"""Minimal CLI that opens a URL with Patchright."""

from __future__ import annotations

import argparse
import asyncio
import json
import logging
import shutil
import subprocess
from pathlib import Path

LOGGER = logging.getLogger(__name__)


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Open a URL with Patchright.")
    parser.add_argument("url", help="URL to open")
    parser.add_argument(
        "--output-dir",
        default="web_retention_output",
        help="Directory where recording.mp4 will be saved",
    )
    return parser


def convert_to_mp4(source_path: Path, destination_path: Path) -> None:
    try:
        import imageio_ffmpeg
    except ImportError as exc:
        raise RuntimeError(
            "imageio_ffmpeg is required to convert the recording to mp4."
        ) from exc

    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    subprocess.run(
        [
            ffmpeg_exe,
            "-y",
            "-i",
            str(source_path),
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            str(destination_path),
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def run_tribev2_inference(video_path: Path, output_dir: Path) -> None:
    from tribev2.demo_utils import TribeModel

    def _run(device: str):
        model = TribeModel.from_pretrained(
            "facebook/tribev2",
            cache_folder=output_dir / "cache",
            device=device,
        )
        df = model.get_events_dataframe(video_path=video_path)
        preds, segments = model.predict(events=df)
        return df, preds, segments

    try:
        df, preds, segments = _run("auto")
    except RuntimeError as exc:
        if "CUDA out of memory" not in str(exc):
            raise
        LOGGER.warning("CUDA ran out of memory. Retrying TRIBE inference on CPU.")
        try:
            import torch

            if torch.cuda.is_available():
                torch.cuda.empty_cache()
        except Exception:
            pass
        df, preds, segments = _run("cpu")

    df.to_json(output_dir / "events.json", orient="records", indent=2)
    npy_path = output_dir / "predictions.npy"
    import numpy as np

    np.save(npy_path, preds)

    segment_rows = []
    for index, segment in enumerate(segments):
        segment_rows.append(
            {
                "index": index,
                "start": float(segment.start),
                "stop": float(segment.stop),
                "duration": float(segment.duration),
            }
        )
    (output_dir / "segments.json").write_text(
        json.dumps(segment_rows, indent=2), encoding="utf-8"
    )

    n_timesteps = min(6, len(preds))
    if n_timesteps > 0:
        try:
            from tribev2.plotting.cortical import PlotBrainNilearn
            import matplotlib.pyplot as plt
        except ImportError as exc:
            LOGGER.warning("Skipping brain visualization because plotting dependencies are missing: %s", exc)
            return

        plotter = PlotBrainNilearn(mesh="fsaverage5")
        fig = plotter.plot_timesteps(
            preds[:n_timesteps],
            segments=segments[:n_timesteps],
            cmap="fire",
            norm_percentile=99,
            vmin=0.6,
            alpha_cmap=(0, 0.2),
            show_stimuli=True,
        )
        fig.savefig(output_dir / "brain.png", dpi=200, bbox_inches="tight")
        plt.close(fig)


async def open_url(url: str, output_dir: Path) -> None:
    try:
        from patchright.async_api import async_playwright
    except ImportError as exc:
        raise RuntimeError(
            "Patchright is not installed. Install dependencies before using this CLI."
        ) from exc

    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=False)
        output_dir.mkdir(parents=True, exist_ok=True)
        temp_dir = output_dir / "patchright_video_tmp"
        temp_dir.mkdir(parents=True, exist_ok=True)
        context = await browser.new_context(
            viewport={"width": 1440, "height": 900},
            record_video_dir=str(temp_dir),
            record_video_size={"width": 1440, "height": 900},
        )
        page = await context.new_page()
        await page.goto(url)
        await page.wait_for_timeout(2000)
        while True:
            metrics = await page.evaluate(
                """() => ({
                    scrollY: window.scrollY,
                    viewportHeight: window.innerHeight,
                    scrollHeight: Math.max(
                        document.body.scrollHeight,
                        document.documentElement.scrollHeight
                    )
                })"""
            )
            max_scroll = max(metrics["scrollHeight"] - metrics["viewportHeight"], 0)
            next_scroll = min(metrics["scrollY"] + metrics["viewportHeight"], max_scroll)
            if next_scroll <= metrics["scrollY"]:
                break
            await page.wait_for_timeout(2000)
            await page.evaluate(
                "(top) => window.scrollTo({ top, behavior: 'smooth' })",
                next_scroll,
            )
            await page.wait_for_timeout(2000)
        await page.wait_for_timeout(2000)
        video = page.video
        await page.close()
        await context.close()
        recorded_path = Path(await video.path())
        temp_webm_path = output_dir / "recording.webm"
        if recorded_path != temp_webm_path:
            shutil.move(str(recorded_path), temp_webm_path)
        mp4_path = output_dir / "recording.mp4"
        convert_to_mp4(temp_webm_path, mp4_path)
        temp_webm_path.unlink(missing_ok=True)
        shutil.rmtree(temp_dir, ignore_errors=True)
        await browser.close()
        run_tribev2_inference(mp4_path, output_dir)


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s - %(message)s")
    args = build_arg_parser().parse_args()
    asyncio.run(open_url(args.url, Path(args.output_dir).resolve()))


if __name__ == "__main__":
    main()

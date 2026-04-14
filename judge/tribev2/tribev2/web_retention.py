"""Minimal CLI that opens a URL with Patchright."""

from __future__ import annotations

import argparse
import asyncio
import json
import logging
import shutil
import subprocess
import tempfile
from pathlib import Path

LOGGER = logging.getLogger(__name__)


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Open a URL with Patchright.")
    parser.add_argument("url", nargs="?", help="URL to open")
    parser.add_argument(
        "--input",
        type=Path,
        help="Local input video file to run TRIBE inference on directly",
    )
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


def render_brain_video(preds, segments, output_path: Path) -> None:
    import imageio_ffmpeg
    import matplotlib.pyplot as plt
    from tqdm import tqdm

    from tribev2.plotting import PlotBrain
    from tribev2.plotting.utils import get_clip, get_text, robust_normalize

    output_path.parent.mkdir(parents=True, exist_ok=True)
    tmp_dir = Path(tempfile.mkdtemp(prefix=f"{output_path.stem}_frames_", dir=output_path.parent))
    plotter = PlotBrain(mesh="fsaverage5")
    normalized_preds = robust_normalize(preds, percentile=99)
    try:
        for i in tqdm(range(len(normalized_preds)), desc="Plotting..."):
            clip = get_clip(segments[i]) if segments else None
            fig, axes = plt.subplots(
                2,
                1,
                figsize=(3, 5),
                gridspec_kw={"height_ratios": [1, 3]},
            )
            frame_ax, brain_ax = axes
            if clip is not None:
                img = clip.get_frame(0)
                frame_ax.imshow(img)
            else:
                frame_ax.text(
                    0.5,
                    0.5,
                    "No source frame",
                    ha="center",
                    va="center",
                    fontsize=10,
                )
            frame_ax.axis("off")
            frame = normalized_preds[i]
            plotter.plot_surf(
                frame,
                axes=[brain_ax],
                cmap="fire",
                vmin=0.6,
                alpha_cmap=(0, 0.2),
            )
            fig.suptitle(f"t = {i}s", fontsize=14, fontweight="bold")
            if segments:
                words = " ".join(get_text(segments[i]).split(" ")[-8:])
                fig.text(0.1, 0.92, words, fontsize=9, ha="left", va="top")
            fig.savefig(tmp_dir / f"tmp_{i:05d}.png", dpi=300)
            plt.close(fig)
            if clip is not None:
                clip.close()

        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
        cmd = [
            ffmpeg_exe,
            "-y",
            "-framerate",
            "1",
            "-i",
            f"{str(tmp_dir)}/tmp_%05d.png",
            "-vf",
            "minterpolate=fps=12",
            "-c:v",
            "libx264",
            "-crf",
            "18",
            "-pix_fmt",
            "yuv420p",
            str(output_path),
        ]
        subprocess.run(cmd, check=True)
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


def run_tribev2_inference(video_path: Path, output_dir: Path) -> None:
    CACHE_FOLDER = Path("./cache")
    try:
       from tribev2.demo_utils import TribeModel, download_file
    except OSError as exc:
        message = str(exc)
        if "c10.dll" not in message and "torch" not in message.lower():
            raise
        raise RuntimeError(
            "PyTorch failed to initialize on Windows while loading native DLLs. "
            "This is an environment issue in the local torch install, not a TRIBE "
            "inference error. Reinstall torch and torchvision in the active venv "
            "and ensure the Microsoft Visual C++ Redistributable is installed "
            "(vc_redist.x64)."
        ) from exc

    def _run(device: str):
        model = TribeModel.from_pretrained(
           "facebook/tribev2",
            cache_folder=CACHE_FOLDER,
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

    n_timesteps = len(preds)
    if n_timesteps > 0:
        try:
            import imageio_ffmpeg  # noqa: F401
        except ImportError as exc:
            LOGGER.warning("Skipping brain visualization because plotting dependencies are missing: %s", exc)
            return

        render_brain_video(
            preds[:n_timesteps],
            segments[:n_timesteps],
            output_dir / "brain.mp4",
        )


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
    output_dir = Path(args.output_dir).resolve()

    if args.input is not None:
        input_path = args.input.resolve()
        if not input_path.exists():
            raise FileNotFoundError(f"Input file does not exist: {input_path}")
        output_dir.mkdir(parents=True, exist_ok=True)
        run_tribev2_inference(input_path, output_dir)
        return

    if not args.url:
        raise SystemExit("Either a URL or --input <file> is required.")

    asyncio.run(open_url(args.url, output_dir))


if __name__ == "__main__":
    main()

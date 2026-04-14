"""CLI to capture page screenshots in vertical sections with Patchright."""

from __future__ import annotations

import argparse
import asyncio
from datetime import datetime
from pathlib import Path


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Capture a URL as multiple viewport-height screenshots with Patchright."
    )
    parser.add_argument("url", help="URL to open")
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("page_screenshots"),
        help="Base directory where each run folder will be created",
    )
    parser.add_argument(
        "--run-name",
        type=str,
        default="",
        help="Optional run folder name. Defaults to screenshot_run_YYYYMMDD_HHMMSS",
    )
    parser.add_argument(
        "--prefix",
        type=str,
        default="section",
        help="File prefix for section images",
    )
    parser.add_argument(
        "--wait-ms",
        type=int,
        default=2000,
        help="Extra time to wait after navigation, in milliseconds",
    )
    parser.add_argument(
        "--step-overlap",
        type=int,
        default=140,
        help="Vertical overlap between consecutive screenshots in pixels",
    )
    parser.add_argument(
        "--scroll-wait-ms",
        type=int,
        default=350,
        help="Wait time after each scroll before taking screenshot",
    )
    return parser


async def capture_screenshot_sections(
    url: str,
    output_root: Path,
    run_name: str,
    prefix: str,
    wait_ms: int,
    step_overlap: int,
    scroll_wait_ms: int,
) -> None:
    try:
        from patchright.async_api import async_playwright
    except ImportError as exc:
        raise RuntimeError(
            "Patchright is not installed. Install dependencies before using this CLI."
        ) from exc

    output_root.mkdir(parents=True, exist_ok=True)
    if run_name.strip():
        target_dir = output_root / run_name.strip()
    else:
        stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        target_dir = output_root / f"screenshot_run_{stamp}"
    target_dir.mkdir(parents=True, exist_ok=True)

    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=False)
        context = await browser.new_context(
            viewport={"width": 1440, "height": 900},
        )
        page = await context.new_page()
        await page.goto(url, wait_until="networkidle")
        if wait_ms > 0:
            await page.wait_for_timeout(wait_ms)

        metrics = await page.evaluate(
            """() => ({
                viewportWidth: window.innerWidth,
                viewportHeight: window.innerHeight,
                scrollHeight: Math.max(
                    document.body.scrollHeight,
                    document.documentElement.scrollHeight
                )
            })"""
        )
        viewport_height = int(metrics["viewportHeight"])
        viewport_width = int(metrics["viewportWidth"])
        scroll_height = int(metrics["scrollHeight"])
        max_scroll = max(scroll_height - viewport_height, 0)

        overlap = max(0, step_overlap)
        step = max(1, viewport_height - overlap)
        scroll_positions: list[int] = list(range(0, max_scroll + 1, step))
        if not scroll_positions:
            scroll_positions = [0]
        if scroll_positions[-1] != max_scroll:
            scroll_positions.append(max_scroll)

        for index, scroll_top in enumerate(scroll_positions, start=1):
            await page.evaluate(
                "(top) => window.scrollTo({ top, behavior: 'instant' })",
                scroll_top,
            )
            if scroll_wait_ms > 0:
                await page.wait_for_timeout(scroll_wait_ms)
            output_path = target_dir / f"{prefix}_{index:03d}.png"
            await page.screenshot(
                path=str(output_path),
                clip={
                    "x": 0,
                    "y": 0,
                    "width": viewport_width,
                    "height": viewport_height,
                },
            )

        await page.close()
        await context.close()
        await browser.close()


def main() -> None:
    args = build_arg_parser().parse_args()
    asyncio.run(
        capture_screenshot_sections(
            args.url,
            args.output_dir.resolve(),
            args.run_name,
            args.prefix,
            args.wait_ms,
            args.step_overlap,
            args.scroll_wait_ms,
        )
    )


if __name__ == "__main__":
    main()

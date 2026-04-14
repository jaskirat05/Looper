# Looper

Looper is an iterative UI evaluation project inspired by Karpathy's "auto research" style workflow.

## What It Does

This repo currently includes two judgment utilities:

1. Sectional screenshot utility
   - Captures a webpage in viewport-height sections for visual iteration and comparison.
   - Script: `judge/tribev2/tribev2/web_screenshot.py`

2. TRIBE v2 retention / brain-scan utility
   - Records a webpage session, runs TRIBE v2 inference, and outputs prediction artifacts and a brain visualization video.
   - Script: `judge/tribev2/tribev2/web_retention.py`

## Current Output Artifacts

Depending on the run, outputs can include:
- Section screenshots (`section_001.png`, etc.)
- `recording.mp4`
- `predictions.npy`
- `events.json`
- `segments.json`
- `brain.mp4`

## Planned Additions

- Run an LLM on TRIBE v2 generated video outputs using multimodal LLMs.
- Generate a structured report from those multimodal analyses.
- Add UI labeling workflows using Pillow.


# Screenshot-Driven Iteration Instructions

## Objective

Iteratively improve the website by taking screenshots of `http://localhost:3000` and refining UI/UX until the target quality is achieved.

## Required Tool

Use:

`Looper\judge\tribev2\tribev2\web_screenshot.py`

## Workflow

1. Ensure the app is running locally on port 3000.
2. Capture a baseline screenshot.
3. Make one focused improvement pass.
4. Capture a new screenshot after each pass.
5. Compare against previous screenshot and evaluate progress toward the target.
6. Repeat until the target is achieved.

## Commands

Run from repo root (`Looper`):

```powershell
$env:PYTHONPATH='.'
python -m judge.tribev2.tribev2.web_screenshot "http://localhost:3000" --output "baseline-home.png" --wait-ms 2500
python -m judge.tribev2.tribev2.web_screenshot "http://localhost:3000" --output "iteration-1-home.png" --wait-ms 2500
```

Continue with incremented filenames (`iteration-2-home.png`, `iteration-3-home.png`, etc.) after each change.

## Stop Condition

Stop iterating only when the target quality is achieved.

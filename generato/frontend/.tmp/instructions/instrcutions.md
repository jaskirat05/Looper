# Sequential Build Instructions

## Goal

Build a Next.js app with:

- A landing page that uses provided reference images as design inspiration
- A DAG editor built with `reactflow`
- Global state managed with `zustand`
- A graph compiler that converts the DAG into an IR
- Fast, modern UI and interaction quality
- Final evaluation using `tribev2-web-retention` against every page created

## Non-Negotiable Requirements

- Use `Next.js`
- Use `React Flow` for the DAG editor
- Use `Zustand` for state management
- The DAG editor must support double click to open node search
- The graph must compile into an IR
- The editor can take inspiration from Higgsfield and ComfyUI, but must use a more modern color system and feel much faster
- Run the app with `npm run dev` at the end
- Run `tribev2-web-retention` on every page URL that was created
- Work in your own git directory, branch, or worktree

## Assumptions

- There is no existing Next.js app in this workspace yet, so create one if needed
- If reference images are not present yet, create a placeholder folder and document where they should be added
- Use TypeScript unless there is a strong reason not to
- Prefer Next.js App Router unless project constraints require otherwise

## Step 1: Create the App Foundation

Tasks:

- Create the Next.js app scaffold if it does not already exist
- Install and configure the required dependencies
- Set up `reactflow`
- Set up `zustand`
- Add a shared layout, theme tokens, and common UI primitives
- Establish a clean folder structure for pages, editor features, shared components, and stores

Expected outcome:

- The app starts and renders a basic shell
- Shared foundations exist for the landing page and editor

## Step 2: Create the Landing Page

Tasks:

- Build a landing page at `/`
- Use the provided reference images as design inspiration, not as a direct copy
- Make the page visually distinct, premium, and responsive
- Add strong hierarchy, motion, and clear calls to action
- Keep the design language aligned with the upcoming editor page

Expected outcome:

- A complete landing page that feels intentional and modern

## Step 3: Create the DAG Editor

Tasks:

- Build a DAG editor page at `/editor` using `reactflow`
- Add fast pan, zoom, and node interaction behavior
- Add double click behavior to open node search
- Let the user insert nodes from the search flow
- Keep interaction latency very low
- Use Higgsfield and ComfyUI only as inspiration for density and capability, not as a visual copy
- Use a more modern palette, stronger contrast discipline, and cleaner surfaces

Expected outcome:

- A working DAG editor with fast interactions and double-click node search

## Step 4: Add Zustand State Management

Tasks:

- Use Zustand for graph state
- Use Zustand for node search modal state
- Use Zustand for compile result state
- Keep ephemeral local UI state out of Zustand unless it is genuinely shared
- Use selectors carefully to avoid unnecessary rerenders

Expected outcome:

- Shared editor and app state is centralized and performant

## Step 5: Compile the Graph Into IR

Tasks:

- Define a clear IR schema
- Convert the React Flow graph into IR
- Validate node connectivity and graph correctness
- Add compile diagnostics for invalid graphs
- Expose compile output in the UI through an inspector, debug panel, or equivalent surface
- Make the compiler deterministic and easy to extend

The IR should include at minimum:

- Node ids
- Node types
- Node params or config
- Edge list
- Execution order or topological ordering
- Validation metadata or compile diagnostics

Expected outcome:

- The current graph can be compiled into IR and inspected in the UI

## Step 6: Performance Pass

Tasks:

- Review the DAG editor for unnecessary rerenders
- Check Zustand selector usage
- Keep graph interactions smooth with realistic node counts
- Make sure the landing page and editor both load quickly
- Reduce avoidable client-side work

Expected outcome:

- The app feels fast in normal local usage

## Step 7: Run the App

Tasks:

- Start the app with:

```bash
npm run dev
```

- Confirm that every created page is accessible locally
- Record the final page URLs

Expected outcome:

- The app is running locally and all pages are reachable

## Step 8: Run Tribe Evaluation on Every Page

Tasks:

- Run `tribev2-web-retention` against every page URL created in the app
- Save each page’s results into a separate output directory
- Review the activation report for each page
- Identify which segments show the highest predicted neural activation

Example:

```bash
tribev2-web-retention "http://127.0.0.1:3000/" --output-dir ./tribe-home
tribev2-web-retention "http://127.0.0.1:3000/editor" --output-dir ./tribe-editor
```

If more pages are added, evaluate each additional page separately.

Expected outcome:

- Every created page has a saved `tribev2` report

## Step 9: Final Report

Include:

- Pages created
- URLs tested
- Stack and architecture summary
- Zustand usage summary
- IR format summary
- Performance issues fixed
- Highest-activation segments from each page
- Any missing assets, blockers, or approximations

## Design Direction

- Use reference images for inspiration in composition, density, palette, and motion
- Avoid cloning Higgsfield or ComfyUI
- Aim for a sharper, more modern visual system
- Avoid muddy defaults and low-contrast gray-on-gray UI
- Use clear surface separation, intentional motion, and readable typography
- Make the landing page and editor feel like the same product

## Done Criteria

The work is done only when all of the following are true:

- The Next.js app runs locally with `npm run dev`
- The landing page is complete and responsive
- The DAG editor works with `reactflow`
- Double click opens node search
- Zustand manages the intended shared state
- The graph compiles into IR
- The design is cohesive and modern
- Every created page has been evaluated with `tribev2-web-retention`
- Results are documented with page URLs and highest-activation segments

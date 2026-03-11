/x-workflow.list.progress

**Load the `x-workflow` skill** for the full methodology.

## Purpose

List the steps followed so far and their stage. Use when you need a progress summary for the current (or specified) workflow.

## Arguments

`$ARGUMENTS` — Optional slug. If empty, use the most recent checkpoint.

## Execution

1. **Load checkpoint** — Read `.cursor/workspace/x-workflow-<slug>.md`.
2. **Extract** — Completed substeps, current stage, what's done vs. what's next.
3. **Present** — Progress summary: stages completed, current stage, remaining steps.

## Guidelines

- Focus on the "Completed" and "Next Steps" sections
- Show stage number (1–7) and name for clarity

/x-workflow.list.workflows

**Load the `x-workflow` skill** for the full methodology.

## Purpose

List recent workflows and their status. Use when you have multiple active problems and need an overview.

## Execution

1. **Scan** — List files in `.cursor/workspace/` matching `x-workflow-*.md`.
2. **Summarize** — For each: problem name (from slug or file content), current stage, last updated.
3. **Present** — Table or list with workflow slug, stage, and last-updated date.

## Guidelines

- Sort by last modified (most recent first)
- Include path for each so user can resume with `/x-workflow.resume <slug>`

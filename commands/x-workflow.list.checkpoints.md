/x-workflow.list.checkpoints

**Load the `x-workflow` skill** for the full methodology.

## Purpose

List active checkpoints. Use when you need to see what checkpoint files exist and where they are.

## Execution

1. **Scan** — List files in `.cursor/workspace/` matching `x-workflow-*.md`.
2. **Report** — File path, slug, and brief status (stage + last updated) for each.

## Guidelines

- Same as list.workflows but focused on checkpoint file inventory
- Useful when user asks "what checkpoints do I have?"

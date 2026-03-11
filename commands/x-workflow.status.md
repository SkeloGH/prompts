/x-workflow.status

**Load the `x-workflow` skill** for the full methodology.

## Purpose

Show current stage, checkpoint path, and next steps. Use when you need to orient or when context was lost.

## Arguments

`$ARGUMENTS` — Optional slug. If provided, show status for that workflow. If empty, use the most recent or list options.

## Execution

1. **Locate checkpoint** — Read `.cursor/workspace/x-workflow-<slug>.md` or list workspace.
2. **Report** — Current stage (1–7), problem definition, completed substeps, next steps, artifact paths.
3. **Suggest** — What to do next based on the checkpoint.

## If No Checkpoint Exists

- Ask the user which problem they're working on
- Suggest starting with `/x-workflow.discover` or `/x-workflow.resume`

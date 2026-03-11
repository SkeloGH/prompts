/x-workflow.resume

**Load the `x-workflow` skill** for the full methodology and continuity guidance.

## Purpose

Resume an X-Workflow from a checkpoint file. Use when starting a new session, after context was lost, or when picking up work handed off by another agent.

## Arguments

`$ARGUMENTS` — Optional slug (e.g. `baseline-hygiene`). If empty, look for checkpoint files in `.cursor/workspace/` and use the most recent or ask the user which to resume.

## Execution

1. **Locate checkpoint** — Read `.cursor/workspace/x-workflow-<slug>.md` (or list workspace and pick one).
2. **Load context** — Parse current stage, problem definition, completed work, next steps, decisions, artifacts.
3. **Load artifacts** — Read any linked briefs, specs, or data files needed for the next steps.
4. **Continue** — Execute the "Next Steps" from the checkpoint. Do not redo completed work.
5. **Update checkpoint** — When making progress or before ending, update the checkpoint file.

## If No Checkpoint Exists

- Ask the user which problem to work on
- Start from Stage 1 (Problem Discovery) or ask which stage they're in
- Create a checkpoint after the first meaningful progress

## Guidelines

- Read the checkpoint first; do not assume prior context
- Follow "Next Steps" as written unless they're obsolete
- Keep the checkpoint updated so the next session can resume cleanly

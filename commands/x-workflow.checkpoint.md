/x-workflow.checkpoint

**Load the `x-workflow` skill** for the full methodology and continuity guidance.

## Purpose

Save current X-Workflow state so the next agent (or session) can resume without losing context. Use before hitting context limits, ending a session, or handing off.

## Arguments

`$ARGUMENTS` — Optional slug for the checkpoint file (e.g. `baseline-hygiene`). If empty, infer from problem name or ask the user.

## Execution

1. **Identify the active problem** — What X-Workflow problem are we working on?
2. **Gather state** — Current stage, problem definition, completed substeps, key decisions, artifact paths.
3. **Write checkpoint** to `.cursor/workspace/x-workflow-<slug>.md` using the template in the x-workflow skill's reference.md.
4. **Confirm** — Tell the user the checkpoint path and that they can resume with `/x-workflow.resume` or `/x-workflow.resume <slug>`.

## Checkpoint Must Include

- **Current stage** (1–7)
- **Problem definition** (one sentence, or "Draft: ...")
- **Completed** — checked substeps
- **Next Steps** — 2–3 concrete actions for the next agent
- **Key decisions** — rationale for important choices
- **Artifacts** — paths to briefs, specs, data files

## Guidelines

- Use a short, memorable slug (lowercase, hyphens)
- Keep "Next Steps" concrete and actionable
- Link to artifacts so the next agent can load them

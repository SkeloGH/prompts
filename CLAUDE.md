# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

A collection of Claude Code skill prompts, primarily the **Factory Factory (FF) pipeline** — an autonomous spec-to-PR workflow system. There is no buildable application here; the deliverables are markdown skill files in `workflows/`.

## Repository Structure

```
workflows/          # Skill definitions (SKILL.md format with YAML frontmatter)
  ff.md             # Full pipeline (spec → implement → review → validate → pr)
  ff-spec.md        # Spec-only stage
  ff-implement.md   # Implementation-only stage
  ff-review.md      # Review + validate stage
  ff-pr.md          # PR creation stage
  ff-resume.md      # Resume a stalled pipeline
  ff-checkpoint.md  # Manual progress snapshot
  ff-status.md      # Query all active pipeline states
  use-ff.md         # Comprehensive usage guide for Factory Factory
ff-value-and-weaknesses.md  # Design rationale and known limitations
```

## FF Pipeline Architecture

**Mental model:** User = manager. Claude (main conversation) = PM/orchestrator. FF agent = developer. FF = the office building (Docker container with isolated git worktrees).

### Key design decisions

- **Pipeline state lives on GitHub issues**, not local files. Stage is tracked via `ff:<stage>` labels (`ff:spec`, `ff:implement`, `ff:review`, `ff:validate`, `ff:pr`, `ff:done`). Checkpoint comments record progress at each transition.
- **The orchestrator never writes code.** All implementation happens inside FF workspace agents. The orchestrator gathers requirements, launches workspaces, monitors, approves permissions, and reviews output.
- **Workspace prompts must be fully self-contained** — the FF agent has zero conversational context beyond the prompt text and files it can read.
- **Governance is mandatory.** Every stage transition requires a `gh issue comment` + label update. Skipping governance is a pipeline violation.

### Stage flow

`spec → implement → (simplify) → review → validate → pr → done`

Each stage can be run independently via its skill (`/ff:spec`, `/ff:implement`, etc.) or all at once via `/ff`.

### Workspace monitoring

FF agents require active polling (~15-30s intervals) for permission approvals. There are no push notifications. The orchestrator must watch for permission dialogs, errors, and completion signals.

## Editing Skills

Each skill file follows this format:
- YAML frontmatter (`name`, `description`) — used by Claude Code for skill registration
- Markdown body with: role definition, steps, prompt templates, and monitoring instructions

When modifying skills:
- Keep the orchestrator/PM role boundary strict — skills should never instruct the main conversation to write implementation code
- Workspace prompt templates must be self-contained (include all context, file paths, issue numbers)
- Governance steps (label updates, checkpoint comments) are non-negotiable in every stage skill
- The `use-ff.md` file is the single source of truth for FF operational knowledge; keep it current when workflows change

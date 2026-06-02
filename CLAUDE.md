# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## What This Repo Is

A portable, **public** collection of Claude Code configuration — skills, slash
commands, workflow guides, rule files, and sanitized memory — kept in sync so any
machine can pull the same setup. There is no buildable application here; the
deliverables are markdown prompt/skill files.

**Public-repo invariant:** no secrets, credentials, or personal data. Machine-
specific user paths are parameterized to `%USERPROFILE%`, never hardcoded to a
real home directory. When adding or editing content, preserve this — sanitize
before committing.

## Repository Structure

```
skills/        # Claude Code skills (SKILL.md + assets)
  factory-factory/   # Autonomous spec→implement→review→PR pipeline (FF)
  x-workflow/        # Discovery/hypothesis/validation workflow
  thread/ checkpoint/ consolidate/ hydrate-context/ mempalace/   # memory & continuity
  html-presentation/ md-presentation/ pdf-presentation/          # decks
  archived/          # older SKILL.md-per-dir form of the FF skills
commands/      # Slash-command prompts (spec, prd, implement, review, x-workflow.*, …)
guides/        # Long-form guides (GLOBAL-CLAUDE.md, SPECCING.md, X-WORKFLOW.md)
rules/         # Always-on rule files (SPECCING.md, agent-continuity.mdc)
memories/      # Sanitized auto-memory facts (engineering reference + working prefs)
```

## Editing Conventions

- **Skills** follow the `SKILL.md` format: YAML frontmatter (`name`,
  `description`) used for registration, then a markdown body (role, steps, prompt
  templates, monitoring instructions).
- **Parameterize paths.** Use `%USERPROFILE%`/`~` rather than a literal home dir.
  Before committing, grep for a real username and for internal session UUIDs
  (`originSessionId`) and strip them.
- **Keep memories sanitized.** `memories/` carries only reusable engineering
  knowledge and working preferences — never finances, location, or other personal
  facts.

## Factory Factory (FF) Pipeline — notes for that skill family

**Mental model:** User = manager. Claude (main conversation) = PM/orchestrator.
FF agent = developer. FF = the office building (Docker container with isolated
git worktrees).

- **Pipeline state lives on GitHub issues**, not local files. Stage is tracked via
  `ff:<stage>` labels (`ff:spec`, `ff:implement`, `ff:review`, `ff:validate`,
  `ff:pr`, `ff:done`). Checkpoint comments record progress at each transition.
- **The orchestrator never writes code.** All implementation happens inside FF
  workspace agents; the orchestrator gathers requirements, launches workspaces,
  monitors, approves permissions, and reviews output.
- **Workspace prompts must be fully self-contained** — the FF agent has zero
  conversational context beyond the prompt text and files it can read.
- **Governance is mandatory.** Every stage transition requires a `gh issue
  comment` + label update. Skipping governance is a pipeline violation.
- Stage flow: `spec → implement → (simplify) → review → validate → pr → done`.
- `skills/factory-factory/use-ff.md` is the single source of truth for FF
  operational knowledge; keep it current when workflows change.

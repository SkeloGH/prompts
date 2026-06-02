# Prompts

A portable, public collection of my Claude Code skills, slash commands,
workflow guides, and sanitized memory — kept in sync so any machine can pull the
same setup. No secrets or personal data live here; machine-specific user paths
are parameterized to `%USERPROFILE%`.

## Layout

| Dir | What's in it |
|-----|--------------|
| [`skills/`](skills/) | Claude Code skills (`SKILL.md` + assets) |
| [`commands/`](commands/) | Slash-command prompts |
| [`guides/`](guides/) | Long-form operational guides |
| [`rules/`](rules/) | Always-on rule files |
| [`memories/`](memories/) | Sanitized auto-memory facts (reference + working prefs) |

## Skills

### Memory & continuity (mempalace-backed)
| Skill | Description |
|-------|-------------|
| [thread](skills/thread/SKILL.md) | Bind a session to a named work thread |
| [checkpoint](skills/checkpoint/SKILL.md) | Cheap incremental diary save mid-work |
| [consolidate](skills/consolidate/SKILL.md) | Full snapshot + knowledge-graph reconcile at session end |
| [hydrate-context](skills/hydrate-context/SKILL.md) | Resume a thread by replaying snapshot + checkpoints |
| [mempalace](skills/mempalace/SKILL.md) | Operate the local mempalace memory system |

### Presentations
| Skill | Description |
|-------|-------------|
| [html-presentation](skills/html-presentation/SKILL.md) | Didactic 16:9 HTML slide deck |
| [md-presentation](skills/md-presentation/SKILL.md) | Markdown deck (mermaid + ASCII), diffs cleanly in git |
| [pdf-presentation](skills/pdf-presentation/SKILL.md) | HTML deck rendered to PDF via headless Chrome/Edge |

### Workflows
| Skill | Description |
|-------|-------------|
| [factory-factory](skills/factory-factory/) | Autonomous spec→implement→review→PR pipeline (FF) |
| [x-workflow](skills/x-workflow/SKILL.md) | Discovery / hypothesis / validation workflow |

> `skills/archived/` holds the older `SKILL.md`-per-dir form of the FF skills.

## Commands

Core: [`spec`](commands/spec.md), [`prd`](commands/prd.md),
[`implement`](commands/implement.md), [`test`](commands/test.md),
[`review`](commands/review.md), [`optimize`](commands/optimize.md),
[`assess-coverage`](commands/assess-coverage.md), [`reflect`](commands/reflect.md),
[`commit`](commands/commit.md).
Plus the `x-workflow.*` command family (discover/observe/hypothesize/analyze,
checkpoint, resume, status, validate).

## Guides

- [GLOBAL-CLAUDE.md](guides/GLOBAL-CLAUDE.md) — portable `~/.claude/CLAUDE.md` (shell patterns, gh/MSYS gotchas, agent-prompt governance)
- [SPECCING.md](guides/SPECCING.md) — spec-writing guide
- [X-WORKFLOW.md](guides/X-WORKFLOW.md) — x-workflow operational guide

## Using these on a new machine

- **Skills** → copy `skills/<name>/` into `~/.claude/skills/`.
- **Commands** → copy `commands/*.md` into `~/.claude/commands/`.
- **Global guidance** → merge `guides/GLOBAL-CLAUDE.md` into `~/.claude/CLAUDE.md`.
- **Memories** → for reference; re-add to your memory store as desired.

Paths in skills use `%USERPROFILE%` — adjust for the shell that runs them (e.g.
`$HOME`/`~` in bash, `$env:USERPROFILE` in PowerShell). The memory & continuity
skills assume a local [mempalace](skills/mempalace/SKILL.md) install.

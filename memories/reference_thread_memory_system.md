---
name: thread-memory-system
description: "Cross-session memory lifecycle skills + hooks for Claude Code, built on mempalace"
metadata: 
  node_type: memory
  type: reference
---

Cross-session work-continuity system built 2026-05-21. A **thread** = a named unit of work that survives session end, compaction, and resume; the label is the join key.

Skills (`~/.claude/skills/`): `/thread` binds session↔label · `/checkpoint` cheap incremental diary save · `/consolidate` full snapshot + KG reconcile (add + invalidate) + decision drawers · `/hydrate-context` resume = replay snapshot + checkpoints. Model: snapshot + write-ahead log + replay.

Hooks (`~/.claude/settings.json`, scripts `~/.claude/hooks/thread-*.ps1`): SessionStart injects active-thread reminder; Stop nudges `/checkpoint` every ~15 turns (`exit 2` + stderr); PreCompact blocks an unsaved manual `/compact` once.

Registry, snapshots, helper, README live in `~/.mempalace/threads/`. Threads bind on `session_id` (stable across compaction/resume) — Claude Code does not expose the session *name* to skills/hooks. Canonical KG predicate vocabulary (~22 predicates + legacy map for the 83-type sprawl) is in `consolidate/SKILL.md`. Prefer these skills for ending/resuming substantive work sessions.

---
name: consolidate
description: Full memory consolidation for a work thread — snapshot the thread's resumable state, reconcile the mempalace knowledge graph (add new facts, invalidate stale ones), file decision drawers, and write a diary entry. Use at the end of a work session, before compaction, or when switching threads. The counterpart to /hydrate-context. Triggers — "/consolidate", "consolidate this thread", "save the session before I compact".
argument-hint: "[thread-label]"
---

# consolidate

The **write** half of the memory lifecycle. Where `/hydrate-context` fans out reads and synthesizes a brief, `/consolidate` scans the conversation and fans out writes.

Mental model — **snapshot + write-ahead log + replay**:
- `/consolidate` writes a **full snapshot** (this skill).
- `/checkpoint` appends **incremental log lines** between snapshots.
- `/hydrate-context` **replays** = snapshot + checkpoints since.

Run `/consolidate` at end of a work session, before a deliberate `/compact`, or when switching threads.

---

## Step 1 — Resolve the thread label

The label is the join key. `REG` below = `powershell -NoProfile -ExecutionPolicy Bypass -File "%USERPROFILE%/.mempalace/threads/registry.ps1"`.

- **If `$ARGUMENTS` is given** — that string is the label. Bind it:
  `REG -Action bind -SessionId "${CLAUDE_SESSION_ID}" -Label "$ARGUMENTS"`
- **If no argument** — resolve the session's existing thread:
  `REG -Action resolve -SessionId "${CLAUDE_SESSION_ID}"`
  - If that prints a label, use it.
  - If empty — infer a short kebab-case label from the session focus / CLAUDE.md, propose it to the user, and bind it once confirmed. Never consolidate to an unlabeled thread.

Hold the resolved label as `<label>` for the rest of the run.

---

## Step 2 — Scan the conversation

Walk the conversation since the **last consolidate** (`REG -Action status -SessionId "${CLAUDE_SESSION_ID}"` shows `lastConsolidate`). Extract only **durable** knowledge — apply a high signal bar:

- **Decisions** made and the reasoning behind them.
- **Gotchas** discovered — non-obvious things that would save future-you time.
- **Facts now true** — new dependencies, patterns, constraints, status.
- **Facts now false** — anything a stored fact or drawer now contradicts.

Ignore "what I did" narration, filler, and anything git/GitHub already records.

---

## Step 3 — Reconcile the knowledge graph

For each candidate fact:

1. Map the relationship to a **canonical predicate** from the vocabulary below. **Never invent a predicate.** If a legacy predicate is encountered on an existing triple you touch, normalize it (see legacy map).
2. `mempalace_kg_query` the subject.
3. **Contradicts** an existing current triple → `mempalace_kg_invalidate` the old triple (with `ended` = today), then `mempalace_kg_add` the new one. Where it genuinely replaces an approach, also add a `supersedes` triple.
4. **New** → `mempalace_kg_add` with `valid_from` = today (absolute ISO date).
5. **Already present** → skip.

Reconciliation — invalidating stale facts — is the point. Do not just append.

### Canonical predicate vocabulary

Use ONLY these. Object strings carry the specifics.

| Predicate | Use for |
|---|---|
| `is_a` | one-line identity of an entity |
| `child_of` | sub-repo / component belongs to a parent project |
| `has_component` | a project contains a named sub-part |
| `depends_on` | needs another project or package to function |
| `uses` | a library, framework, tool, or technique |
| `uses_language` | a programming language it is written in |
| `uses_database` | a datastore it relies on |
| `deployed_on` | where it runs in production (host / platform / cloud) |
| `requires` | a hard constraint, rule, or policy that must hold |
| `targets` | intended platform, locale, or audience |
| `open_decision` | an unresolved question or decision |
| `decided` | a resolved decision and the chosen approach |
| `decided_against` | an option explicitly rejected |
| `supersedes` | this fact/approach replaces an older one (pair with kg_invalidate) |
| `provides` | a capability, feature, or service it exposes |
| `implements` | implements a spec, interface, or named pattern |
| `integrates_with` | connects to / interoperates with another system |
| `has_failure_mode` | a known bug, gotcha, or way it breaks |
| `follows_pattern` | adheres to a named convention or architecture |
| `worked_on` | provenance — an agent or person worked on this |
| `costs_approximately` | a cost or pricing fact |
| `relates_to` | generic association — last resort only |

### Legacy → canonical map (normalize opportunistically, do not bulk-migrate)

`uses_framework` · `uses_orm` · `uses_cache` · `uses_ui_library` · `uses_styling` · `uses_state_management` · `uses_testing` · `uses_audio_library` · `uses_native_haptics` · `uses_budgeting_model` · `uses_file_format` → **`uses`** &nbsp;|&nbsp;
`uses_backend` → **`integrates_with`** &nbsp;|&nbsp;
`deploys_to` · `runs_on` · `shipped_on` → **`deployed_on`** &nbsp;|&nbsp;
`*_rule` · `dependency_policy` · `requires_node_version` · `requires_for_external_https` → **`requires`** &nbsp;|&nbsp;
`has_open_decision` → **`open_decision`** &nbsp;|&nbsp;
`closed_decision` → **`decided`** &nbsp;|&nbsp;
`superseded_by` · `replaces` · `renamed_to` · `same_as` → **`supersedes`** (re-orient the direction) &nbsp;|&nbsp;
`has_capability` → **`provides`** &nbsp;|&nbsp;
`crashes_whole_batch_on` · `returns_empty_silently_when` · `dead_in_production_because` · `often_masks` → **`has_failure_mode`**

---

## Step 4 — File decision drawers

For each substantive decision worth more than a KG triple, file a drawer (the KG holds the fact; the drawer holds the reasoning):

1. `mempalace_check_duplicate` (threshold 0.9).
2. `mempalace_add_drawer` — `added_by="consolidate"`, `source_file="thread:<label>"`, room `decisions` where it exists else `general`. Use the What / Why / Rejected alternatives / Gotchas / Revisit triggers structure from the `mempalace` skill's PR-capture template. Skip empty sections.

---

## Step 5 — Rewrite the thread snapshot

Overwrite `%USERPROFILE%/.mempalace/threads/<label>.md` with the current full state:

```markdown
# Thread: <label>
Updated: <YYYY-MM-DDTHH:MM> · Session: ${CLAUDE_SESSION_ID} · Wings: <touched mempalace wings>

## Goal
<What this thread is trying to achieve — one paragraph.>

## Current state
<Where things stand right now. Concrete.>

## Decisions made
- <decision — cite drawer id / KG fact if filed>

## Open items / next step
- [ ] <the very next action>
- [ ] <other open threads>

## Key references
- PRs: <#n> · Drawers: <ids> · KG entities: <names> · Files: <paths>
```

This file is the deterministic resume anchor `/hydrate-context` reads first. Make it complete enough that a fresh session could resume from it alone.

---

## Step 6 — Diary entry

`mempalace_diary_write` — `agent_name="claude-code"`, `topic="<label>"`, AAAK style, under ~200 tokens:
`SESSION:<YYYY-MM-DD>|<label>|consolidated|<key.decisions>|<kg.delta:+N/-M>|next:<next.step>`

---

## Step 7 — Mark the consolidate

`REG -Action touch -SessionId "${CLAUDE_SESSION_ID}" -Kind consolidate`

This resets the checkpoint cadence and clears the pre-compaction safety net.

---

## Step 8 — Report

Tell the user, concisely: thread label, KG facts added / invalidated, drawers filed, snapshot path, and the recorded next step. The thread is now safe to `/compact` or end.

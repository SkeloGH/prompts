---
name: checkpoint
description: Lightweight incremental memory checkpoint for the active work thread — appends one topic-tagged diary entry capturing what changed, current state, and the next step. Cheap and fast; run frequently or when the Stop hook nudges. The incremental log between full /consolidate snapshots. Triggers — "/checkpoint", "checkpoint this", or the Stop-hook nudge.
argument-hint: "[thread-label]"
---

# checkpoint

The **incremental log** of the memory lifecycle. Cheap, frequent, append-only, low-risk — the opposite of `/consolidate`, which writes a full snapshot.

`/checkpoint` does **one** thing: append a topic-tagged diary entry. It does NOT touch the knowledge graph, file drawers, or rewrite the snapshot — that is `/consolidate`'s job. Keeping it cheap is the point; it can run every ~15 turns without cost or noise.

---

## Step 1 — Resolve the thread label

`REG` = `powershell -NoProfile -ExecutionPolicy Bypass -File "%USERPROFILE%/.mempalace/threads/registry.ps1"`.

- **If `$ARGUMENTS` is given** — bind it: `REG -Action bind -SessionId "${CLAUDE_SESSION_ID}" -Label "$ARGUMENTS"`.
- **If no argument** — resolve: `REG -Action resolve -SessionId "${CLAUDE_SESSION_ID}"`.
  - Empty result → the session has no thread. Tell the user to run `/thread <label>` (or `/consolidate <label>`) first, then stop. Do not checkpoint to an unlabeled thread.

Hold the result as `<label>`.

---

## Step 2 — Write the diary entry

Compose a compact AAAK line — what changed since the last checkpoint, where things stand, and the immediate next step. Under ~150 tokens.

`mempalace_diary_write` — `agent_name="claude-code"`, `topic="<label>"`, entry e.g.:
`CHECKPOINT:<YYYY-MM-DD HH:MM>|<label>|<what.changed>|state:<current>|next:<next.step>`

---

## Step 3 — Mark the checkpoint

`REG -Action touch -SessionId "${CLAUDE_SESSION_ID}" -Kind checkpoint`

This resets the Stop-hook turn counter so the next nudge is ~15 turns away.

---

## Step 4 — Confirm

One line: `✓ checkpoint · <label> · next: <next step>`. Keep it terse — checkpoints are frequent; do not write a report.

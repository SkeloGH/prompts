---
name: thread
description: Manage work threads — named units of work that span Claude Code sessions and compactions. Set the active thread for this session, list all threads, or archive a finished one. The thread label is the join key for /checkpoint, /consolidate, and /hydrate-context. Triggers — "/thread", "/thread <label>", "start a thread", "what threads do I have", "/thread done <label>".
argument-hint: "[label | list | done <label>]"
---

# thread

A **thread** is a named unit of work that outlives any single Claude Code session — it survives compaction, session end, and resume. It is identified by a short kebab-case label (e.g. `migrate-mempalace-zep`).

Each thread owns:
- a **snapshot** — `~/.mempalace/threads/<label>.md` (written by `/consolidate`, read by `/hydrate-context`)
- a **checkpoint trail** — topic-tagged mempalace diary entries
- a **registry entry** — `~/.mempalace/threads/index.json`, binding `session_id ↔ label`

Binding to `session_id` (not the session name, which Claude Code does not expose) means once a session is bound, bare `/checkpoint` and `/consolidate` resolve the label automatically — and the binding survives compaction and resume.

`REG` = `powershell -NoProfile -ExecutionPolicy Bypass -File "%USERPROFILE%/.mempalace/threads/registry.ps1"`.

---

## Dispatch on `$ARGUMENTS`

### No argument, or `list` — show threads

1. `REG -Action list` — every thread with status and last-checkpoint time.
2. `REG -Action resolve -SessionId "${CLAUDE_SESSION_ID}"` — the thread bound to *this* session.
3. Report both: the active thread for this session, and the full list.

### `done <label>` — archive a finished thread

1. `REG -Action archive -Label "<label>"`.
2. Move its snapshot: `~/.mempalace/threads/<label>.md` → `~/.mempalace/threads/archive/<label>.md`.
3. Suggest a final `/consolidate <label>` first if the thread has unsaved work.

### `<label>` — set/create the active thread

1. `REG -Action bind -SessionId "${CLAUDE_SESSION_ID}" -Label "<label>"` — binds this session and creates the thread if new. Labels must match `[A-Za-z0-9_-]+`.
2. If `~/.mempalace/threads/<label>.md` does not exist, create the skeleton:
   ```markdown
   # Thread: <label>
   Updated: <YYYY-MM-DDTHH:MM> · Session: ${CLAUDE_SESSION_ID} · Wings: -

   ## Goal
   <one paragraph — fill in>

   ## Current state
   (new thread)

   ## Decisions made
   -

   ## Open items / next step
   - [ ] <first action>

   ## Key references
   -
   ```
3. Tip the user: name the CLI session to match so `claude --resume <label>` lines up — `/rename <label>`.
4. Confirm: `✓ active thread · <label>`.

---

## Notes

- One session binds to one thread at a time. Re-running `/thread <other>` re-binds (a context switch — consider `/consolidate` on the old thread first).
- The thread label and `/hydrate-context`'s topic argument are the same string — that is the unification.

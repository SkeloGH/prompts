---
name: role
description: Adopt a working role for a project and self-hydrate context from that role's perspective. Given "<project> <role>" (e.g. "/role savia analyst"), it loads the role's charter + prior role-work from repos and memories; on the FIRST time a role is played it researches current external/industry practice (online, beyond training data) and synthesizes a charter. Then binds the persona for the rest of the session. Triggers — "/role <project> <role>", "/role list", "/role drop", "/role refresh <project> <role>", "adopt the <role> role", "be the <project> <role>".
argument-hint: "[<project> <role> | list | drop | refresh <project> <role>]"
---

> **Portability:** paths below use `$AGENT_OPS` (your clone of the agent-ops/bus repo) and `~/` (home). Set `$AGENT_OPS` for your machine before relying on the shell snippets; an installed copy under `~/.claude/skills` may use absolute paths.

# role

`/role` is the **role-scoped sibling of `/hydrate-context`**. Where `/hydrate-context` answers *"what is the state of this task?"*, `/role` answers *"who am I working as, and what does that role already know?"* — then operates as that role for the rest of the session.

Two axes, not one:
- A **thread** (`/thread`, `/checkpoint`, `/consolidate`) is the **what** — a unit of work that spans sessions.
- A **role** (this skill) is the **as whom** — a persona with a charter (responsibilities, deliverables, standards, lens) that spans projects and sessions.

They compose: you can be the `savia analyst` working the `savia-byok-qa` thread. A role does **not** replace a thread and does not bind/unbind threads — leave the thread system untouched.

A role is identified by `<project>` + `<role>`, slugged `<project>__<role>` (each part kebab-cased, `[a-z0-9-]+`). Example: `savia analyst` → `savia__analyst`.

Each role owns:
- a **charter** — `$AGENT_OPS/roles/<slug>.md` (the durable definition + prior-work log). **Its existence is the "has this role been played before?" test.**
- a **registry entry** — `$AGENT_OPS/roles/index.json`, binding `session_id ↔ slug` (managed with the Read/Write tools directly — no PowerShell; `-ExecutionPolicy Bypass` is classifier-blocked on this machine, and the role axis is deliberately independent of the thread registry).
- **KG provenance** — mempalace `worked_on` triples tying the role to the project.

---

## Step 0 — Parse `$ARGUMENTS` and dispatch

- **`list`** (or asking "what roles do I have / what role am I in") → go to **§ list**.
- **`drop`** (or "step out of the role") → go to **§ drop**.
- **`refresh <project> <role>`** → adopt as normal but **force** the first-play online research even though a charter exists (Step 2B research + merge into the existing charter). Use when the charter is stale.
- **`<project> <role>`** (two+ words) → the adopt flow below. The first token is the project, the rest is the role (roles may be multi-word, e.g. `savia data analyst` → project `savia`, role `data-analyst`).

Hold the slug `<project>__<role>` as `<slug>` for the rest of the run.

**Resolve the project's coordinates** the same way `/hydrate-context` does — from the session's CLAUDE.md + auto-memory (`MEMORY.md`):
- local repo path(s) for `<project>` (e.g. savia → `~/Code/<project>/...`),
- the mempalace **wing** for `<project>` (e.g. `savia_mobile`),
- which optional sources are reachable (Notion, Slack, web).

If the project is unknown from context, say so and ask for the repo path / wing before proceeding — do not guess a path.

---

## Step 1 — Has this role been played before? (charter check)

Read `$AGENT_OPS/roles/<slug>.md`.
- **Exists** → **RESUME** an established role: Step 2A.
- **Absent** → **FIRST PLAY** — bootstrap the charter: Step 2B.

(`refresh` always runs Step 2B's research even when the charter exists, then merges.)

---

## Step 2A — Resume an established role

Read the charter, then run a **role-lensed local sweep** — `/hydrate-context`'s machinery, filtered through the role. Run all of these **in parallel** (one batch):

1. **Charter** (already read) — the authoritative definition + prior-work log + open role-questions.
2. **Mempalace diary**, fanned across `agent_name` values (`claude-code`, `Cursor`, `Composer`, `Codex`) with `topic` ≈ `<slug>` or the project — filter to entries about *this role's* work. Never read a single agent_name. (See `/hydrate-context` §B.)
3. **Mempalace semantic search** scoped to the wing: `mempalace_search "<role> <project> <key responsibilities>" --wing <wing> --limit 6` — surfaces prior analyses, decisions, deliverables made in this role.
4. **Mempalace KG**: `mempalace_kg_query "<project>"` and `"<slug>"` — pull `worked_on` provenance and any role-relevant `decided` / `open_decision` / `provides` triples.
5. **Repos + memories**: grep the project repo(s) and auto-memory for artifacts this role owns (e.g. an analyst's reports, notebooks, dashboards, queries). Dispatch an `Explore` subagent if the surface is broad.

**Do not** go online on a resume unless the user passed `refresh` or the charter's `Revisit triggers` fire (e.g. "re-research methods if >90 days old"). Then go to Step 3.

---

## Step 2B — First play: bootstrap the charter

No charter exists. Build one from three sources, **in parallel**:

1. **Latent local role-work** — sweep repos + mempalace + memory for anything already done in this role even though it was never formally adopted (Step 2A's sweep, tolerant of empty results).

2. **External / online practice (ALWAYS on first play)** — dispatch the **`compound-engineering:research:best-practices-researcher`** subagent (it has WebSearch/WebFetch). Brief it to return **current, post-training-cutoff** practice for this role, specifically:
   - what this role *does* — core responsibilities, standard deliverables, and the decision lens it applies;
   - the methods / frameworks / metrics the role is expected to use (cite sources + dates);
   - role-relevant standards or regulations for the project's domain (e.g. for a fintech analyst: data-privacy, reporting norms — note the user is in Guadalajara, MX, so prefer MX/LATAM-applicable norms where domain-relevant);
   - common pitfalls / anti-patterns for the role.
   Tell it to flag anything it could not verify rather than fill from assumption. **Source-quality guard (required):** restrict sources to reputable origins — named firms/publishers, government (`.gob.mx` / `.gov`), standards bodies (IAPP, ISO, ITIL), and established outlets. Do **NOT** WebFetch low-reputation SEO/AI content farms — especially non-Wikipedia `.wiki` domains (e.g. `compliancehub.wiki` repeatedly tripped AVG's `URL:Blacklist` during MX/LFPDPPP research and spammed the operator with threat popups). Prefer reading search snippets over fetching unknown domains. For a project- *and* code-specific lens, optionally also dispatch `repo-research-analyst` on the repo in the same batch.

3. **Project context** — the resolved repo conventions + any project memory (goals, constraints) so the charter is grounded in *this* project, not generic.

**Synthesize and write** `$AGENT_OPS/roles/<slug>.md` with the Write tool, using the charter template below. Then:
- **Seed the KG**: `mempalace_kg_add` `worked_on` (subject = the role/agent, object = `<project>` as `<role>`, `valid_from` = today). Add `provides` triples for the role's deliverables if clearly defined. Use only canonical predicates (see `/consolidate`'s vocabulary) — never invent one.
- File a one-paragraph drawer in the project's wing (room `general` or `roles` if it exists) noting the role was established, so semantic search finds it later. `mempalace_check_duplicate` first (threshold 0.9).

### Charter template

```markdown
# Role: <project> · <role>
Established: <YYYY-MM-DD> · Slug: <slug> · Wing: <wing> · Last played: <YYYY-MM-DD>

## Mandate
<One paragraph: what this role is responsible for ON THIS PROJECT, and the lens it
applies to every decision.>

## Responsibilities
- <core duty> — <what "done" looks like>

## Deliverables
- <artifact the role produces> — <where it lives / format>

## Methods & standards
<Frameworks, metrics, conventions, regulations the role applies. Cite external
sources + dates where they came from first-play research.>

## Tools & data
<Repos, datasets, dashboards, MCP servers, files this role touches — concrete paths.>

## Bus
- enabled: <yes|no>                  # no = solo/offline role: no DM line, no listener
- identity: <vendor>-<role>-<short>  # stable MYID (bus group name + from + presence key)
- dm: bus:inbox:<identity>           # this role's dedicated direct line — opened + listened via /subscribe
- channels: joined separately via /subscribe — NOT auto-joined on adopt

## Common pitfalls
- <anti-pattern to avoid in this role>

## Prior role-work log
<Append-only, most-recent-first. One line per session: date · what was produced/decided · refs.>
- <YYYY-MM-DD> · (role established) · sources: <research citations / drawers>

## Open role-questions
- [ ] <unresolved question this role still owes an answer to>

## Revisit triggers
- <when to re-research, e.g. "re-run external research if >90 days since Established/last refresh">

## References
- KG: <entities> · Drawers: <ids> · Repos: <paths> · External: <urls + access date>
```

Then go to Step 3.

---

## Step 3 — Bind the persona

Adopt the role for the rest of the session.

1. **Register the binding** — read `$AGENT_OPS/roles/index.json` (create `{ "sessions": {}, "roles": {} }` if absent), set `sessions[<session_id>] = <slug>` and stamp `roles[<slug>].lastPlayed = <today>` / `lastSession = <session_id>`, write it back. Use the Read/Write tools — no shell.
   - `<session_id>` is the current session id (the value used by the thread skills, e.g. from CLAUDE.md context). If it isn't resolvable, still bind in-spirit for the session and note the registry write was skipped.
2. **Update the charter** — bump `Last played`, prepend a `Prior role-work log` line for today (even if just "adopted").
3. This binding is the role analogue of a thread binding. It is **not** auto-re-injected after a `/compact` (there is no role SessionStart hook), so the charter on disk is the durable anchor — a fresh session re-running `/role <project> <role>` resumes it. If the user wants the active role echoed after every compaction, offer to add a SessionStart hook later; do not build it unprompted.

---

## Step 3.5 — Wire real-time comms (bus-enabled roles only)

Real-time agent↔agent comms stay on the **redis-bus** (not files). On adoption, a bus-enabled
role gets its own **DM line** and delegates listening to **`/subscribe`** — it does **not**
auto-join shared coordination channels.

1. **Check the charter's `Bus` section.** If `enabled: no` (solo/offline roles), skip this step
   entirely — no identity, no DM line, no listener. New charters default to `enabled: yes` unless
   the role is clearly solo.
2. **Resolve the bus identity (`MYID`).** Use the charter's `identity`. On first play, derive a
   stable one — `<vendor>-<role>-<short>` or `<machine>-<role>` (e.g. `simrig-it-desk`) per the bus
   naming convention — and **record it in the charter** so resumes reuse the same id (it is the
   group name, `from`, and presence key; it MUST be stable across sessions).
3. **Open the DM line via `/subscribe`.** The DM line is the agent's dedicated direct stream
   **`bus:inbox:<MYID>`** (the existing `/subscribe` DM convention — point-to-point, not in topic
   fan-out). Invoke `/subscribe` to open it and arm the Monitor on `bus:inbox:<MYID>` so DMs wake
   the session in real time. **`/role` never reimplements the listener** — `/subscribe` owns
   identity mechanics, presence heartbeat, the wake gate, and the Monitor.
4. **Do NOT auto-join shared topic channels.** Joining a coordination channel (`bus:topic:<label>`)
   stays a separate, explicit `/subscribe <label>` the operator runs when the role actually needs
   that room. Adopting a role opens only the agent's own DM line.
5. **If the bus isn't available** (the `redis-bus` MCP tools are absent / `agent-bus-redis` isn't
   running), record the intended `identity` + `dm` in the charter, report that live wiring is
   deferred, and continue — never block adoption on the bus being up.
6. **Mirror to the registry.** Record `bus`/`identity`/`dm` into `$AGENT_OPS/roles/index.json`
   under `roles[<slug>]` (in addition to the charter's `Bus` section), so ticket filers can resolve
   role → DM line from that one file (see PROTOCOL.md "Addressing a role" + `/tickets`).
7. **Arm the file-inbox watcher too (symmetry).** Role-addressed tickets can also arrive as *files*
   in `~/.claude/inbox/pending/` **without** a bus doorbell — the DM-line listener won't catch those.
   So a bus-enabled role ALSO arms a persistent watcher (a poll-loop Monitor) on `pending/`, filtered
   to `to ∈ { <slug>, <identity>, "orchestrator", absent }`, emitting only *new* matching tickets
   (seed the seen-set with the current dir so adoption doesn't re-announce the backlog — Step 4's scan
   covers that). DM line + file watcher = both intake channels covered. Record both watcher task ids in
   the charter (an "Intake watchers" line). Solo/bus-disabled roles skip this — they're pull-only by
   choice (on-adopt scan + breakpoints).

---

## Step 4 — Emit the role brief and adopt

Produce a brief from the role's vantage. Omit empty sections; cite each fact's source (charter, diary date, drawer, KG, repo path, external url).

**First, check the ticket queue for this role:** scan `~/.claude/inbox/pending/` for tickets
addressed to this role (run `/tickets` — its role filter resolves your slug) and surface any in the
brief. Role-addressed tickets queue even when no one holds the role, so adoption is exactly when
they get picked up. (Applies to every role, not just inbox-owning ones.)

```
## Operating as: <project> · <role>
<One line: the mandate + the lens I will now apply.>

### What this role knows / has done
<Prior role-work from the charter log + diary + repo artifacts — cite sources.
 On first play: "newly established — no prior work" + the synthesized basis.>

### Methods & standards I'll apply
<From the charter — the frameworks/metrics/regulations, with sources.>

### State relevant to this role right now
<Current project state filtered to what this role cares about — cite.>

### Open role-questions
<Unresolved items the role owes — from charter + sweep.>

### How I'll work differently in this role
<Concrete behavioral shifts: what I'll prioritize, the deliverables I'll aim for,
 the lens I'll bring to decisions this session.>
```

End by stating plainly: **"Now operating as `<project> <role>`. Run `/role drop` to step out, or `/role list` to see active role."** Then continue the user's work in-character.

For the rest of the session, let the charter shape behavior: prioritize the role's deliverables, apply its methods, and weigh decisions through its lens — without ignoring the user's direct instructions, which always override.

---

## § list

- Read `$AGENT_OPS/roles/index.json`; report the role bound to **this** session (`sessions[<session_id>]`) and the full `roles` map (slug · last played).
- Also list charter files in `$AGENT_OPS/roles/*.md` so charters that exist but were never bound this session still show.

## § drop

- Read `$AGENT_OPS/roles/index.json`, remove `sessions[<session_id>]`, write it back.
- Confirm: `✓ stepped out of role · <slug>`. Suggest a charter update (Prior role-work log line) if the session produced role work worth recording.
- Note: the charter file persists; dropping only unbinds the current session.

---

## Inbox-owning roles

Some roles **receive tickets** — most notably a help-desk / operator role like `simrig it-desk`.
For any such role:
- The first-play charter (Step 2B) MUST list **"triage the agent inbox"** as a standing
  responsibility, with the tool named: `/tickets triage` over `~/.claude/inbox/pending/`
  (filing convention in `~/.claude/inbox/PROTOCOL.md`).
- On adopt (Step 4), run `/tickets list` as part of the role brief and surface the pending
  queue. On a resume (Step 2A), check it again. Adopting the role is what makes the inbox get
  checked — no polling hook needed for an interactive session.
- Put the inbox path in the charter's **Tools & data** section so resumes rediscover it.

## Persistence & the memory lifecycle

- The **charter** is to a role what the **thread snapshot** is to a thread: the durable, resumable anchor. Append to its `Prior role-work log` as the role produces work — at session end or before `/compact`, fold the session's role-work into the charter (this is the role analogue of `/consolidate`'s snapshot rewrite).
- Substantive role *decisions* still belong in the KG + decision drawers via normal `/consolidate` — the charter logs *that* work happened and points to them; it is not a second copy of the reasoning.
- Diary checkpoints for role work use `topic = <slug>` so a later `/role` resume (Step 2A) finds them.

## Rules

- **First play ALWAYS researches online** (Step 2B) — the whole point is to import current external practice the model's training data may lack. Only `refresh` re-triggers it afterward.
- **Never invent a charter from training data alone on first play** — ground it in the parallel research + the project's actual repos/memory, and cite sources. Flag unverified claims.
- **Roles ≠ threads.** Never touch the thread registry (`~/.mempalace/threads/`) or rebind/unbind a thread from this skill.
- **Formation changes are announced before charter edits** (it-desk IT-029). A mid-sprint role re-allocation (absorb/split/rename) is a labeled `FORMATION CHANGE` broadcast on the project topic — with unwind steps — BEFORE you edit any charter/KG. Don't silently absorb seats via direct charter edits; the bus records the change going in.
- **Run sweeps in parallel** and **cite every source**, exactly as `/hydrate-context` requires — never rely on a single `mempalace_diary_read` agent_name.
- **No PowerShell** for the registry — edit `$AGENT_OPS/roles/index.json` with Read/Write directly.
- **Real-time comms stay on the redis-bus, not files.** A bus-enabled role opens only its own DM line (`bus:inbox:<identity>`) and delegates all listening to `/subscribe`; it never reimplements the listener and never auto-joins shared channels (that is a separate `/subscribe <label>`). The file-drop ticket inbox (`~/.claude/inbox`) is the bus-free *async* intake; the bus DM line is the *real-time* intake — they coexist.
- **The user's direct instructions override the persona**, always. The role is a lens, not a constraint on obeying the user.

---
name: hydrate-context
description: Full context sweep for a task — given a repo/project and an identifier (PR number, feature name, topic). Queries every available knowledge source in parallel (mempalace diary + KG + semantic search, GitHub PR, Notion, local learnings, stored references) and synthesizes a structured brief. Use when the user says "/hydrate-context <repo> PR <number>", "/hydrate-context <repo> <topic>", or asks to "get up to speed" on a task.
---

# hydrate-context

Builds a structured context brief by sweeping every available knowledge source in parallel, then synthesizing. The most common mistake is querying only one or two sources (e.g. semantic search only) and missing temporal state, specs, or stored external references.

## Step 0 — Parse and infer

From the user's args and the session's CLAUDE.md / memory:
- **Topic / thread label**: PR number, feature name, branch, or free topic string. This string doubles as the **thread label** — the join key shared with `/consolidate` and `/checkpoint`.
- **Repo**: which sub-repo or project (infer the mempalace wing and local git path from project context)
- **Available tools**: note which of the optional sources below are reachable (Notion MCP, Slack MCP, etc.)

**Resolve the thread label.** `REG` = `powershell -NoProfile -ExecutionPolicy Bypass -File "%USERPROFILE%/.mempalace/threads/registry.ps1"`.
- If the user passed an exact label, use it.
- If the user passed a free-topic string (e.g. "savia mobile on-device ai"), **list `%USERPROFILE%/.mempalace/threads/` and fuzzy-match the topic against existing snapshot filenames before treating it as greenfield.** A topic that loosely matches an existing thread label (case-insensitive, hyphens/spaces fungible, substring or word-overlap) almost certainly refers to that thread — resolve to the canonical label and resume from its snapshot instead of re-discovering state. If multiple candidates match, list them and ask which one.
- If no user-supplied label/topic, resolve the session's bound thread: `REG -Action resolve -SessionId "${CLAUDE_SESSION_ID}"`.
- If a label is resolved, the diary entries for it are topic-tagged with it (see §B), and a snapshot may exist (see §0).

---

## Step 1 — Parallel fetch (all sources at once)

Run every applicable fetch in a single parallel batch.

### 0. Thread snapshot *(if a thread label is resolved — do this first)*

If a thread label resolved in Step 0, read its snapshot:
```
%USERPROFILE%/.mempalace/threads/<label>.md
```
This is the **deterministic resume anchor** — the last full `/consolidate` state (goal, current state, decisions, open items, next step). It is the most authoritative single source: a fresh session should be able to resume from it alone. If the file does not exist, the thread has been labelled but never consolidated — note that and lean on the diary trail instead.

The replay model: **snapshot (this file) + checkpoints since (topic-tagged diary, §B) = current working context.**

### A. GitHub PR *(if PR number given)*
```
gh pr view <N> --json title,body,state,headRefName,baseRefName,files,labels,assignees,comments
```
Run from the repo's local directory.

### B. Mempalace — diary *(always)*

`mempalace_diary_read` is **scoped per `agent_name`** — entries written from Claude Code vs Cursor vs Composer land in separate diary streams. Reading **only one** name usually misses the full trail even when diary history exists.

**Every hydrate-context run:** call `mempalace_diary_read` **in parallel** once per canonical identity below (same batch as other fetches). Use `last_n` **15–25** each so merged coverage is substantive without drowning the synthesis.

| `agent_name` | Typical source |
|----------------|----------------|
| `claude-code` | Claude Code (`mempalace_diary_write` default in team practice) |
| `Cursor` | Cursor IDE agent |
| `Composer` | Cursor Composer-style sessions |
| `Codex` | OpenAI Codex / similar |

If your team consistently uses another diary label, add it here and include it in the parallel batch.

**Synthesis:** merge all non-empty `entries` arrays, sort or scan by recency, and filter for the topic / wing / PR. Cite diary facts as **`(diary · <agent_name> · <entry date>)`**. If **every** parallel read returns empty, say so explicitly — do not pretend there is no diary system-wide.

**This is the most commonly skipped or under-read source — never omit it and never rely on a single `agent_name`.**

### C. Mempalace — semantic search *(always)*
```
mempalace_search "<topic>" --wing <inferred wing> --limit 6
```
Surfaces decision drawers, PR body snapshots, handoff prompts, architecture notes.

### D. Mempalace — KG query *(when identifier maps to a named entity)*
```
mempalace_kg_query "<entity>"
```
Typed relationships: dependencies, decisions, open questions, status, successor/predecessor features.

### E. Stored references — specs, plans, spikes
Mempalace and auto-memory may contain `reference`-type drawers or entries pointing to external specs (Notion, Linear, Confluence, internal wikis). Check:
1. Scan the session's memory (`MEMORY.md` + memory files) for `reference` entries related to the topic.
2. Search mempalace for drawers in rooms likely to hold specs: `specs`, `decisions`, `research`, `general` — look for Notion URLs, Linear links, doc titles.
3. If a Notion URL or page ID is found and the Notion MCP is available, fetch it:
   ```
   notion-fetch <page_id_or_url>
   ```
   Also search Notion directly for the topic:
   ```
   notion-search "<topic>"
   ```

### F. Local learnings *(always)*
Check project-level learnings for prior solutions, architecture notes, or gotchas:
```
<project-root>/.claude/learnings/   # or .cursor/learnings/ — infer from CLAUDE.md
```
Grep for the topic, feature name, or PR number across all `.md` files.

### G. Optional — Slack / other platforms
If Slack MCP is available and the topic is substantial (not a trivial fix), search for recent discussion:
```
slack_search_public_and_private "<topic>"
```

---

## Step 2 — Synthesize

Produce a brief. Omit sections where nothing was found. Cite the source of each fact (diary, drawer name, KG, PR body, Notion page, learnings file).

```
## <PR title or feature name>
<State + branch — if PR. One-sentence summary.>

### Thread snapshot
<Goal, current state, and the recorded next step from the thread snapshot file —
 then the checkpoints logged since it (topic-tagged diary). Omit if no thread label.>

### Stack / feature context
<Where this sits in the broader work; what shipped before; what comes after>

### Specs & plans
<Links or summaries from Notion/external docs, with source cited>

### Architecture decisions that apply
<Non-obvious constraints and tradeoffs from mempalace drawers — cite drawer name>

### What was in flight (diary)
<Open questions, unresolved threads, last-known state from diary entries — cite date>

### Prior learnings
<Relevant gotchas or solutions from learnings files — cite file path>

### Open items
<Unchecked test-plan items, deferred tracker rows, follow-up work>
```

End with: *"Anything else to pull before we start?"*

---

## Rules

- **Never skip the diary.** Semantic search alone misses temporal state. **Always fan out `mempalace_diary_read` across multiple `agent_name` values** (see §B) — one name is never exhaustive.
- **Always check stored references** before deciding external docs are unavailable — mempalace and memory often hold Notion URLs or spec pointers.
- **Run all fetches in parallel** — they are independent.
- **Say so when nothing was found** — do not fill gaps from training-data assumptions.
- **Cite every source** — note whether each fact came from diary, named drawer, KG, PR body, Notion, or learnings.

---
name: mempalace
description: Operate the local mempalace memory system — save decisions as drawers, add typed facts to the knowledge graph, write diary entries, seed new projects, re-mine existing ones, and capture finished PRs. Use when the user says "remember this", "save to mempalace", "what do we know about X", "bootstrap mempalace for this project", "re-mine the palace", "capture this PR", "wrap up this feature", or asks mempalace to recall past decisions about savia, cloudrig, or shakr.
---

# Mempalace Operations

Mempalace is a local-first AI memory system installed at `%USERPROFILE%/pipx/venvs/mempalace/` and exposed as `mempalace_*` MCP tools. It stores verbatim content in ChromaDB plus a SQLite knowledge graph at `~/.mempalace/palace/`.

## Current wings

- `savia_edge`, `savia_mobile`, `savia_web` — Savia polyrepo (LatAm personal finance: React Native + Next.js + Supabase edge)
- `cloudrig_cr_api`, `cloudrig_cr_field`, `cloudrig_cr_pm`, `cloudrig_cr_view_models` — CloudRig polyrepo (construction PM platform: Node.js backend + Next.js web + React Native mobile + shared API client)
- `shakr` — haptic playback engine monorepo (Python/PySide6 desktop + Expo mobile + Supabase backend)

## Operations

### 1. Save a decision as a drawer

Triggered by: *"remember this"*, *"save this decision"*, *"file this"*, or when the user describes a non-obvious constraint, tradeoff, or rule that isn't in the code.

1. Infer the wing from context, or ask.
2. Pick a room. Prefer existing rooms visible in `mempalace_list_rooms`; fall back to `general` or a domain-appropriate name.
3. Call `mempalace_check_duplicate` first with a ~90% threshold to avoid filing the same decision twice.
4. Call `mempalace_add_drawer` with verbatim content structured as:
   - **What**: the decision, rule, or observation
   - **Why**: the reasoning (constraint, incident, tradeoff, stakeholder ask)
   - **When**: an absolute ISO date (convert "today" → YYYY-MM-DD before filing)
   - **Revisit trigger**: what change would make you reconsider
5. Confirm the returned `drawer_id` to the user.

### 2. Add a typed fact to the knowledge graph

Triggered by: the user states a fact about a person, project, or entity that has temporal validity, or during initial project seeding.

1. Call `mempalace_kg_query` on the subject first to check for duplicates.
2. Call `mempalace_kg_add` with `subject`, `predicate`, `object`, and `valid_from` in ISO date format.
3. If the new fact replaces an older one (e.g. stack migration, role change), call `mempalace_kg_invalidate` on the old triple first — don't silently shadow it.
4. Prefer stable, typed predicates: `is_a`, `uses`, `targets`, `requires`, `deployed_on`, `child_of`, `partner_of`, `worked_on`, `decided_against`, `open_decision`. Avoid free-form phrases.

### 3. Write a diary entry

Triggered by: end of a substantive session, or explicit *"write a diary entry"*.

1. Summarize in three beats: what was done, what was decided, what's still open.
2. Keep it under ~200 tokens. Use AAAK-ish style with entity codes, pipes as separators, and date prefixes. Example: `SESSION:2026-04-08|palace.bootstrap|7.wings.seeded|kg.populated.from.CLAUDE.md|next:weekly.remine`.
3. Call `mempalace_diary_write` with `agent_name="claude-code"` (or the current agent's actual name) and the composed entry.

### 4. Seed a new project into the palace

Triggered by: *"add this repo to mempalace"*, *"bootstrap mempalace for this project"*.

1. Determine structure: monorepo (single wing, many rooms) vs polyrepo (one wing per sub-repo — check each sub-dir for its own `.git/`).
2. Run init with auto-accept + newline for room prompt, via Bash:
   ```bash
   cd ~/Documents/Code
   export PYTHONIOENCODING=utf-8
   printf '\n' | mempalace init <path> --yes
   ```
3. Overwrite `<path>/entities.json` with a clean single-project entry:
   ```json
   {
     "people": [],
     "projects": ["<Clean Project Name>"]
   }
   ```
4. Run `mempalace mine <path>` with a generous timeout (900000ms+) in the background — mines on large repos take several minutes. Stdout is fully buffered when not a TTY; monitor progress via `ls -la ~/.mempalace/palace/chroma.sqlite3` if needed.
5. After the mine completes, read the project's CLAUDE.md / README / AGENTS.md and call `mempalace_kg_add` to seed the KG with identity/stack/rules/open decisions — same pattern as initial bootstrap.
6. Offer to append a mempalace section to the project's CLAUDE.md referencing the new wing name.

### 5. Re-mine for freshness

Triggered by: *"refresh the palace"*, *"re-mine savia"*, *"update mempalace"*, or when the user notes the palace is stale.

1. Run `mempalace mine <wing_path>` for each wing sequentially — never in parallel (ChromaDB write conflicts).
2. Mempalace deduplicates by content hash; unchanged files are skipped automatically. Report "Files processed / Files skipped / Drawers filed" per wing.
3. If a specific wing is named, only re-mine that one.

### 6. Answer from the palace

Triggered by: the user asks about existing code, past decisions, or project history.

1. For factual "what/who/when" questions about an entity → `mempalace_kg_query` first.
2. For implementation/code questions → `mempalace_search` with `wing` (and `room` when obvious) filter. Unfiltered search is diluted across 70k+ drawers.
3. For cross-project pattern discovery → `mempalace_find_tunnels` or unfiltered `mempalace_search`.
4. For "what rooms exist in X wing" → `mempalace_list_rooms` with `wing` param.
5. Always cite drawer IDs or sources in your answer so the user can verify.

### 7. Capture a finished PR

Triggered by: *"capture this PR"*, *"wrap up this feature in mempalace"*, *"save the decision behind this PR"*, or when the user is about to merge / has just opened a PR and wants the institutional knowledge preserved.

**Core principle: save what's in the author's head that isn't anywhere else yet. Not the diff (git has it), not the PR description (GitHub has it), not the file list (mechanical noise).**

1. **Identify the target wing(s)**. Look at which directories the PR touched. Map to wing names (e.g. `cloudrig/cr-pm/*` → `cloudrig_cr_pm`). A single PR may touch multiple wings — save one drawer per wing if the rationale differs, or one drawer in the most central wing if it's one coherent decision.

2. **Search first** via `mempalace_search` with `--wing` for the PR's main concept. If anything related surfaces that:
   - Contradicts the new approach → flag to the user before saving.
   - Overlaps substantively → either call `mempalace_kg_invalidate` on the old fact and supersede it, or reference the prior drawer ID in the new drawer's content so they're linked.

3. **Save the decision as a drawer** via `mempalace_add_drawer`:
   - `wing`: as identified in step 1
   - `room`: prefer existing `decisions` if it exists; otherwise `general` or a domain room
   - `source_file`: the PR URL/number, or empty
   - `added_by`: `"pr-capture"` (so these drawers are grep-able)
   - `content`: a verbatim markdown block with this exact structure:
     ```
     # <One-line summary of what the PR introduces>

     **PR**: <number or URL>
     **Date**: <YYYY-MM-DD — always absolute, convert "today" first>
     **Wing**: <wing name>

     ## What
     <One paragraph: what this PR actually does, not what feature it adds. Be concrete.>

     ## Why
     <The real reason. A constraint, an incident, a perf issue, a stakeholder ask, a bug class that kept recurring. NOT "to add feature X" — that's circular.>

     ## Rejected alternatives
     - **<Option A>**: <why it lost — be specific>
     - **<Option B>**: <why it lost>

     ## Gotchas discovered
     - <Non-obvious thing hit during implementation that would save future-me time>
     - <Another one>

     ## Revisit triggers
     - <What change in circumstances would make us reconsider this approach?>
     - <E.g. "if we ever need to support offline writes", "if Node version unlocks", etc.>

     ## Open questions
     - <Anything deferred to a follow-up PR or a future decision>
     ```
   Skip any section that genuinely has nothing to say — don't pad. Better to ship 3 real sections than 6 with filler.

4. **Run `mempalace_check_duplicate`** on the drawer content (threshold 0.9) before filing. If a near-duplicate already exists, ask the user whether to update or skip — don't blindly file a second copy.

5. **Add KG facts** via `mempalace_kg_add` for anything durable introduced by the PR:
   - New dependency: `<wing> uses <library>` with `valid_from=<date>`
   - New pattern: `<wing> uses <pattern-name>` with `source_closet=<drawer_id>`
   - New constraint: `<wing> requires <thing>`
   - Deprecation: call `mempalace_kg_invalidate` on the old triple FIRST with `ended=<date>`, then add the replacement.
   Prefer stable predicates (`uses`, `requires`, `deployed_on`, `replaces`). Don't add KG facts for one-off code changes — the drawer already covers them.

6. **Write a diary entry** via `mempalace_diary_write` (`agent_name="claude-code"` or the current agent name), AAAK-style, under ~200 tokens. Format:
   ```
   SESSION:<YYYY-MM-DD>|<wing>|pr#<N>|<short.what>|<key.decision>|<gotcha.if.any>|next:merge+remine
   ```

7. **Remind the user** at the end: *"After this PR merges, run `mempalace mine <path>` on the affected wing(s) to pull the new code into the palace. Dedup is automatic — only changed files get re-embedded."*

**What NOT to do:**
- Do not save the code diff or file list — that's git's job.
- Do not paste the PR description verbatim — that's GitHub's job.
- Do not save conversation filler, thanks, or "this was hard" reflections — keep the drawer signal-dense.
- Do not save a drawer per file changed — one drawer per rationale.
- Do not invent rejected alternatives that weren't actually considered. Empty section is fine.

## Known quirks — do not forget

- **UTF-8 on Windows**: always `export PYTHONIOENCODING=utf-8` before calling the CLI from Bash, otherwise it crashes with `cp1252` encoding errors on Unicode confidence bars and icons.
- **`--yes` ≠ fully non-interactive**: the flag skips entity confirmation but NOT the room confirmation prompt. Pipe `printf '\n'` into stdin.
- **Entity auto-detector is noisy**: on code repos it latches onto generic English words ("Transaction", "Functions", "React", "Native"). Always auto-accept with `--yes` and then overwrite `entities.json` manually with the clean single-project entry.
- **`mempalace status` has a ~10k drawer display cap**: that's a display bug, not a storage limit. The palace can hold far more than 10k. Use it to verify wings exist, not for accurate totals.
- **Mines on large repos are slow and silent**: 10+ minutes for 1000+ files. Stdout is fully buffered when not a TTY — don't interpret empty output as "stuck". Check `~/.mempalace/palace/chroma.sqlite3` mtime/size for actual progress.
- **Do NOT install `hooks/mempal_save_hook.sh`**: path traversal issue (upstream #121) not yet patched. Rely on this skill + CLAUDE.md instructions instead.
- **AAAK compression mode is a regression**: the README itself acknowledges it scores lower on retrieval than raw mode. The palace is in raw mode; leave it there.
- **No concurrent writes**: never run two `mempalace mine` commands in parallel — they share a single ChromaDB instance and will conflict.
- **NEVER kill a mine mid-run**: ChromaDB's HNSW vector index cannot recover from a killed writer. Killing a mine corrupts the HNSW for the *entire palace* (not just the wing being mined), making every wing unreadable with `Error loading hnsw index`. The only recovery is to wipe `~/.mempalace/palace/` and re-mine every wing. If a mine is taking too long, let it finish or accept the wipe — do not kill.
- **MCP server processes hold the HNSW exclusively**: before doing any direct-to-chromadb work (bulk delete, compaction, repair), stop any running `python -m mempalace.mcp_server` processes. They'll auto-restart on next tool call. Detect with `powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter 'Name=\"python.exe\"' | Where-Object { \$_.CommandLine -like '*mempalace*mcp_server*' } | Select-Object ProcessId,CommandLine | Format-List"`.
- **`.mypy_cache/` is NOT in standard Python .gitignore templates**: if a project uses mypy, explicitly add `.mypy_cache/`, `.pytest_cache/`, and `.ruff_cache/` to its `.gitignore` before mining. Otherwise mempalace indexes tens of thousands of `.data.json` files per wing. Same caution for any tool-specific cache dir (`.next/`, `.turbo/`, `.nx/cache`, `.gradle/caches`).
- **Vectors are NOT in sqlite**: the palace `chroma.sqlite3` stores metadata and documents; actual embedding vectors live in HNSW `.bin` files under `<palace>/<uuid>/`. Wiping the HNSW dir = losing all vectors = must re-embed everything = full re-mine.
- **Python via bash on Windows — use quoted heredocs, not `-c`**: direct chromadb / sqlite operations commonly hit a 3-layer escape minefield (JSON tool-call encoding + bash string escaping + Python backslash literals). The canonical pattern is:
  ```bash
  "%USERPROFILE%/pipx/venvs/mempalace/Scripts/python.exe" - <<'PYEOF'
  import chromadb, os
  client = chromadb.PersistentClient(path=os.path.expanduser("~/.mempalace/palace"))
  col = client.get_collection("mempalace_drawers")
  src = r"C:\path\to\your\project"   # raw string — dodges Python's backslash escape
  print(col.count(), src.replace(chr(92), "/"))
  PYEOF
  ```
  The **quoted** delimiter (`'PYEOF'`) is what disables bash expansion. Raw strings (`r"..."`) handle Python's own backslash interpretation. Together they neutralize all layers. Never embed chromadb/sqlite Python inside a double-quoted `python -c "..."` on this machine — every session that does gets bitten. For anything >30 lines or that will be re-run, write a file instead.

## Quick reference — CLI paths

- Python binary: `%USERPROFILE%/pipx/venvs/mempalace/Scripts/python.exe`
- CLI shim: `mempalace` (on PATH via pipx)
- MCP entry: `python -m mempalace.mcp_server`
- Palace data: `~/.mempalace/palace/`
- Knowledge graph: `~/.mempalace/knowledge_graph.sqlite3`
- Per-project config: `<project>/mempalace.yaml` and `<project>/entities.json`

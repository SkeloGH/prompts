# Global guidance for Claude Code sessions

Portable, sanitized version of my machine-global `~/.claude/CLAUDE.md`. Drop this
into `~/.claude/CLAUDE.md` (or merge it) on a new machine. Machine-private bits
(local memory-system internals, antivirus cert specifics, local LLM install) are
intentionally omitted; user paths are parameterized to `%USERPROFILE%`.

## Shell patterns (Windows + Python + bash)

When running bash on Windows (git bash), embedding multi-line Python in a bash
`-c` double-quoted string is a **minefield**: JSON tool-call escaping + bash
string escaping + Python backslash-in-string-literals stack in ways that cause
silent or cryptic `SyntaxError: unterminated string literal` failures.

### Canonical pattern — Python via bash with a quoted heredoc

```bash
python - <<'PYEOF'
# QUOTED delimiter ('PYEOF' not PYEOF) disables ALL bash expansion inside:
# no $ interpolation, no backtick expansion, no backslash processing.
# Bash sees the entire block as raw text. Python gets it verbatim.
import os
# For Windows paths use raw strings to dodge Python's OWN backslash escape:
src = r"C:\path\to\your\project"
print(src.replace(chr(92), "/"))
PYEOF
```

### Hard rules

- **NEVER embed multi-line Python inside a bash `-c "..."` double-quoted string.**
  Use a quoted heredoc (`<<'PYEOF'` ... `PYEOF`) OR write to a `.py` file first.
- **Quote the heredoc delimiter** (`<<'PYEOF'` not `<<PYEOF`). The quotes are what
  disable shell expansion. Without them, `$`, `` ` ``, and `\` get mangled by bash.
- **For Windows paths in embedded Python, use raw strings** (`r"C:\..."`) — NOT
  double-escaped (`"C:\\..."`). Raw strings sidestep Python's string-literal
  backslash interpretation.
- **For path separators in replace calls**, prefer `chr(92)` over `"\\"` — makes
  the code layer-independent and unambiguous.
- **If any of the above feels fragile, write a file.** The `Write` tool takes
  literal string parameters, no shell in between.

### Decision table

| Situation | Use |
|---|---|
| One-shot read-only probe (sqlite query, process listing), <20 lines of Python | Quoted heredoc via `python - <<'PYEOF'` |
| Destructive operation (bulk delete, bulk update, wipe) | File in a scripts dir — review before running |
| Long-running (>2 min) | File + `run_in_background=true` — output goes to a log, doesn't pollute context |
| Will be re-run more than once | File — naturally |
| <10 lines of trivial logic, no Windows paths, no $ / backticks | Inline `python -c "..."` is fine |
| Complex Python with f-strings, path manipulation, or multi-line logic | **Quoted heredoc** (not `-c`, not a file) — the sweet spot for one-off operations |

## Shell / Tooling Quirks

### gh CLI on Windows
If the GitHub CLI dir (e.g. `C:\Program Files\GitHub CLI`) is on the inherited
PATH for Claude Code's bash, plain `gh ...` works directly — no full-path
invocation needed. Avoid adding an `alias gh=...` to `.bashrc` pointing at a
Windows-style path: alias expansion is text-substituted then word-split on the
space, which *breaks* the working setup.

### gh api — URL paths must NOT have a leading slash
Under git-bash / MSYS, a leading `/` on a `gh api` URL path gets rewritten to a
Windows filesystem path before gh sees it, producing errors like *"invalid API
endpoint: 'C:/Program Files/Git/repos/…'"*. Omit the leading slash:

```bash
# WRONG — MSYS mangles the path
gh api /repos/OWNER/REPO/issues/comments/1234 -X PATCH -f body='...'

# RIGHT — no leading slash
gh api repos/OWNER/REPO/issues/comments/1234 -X PATCH -f body='...'
```

gh accepts both forms on platforms without MSYS rewriting, so the no-slash form
is portable. Applies to `-X PATCH`, `-X PUT`, `-X DELETE`, and any endpoint where
a path argument starts with `/`. The error message hints at it ("Your shell
might be rewriting URL paths as filesystem paths").

### Windows + nvm + Jest workers in git hooks
`jest-worker` uses `process.execPath` to spawn child processes, which resolves to
the nvm symlink path (e.g. `%USERPROFILE%\AppData\Local\nvm\nodejs\node.exe`).
This path is unavailable in husky git hook contexts, causing `ENOENT`. Fix: add
`--runInBand` to any `jest` command in lint-staged to avoid worker spawning.

## /compound — when to trigger

Every solved hard problem is an opportunity to compound. Senior engineers become
faster over time not by working harder but by pattern-matching against a mental
library of solved problems. Encoding this habit into agents (via `/compound`
after every non-trivial unblocking event) produces the same compounding effect:
future agents inherit the institutional knowledge without rediscovery.

**Trigger `/compound` after:** figuring out why something didn't work, uncovering
a non-obvious codebase pattern, resolving an agent misunderstanding, or any "aha
moment" a future engineer would benefit from. Skip only for trivial fixes (typos,
obvious syntax errors).

## Agent prompt engineering — governance pattern

When designing prompts for autonomous agents (workspaces, subagents), mandatory
process steps (governance, checkpoints, label updates) must be structured as
**inline blocking prerequisites within each stage** — not as a separate "also do
this" section. Agents optimize for the primary task and deprioritize anything
that reads as secondary.

**Pattern:** End each stage with `>>> GOVERNANCE — run these commands NOW before
proceeding` followed by exact commands. This makes governance structurally
impossible to skip.

**Anti-pattern:** A flat section like "At each stage transition: 1. Post comment
2. Update label" — agents will mentally skip past this.

Also: workspace agents are CLI processes inside Docker — they cannot click UI
buttons. Don't reference orchestrator-side UI actions in workspace prompts.

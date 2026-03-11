---
name: use-ff
description: Know how to use Factory Factory (ff) — a Docker-based autonomous Claude Code runner. Use when the user asks to create a workspace, monitor agent progress, review ff output, or interact with the ff platform in any way.
---

# Factory Factory (ff)

Factory Factory is a Docker container that runs Claude Code autonomously. You give it a task, it creates an isolated git worktree, drops a Claude agent inside it, and the agent writes code, runs tests, and checks CI — all without the user watching. The result is a branch ready to review and merge.

**Mental model:** User = manager. Claude (you, in the main conversation) = PM/orchestrator. ff agent = developer. ff = the office building.

**Your role is strictly PM/orchestrator.** You do NOT write implementation code, spec code, or any deliverable code directly in the main conversation. Your job is to:
- Write GitHub issues and top-level context documents
- Launch ff workspaces with self-contained prompts
- Monitor workspace progress and approve permissions
- Review output and give feedback
- Merge PRs and advance the pipeline

If a user asks you to "implement X" or "write code for Y", your response is to launch an ff workspace — not to write the code yourself.

## Architecture

```
factory-factory/
├── claude-config/
│   ├── CLAUDE.md          # Global instructions injected into every agent session
│   └── settings.json      # Pre-approved command allowlist (bind-mounted into container)
├── docker-compose.yml
└── docker-compose.override.yml   # Dev overrides: SSH keys, gh auth, volume mounts
```

Each workspace gets an isolated git worktree at `/data/worktrees/workspace-<id>/`.

## Workspace Lifecycle

```
NEW -> PROVISIONING -> READY -> (ARCHIVING -> ARCHIVED)
                    -> FAILED
```

- **NEW**: Workspace record created, not yet provisioned
- **PROVISIONING**: Worktree being set up, startup scripts running
- **READY**: Agent can run sessions
- **FAILED**: Provisioning or script failure
- **ARCHIVING / ARCHIVED**: Being cleaned up / done

## Session Lifecycle

```
IDLE -> RUNNING -> COMPLETED
              -> FAILED
              <-> PAUSED
```

## Page Title Status Dot

When viewing a workspace detail page, the browser tab title shows a color dot:

| Dot | Meaning |
|-----|---------|
| Red | Workspace FAILED or CI failing |
| Green | Agent actively working (session running) |
| Yellow | Workspace provisioning or CI checks running |
| Blue | CI passing or PR merged |
| White | Idle, ready, no PR / unknown |

## Pre-approved Commands (allowlist)

These run without user confirmation inside ff workspaces:

**TypeScript / Node**
- `npx tsc`, `npx tsc --noEmit`
- `npx expo *`
- `node --version`, `which node`, `which npm`

**File inspection**
- `ls src`, `ls src/**`, `ls *`
- `cat package.json` (root only — no wildcard)
- `echo $NODE_ENV`, `pwd`
- `Read(src/**)`, `Glob(src/**)`, `Grep(src/**)`

**npm**
- `npm list *`, `npm outdated`
- `npx jest *`

**git (read-only)**
- `git log *`, `git diff *`, `git status`
- `git branch *`, `git show *`, `git remote *`
- `git stash list`

**GitHub CLI (read-only)**
- `gh pr checks *`, `gh pr view *`, `gh pr list *`, `gh pr diff *`
- `gh issue view *`, `gh issue list *`
- `gh run view *`, `gh run list *`
- `gh repo view *`, `gh auth status`

## Security Rules for Allowlist

User confirmation is required for any command that could:
- **Expose secrets** — read files containing private keys, tokens, credentials (`.env*`, `~/.ssh/*`, `*.pem`)
- **Enable code injection** — pass unbounded input to an interpreter (`node -e *`, `bash -c *`, `eval *`)
- **Mutate shared state** — write to repo, push, open/merge PRs, post comments, modify external services

Safe: `*` on the **target** side (file paths, PR numbers, URLs).
Dangerous: `*` on the **code/value** side of an interpreter.

## Docker Configuration

The container is customized via `docker-compose.override.yml`:
- SSH keys: `~/.ssh` mounted read-only (for git operations)
- gh auth: `~/.config/gh` volume persisted
- Claude auth: `claude-auth` volume + `CLAUDE.md` and `settings.json` bind-mounted
- Port mapping: `7001` for the ff UI; workspace dev servers get next available ports
- `NODE_ENV=development` is always set for workspace child processes

## Key Source Locations

| Concern | File |
|---------|------|
| Workspace init orchestration | `src/backend/orchestration/workspace-init.orchestrator.ts` |
| Git ops (worktrees, hooks, lockfile restore) | `src/backend/services/git-ops.service.ts` |
| Config / env (port, paths, model defaults) | `src/backend/services/config.service.ts` |
| Status dot logic | `src/client/routes/projects/workspaces/workspace-detail-container.tsx` |
| Sidebar status derivation | `src/shared/core/workspace-sidebar-status.ts` |
| Enums (WorkspaceStatus, SessionStatus, etc.) | `src/shared/core/enums.ts` |

---

# PM-Driven Workflow with Factory Factory

This section documents the full operational workflow for using Claude Code as PM and ff as the agent farm. The pattern is: create GitHub issues -> launch ff workspaces -> monitor + approve permissions -> review output -> merge PRs -> repeat for next phase.

## Phase-Based Execution

### Phase 1: Spec Writing
1. Write top-level specs yourself (PRD, breakdown, architecture) — these require PM judgment
2. Create GitHub issues for each spec deliverable with full context
3. Launch ff workspaces (one per issue) with self-contained prompts
4. Monitor, answer agent questions, approve permissions
5. Trigger "Create PR" for each completed workspace
6. Review specs for completeness and cross-spec consistency
7. Merge PRs, close issues with PR references

### Phase 2: Implementation
1. Create GitHub issues for each work package, referencing spec sections
2. Launch ff workspaces (one per issue or grouped by dependency)
3. Monitor, approve permissions
4. Trigger "Create PR" for completed workspaces
5. Review implementation against specs
6. Merge PRs, close issues

### Phase 3: Integration Testing
1. Pull all merged branches to local main
2. Run end-to-end verification
3. File fix issues if needed, repeat Phase 2

## Creating Workspaces — Operational Guide

### UI Navigation
- **CRITICAL**: ff only loads from the root route (`localhost:7001`). Navigating directly to `/projects/...` returns a blank page. Always start from `localhost:7001` and let it redirect.
- **Port assignment**: ff maps container ports 3000-3999 to host ports 13000-13999. The ff UI itself runs on `13000`. Each workspace dev server gets the next available port (13001, 13002, …) as they spin up.
- The board view shows columns: Todo-GitHub | Working | Waiting | Done
- Click "+ New Workspace" in the Todo column to open the creation dialog

### Creation Dialog
1. Click "+ New Workspace" — dialog opens with textarea + agent/workflow dropdowns
2. Type the workspace prompt in the textarea
3. Select agent: "Claude" (default)
4. Select workflow: "Default" for implementation, "Plan" if you want the agent to plan first
5. Click "Launch"

### Writing Effective Workspace Prompts
The prompt must be **fully self-contained** — the agent has no conversational context. Include:
- **What to do**: Clear deliverable (file paths, function names)
- **Where to find context**: Spec file paths with section numbers
- **Acceptance criteria**: How the agent knows it's done
- **Issue reference**: `Closes #N` for auto-linking when PR is created

Example prompt structure:
```
Implement [feature name]. Closes #[N].

Read the spec at [path/to/spec.md] for full details.

Create/modify these files:
1. [file1] — [what it does]
2. [file2] — [what it does]

Key requirements:
- [requirement 1]
- [requirement 2]

After implementation, run tests to verify: [test command]
```

### Grouping Strategy
- **Independent deliverables**: One workspace per issue (e.g., DB migrations, each spec doc)
- **Interdependent modules**: Combine into one workspace (e.g., all 6 worker Python modules)
- **Modifications to existing code**: One workspace per logical change (e.g., api.ts + store + component)

## Permission Management — The Biggest Bottleneck

### The Problem
FF agents run in isolated worktrees but require explicit permission for mutating operations. Each permission prompt blocks the agent until you click Allow/Always Allow/Reject in the browser.

### Permission Flow for PR Creation
When you click "Create PR" in the workspace header, the agent needs sequential permissions:
1. `git add` — staging files
2. `git commit` — creating the commit
3. `git push -u origin <branch>` — pushing to remote
4. `gh pr create` — creating the pull request

**Recommendation**: Click "Always Allow" for scoped operations like `git add`, `git commit`, `git config user.*` — these are safe in an isolated worktree. Be more cautious with broad commands like `git push` or `gh pr create`; "Always Allow" persists across sessions, so only use it for commands you'd approve unconditionally every time.

### Ratchet Tab — Post-Merge Automation
After a PR is merged, ff automatically runs a "Ratchet" session that:
- Fetches latest main
- Checks for CI failures
- Checks for unaddressed review comments
- Runs build/lint/test verification

The Ratchet tab may also need permissions (e.g., `git fetch origin main`). These are the "Permission Needed" badges visible in the sidebar and board view. **You must visit each workspace and approve Ratchet permissions** for the workspace to move from Working to Done.

### Git Identity in Worktrees
FF agents may encounter "git user identity not configured" errors when trying to commit in new worktrees. The agents typically:
1. Detect the error
2. Check existing commits for identity info
3. Run `git config user.email` and `git config user.name`
This requires a permission approval. Click "Allow" when you see it.

## Monitoring Workspaces

### From the Board View
- Cards show: workspace name, branch, PR number, diff stats (+lines/-lines), status badges
- "Permission Needed" badge = agent is blocked waiting for your approval
- "MERGED" badge = PR was merged on GitHub

### From the Workspace Detail View
- **Chat tabs**: Main conversation (Chat 1) + PR creation tab + Ratchet tab
- **Changes panel** (right): Files modified, staged status
- **Logs tab** (bottom-right): Agent process logs
- **Terminal tab** (bottom-right): Interactive terminal in the worktree

### Tab Title Dots for Monitoring
Use the browser tab title dots to monitor without switching tabs:
- Green = agent actively working
- White = idle/done
- Red = needs attention (failed or CI failing)
- Blue = CI passing or PR merged

## Quick Actions

FF exposes two "Quick actions" buttons. Always check these before manually instructing the agent — they are pre-built, context-aware shortcuts.

### Workspace-level "Quick actions" button (top-right of workspace panel)

Opens a menu with 5 actions that launch a new agent session:

| Action | Description | When to use |
|--------|-------------|-------------|
| **Fetch & Rebase** | Fetch latest from origin and rebase onto main | When branch is behind main, before PR review |
| **Rename Branch** | Rename the branch based on conversation context | When workspace name was auto-generated poorly |
| **Review** | Review the current changes | After implementation — triggers self-review before PR |
| **Take Screenshots** | Capture screenshots of the running dev app | When verifying UI changes |
| **Simplify** | Simplify and refine recent code changes | After implementation — reduces over-engineering |

### Chat-level "Quick actions" button (chat input toolbar)

Opens a smaller menu with 3 actions that are sent as messages to the current session:

| Action | Description | When to use |
|--------|-------------|-------------|
| **Create Pull Request** | Triggers PR creation flow (same as "Create PR" button) | Faster alternative to clicking the header button |
| **Address PR Comments** | Reads and addresses PR review comments | After you leave review comments on GitHub |
| **Simplify Code** | Simplify and refine current code | After implementation |

### PM Workflow Integration

- After implementation completes → use **Review** from the workspace "Quick actions" button before triggering PR
- When CI fails due to branch being stale → use **Fetch & Rebase** instead of manually instructing
- After leaving PR review comments on GitHub → use **Address PR Comments** from the chat "Quick actions" button to have the agent respond
- When implementation feels overly complex → use **Simplify** from the workspace "Quick actions" button before merging

## Triggering PR Creation

1. Navigate to the completed workspace
2. Click "Create PR" button in the workspace header bar (top of page, next to branch name)
3. A new tab opens (e.g., "Create Pull Requ...")
4. The agent analyzes changes, commits, pushes, and creates the PR
5. Approve permissions as they appear (git add → commit → push → gh pr create)
6. The PR URL appears in the chat when complete

**Important**: The "Create PR" button only appears when the workspace has uncommitted/unpushed changes and is in a ready state.

## Merging and Issue Linking

### Link Issues to PRs
- Include `Closes #N` in the workspace prompt so the agent includes it in the PR body
- After merging, close issues with `gh issue close N --comment "Completed in PR #M"`
- For spec issues: close when spec PR is merged
- For implementation issues: close when implementation PR is merged

### Merge Workflow
```bash
# From local CLI (faster than using FF UI)
gh pr merge <N> --merge --delete-branch

# Pull changes locally
git pull origin main
```

## Efficient Flow (Optimized from Experience)

### What Works Well
1. **Batch issue creation**: Create all issues for a phase at once using `gh issue create` in parallel
2. **Self-contained prompts**: Agents with full context in their prompt work faster and produce better results
3. **Spec-driven implementation**: Detailed specs with SQL/function signatures let agents copy verbatim
4. **Parallel workspaces**: Launch multiple workspaces simultaneously for independent deliverables
5. **CLI for merging**: Use `gh pr merge` from terminal instead of navigating FF UI

### What To Avoid
1. **Don't navigate away from root**: Always start from `localhost:7001`, not direct URLs
2. **Don't wait on FF for simple ops**: Use `gh` CLI for issue creation, PR merging, issue closing
3. **Don't over-spec**: If group-level specs are detailed enough (function signatures, SQL), skip per-component specs
4. **Don't create workspace from within another workspace page**: Navigate to the board first
5. **Don't forget Ratchet tabs**: Merged PRs still show as "Working" until Ratchet permissions are approved

### Time Optimization
- Create all GitHub issues first (batch), then launch all workspaces (batch)
- While agents work, review other completed workspaces or do cross-spec consistency checks
- Use CLI to merge PRs instead of clicking through FF UI
- Handle Ratchet permissions in a sweep after all PRs are merged

## Known Issues and Workarounds

| Issue | Workaround |
|-------|------------|
| FF only loads from root route | Always navigate to `localhost:7001`, never direct to `/projects/...` |
| Chrome extension disconnects during long `wait` operations | Reconnect via `tabs_context_mcp`, retry the same action |
| Agents need git identity config in new worktrees | Click "Allow" when agent runs `git config user.email/name` |
| "Permission Needed" badges persist after merge | Visit workspace, click Ratchet tab, approve pending permissions |
| CI may show as "FAILING" for docs-only PRs | Expected — no CI pipeline for markdown files, safe to ignore |
| Workspace creation from sidebar may not work | Navigate to board view first, then click "+ New Workspace" |
| Long prompts may not fully render in creation dialog | Keep prompts focused; put deep context in spec files and reference paths |

## Potential Improvements

### Pending (not yet implemented)
- Pre-approve `git add *`, `git commit *`, `git push *`, `gh pr create *` to eliminate the PR creation permission bottleneck
- Pre-approve `git config user.email *`, `git config user.name *` for worktree identity setup
- Auto-approve Ratchet permissions for post-merge cleanup
- Support batch workspace creation (launch multiple from a list of issues)
- Add workspace templates for common patterns (spec-writing, implementation, review)

### Already implemented
- `package-lock.json` name pollution fix via `core.hooksPath` pre-commit hook + lockfile restore after startup scripts
- `NODE_ENV=development` always set for workspace child processes via `getChildProcessEnv()`
- `settings.json` and `CLAUDE.md` reproducibly bind-mounted from `claude-config/` — no ephemeral volume required
- Page title status dot for at-a-glance workspace monitoring from browser tabs

---

# Learnings Maintenance

**IMPORTANT**: Every time you learn something new, you MUST document it. There are two tiers:

## Tier 1 — ff-specific learnings (bugs, workarounds, operational patterns)

Every time you discover something new about Factory Factory itself:

1. Update this skill file with the new learning
2. Update memory files if the learning affects project-level workflow:
   - `MEMORY.md` — add a brief note with link to detailed file
   - Create/update `ff-workflow.md` in memory dir for detailed operational notes
3. Remove outdated learnings that have been fixed or superseded
4. Keep the "Known Issues" and "Potential Improvements" sections current

## Tier 2 — General engineering learnings (codebase, debugging, principles)

Any time a non-trivial blocker gets resolved during orchestration — a tricky codebase pattern uncovered, a non-obvious fix, a debugging insight, a reusable principle — invoke `/compound` to capture it:

```
/compound
```

This runs the compound-docs skill and writes the learning to `.claude/learnings/[category]/`. Use it after:
- Figuring out why something didn't work and how to fix it
- Discovering a non-obvious pattern or constraint in the codebase
- Resolving an agent misunderstanding that cost time
- Any "aha moment" a future agent or engineer would benefit from

Skip `/compound` only for trivial issues (typos, obvious syntax errors, one-liners).

This ensures compound knowledge growth — every session builds on previous sessions.

---

## Common Tasks

### Check what a workspace is doing
Look at `workspace.sidebarStatus.activityState` (WORKING / IDLE) and `ciState` (NONE / RUNNING / FAILING / PASSING / MERGED).

### Understand why provisioning failed
Read `workspaceInitStatus` from the init orchestrator — it exposes a `phase` and `chatBanner` for user-facing context.

### Add a new pre-approved command
Edit `factory-factory/claude-config/settings.json`. Requires `docker compose down && up` to take effect (settings.json is bind-mounted at container start).

### Inspect package-lock.json name pollution
ff injects a `pre-commit` git hook via `core.hooksPath` that patches `package-lock.json`'s `name` field back to the value in `package.json`. It also runs `git checkout --` on tracked lockfiles after startup scripts complete.

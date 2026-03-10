---
name: ff:implement
description: Run only the implementation stage of the ff pipeline. Assumes spec already exists. Agent stops after code is committed and tests pass. Use after /ff:spec and optional spec review.
---

# /ff:implement — Implementation Stage Only

Picks up after spec is done. Launches an FF workspace agent that reads the spec, writes code, runs tests, and stops before PR creation.

## Your Role

**You are the orchestrator/PM, not the implementer.** You do NOT write code. You:
1. Set up pipeline state (`.ff-state.toml`)
2. Create a workspace in the FF dashboard (localhost:7001) via the Claude Chrome plugin
3. Monitor the workspace agent's progress in a polling loop
4. Unblock the agent when it needs permissions or hits errors
5. Verify completion and advance to the next stage

## Steps

1. Identify the workspace or gather:
   - Feature name / spec path
   - GitHub issue number
   - Existing `.ff-state.toml` path (if resuming) or create fresh

2. Update or create `.ff-state.toml` — advance stage to implement:

```toml
[pipeline]
stage      = "implement"
stop_after = "implement"
updated_at = "<ISO timestamp>"

[stages.implement]
status = "in_progress"
pr     = 0
```

3. Create ff workspace in the FF dashboard (localhost:7001):
   - Use Claude Chrome plugin (`tabs_context_mcp` → `navigate` → `computer`)
   - Navigate to the project board
   - Click "+ New Workspace"
   - Enter the implementation prompt (see below)
   - Click "Launch"

4. **Monitor the workspace in a polling loop** (see Monitoring section below)

5. After implementation completes, use the **Simplify** quick action — ⚡ (top-right of workspace panel) → "Simplify — Simplify and refine recent code changes" — before proceeding to `/ff:review`.

## Workspace Prompt Template

```
Implement: <feature name>. Closes #<issue>.

Read .ff-state.toml first. Your stage is "implement" and stop_after is "implement" — write code only, do not create a PR yet.

Read the spec at: <spec path>
Implement everything described in the spec.

When done:
- Run tests, fix failures
- Commit all changes
- Update .ff-state.toml stages.implement.status = "done"
- Stop — do not push or create a PR
```

## Monitoring Loop (Required)

After launching the workspace, you MUST actively monitor the agent. The Chrome plugin does NOT send push notifications — you must poll.

### Loop behavior:

1. Take a screenshot of the FF workspace every ~15–30 seconds
2. Check for:
   - **Permission dialogs**: Click "Allow" (or "Always Allow" for safe commands like `find`, `ls`, `cat`) to unblock the agent
   - **Error indicators**: Red "Error" badges on tool calls — investigate if they're blocking progress
   - **"Waiting for input"**: The agent may need a follow-up message or clarification
   - **Completion signals**: Agent message says implementation is done, or `.ff-state.toml` shows `status = "done"`
   - **Stale state**: If agent hasn't progressed in 2+ minutes, investigate
3. When the agent finishes:
   - Verify changes in the "Changes" tab (right panel)
   - Confirm `.ff-state.toml` was updated to `status = "done"`
   - Report completion to user
   - Trigger Simplify ⚡ if appropriate

### What to approve:
- File system reads (find, ls, cat, grep) → **Always Allow**
- Package installs (pip, npm) → **Allow** (review command first)
- File writes/edits → **Allow** (these are the implementation)
- Git operations → **Allow** (commits are expected)
- Destructive operations (rm, reset) → **Ask user first**

### What to flag to the user:
- Agent is stuck in a loop retrying the same failing operation
- Agent is making architectural decisions not covered by the spec
- Agent asks a question that requires user domain knowledge
- Tests are failing after multiple fix attempts

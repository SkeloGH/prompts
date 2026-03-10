---
name: ff:spec
description: Run only the spec-writing stage of the ff pipeline. Agent stops after spec is committed. Use when you want to review the spec before implementation begins.
---

# /ff:spec — Spec Stage Only

Creates a workspace that writes the spec and stops. You review, then run /ff:implement when ready.

## Your Role

**You are the orchestrator/PM, not the spec author.** You do NOT write the spec. You:
1. Set up pipeline state (`.ff-state.toml`)
2. Create a workspace in the FF dashboard (localhost:7001) via the Claude Chrome plugin
3. Monitor the workspace agent's progress in a polling loop
4. Unblock the agent when it needs permissions or hits errors
5. Verify completion and present the spec to the user for review

## Steps

1. Gather from user:
   - Feature name / description
   - GitHub issue number
   - Any reference files, existing patterns, or constraints

2. Write `.ff-state.toml`:

```toml
[pipeline]
stage      = "spec"
stop_after = "spec"
started_at = "<ISO timestamp>"
updated_at = "<ISO timestamp>"

[context]
feature = "<feature name>"
issue   = <issue number>
branch  = "ff/spec/<feature-slug>"
spec    = "docs/specs/<feature-slug>.md"

[stages.spec]
status = "pending"
pr     = 0

[stages.implement]
status = "pending"
pr     = 0

[stages.review]
status   = "pending"
findings = ""

[stages.pr]
status = "pending"
pr     = 0
```

3. Create ff workspace in the FF dashboard (localhost:7001):
   - Use Claude Chrome plugin (`tabs_context_mcp` → `navigate` → `computer`)
   - Navigate to the project board
   - Click "+ New Workspace"
   - Enter the spec prompt (see below)
   - Click "Launch"

4. **Monitor the workspace in a polling loop** (see Monitoring Loop below)

## Workspace Prompt Template

```
Write spec for: <feature name>. Closes #<issue>.

Read .ff-state.toml first. Your stage is "spec" and stop_after is "spec" — write the spec only, do not write any implementation code.

Write the spec to: <spec path>

Include:
- Problem statement
- Proposed solution
- Key interfaces / function signatures
- Data model changes (if any)
- Acceptance criteria
- Out of scope

When done: commit the spec file, update .ff-state.toml stages.spec.status = "done", and stop.
```

## Monitoring Loop (Required)

After launching the workspace, you MUST actively monitor the agent. The Chrome plugin does NOT send push notifications — you must poll.

1. Take a screenshot of the FF workspace every ~15–30 seconds
2. Check for:
   - **Permission dialogs**: Click "Allow" to unblock the agent
   - **Error indicators**: Red "Error" badges — investigate if blocking
   - **"Waiting for input"**: Agent may need clarification
   - **Completion signals**: Agent says spec is done, or `.ff-state.toml` shows `status = "done"`
   - **Stale state**: No progress in 2+ minutes → investigate
3. When the agent finishes:
   - Verify the spec was written and committed
   - Report completion to user
   - Present spec for review before proceeding to `/ff:implement`

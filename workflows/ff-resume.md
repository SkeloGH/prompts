---
name: ff:resume
description: Resume an in-progress ff pipeline. Finds the in-progress GH issue by label, picks the workspace, and continues from the current stage.
---

# /ff:resume — Resume Pipeline

Finds the in-progress workspace and continues the pipeline from where it left off.

## Your Role

**You are the orchestrator/PM.** You find the stalled or paused workspace, create a new session to resume it, and monitor progress.

## Steps

1. Find in-progress pipelines by querying GH issue labels:
   ```bash
   gh issue list --label "ff:spec,ff:implement,ff:review,ff:pr,ff:paused" --state open
   ```

2. **If only one result:** auto-select it, confirm with user.
   **If multiple:** present a list:
   ```
   Active pipelines:
   1. user-auth  [ff:implement]  issue: #42
   2. dashboard  [ff:spec]       issue: #51

   Which to resume? (1/2)
   ```

3. Read the selected issue to determine current stage:
   ```bash
   gh issue view <N> --json labels,comments,title
   ```
   - Current stage = the `ff:*` label (excluding `ff:paused` and `ff:done`)
   - Latest checkpoint note = most recent comment containing `## ff checkpoint`

4. Determine the stage to run:
   - `ff:spec`      → run `/ff:spec` behavior
   - `ff:implement` → run `/ff:implement` behavior
   - `ff:review`    → run `/ff:review` behavior
   - `ff:pr`        → run `/ff:pr` behavior

5. If `ff:paused` is on the issue, remove it before resuming:
   ```bash
   gh issue edit <N> --remove-label "ff:paused"
   ```

6. Create a new session in the existing ff workspace (navigate to it via `localhost:13000`) with a resume prompt:

```
Resume pipeline for: <feature name>. Issue: #<N>.

Check the current stage: gh issue view <N> --json labels
Read the latest checkpoint comment for context on what was completed.

Continue from the current stage. Do not redo completed work.

At each stage transition, post a checkpoint comment and update the ff label on the issue.
```

7. Monitor progress — the agent will post comments and update labels as it advances.

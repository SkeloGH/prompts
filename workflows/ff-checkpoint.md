---
name: ff:checkpoint
description: Snapshot the current ff pipeline progress into a GH issue comment without advancing the pipeline. Use to freeze state before a risky operation, hand off to another agent, or create a recovery point.
---

# /ff:checkpoint — Manual Checkpoint

Posts current progress as a comment on the GH issue. The issue label already reflects the active stage. This records partial progress within a stage without marking it done.

## When to use
- Before a risky operation (push, force, large refactor)
- To hand off to another agent or session
- To create a named recovery point mid-stage
- When pausing work intentionally

## Steps

1. Identify the GH issue number (from the workspace context or `gh pr list`)

2. Gather current state:
   - What stage is in progress (read from the `ff:*` label on the issue)
   - What has been completed within the current stage
   - Any artifacts created (files written, tests run, PRs opened)
   - Any notes or blockers

3. Post a checkpoint comment to the GH issue:
   ```bash
   gh issue comment <N> --body "## ff checkpoint

   **Stage:** <current stage>
   **Status:** in_progress
   **Note:** <human-readable summary of what's done and what remains>
   **Time:** <ISO timestamp>
   **Artifacts:** <file paths, PR numbers, commit SHAs if known>"
   ```

4. If intentionally pausing, apply the `ff:paused` label:
   ```bash
   gh issue edit <N> --add-label "ff:paused"
   ```

5. Report to user: what was saved, current stage, what remains.

## Agent autonomous trigger conditions
The agent should call this automatically when:
- About to `git push` or `gh pr create`
- A discrete unit of work is complete (logical file group, test suite passing)
- A permission prompt is about to be requested
- Switching between major tasks within a stage
- An unexpected error occurs

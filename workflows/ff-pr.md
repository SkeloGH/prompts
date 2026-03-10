---
name: ff:pr
description: Run the PR creation stage of the ff pipeline. Pushes the branch and creates a GitHub PR. Use after /ff:review (which includes validation). /ff:review may run before or after.
---

# /ff:pr — PR Creation Stage

Triggers PR creation via the FF dashboard "Quick actions" button. Assumes review and validation have already passed (`ff:pr` label is on the issue).

## Your Role

**You are the orchestrator/PM, not the PR author.** You do NOT create the PR directly. You:
1. Confirm the issue has the `ff:pr` label (review + validate already complete)
2. Trigger PR creation via the "Quick actions" button in the FF workspace
3. Monitor the workspace agent's progress
4. Verify the PR was created successfully
5. Ensure the agent annotates each touched file with a "why this file changed" comment
6. Return the PR URL to the user

## Steps

1. Confirm pre-conditions:
   ```bash
   gh issue view <N> --json labels
   ```
   The issue should have `ff:pr`. If it still has `ff:review` or `ff:validate`, run `/ff:review` first.

2. Navigate to the workspace in the FF dashboard (`localhost:13000`)

3. Trigger PR creation:
   - Click the "Quick actions" button in the **chat input toolbar** (bottom bar)
   - Select **"Create Pull Request"**
   - This launches a pre-built PR creation workflow — no manual prompt needed

4. **Monitor the workspace** — take screenshots every ~15–30 seconds:
   - Approve permissions as they appear (`git add`, `git commit`, `git push`, `gh pr create`)
   - Watch for errors (auth issues, branch conflicts)
   - Wait for PR URL to appear in the chat

5. After PR is created:
   - Verify the PR exists: `gh pr view <PR>`

   - **Annotate each touched file** — post one PR review comment per file changed, explaining *why* that file needed to change (not what changed — the diff shows that). This gives human reviewers context without having to reconstruct intent from code:
     ```bash
     gh pr diff <PR> --name-only   # get the list of changed files
     gh api repos/{owner}/{repo}/pulls/{PR}/comments \
       --method POST \
       --field body="<why this file changed>" \
       --field path="<file path>" \
       --field position=1 \
       --field commit_id="<head sha>"
     ```
     One comment per file. Focus on intent and business reason, not implementation detail.

   - Update GH issue label:
     ```bash
     gh issue edit <N> --remove-label "ff:pr" --add-label "ff:done"
     ```
   - Post a checkpoint comment:
     ```bash
     gh issue comment <N> --body "## ff: PR created\nPR: <PR URL>\nPipeline complete."
     ```
   - Return the PR URL to the user

## Ratchet (Auto-Triggered After PR Creation)

After the PR is created, FF automatically launches a **Ratchet** agent in a separate tab. Ratchet:
1. Merges latest `main` into the branch and resolves conflicts
2. Checks CI failures and fixes them
3. Checks for unaddressed code review comments and addresses them
4. Runs build/lint/test and fixes failures
5. Pushes only when actionable fixes are made
6. Requests re-review via `gh pr edit <PR> --add-reviewer <login>`

### Orchestrator Responsibilities During Ratchet
- Continue monitoring — Ratchet needs permission approvals
- "Always Allow" is safe for read-only `gh` commands
- "Allow" for write operations (`git push`, `gh pr comment`)
- When Ratchet finishes: report final CI status to user

### Known Ratchet Patterns
- Pre-existing CI failures (not introduced by this PR) may cause investigation but not a fix — expected
- If Ratchet hits an unfixable CI failure, it documents why and stops
- The orchestrator relays Ratchet's findings to the user for items requiring human judgment

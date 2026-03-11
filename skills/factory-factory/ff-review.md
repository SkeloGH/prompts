---
name: ff:review
description: Run the review stage of the ff pipeline. Invokes the compound /review skill on the current workspace branch and posts findings as PR comments. Use after /ff:implement or /ff:pr.
---

# /ff:review — Review Stage

Invokes a code review on the workspace branch, iterates until clean, then triggers functional validation before handing off to `/ff:pr`.

## Your Role

**You are the orchestrator/PM, not the reviewer.** You do NOT perform the review. You:
1. Update GH issue label to `ff:review`
2. Trigger the review via the FF workspace Quick Action
3. Monitor the review agent's progress
4. Post findings as PR comments
5. Loop until no P0/P1 findings remain
6. Trigger validation (`ff:validate` stage)
7. Hand off to `/ff:pr`

## Steps

1. Identify the GH issue number and workspace from context or `gh issue list --label "ff:implement"`

2. Update the GH issue label:
   ```bash
   gh issue edit <N> --remove-label "ff:implement" --add-label "ff:review"
   ```

3. Invoke review on the workspace:
   - **Preferred**: Use the **Review** option in the "Quick actions" button (top-right of workspace panel). Launches a pre-configured review session.
   - **Alternative**: Send `/review` manually in the workspace chat

4. **Monitor the workspace** — take screenshots every ~15–30 seconds, approve permissions as needed

5. **Post findings as PR comments** (required — this feeds Ratchet):
   - Post each **actionable** finding as a separate PR comment using `gh pr comment`
   - Include file, line range, violated principle, and required change
   - Label each comment: `[P1 — Critical]`, `[P2 — Important]`, or `[P3 — Nice to have]`
   - If **no actionable findings**: post a single approval comment ("LGTM — code review passed")

6. **Address findings** using the **"Address PR Comments"** option in the "Quick actions" button (chat input toolbar). Monitor until complete.

7. **Re-run review** and repeat until no P0/P1 findings remain in-scope.

8. Post a checkpoint comment on the GH issue:
   ```bash
   gh issue comment <N> --body "## ff: review complete\nNo remaining P0/P1 findings. Proceeding to validate."
   ```

## Validate Stage (required before proceeding to PR)

Once the review loop is clean, advance to functional validation:

1. Update the GH issue label:
   ```bash
   gh issue edit <N> --remove-label "ff:review" --add-label "ff:validate"
   ```

2. Run **`compound-engineering:test-browser`** to exercise the feature against the spec's acceptance criteria in the browser. This skill runs browser tests on pages affected by the current branch.

3. If the PR touches UI, also run **`compound-engineering:feature-video`** to record a walkthrough and attach it to the PR description.

4. Post validation results as a PR comment:
   ```bash
   gh pr comment <PR> --body "## Validation Results\n\n**Browser tests:** PASS/FAIL\n**Acceptance criteria:**\n- [ ] criterion 1\n- [ ] criterion 2\n\n**Walkthrough:** <video link if recorded>"
   ```

5. **If validation fails:** fix the issues (loop back to implement if needed), then re-validate.

6. **If validation passes:** post checkpoint and advance:
   ```bash
   gh issue comment <N> --body "## ff: validate complete\nAll acceptance criteria passed. Proceeding to PR."
   gh issue edit <N> --remove-label "ff:validate" --add-label "ff:pr"
   ```

7. Report to user and recommend proceeding to `/ff:pr`.

## Iterate Until Production-Ready

Keep looping:
1. **Review** → capture findings → post as PR comments
2. **Address PR Comments** → agent fixes in-scope items
3. **Re-run Review** → verify fixes, check for new issues
4. **Validate** → confirm behavioral correctness against spec
5. Only stop when: no P0/P1 findings remain AND all acceptance criteria pass AND CI is green

## Agent Output Review Checklist

After the review agent finishes, also check for these recurring agent blind spots. **Flag to the human** if present:

- [ ] **`# type: ignore` proliferation** — 3+ suppressions in a file = broken types
- [ ] **Missing observability in fallback/error paths** — error handler writes data but no log confirms recovery
- [ ] **Import ordering violations** — did the agent run pre-commit?
- [ ] **Spec vs. issue conflicts** — implementation contradicts spec even if it matches the issue
- [ ] **Tests that bypass the system under test** — heavy mocking, assertions on mock-setup values

## Feed Findings Back Into Process

When findings reveal workflow or process gaps:
- **CI gap** → fix CI config, update the implement skill
- **Spec gap** → update spec template or SPECCING.md
- **Convention gap** → update CLAUDE.md or the implement skill
- **Observability gap** → add to the checklist above

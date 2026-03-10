---
name: ff
description: Run the full Factory Factory pipeline end-to-end (spec → implement → review → pr). Use when the user says "/ff" or wants to run the complete autonomous workflow for a feature.
---

# /ff — Full Pipeline

> **Your role: orchestrator, not developer.** You do not write code. You gather requirements, launch the ff workspace, and monitor it to completion.

Runs the complete ff pipeline without gates: spec → implement → review → validate → pr.

## State model

Pipeline state lives on the **GitHub issue** — not in any local file:

| Mechanism | Purpose |
|-----------|---------|
| GH label `ff:<stage>` | Current active stage (`ff:spec`, `ff:implement`, `ff:review`, `ff:validate`, `ff:pr`, `ff:done`) |
| GH issue comment | Checkpoint notes posted by the workspace agent at each stage transition |

This survives workspace archival and is visible to the whole team without navigating the ff UI.

## Steps

1. Gather feature details from the user if not provided:
   - Feature name / description
   - GitHub issue number — if none exists, **you create it** using `gh issue create` before proceeding:
     ```bash
     gh issue create --title "<feature name>" --body "<brief description>"
     ```
     Capture the returned issue number and use it in all subsequent steps.
   - Base branch (default: main)

2. Apply the opening stage label to the GH issue:
   ```bash
   gh issue edit <N> --add-label "ff:spec"
   ```
   Create the label first if it doesn't exist:
   ```bash
   gh label create "ff:spec" --color "0075ca" --description "ff pipeline: spec stage"
   ```
   Labels to create (do all at once if starting fresh):
   `ff:spec`, `ff:implement`, `ff:review`, `ff:validate`, `ff:pr`, `ff:done`

3. Create the ff workspace using `compound-engineering:agent-browser`:
   - Navigate to `localhost:13000` (the ff board — always use the root route, never a direct `/projects/...` URL)
   - Click **"+ New Workspace"** in the Todo column
   - Paste the prompt from the template below into the textarea
   - Select agent: **Claude**, workflow: **Default**
   - Click **"Launch"**
   - Wait for the workspace card to appear and status to leave PROVISIONING

4. Monitor progress — the workspace agent posts GH comments at each stage transition and updates the issue label. Check issue state with:
   ```bash
   gh issue view <N>
   ```

## Workspace Prompt Template

```
Full pipeline run for: <feature name>. Closes #<issue>.

## MANDATORY GOVERNANCE (Non-Negotiable)

You MUST execute the gh commands shown at the end of EVERY stage before moving to the next.
Skipping governance is a pipeline violation — it makes pipeline state invisible to the team.
These commands are as important as the code itself.

## Pipeline Stages

### Stage 1: SPEC
- Write spec to <spec path>
- Commit the spec file
- >>> GOVERNANCE — run these commands NOW before proceeding to Stage 2:
  gh issue comment <issue> --body "## ff:spec complete
  Spec written to <spec path>.
  Next: implement"
  gh issue edit <issue> --remove-label "ff:spec" --add-label "ff:implement"

### Stage 2: IMPLEMENT
- Read the spec at <spec path>
- Implement the feature per spec
- Run tests (npx jest or npm test), fix any failures
- Commit all changes
- >>> GOVERNANCE — run these commands NOW before proceeding to Stage 3:
  gh issue comment <issue> --body "## ff:implement complete
  <1-3 line summary of changes made>
  Next: review"
  gh issue edit <issue> --remove-label "ff:implement" --add-label "ff:review"

### Stage 3: REVIEW
- Self-review: read the full diff (git diff main...HEAD) against the spec
- Check for: missing acceptance criteria, code quality issues, missing error handling, OWASP issues
- Fix any P0/P1 findings, re-commit
- >>> GOVERNANCE — run these commands NOW before proceeding to Stage 4:
  gh issue comment <issue> --body "## ff:review complete
  Self-review findings: <summary or 'no issues found'>
  Next: validate"
  gh issue edit <issue> --remove-label "ff:review" --add-label "ff:validate"

### Stage 4: VALIDATE
- Run type-checking: npx tsc --noEmit (zero errors expected in source code; ignore node_modules errors)
- Run tests: npx jest or npm test (all tests must pass)
- Verify each acceptance criterion from the spec is met — list them explicitly
- >>> GOVERNANCE — run these commands NOW before proceeding to Stage 5:
  gh issue comment <issue> --body "## ff:validate complete
  Type-check: PASS/FAIL
  Tests: X passed, Y failed
  Acceptance criteria: <list each with PASS/FAIL>
  Next: pr"
  gh issue edit <issue> --remove-label "ff:validate" --add-label "ff:pr"

### Stage 5: PR
- Push the branch: git push -u origin <branch>
- Create PR: gh pr create --title "<concise title>" --body "<summary + Closes #<issue>>"
- Include "Closes #<issue>" in the PR body
- >>> GOVERNANCE — run these commands NOW (final step):
  gh issue comment <issue> --body "## ff:pr complete
  PR: <PR URL>
  Pipeline complete."
  gh issue edit <issue> --remove-label "ff:pr" --add-label "ff:done"
```

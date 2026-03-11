---
name: ff:status
description: Show the pipeline status of all active ff workspaces. Reads stage from GH issue labels and renders a summary table.
---

# /ff:status — Pipeline Status

Queries GH issue labels to show current pipeline state across all active features.

## Steps

1. Query all open issues with ff labels:
   ```bash
   gh issue list --label "ff:spec,ff:implement,ff:review,ff:pr,ff:paused" --state open --json number,title,labels,url
   ```

2. Also check for completed pipelines if needed:
   ```bash
   gh issue list --label "ff:done" --state open --json number,title,labels,url
   ```

3. Render a summary table:

```
FF Pipeline Status — 2026-03-09

Feature             Stage        Status     Issue   PR
──────────────────────────────────────────────────────
user-auth           implement    ACTIVE     #42     —
dashboard           spec         ACTIVE     #51     —
notifications       pr           ACTIVE     #38     #104
payments            done         COMPLETE   #29     #99 ✓
daily-report        implement    PAUSED     #61     —
```

Stage indicators:
- `ff:spec`      → writing specification
- `ff:implement` → writing code
- `ff:review`    → review in progress
- `ff:pr`        → PR creation in progress
- `ff:done`      → pipeline complete
- `ff:paused`    → intentionally paused (check latest checkpoint comment for context)

4. For any PAUSED or STALE issues, read the latest checkpoint comment for context:
   ```bash
   gh issue view <N> --json comments --jq '.comments[-1]'
   ```

5. Flag issues with no `ff:*` label that have open PRs from `ff/` branches — these are UNTRACKED:
   ```bash
   gh pr list --state open --json headRefName,number | jq '.[] | select(.headRefName | startswith("ff/"))'
   ```

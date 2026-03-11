/x-workflow.discover

**Load the `x-workflow` skill** for the full methodology.

## Purpose

Run Problem Discovery in sequence: Observe → Collect Data → Analyze → Hypothesize. Use when starting a new problem or when you need to go through the full discovery cycle.

## Arguments

`$ARGUMENTS` — Optional context (e.g. problem description, bug report). If empty, ask the user what to discover.

## Execution

Follow all substeps in order:

1. **Observe** — Never take what you know for granted. Observe the system. List logs, reports, data from peers.
2. **Collect Data** — Gather data historically: when did the problem manifest? What variables changed? Match against data.
3. **Analyze** — Use data to prove ideas wrong or right. Use visualizations, models, tools. Go through data even when confident.
4. **Hypothesize** — Write ideas as sentences. Taguchi diagrams help organize and prioritize causes.

Also establish **Experimental Design** (how to test) and **Tests** (protocols for replication). See reference.md for details.

## Guidelines

- Do not skip steps
- If stuck, revisit the previous step
- Consider checkpointing with `/x-workflow.checkpoint` before context limit

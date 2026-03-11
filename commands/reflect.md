# reflect

Usually ran after completing a task or session; reflect on the recent work to surface and document any learnings not captured in existing docs.

## 1. Orient: What Just Happened

Unless context is clear, review the recent work:

```bash
git log --oneline -10
git diff HEAD~1..HEAD --stat
```

Unless already provided, read any spec or PRD that scoped the work (if one exists). Identify which platform(s) were touched (desktop, mobile, shared).

## 2. Load Existing Learnings

Unless already done, read all files in `docs/learnings/` to understand what is already documented. Do not duplicate what is already there. Focus only on gaps.

## 3. Reflect: Ask These Questions

Work through each category. Only surface insights that are non-obvious, reusable, and not already captured.

**Surprises & Friction**
- What took longer than expected, and why?
- What assumption turned out to be wrong?
- What did I have to look up or re-discover?
- Where did I get stuck, and what unblocked me?

**Implicit Decisions**
- What tradeoffs were made that aren't documented anywhere?
- What was rejected and why? (Discarded options often matter as much as what was chosen.)
- What was almost done but wasn't?

**Codebase Understanding**
- What was surprising about how existing code worked?
- What naming was misleading or different from what was expected?
- What would need to be explained to someone picking up this task cold?

**Tooling & Environment**
- What setup steps were non-obvious or order-dependent?
- What commands or flags were crucial that aren't in the documentation?
- What broke, and how was it diagnosed?
- What context had to be re-established that should be pre-loaded?
- What question couldn't the docs answer?
- Where did source code have to be read because a spec was ambiguous?
- What invariant or constraint is load-bearing but nowhere stated?

## 4. Filter

Before writing anything, apply these filters:

- Is this a principle (reusable in a different context), or an implementation detail (specific to this task)? Only document generrally applicable principles.
- Could this mistake plausibly recur? If not, skip it.
- Is it already captured in `docs/learnings/`, `CLAUDE.md`, or `CONTRIBUTING.md`? If yes, skip it. If the existing doc is incomplete or wrong, update that doc instead.

## 5. Write

For each surviving insight, determine which file it belongs to:

- `docs/learnings/architecture.md` — ownership, immutability, data flow, boundaries
- `docs/learnings/agent-workflow.md` — parallelization, subagent prompts, review process, context hygiene
- `docs/learnings/audio-development.md` — callback constraints, clock, synthesis, devices
- New file — only if the domain is genuinely new and unrelated to the above

If a new file is created, update `docs/learnings/README.md` to include it.

Write principles, not implementation details. Avoid referencing specific file names, class names, or feature names. Use the same voice and format as the existing learnings files.

## 6. Report

After writing, briefly summarize:
- What was documented and where
- What was considered but filtered out (and why)
- Any open questions that remain unresolved

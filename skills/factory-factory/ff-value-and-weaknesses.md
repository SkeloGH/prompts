# Factory Factory — Value Proposition & Known Weaknesses

## What Problem Does ff Solve?

**The core problem: the developer bottleneck.**

In a normal workflow, a human engineer is the single-threaded executor — they can only work on one thing at a time, and context-switching between tasks is expensive. The more features in flight, the slower each one moves.

ff dissolves that bottleneck by separating two fundamentally different jobs:

| Role | Human cost | ff's answer |
|------|-----------|-------------|
| **Deciding what to build** | High judgment, can't be delegated | You (PM/orchestrator) |
| **Building it** | Low judgment, high execution | ff agent (developer) |

Once the "what" is clear (spec + GH issue), ff handles the entire execution loop — write code, run tests, self-review, validate, create PR — without blocking you. You can have 5–10 features in flight simultaneously while you're reviewing output, writing the next spec, or doing something else entirely.

### Secondary problems it resolves

1. **Context loss between sessions** — work state lives on GH issues (labels + checkpoint comments), not in anyone's head or a local file. Any agent in any session can pick up where the last one stopped.

2. **Quality drift at scale** — running multiple workspaces in parallel without review would produce garbage. The pipeline gates (review → validate → annotate → pr) enforce a quality floor regardless of how many agents are working.

3. **Permission/trust boundary** — agents can do unrestricted work inside isolated git worktrees, but mutations to shared state (push, PR creation, comments) require explicit orchestrator approval. This keeps humans in the loop for things that matter.

---

## Known Weaknesses

### 1. Permission bottleneck (biggest pain point)

Every mutating operation blocks the agent until you click Allow in the browser. With 5 workspaces running in parallel, you become a full-time permission-clicker. The agent sits idle — sometimes for minutes — waiting for you to notice.

**Mitigation so far:** "Always Allow" for safe operations (git add, git config). But write operations (push, PR create) still need per-click approval, and there's no batch-approve mechanism.

### 2. Issue body is the prompt — still all-or-nothing

ff auto-creates workspaces from assigned GitHub issues (assign with `gh issue edit <N> --add-assignee @me`). The issue body **is** the workspace prompt. This eliminates the manual copy-paste step, but the agent still has **zero conversational context** beyond what's in the issue body and files it can read. If the issue body omits a spec path or key requirement, the agent will guess wrong or stall.

**Failure mode:** Agent produces a technically correct implementation that misses the point because the issue body omitted business context that felt "obvious" to you.

### 3. No mid-flight course correction

Once an agent is running, you can't steer it. You can't say "actually, use approach B instead" — you have to wait for it to finish (or fail), then launch a new session with updated instructions. There's no conversational feedback loop like a human pair-programming session.

### 4. Spec quality is the ceiling

ff agents execute faithfully. If the spec is vague, the implementation will be confidently wrong. Bad specs produce bad PRs *faster* — which is actually worse than slow, because now you're spending review time rejecting work instead of shipping it.

### 5. Cross-workspace coordination is manual

If workspace A produces a schema migration and workspace B depends on it, there's no mechanism for B to wait on A. You (the orchestrator) must manually sequence dependent work, merge A first, then launch B. ff treats every workspace as independent.

### 6. Review/validate loop can spin

The self-review stage can loop indefinitely — the agent finds P1 issues, fixes them, introduces new P1 issues, fixes those, etc. There's no circuit breaker. The orchestrator has to notice and intervene.

### 7. Ratchet noise

Post-PR, Ratchet investigates pre-existing CI failures that have nothing to do with the current PR. It dutifully documents them but wastes time and generates noise. There's no way to tell it "these failures existed before you."

### 8. Single-repo assumption

ff creates worktrees from one repo. CloudRig is a polyrepo (cr-pm, cr-field, cr-view-models). A feature that spans repos needs multiple workspaces with manual coordination — ff doesn't understand cross-repo dependencies.


# Evidence-Based Optimization

**Usage:** `/optimize` followed by the optimization goal.

**Examples:**
- `/optimize to find a memory leak in navigation`
- `/optimize to reduce re-renders on the video player`
- `/optimize to fix haptic timing drift during playback`

---

## Instructions

When invoked with a goal, follow this workflow.

### 1. Context: project rules

Load and apply:

- **`CLAUDE.md`** — Project overview, monorepo structure, tech stack, coding principles, architecture.
- **`CONTRIBUTING.md`** — Quality gates, testing discipline, contribution workflow.
- **`docs/learnings/`** — Architecture patterns and principles.

Respect existing architecture, data flow, and ownership patterns when proposing changes.

### 2. Troubleshooting principles

- If **`docs/guides/X-WORKFLOW.md`** exists, use it as the primary approach for problem-solving and troubleshooting.
- Otherwise, apply a structured approach: disambiguate, clarify, validate. Prefer clarifying questions over assumptions.

### 3. Tooling

Use available scripts where they help. Do not run long-lived dev servers unless the user asks. Prefer non-interactive commands.

### 4. Research

- Search the codebase for the area implied by the user's goal.
- Identify likely causes (e.g. subscriptions without cleanup, unstable references, missing cleanup, listener leaks).
- Cross-check with CLAUDE.md coding principles and architecture docs.

### 5. Data and evidence (required)

**Do not rely on theory alone.** Optimizations must be grounded in actual data.

- **Identify what data exists or is obtainable:**
  - User-reported repro (steps, frequency, device/simulator).
  - Test suite: coverage, timings, heap usage.
  - Runtime: profiler output, memory snapshots, FPS/frame drops.
  - Existing docs: any metrics or benchmarks under `docs/`.
- **State what data is missing:** What measurements would be needed to validate the hypothesis before or after a change.
- **Design decisions:** Require clear validation criteria — what observable data would confirm or reject the recommendation.

If no data is available, the proposal **must** say so and list the **minimal data to gather** before implementing (or mark the proposal as "hypothesis only; validate with data first").

### 6. Solution proposal (spec-style)

Present the solution as a **proposal**:

- **Include only sections that have concrete content** (e.g. Problem Overview, Constraints, Background, Theory/Technical Specification, Open Issues).
- **Be concise:** prefer relevant excerpts and clear bullets over long prose.
- **Include an Evidence/validation subsection:** what data supports the recommendation, what data is missing, and what to gather before or after implementing.
- **Structure the proposal** so it can be validated and then implemented (hypothesis, key code touchpoints, test strategy).

End with a **clear list of recommended next steps**.

### 7. Await confirmation

After presenting the proposal:

- Explicitly ask for **user confirmation** before implementing.
- Invite **feedback** (scope, alternative approaches, constraints).
- Do not start implementation or make edits until the user confirms.

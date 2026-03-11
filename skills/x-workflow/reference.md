# X-Workflow Reference

Full methodology content.

## Objective

This document is a manual for an ongoing living process where everyone can participate and collaborate to expose examples, special cases, prepare courses and discuss.

## General Process

The cycle we live while we work. Following a constituted method reduces errors. Even when imperfect, it represents a giant leap to success.

### How To Go Through The Process

- Look at the company as a single team
- When working on a problem, identify its current stage and follow the process until the end
- May take iterations, loops, tweaks—follow through
- You may hand work to another peer; someone may use your work as research later
- Don't skip stages because something seems hard or useless—ask questions, read, research

---

## Stage 1: Problem Discovery

Observe something: new project, customer use case, bug, undiscovered flow, performance hit. Discover components, manifestations, causes and effects.

### Observation
Never take what you know for granted. Observe the system. List logs, reports, data from peers for system structure or flow.

### Data Gathering
Gather data historically: when did the problem manifest? What was going on? What variables changed? Think logical explanations, match against data.

### Data Analysis
Use data to prove ideas wrong or right. Use visualizations, models, text/log analysis tools. Go through data even when confident—you may find surprises.

### Hypothesis Generation
Write ideas as sentences explaining what is going on. Taguchi diagrams help organize and prioritize causes.

### Experimental Design
Tools for knowledge generation and hypothesis testing. Not TDD, but similar. Test several ideas at once, detect errors. Prove causes matter. Don't skip.

### Tests
Protocols anyone can use to replicate observations. Also final tests for hypothesis success/failure. Establish clearly—you'll need them later.

---

## Stage 2: Problem Definition

You may have discovered multiple problems. Don't force one. Define each in a single sentence; having many definitions is fine.

### Definition
Single sentence expressing the problem. Others should understand it; they can look at prior work for context.

**Example (good):** Getting to 500 requests per second on this service increases average response time from 10ms to 500ms.

**Example (bad):** The service response time is affected by the number of requests per second.

### Constraints
List all conditions and their importance. Systems behave differently under different conditions. What's a problem on a small computer may not be on a server.

---

## Stage 3: Search For Solutions

Document ideas. Gather, read, talk, draw. Generate solutions. Test ideas against constraints.

### Research
Many problems are already solved (perhaps expressed differently). Research. If not solved, learn what worked or failed elsewhere.

### Brainstorming
Gather with others. Think many possibilities, go crazy, be wrong. Discard later.

### Modeling
Discard ideas that don't work. Choose the best that fits constraints. Use diagrams, tests, documentation. Discard what doesn't match the problem definition.

### Prototyping
A prototype is a simplified system that proves the component can be built and will work. Not a bad implementation—a validation tool.

---

## Stage 4: Specification

The spec is the guide with which you build. Result of all previous work. If stuck, you likely skipped something—go back.

### Problem
ONE problem. Specific solution. Does not solve many problems, all problems, or build products.

### Background
Summary of prior work: research, failed attempts, improvements. Justify your course of action.

### Hypothesis
Foundation for the solution. Single sentence (or few). Better to create more specs than fit all into one.

### Solution Proposal
General idea. Small description of how it works. Black box diagram helps show interactions.

### Functional Specification
Detailed solution proposal. Diagrams, storyboards, text. States, buttons, APIs. Anatomy of the solution.

### Technical Specification
Implementation steps: pseudo-code, algorithms, protocols. Anyone with skills should implement from this. See RFC, IEEE, ECMA for examples.

---

## Stage 5: Implementation

Stop being creative. Become an execution machine. Execute and error-check. Document changes and strange situations in a journal.

---

## Stage 6: Data Analysis

Check if you did it right. Test the hypothesis. Use tests from discovery stage. Test constraints (old browser? slow network? UX clarity?). Build a report.

---

## Stage 7: Planning For The Future

Document: what you did, accomplished, failed, new ideas, other approaches, improvements, new ventures. Valuable for future work.

---

---

## Agent Continuity (Limited Context)

Agents with limited context windows lose state between sessions. Checkpoint files let the next agent resume without re-explaining.

### Checkpoint File Location
`.cursor/workspace/x-workflow-<slug>.md`

Use a short, memorable slug (e.g. `baseline-hygiene`, `coverage-gates`, `storybook-docs`). One file per active problem.

### When to Write a Checkpoint
- Approaching context limit or ending a long session
- After completing a stage (or significant substep)
- Before handing off to another agent or human

### Checkpoint Template

```markdown
# X-Workflow: [Problem Name]

**Current stage:** [1–7: stage name]
**Last updated:** YYYY-MM-DD

## Problem Definition
[One sentence, or "Draft: ..." if still refining]

## Constraints
[Key constraints, if known]

## Completed
- [x] [Substep]
- [x] [Substep]
- [ ] [Next substep]

## Next Steps (concrete)
1. [Specific action the next agent should take]
2. [Specific action]
3. [Specific action]

## Key Decisions
- [Decision]: [Rationale]

## Artifacts
- [Path to brief, spec, data file, etc.]
- [Path]
```

### Resume Flow
1. User runs `/x-workflow.resume` or `/x-workflow.resume <slug>`
2. Agent loads x-workflow skill and reads the checkpoint file
3. Agent continues from "Next Steps" without redoing completed work
4. Agent updates the checkpoint when making progress or before ending

### Tips
- Keep "Next Steps" concrete (e.g. "Run ESLint on cr-pm and list violations" not "Continue discovery")
- Link to artifacts so the next agent can load them
- If multiple problems, use separate checkpoint files

---

## Appendix References

- Problem solving, design thinking, scientific method
- Design of Experiments
- Elio & Scharf: "Modeling novice-to-expert shifts in problem-solving strategy"
- Schraagen: "How experts solve a novel problem in experimental design"
- Keeping a Research Journal

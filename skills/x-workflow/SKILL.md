---
name: x-workflow
description: Guides through X-Workflow problem-solving stages (discovery, definition, search, specification, implementation, analysis, planning). Use when the user wants X-Workflow, has a complex/ambiguous problem, or says "go through the process".
---

# X-Workflow

A structured problem-solving methodology. Follow the process from the current stage through to completion. Do not skip stages—if stuck, go back.

## First: Identify Current Stage

Ask the user or infer from context which stage they're in:

| Stage | Signs |
|-------|-------|
| **Problem Discovery** | New problem, bug, unclear cause, need to observe/gather data |
| **Problem Definition** | Have data/hypotheses, need one-sentence definition + constraints |
| **Search For Solutions** | Problem defined, need ideas, research, prototypes |
| **Specification** | Solution chosen, need to document before implementing |
| **Implementation** | Spec ready, executing the build |
| **Data Analysis** | Implementation done, validating hypothesis and constraints |
| **Planning For The Future** | Work complete, documenting learnings and next steps |

## Stage Overview

### 1. Problem Discovery
Observation → Data Gathering → Data Analysis → Hypothesis Generation → Experimental Design → Tests

### 2. Problem Definition
One-sentence definition + constraints. If multiple problems, define each separately.

### 3. Search For Solutions
Research → Brainstorming → Modeling → Prototyping. Consider using the **brainstorming** skill for the ideation phase.

### 4. Specification
Problem, Background, Hypothesis, Solution Proposal, Functional Spec, Technical Spec. Use project's **SPECCING** format (see `.cursor/rules/SPECCING.md`).

### 5. Implementation
Execute the spec. Document deviations in a journal.

### 6. Data Analysis
Validate hypothesis and constraints. Build a report.

### 7. Planning For The Future
Document outcomes, learnings, improvements, and next ventures.

## Principles

- **One problem per spec**—do not try to solve everything in one document
- **Don't skip**—if stuck on a stage, revisit the previous one
- **Integrate with existing**—use brainstorming skill for Search For Solutions; use SPECCING for Specification
- **Follow through**—complete the cycle even if handing off to others

## Agent Continuity (Limited Context)

When working with agents that have limited context, persist state so the next session can resume.

### Checkpoint Location
`.cursor/workspace/x-workflow-<slug>.md` — one file per active problem. Use a short slug (e.g. `baseline-hygiene`, `coverage-gates`).

### When to Checkpoint
- **Before context limit** — when approaching token limits or ending a long session
- **End of each stage** — after completing a stage's work
- **Before handoff** — when passing to another agent or human

### Checkpoint Contents
Include: current stage, problem definition (draft or final), completed substeps, next 2–3 concrete actions, key decisions, and paths to artifacts (briefs, specs, data).

### Resume
Run `/x-workflow.resume` or `/x-workflow.resume <slug>`. The agent reads the checkpoint first, then continues from the stated next steps.

See [reference.md](reference.md) for the checkpoint template and full continuity guidance.

## Subcommands (dot notation)

| Command | Purpose |
|---------|---------|
| `/x-workflow.checkpoint` | Save state for resume |
| `/x-workflow.resume` | Load checkpoint and continue |
| `/x-workflow.discover` | Full discovery sequence |
| `/x-workflow.discover.observe` | Observation step |
| `/x-workflow.discover.collect-data` | Data gathering step |
| `/x-workflow.discover.analyze` | Data analysis step |
| `/x-workflow.discover.hypothesize` | Hypothesis generation step |
| `/x-workflow.problem-statement` | One-sentence definition + constraints |
| `/x-workflow.research` | Search For Solutions (research, modeling, prototyping) |
| `/x-workflow.validate` | Data Analysis (validate hypothesis and constraints) |
| `/x-workflow.status` | Show current stage and next steps |
| `/x-workflow.list.workflows` | Recent workflows and status |
| `/x-workflow.list.checkpoints` | Active checkpoints |
| `/x-workflow.list.progress` | Steps followed and stage |

Use `/brainstorm` for ideation, `/spec` for specification, `/implement` for implementation, `/compound` for planning/learnings.

## Additional Resources

- For full stage details, methods, and examples, see [reference.md](reference.md)

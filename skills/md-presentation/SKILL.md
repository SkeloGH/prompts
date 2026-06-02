---
name: md-presentation
description: >-
  Generate a didactic presentation as a Markdown document for epistemic
  priming on a topic, PR, feature, subsystem, or decision. Same approach as
  /pdf-presentation but the output is a .md file with mermaid diagrams and
  ASCII visuals instead of a rendered PDF — so it lives in a repo, renders in
  GitHub / VS Code / Obsidian, and diffs cleanly. Use when the user says
  "/md-presentation", asks for a Markdown deck / slides, or wants priming
  material that belongs in version control.
---

# md-presentation

Produce a presentation as a single Markdown document. Its job is **epistemic
priming**: a reader finishes it able to *think* about the subject — not merely
informed of facts. Same intent as `/pdf-presentation`; different medium.

## When to use this vs /pdf-presentation

- **md-presentation** — when the deck should live in a repo, be reviewed in a
  PR, render inline on GitHub, or be edited as text. Diagrams are mermaid (live
  in most renderers) or ASCII (live everywhere). No browser, no render step.
- **pdf-presentation** — when you want a polished, fixed-layout PDF artifact to
  hand off or attach. Pixel control, CSS visuals.

The thinking is identical. Only the output format differs.

## Five principles (shared with /pdf-presentation)

1. **Concept-dependency order.** Each slide uses only ideas already taught.
   Outline the dependency graph, then walk it.
2. **Selective, not exhaustive.** Teach; do not record. Cut the file-by-file
   dump; keep the diagram of the one tricky mechanism.
3. **Visuals do the work.** Every non-trivial idea gets a mermaid diagram or
   an ASCII figure — not a bare bullet list.
4. **Ground every claim.** Never invent. `gh pr view`, read the code, verify
   the numbers.
5. **One idea per slide.** A heading states a *claim*, not a label.

## Document structure

One `.md` file. Each "slide" is a section separated by a `---` horizontal
rule. Use this skeleton (see `template.md` in this skill's directory for a
full worked example):

```markdown
# Deck Title
One-line subtitle — what the reader will be able to think about afterward.

`Tag` · `Context` · `Scope`

---

## 01 · Section label
### A headline that states a claim, not a topic

One sentence framing the visual below.

<the visual — mermaid or ASCII>

> **Takeaway:** the one line to leave the slide holding.

---

## 02 · ...
```

Keep it to 8–12 slides. Slide 1 is the title; the last is synthesis / what's
next.

## Choosing the visual

**mermaid** — for anything with nodes and edges. Renders live in GitHub, VS
Code, Obsidian, GitLab.

| Idea | mermaid form |
|---|---|
| Process / "A leads to B" | `flowchart LR` |
| Precedence / decision logic | `flowchart TD` with `{decision}` nodes |
| Timeline / sequence of events | `flowchart LR` or `timeline` |
| Interaction between parts | `sequenceDiagram` |
| State changes | `stateDiagram-v2` |
| Hierarchy / breakdown | `flowchart TD` tree |

**ASCII** (fenced ` ``` ` block) — for things mermaid renders poorly:

- **Gauge / value-vs-threshold:** `[████████░░░░░░░░░░] 0.44  │ gate 0.90`
- **Tier ladder / ranked levels:** stacked labelled boxes.
- **Annotated strip / sequence of cells:** rows of `■`/`□` with a legend.
- **Side-by-side comparison:** a Markdown table is usually best; ASCII columns
  if layout matters.

Pick the form that *is* the idea. If a slide's idea is "A causes B causes C,"
that is a `flowchart LR`; if it is "two things differ," that is a table or a
two-column figure.

## Markdown craft

- Headings: `##` for the slide, `###` for its claim-headline. Do not go deeper.
- Use `>` block quotes for the per-slide takeaway.
- Use tables for structured comparisons and reference recaps — they render
  everywhere and diff cleanly.
- Inline `code` for identifiers, file names, symbols.
- No HTML. No images. Keep it pure Markdown + mermaid so it renders anywhere
  and stays diff-friendly.
- A mermaid block must be ```` ```mermaid ````; an ASCII figure is a plain
  ```` ``` ```` fenced block (no language) so it is never reflowed.

## Process

1. **Gather & verify** the source material.
2. **Outline** 8–12 slides in concept-dependency order; write each headline as
   a one-sentence claim first.
3. **Pick a visual per slide** (mermaid or ASCII per the table above).
4. **Write** the `.md` from `template.md`.
5. **Sanity-check** the mermaid blocks — every node referenced is defined, no
   stray characters; the file is valid Markdown.

## Output location

Save the `.md` to a `presentations/` directory at the project root (the
session's primary working directory). Create it if missing. Name kebab-case by
topic, e.g. `chunk-boundary-eval.md`. Do not write it to the repo root.

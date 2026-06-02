---
name: md-presentation
description: >-
  Generate a didactic presentation as a Markdown document for epistemic
  priming on a topic, PR, feature, subsystem, or decision. Same approach as
  /pdf-presentation — opening on a whole-system architecture diagram, then
  zooming in — but the output is a .md file with mermaid diagrams and ASCII
  visuals instead of a rendered PDF, so it lives in a repo, renders in
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

## Doctrine (shared with /pdf-presentation)

CSS styling doesn't apply to Markdown, but the *didactic* doctrine does — the
structure, leanness, and grounding are the same.

1. **Overview-first structure.** After the title, **slide 2 is a whole-system
   architecture diagram** — the map of the subject — *before* zooming into
   parts. Render it as a top-to-bottom mermaid `flowchart TD` with subgraphs:
   an entry/trigger node, upstream/already-shipped stages, the **deck's own
   subject as the highlighted focus node** (give it a distinct
   `style ... fill:` so it reads as the hero), and the downstream sink. Close
   with one line stating the end-to-end invariant. Spotlight the subject;
   everything else is context. This orients the reader and gives narrative
   continuity across a series of related decks.
2. **Concept-dependency order.** Each slide uses only ideas already taught.
   Outline the dependency graph, then walk it.
3. **Selective, not exhaustive.** Teach; do not record. Cut the file-by-file
   dump; keep the diagram of the one tricky mechanism.
4. **Lean — structure carries the idea; words only label.** A heading is an
   **assertion** (a claim), not a label. Cut the framing sentence when the
   heading + diagram already deliver the point. Tighten each `>` takeaway to a
   **single punch** — one crisp insight, never a restatement of the heading.
5. **Visuals do the work.** Every non-trivial idea gets a mermaid diagram or
   an ASCII figure — not a bare bullet list.
6. **Ground every claim.** Never invent. `gh pr view`, read the code, verify
   the numbers. A priming deck that is confidently wrong is worse than none.
7. **Clean up after yourself.** If you generate any scratch files while
   building, delete them; the `.md` is the only deliverable.

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

Keep it to 8–12 slides. Slide 1 is the title; **slide 2 is the whole-system
architecture overview** (a top-down mermaid `flowchart TD` with the deck's
subject as a highlighted focus node — see `template.md`); the last is
synthesis / what's next.

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
   a one-sentence claim first. Slide 1 is the title; **slide 2 is the
   whole-system architecture overview**.
3. **Pick a visual per slide** (mermaid or ASCII per the table above).
4. **Write** the `.md` from `template.md`.
5. **Sanity-check** the mermaid blocks — every node referenced is defined, no
   stray characters; the file is valid Markdown. Confirm each takeaway is a
   single punch, not a restatement of the heading.

## Output location

Save the `.md` to a `presentations/` directory at the project root (the
session's primary working directory). Create it if missing. Name kebab-case by
topic, e.g. `chunk-boundary-eval.md`. Do not write it to the repo root.

---
name: pdf-presentation
description: >-
  Generate a didactic slide-deck PDF for epistemic priming on a topic, PR,
  feature, subsystem, or decision. Builds a clean 16:9 HTML deck with
  CSS-drawn visuals and renders it to PDF via headless Chrome/Edge. Use when
  the user says "/pdf-presentation", asks to "make a presentation / deck /
  slides", or wants priming material that teaches a subject. For a Markdown
  output instead of a rendered PDF, use the sibling skill /md-presentation.
---

# pdf-presentation

Produce a polished slide-deck PDF whose job is **epistemic priming**: a reader
finishes it able to *think* about the subject — not merely informed of facts.

## What this is for

Turn a subject into teaching material — a PR, a feature, a subsystem, an
architecture decision, a concept. Output: a 16:9 PDF deck, 8–12 slides, with
diagrams hand-drawn in CSS.

This is **not** a document snapshot. A report is organized the way the source
is — chronological, exhaustive, every file and field present. A presentation is
**selective and conceptual**: it teaches the ideas in the order a mind needs
them. If the user wants a faithful capture, that is a different artifact.

## Five principles

1. **Concept-dependency order.** Sequence slides so each one only uses ideas
   already taught. You cannot explain "red by design" before "precision";
   you cannot explain precision before "what a boundary is." Outline the
   dependency graph first, then walk it.
2. **Selective, not exhaustive.** Include what teaches; cut what merely
   records. A 15-file diff table teaches nothing; a diagram of the one tricky
   mechanism teaches a lot.
3. **Visuals do the work.** Every non-trivial idea gets a CSS-drawn visual — a
   comparison, a flow, a cascade, a gauge. Bullet lists are the fallback, not
   the default.
4. **Ground every claim.** Never invent. If it is a PR, `gh pr view`. If it is
   code, read the code. If it is a number, verify it. A priming deck that is
   confidently wrong is worse than none.
5. **One idea per slide.** A headline states a *claim*, not a label
   ("The eval fails today — on purpose", not "Test results").

## Process

1. **Gather & verify** the source material. Fetch / read / confirm.
2. **Outline** 8–12 slides in concept-dependency order. Slide 1 is the title;
   the final slide is synthesis / what's next. Write each slide's headline as
   a one-sentence claim before building anything.
3. **Pick a visual per slide** from the pattern library below.
4. **Build** — copy `template.html` from this skill's directory; fill in slides.
5. **Render & verify** — run `render-pdf.js` (below).
6. **Save** both files to the output directory (below).

## Slide anatomy

Each slide: **kicker** (small section label) → **headline** (the claim) →
**subhead** (one clarifying sentence) → **content** (the visual) → page number.
One fixed-height `.slide` per slide; never let content overflow.

## Visual pattern library

All of these are in `template.html` with CSS + a worked example:

- **Title** — deck name, one-line subtitle, 2–3 context chips.
- **Comparison cards** — 2–3 side-by-side options/things, one judged/highlighted.
- **Horizontal pipeline** — stages connected by arrows; for processes/flows.
- **Decision cascade** — vertical "if X → outcome, else ↓" ladder; for precedence/resolution logic.
- **Tier ladder** — ranked levels, colored by rank; for hierarchies.
- **Two-panel comparison** — a good-vs-bad / before-vs-after split.
- **Metric gauge** — a value against a threshold; for scores, budgets, gates.
- **Checklist** — done/pending items; for test plans, status.
- **Annotated strip / row** — a sequence of cells with markers; for pages, steps, timelines.
- **Reference table** — a compact recap grid; good as a closing slide.
- **Callout / note-line** — an accented one-liner for the takeaway under a visual.

Choose the visual that *is* the idea. If a slide's idea is "two things differ,"
that is a comparison; if it is "A leads to B leads to C," that is a pipeline.

## Build

Copy `template.html` from this skill's directory into a working `.html` file.
It carries the full CSS component library and a worked example of every
pattern. Keep the base CSS; delete example slides you do not need; one
`<section class="slide">` per slide. Slides are 13.333in × 7.5in (16:9).

Style: clean and minimal. One accent color (indigo by default — change the
`--accent` CSS var to re-theme). Generous whitespace. No clip-art, no stock
icons, no decorative gradients. Every pixel of a visual should carry meaning.

## Render

```
node "<this-skill-dir>/render-pdf.js" <input.html> <output.pdf> <slideCount>
```

It resolves a Chrome/Edge browser cross-platform, renders with
`--print-to-pdf --no-pdf-header-footer`, and verifies the PDF page count
equals `<slideCount>`. A mismatch means a slide's content overflowed onto a
second page — tighten that slide and re-render. Passing `<slideCount>` is
optional but recommended; it is the one reliable correctness check.

## Output location

Save **both** the `.html` source and the `.pdf` to a `presentations/`
directory at the project root (the session's primary working directory).
Create it if missing. Keep the `.html` — it is the editable source for future
tweaks. Name files kebab-case by topic, e.g. `chunk-boundary-eval-deck.pdf`.
Do not write generated artifacts to the repo root — they clutter it.

## Notes

- If `gh`, a browser, or other tooling is missing, say so plainly rather than
  guessing or faking output.
- The deck's facts are only as good as the grounding step. Spend real effort
  there before building a single slide.

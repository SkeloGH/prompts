---
name: html-presentation
description: >-
  Generate a didactic slide-deck HTML file for epistemic priming on a topic,
  PR, feature, subsystem, or decision. Builds a clean 16:9 deck with CSS-drawn
  visuals — stops at the HTML, no PDF render. Use when the user says
  "/html-presentation", asks for an HTML deck specifically, wants to iterate
  on the source before rendering, or is in an environment with no browser to
  render with. For a rendered PDF instead, use the sibling skill
  /pdf-presentation. For Markdown, use /md-presentation.
---

# html-presentation

Produce a polished slide-deck **HTML file** whose job is **epistemic priming**:
a reader finishes it able to *think* about the subject — not merely informed
of facts. Identical principles to `/pdf-presentation`; the only difference is
that this skill stops at the HTML and does not render a PDF.

## When to choose this over /pdf-presentation

- Iterating on slide content and visuals — re-renders for every edit cost
  seconds; skipping the PDF step makes the loop tighter.
- The environment has no Chrome / Edge / Chromium available, so the render
  step would fail anyway.
- The deck will be viewed in a browser (open the `.html` directly, or serve
  it) rather than presented as a PDF.
- The deck is a draft for review and a rendered artifact would be premature.

If the user wants something they can email or hand to someone for offline
viewing, they almost certainly want a PDF — use `/pdf-presentation` instead.

## What this is for

Turn a subject into teaching material — a PR, a feature, a subsystem, an
architecture decision, a concept. Output: a 16:9 HTML file, 8–12 slides, with
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
5. **Sanity-check the HTML** — open it in a browser, count slides, verify no
   slide overflows its 7.5in height (a visible scrollbar inside a `.slide` is
   the symptom). There is no automated verification step; this is on you.
6. **Save** the `.html` file to the output directory (below).

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

## No render step

`/pdf-presentation` ends with a headless-browser render and a page-count
correctness check. This skill deliberately does not. If you want that
verification — and the safety it provides against a slide silently overflowing
onto a second printed page — render the HTML through `/pdf-presentation`'s
`render-pdf.js` afterward, or switch to `/pdf-presentation` from the start.

Opening the file in a browser is a sufficient visual check; the only
failure mode it does not catch is the print-paginate edge case, which only
matters if the deck will eventually be printed or PDF-rendered.

## Output location

Save the `.html` to **`%USERPROFILE%\Documents\Code\presentations\`** (the
default cross-project decks directory) unless the user explicitly asks for a
different location. Create the directory if missing. `ls` it first — if a deck
with the same slug already exists, the user almost certainly wants an edit,
not a duplicate. Name files kebab-case by topic, e.g.
`chunk-boundary-eval-deck.html`. Do not write generated artifacts to the
workspace root or a repo root — they clutter it.

## Notes

- The deck's facts are only as good as the grounding step. Spend real effort
  there before building a single slide.
- If the user later asks for a PDF, render the same `.html` through
  `/pdf-presentation`'s `render-pdf.js` — no need to rebuild.

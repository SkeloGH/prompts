---
name: pdf-presentation
description: >-
  Generate a didactic slide-deck PDF for epistemic priming on a topic, PR,
  feature, subsystem, or decision. Builds a clean 16:9 dark-theme deck with
  CSS-drawn visuals — opening on a whole-system architecture slide, then
  zooming in — and renders it to PDF via headless Chrome/Edge. Use when the
  user says "/pdf-presentation", asks to "make a presentation / deck /
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

## Doctrine

1. **Overview-first structure.** After the title, **slide 2 is a whole-system
   architecture diagram** — the map of the subject — *before* zooming into
   parts. It orients the reader and gives narrative continuity across a series
   of related decks. Render it as a top-to-bottom **banded** diagram (the
   `.arch` family): a gate/trigger strip, ingestion/upstream bands rendered
   quietly, the **deck's own subject as the accented hero band**, downstream /
   already-shipped stages in a quiet green `.shipped` treatment, and a closing
   `.arch-parity` thesis bar. Spotlight the subject; everything else is context.
2. **Concept-dependency order.** Sequence slides so each one only uses ideas
   already taught. You cannot explain "red by design" before "precision";
   you cannot explain precision before "what a boundary is." Outline the
   dependency graph first, then walk it.
3. **Selective, not exhaustive.** Include what teaches; cut what merely
   records. A 15-file diff table teaches nothing; a diagram of the one tricky
   mechanism teaches a lot.
4. **Lean — structure carries the idea; words only label.** The
   structure / sequence / representation of a visual *is* the argument; text
   only labels it. Headlines are **assertions** (a claim), not labels ("The
   eval fails today — on purpose", not "Test results"). **Cut the subhead**
   when the headline + visual already deliver the point — keep one only when it
   carries unique load the visual can't. Tighten every `.note-line` callout to
   a **single punch**: one crisp insight, no multi-clause padding, never a
   restatement of the headline.
5. **Visuals do the work.** Every non-trivial idea gets a CSS-drawn visual from
   the pattern library — a comparison, a flow, a cascade, a gauge. Bullet lists
   are the fallback, not the default.
6. **No broken/undefined CSS.** Every class used in the markup must be defined
   in the stylesheet. Never ship a slide that renders as unstyled divs — check
   this explicitly before finishing. This is a real failure mode that has
   happened.
7. **Spacing discipline.** Slides are 13.333in × 7.5in; `.slide` padding is
   `0.72in 0.85in 0.85in`; `.content` centers with `padding-top:8px`. Equal-
   height columns come from flex (`.colcard{flex:1}`, `.two-col{align-items:
   stretch}`), **not** `height:100%`. The footer (`.docmark` / `.pagenum`) sits
   at `bottom:0.5in` — keep content clear of it. Nothing may clip top/bottom or
   overflow horizontally. A dense slide (e.g. the architecture slide) may carry
   the scoped `.arch-slide` density class.
8. **grid-bg rhythm.** Even page numbers carry `grid-bg`; odd are plain; the
   title is the title-slide. Keep the alternation consistent so the striping
   reads as intentional.
9. **Ground every claim.** Never invent. If it is a PR, `gh pr view`. If it is
   code, read the code. If it is a number, verify it. A priming deck that is
   confidently wrong is worse than none.
10. **Verify by rendering, then iterate.** Render to PDF, convert pages to
    images and *look* at every page; the PDF page count must equal the slide
    count (the overflow check). Fix and re-render until clean.
11. **Clean up after yourself.** Delete temp render artifacts (temp PDFs / PNGs)
    when done; keep only the deliverable(s).

## Process

1. **Gather & verify** the source material. Fetch / read / confirm.
2. **Outline** 8–12 slides in concept-dependency order. Slide 1 is the title;
   **slide 2 is the whole-system architecture overview** (banded `.arch`);
   the final slide is synthesis / what's next. Write each slide's headline as
   a one-sentence claim before building anything.
3. **Pick a visual per slide** from the pattern library below.
4. **Build** — copy `template.html` from this skill's directory; fill in slides.
5. **Render & verify** — run `render-pdf.js` (below), then look at the pages.
6. **Save** both files to the output directory (below); delete temp artifacts.

## Slide anatomy

Each slide: **kicker** (small section label) → **headline** (the claim) →
*(optional)* **subhead** → **content** (the visual) → page number. One fixed-
height `.slide` per slide; never let content overflow.

The **subhead is optional** — cut it whenever the headline plus the visual
already carry the point. Keep one only when it carries load the visual can't.

## Visual pattern library

All of these are in `template.html` with CSS + a worked example:

- **Banded architecture (`.arch`)** — the whole-system overview, a top-to-
  bottom stack of bands: gate strip, quiet upstream/shipped bands, one accented
  **hero** band (the subject), a downstream sink, and an `.arch-parity` thesis
  bar. **This is the slide-2 convention** — the map before the parts.
- **Title** — deck name, one-line subtitle, 2–3 context chips.
- **Comparison cards** — 2–3 side-by-side options/things, one judged/highlighted.
- **Horizontal pipeline** — stages connected by arrows; for processes/flows.
- **Decision cascade** — vertical "if X → outcome, else ↓" ladder; for precedence/resolution logic.
- **Tier ladder** — ranked levels, colored by rank; for hierarchies.
- **Two-panel comparison** — a good-vs-bad / before-vs-after split, with a `.pverdict`.
- **Black-box contract** — in → core → out, for a function/subsystem boundary.
- **Metric gauge** — a value against a threshold; for scores, budgets, gates.
- **Checklist** — done/pending items; for test plans, status.
- **Annotated strip / row** — a sequence of cells with markers; for pages, steps, timelines.
- **Reference table** — a compact recap grid; good as a closing slide.
- **Callout / note-line** — an accented **single-punch** one-liner under a visual.

Choose the visual that *is* the idea. If a slide's idea is "two things differ,"
that is a comparison; if it is "A leads to B leads to C," that is a pipeline;
if it is "here is the whole system," that is the banded architecture.

## Build

Copy `template.html` from this skill's directory into a working `.html` file.
It is **self-contained** — the full twilight stylesheet is inlined in a
`<style>` block, so the deck renders anywhere with no external assets. Keep
that inlined CSS; do **not** relink to an external file. Delete example slides
you do not need; one `<section class="slide">` per slide. Slides are
13.333in × 7.5in (16:9).

Style: the default theme is **twilight (dark)** — a near-black page, white ink,
and a single warm accent. Re-theme by editing the `--accent` var (and the rest
of the token block) in `:root`. Generous whitespace. No clip-art, no stock
icons, no decorative gradients. Every pixel of a visual should carry meaning.

Before finishing, **confirm every class in the markup is defined in the CSS** —
a slide that renders as unstyled divs is a hard failure (principle 6).

## Render

```
node "<this-skill-dir>/render-pdf.js" <input.html> <output.pdf> <slideCount>
```

It resolves a Chrome/Edge browser cross-platform, renders with
`--print-to-pdf --no-pdf-header-footer`, and verifies the PDF page count
equals `<slideCount>`. A mismatch means a slide's content overflowed onto a
second page — tighten that slide and re-render. Passing `<slideCount>` is
optional but recommended; it is the one reliable correctness check.

**Don't trust the page count alone — actually look.** Convert a few pages to
images (e.g. with PyMuPDF: `doc[i].get_pixmap(dpi=110).save(...)`) and view
them. Confirm the twilight theme renders (dark page, styled components — *not*
unstyled divs), the banded arch slide reads cleanly, and nothing clips. Fix and
re-render until clean.

## Output location

Save **both** the `.html` source and the `.pdf` to a `presentations/`
directory at the project root (the session's primary working directory).
Create it if missing. Keep the `.html` — it is the editable source for future
tweaks. Name files kebab-case by topic, e.g. `chunk-boundary-eval-deck.pdf`.
**Delete temp render artifacts** (intermediate PDFs / PNGs you made while
verifying) — leave only the deliverables. Do not write generated artifacts to
the repo root — they clutter it.

## Notes

- If `gh`, a browser, or other tooling is missing, say so plainly rather than
  guessing or faking output.
- The deck's facts are only as good as the grounding step. Spend real effort
  there before building a single slide.

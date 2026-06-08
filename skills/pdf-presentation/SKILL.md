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

## Six principles

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
   ("The eval fails today — on purpose", not "Test results"). When a section
   needs several insights, split into separate single-insight beats rather than
   one densely-packed slide; order beats by narrative intent (contrast, cause,
   escalation, reframe), not by what the data trivially supports. Storytelling
   reliably aids single-insight retrieval but not multi-insight synthesis (CHI'24).
6. **Friction before the reveal.** Don't let a fluent, perfectly-ordered deck
   become a substitute for the reader's own thinking. Once per deck, at a
   conceptual *why*-juncture, pose a question on one slide and resolve it on the
   next (a pause-and-predict / why-doesn't-the-obvious-approach-work beat), then
   consolidate the confusion explicitly. One such beat, not many. A slick
   walkthrough produces "I followed that," not "I learned that."

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

**Show dispersion before stating disparity.** On any group comparison (regions,
cohorts, demographics) do **not** collapse each group to one bar/dot — show the
spread (jitter, interval, or an overlap annotation) and state the overlap before
the gap. A single bar per group fuels deficit-thinking attribution; surfacing
within-group variability plus contextual framing reduces it (Holder & Padilla,
IEEE VIS 2024). This sharpens both the **Metric gauge** and **Comparison cards**
patterns above.

## House style — default for this user's technical / PR decks

For a **technical** deck (a PR, subsystem, architecture, or engineering decision), do NOT start from the generic template. Default to the user's **"Twilight"** house template + recipe below. (For non-technical / pitch / general-audience decks, Twilight does NOT apply — keep the per-deck style.) For PDF the fixed 16:9 sizing is correct; the fluid notes still let the same source double as a browser deck.

**Base template:** `%USERPROFILE%/Documents/Code/presentations/styles/twilight-tailwind.html` — the fluid-native, Tailwind-Play-CDN port; DEFAULT for new technical decks. Copy it and fill in slides. (The vanilla `twilight-template.html` + `twilight.css` is the offline-safe fallback — Tailwind Play CDN needs network.)
- **Authoring conveniences (use them):** page numbers + docmark are AUTOMATIC (CSS counters) — don't hand-number slides or add `.pagenum`/`.docmark` elements; just order the slides and set `--docmark` once. Fluid type via Tailwind `fontSize` tokens — use `text-headline`/`text-kicker`/… utilities, no hand-written `clamp()`. An in-file `=== TWILIGHT COMPONENT CHEAT-SHEET ===` comment gives minimal markup per component. Run `node presentations/styles/check-deck.js <deck.html>` to catch overflowing slides (exit 1 if any; `?debug` red-outlines them in-browser). Tailwind utilities are available for ad-hoc layout.
- **Palette (dark "Twilight"):** `--bg-page:#0a0a0f`, `--accent:#FF4018` / `--accent-deep:#FF5D3B`, ink `#ffffff`, body `#cbd5e1`; semantic `--ok:#4ade80` (shipped), `--indigo:#a5b4fc` (deterministic), `--warn`/`--red`. White-on-dark, orange accent. Font: **Manrope**.
- **Components:** banded-hero `.arch` (`.arch-band`/`.arch-band.shipped`/`.arch-hero`/`.arch-gate`/`.arch-parity`), maturity-colored `.pipe` (`.pnode.accent/.deterministic/.shipped`), `.cards`, `.panels`, `.two-col`/`.colcard`, `.sigs`, `.codepanel`, `.bbox-flow`, `.gauge-wrap`, `.reftable` + `.badge.ok/now/next/pending`, `.lands`, `.note-line`, `.kicker/.headline/.subhead`, `.docmark/.pagenum`.

**Single-PR / subsystem deck recipe (~11–12 slides):**
1. **Title** (`.title-slide` orbs/bar/chips) — top-corner `repo · PR #NNNN`; status chips (branch · "ships dark"/"behind flag" · commits/tests/review).
2. **"The whole system" — ALWAYS slide 2:** a banded-hero `.arch` showing where this work sits, THIS PR's scope as `.arch-hero` (accent), downstream/shipped bands neutral/green. *Map before the trail.*
3–4. The problem / why it exists (before→after `.panels`), then the concept.
5–9. Mechanism / contract (`.sigs`/`.bbox-flow`/`.codepanel`), deep-dives & invariants clustered.
10. Validation (tests / eval / review status) where applicable.
11. **Always end on a dedicated closing slide that LANDS** — the impact / the payoff / the bigger story / an open question that energizes the audience and makes them curious. NEVER end on operative details (next-steps checklists, merge plans, ops, config), a detail/reference slide, or implementation minutiae. End on why-it-matters + a hook, not a to-do list.

**Voice:** affirmative constraint headlines — state the invariant as fact ("Status is truth — read `grounding_status`", "Flag, don't gate"), NOT negations or hedging. Dense, authoritative; inline code / type names / spec refs — but keep it authoritative and **warm it ~half a notch**: human and readable, not clipped or stiff. Color-code by maturity (shipped=green, this-work=orange, deterministic=indigo).
**Altitude:** keep every slide at concept/operational altitude — no slide (the closer least of all) should be a dump of implementation minutiae (env-var tables, config field names, internal function/file names). State the takeaway; cite specifics only when they teach.
**Expertise path:** for a high-prior-knowledge audience (e.g. an engineering team on their own subsystem) **strip step-by-step scaffolding and redundant signaling** — the same cues that help newcomers depress expert learning as redundant load (2025 expertise-reversal meta-analysis). Offer a fast/expert path, and segment when the audience is mixed.

**Fluid (so the same HTML doubles as a browser deck) — the base is already fluid-native:** the Tailwind base ships fluid text (`fontSize` tokens), wrapping component rows, and full-bleed slides — you no longer hand-apply a fluid pass. Just don't break it: NO `zoom`/`transform:scale`. The `@media print` 16:9 restore (`.slide{ width:13.333in; height:7.5in; min-height:0; overflow:hidden; page-break-after:always }`) is already in the base. CDNs are fine (Tailwind, fonts, icon/CSS libs) — they render in-browser through AVG; the only tradeoff is offline viewing (and a PDF render needs the resource reachable). Self-contained native CSS is optional, not required. (See memories `feedback_deck_fluid_not_pdf` + `feedback_deck_house_style`.)

**Canonical example:** `presentations/check-grounding-1106-deck.html`.

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

**Page-count parity catches overflow, not falsehood.** Before render, run a
factual-grounding pass — check every number and claim on every slide against the
source. For machine-built decks, content coverage is the easy axis; numeric and
layout fidelity are where they fail (PresentBench 2026). Spend the effort there,
not on adding text.

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

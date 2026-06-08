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
   ("The eval fails today — on purpose", not "Test results").
6. **Friction before the reveal.** Don't let a fluent, perfectly-ordered deck
   become a substitute for the reader's own thinking. Once per deck, at a
   conceptual *why*-juncture, pose a question on one slide and resolve it on the
   next (a pause-and-predict / why-doesn't-the-obvious-approach-work beat), then
   consolidate the confusion explicitly. One such beat, not many. A slick
   walkthrough produces "I followed that," not "I learned that."

## House style — default for this user's technical / PR decks

For a **technical** deck (a PR, subsystem, architecture, or engineering decision), do NOT start from the generic `template.html`. Default to the user's **"Twilight"** house template + recipe below. (For non-technical / pitch / general-audience decks, Twilight does NOT apply — keep the per-deck style, e.g. the Spanish pitch decks.) The **fluid** rule at the bottom applies to ALL browser-viewed decks regardless of theme.

**Base template:** `%USERPROFILE%/Documents/Code/presentations/styles/twilight-tailwind.html` — the fluid-native, Tailwind-Play-CDN port; DEFAULT for new technical decks. Copy it and fill in slides. (The vanilla `twilight-template.html` + `twilight.css` is the offline-safe fallback — Tailwind Play CDN needs network.)
- **Authoring conveniences (use them):** page numbers + docmark are AUTOMATIC (CSS counters) — don't hand-number slides or add `.pagenum`/`.docmark` elements; just order the slides and set `--docmark` once. Fluid type via Tailwind `fontSize` tokens — use `text-headline`/`text-kicker`/… utilities, no hand-written `clamp()`. An in-file `=== TWILIGHT COMPONENT CHEAT-SHEET ===` comment gives minimal markup per component. Run `node presentations/styles/check-deck.js <deck.html>` to catch overflowing slides (exit 1 if any; `?debug` red-outlines them in-browser). Tailwind utilities are available for ad-hoc layout. When a slide risks overflow, **don't hand-tune coordinates or scale — pick a different archetype/component from the library and let `check-deck.js` verify fit**; render 2–3 variants (font size, column split) and keep the one that passes rather than nudging geometry by eye.
- **Palette (dark "Twilight"):** `--bg-page:#0a0a0f`, `--accent:#FF4018` / `--accent-deep:#FF5D3B`, ink `#ffffff`, body `#cbd5e1`; semantic `--ok:#4ade80` (shipped/green), `--indigo:#a5b4fc` (deterministic), `--warn`/`--red`. White-on-dark, orange accent. Font: **Manrope** (Google-Fonts link in the template — keep it; it's the only external resource).
- **Components:** banded-hero `.arch` (`.arch-band`/`.arch-band.shipped`/`.arch-hero`/`.arch-gate`/`.arch-parity`/`.arch-down`), maturity-colored `.pipe` (`.pnode.accent/.deterministic/.shipped`), `.cards`, `.panels` (`.panel.bad/.good`/`.pverdict`), `.two-col`/`.colcard`, `.sigs`, `.codepanel`, `.bbox-flow`, `.gauge-wrap`, `.reftable` + `.badge.ok/now/next/pending`, `.lands`, `.note-line`, `.kicker/.headline/.subhead`, `.docmark/.pagenum`.

**Single-PR / subsystem deck recipe (~11–12 slides):**
1. **Title** (`.title-slide` orbs/bar/chips) — top-corner `repo · PR #NNNN`; status chips (branch · "ships dark"/"behind flag" · commits/tests/review).
2. **"The whole system" — ALWAYS slide 2:** a banded-hero `.arch` showing where this work sits, THIS PR's scope as the `.arch-hero` (accent), downstream/shipped bands neutral/green. *Map before the trail.*
3–4. The problem / why it exists (often before→after `.panels`), then the concept.
5–9. Mechanism / contract (`.sigs`/`.bbox-flow`/`.codepanel`), then deep-dives & invariants clustered.
10. Validation (tests / eval / review status) where applicable.
11. **Always end on a dedicated closing slide that LANDS** — the impact / the payoff / the bigger story / an open question that energizes the audience and makes them curious. NEVER end on operative details (next-steps checklists, merge plans, ops, config), a detail/reference slide, or implementation minutiae. End on why-it-matters + a hook, not a to-do list.

**Voice:** affirmative constraint headlines — state the invariant as fact ("Status is truth — read `grounding_status`", "Flag, don't gate"), NOT negations or hedging. Dense, authoritative; inline code / type names / spec refs — but keep it authoritative and **warm it ~half a notch**: human and readable, not clipped or stiff. Color-code by maturity (shipped=green, this-work=orange, deterministic=indigo). Channel that warmth onto the **one element that matters** — color/emphasize the core mechanism or key term on a slide; don't wash the whole slide in accent. Warming the whole interface lifts mood but distracts from learning (Zhao & Mayer 2025). And only lead with a **myth-vs-fact / wrong-idea panel when you're confident the audience holds the misconception** — for mixed/unknown audiences state the correct mechanism affirmatively and skip the myth; naming a false idea to someone who never held it makes it feel familiar and thus more credible (2026 Ed Psych Review). Both reinforce the affirmative house voice.
**Altitude:** keep every slide at concept/operational altitude — no slide (the closer least of all) should be a dump of implementation minutiae (env-var tables, config field names, internal function/file names). State the takeaway; cite specifics only when they teach.

**Fluid (browser-viewed) — the base is already fluid-native, so don't break it:** the Tailwind base ships fluid text (`fontSize` tokens), wrapping component rows, and full-bleed slides — you no longer hand-apply a fluid pass. Just don't break it: NO `zoom` / `transform:scale`. The `@media print` 16:9 restore (`.slide{ width:13.333in; height:7.5in; min-height:0; overflow:hidden; page-break-after:always } @page{ size:13.333in 7.5in }`) is already in the base. CDNs are fine (Tailwind, fonts, icon/CSS libs) — they render in-browser through AVG; the only tradeoff is offline viewing (and a PDF render needs the resource reachable). Self-contained native CSS is optional, not required. (See memories `feedback_deck_fluid_not_pdf` + `feedback_deck_house_style`.)

**Canonical example built this way:** `presentations/check-grounding-1106-deck.html`.

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

A **curiosity-gap opener** (a "how much you already know" gauge, an open
question, the slide-2 system map framed as "here's what you don't yet see") only
converts to retained understanding if the **very next beat answers why this
matters to the reader**. Pair every gap with a stakes/utility hook; never leave
the gap dangling (2026 J. Cognition).

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

**Decoration is audience-conditioned, not banned.** For a captive/obligated
audience (a mandatory review deck) strip decorative motion ruthlessly —
removing seductive detail is the single highest-yield quality edit (2025
re-analysis of Mayer's own corpus). For a self-selected curious reader a little
delightful motion is low-risk and may raise interest. Tune density to who's
watching.

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

Save the `.html` to **`%USERPROFILE%/Documents/Code/presentations/`** (the
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

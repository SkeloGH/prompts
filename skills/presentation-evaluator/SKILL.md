---
name: presentation-evaluator
description: >-
  Evaluate a presentation artifact — an HTML / PDF / Markdown deck, a narr8
  narrated MP4, or a narr8 deck YAML — against current explanation-design
  evidence, and emit an actionable scorecard plus a SHIP / POLISH / REGEN
  verdict. Use when the user says "/presentation-evaluator", asks to
  review / grade / critique / QC a deck or explainer video, or wants a quality
  gate before shipping one. Pairs with /html-presentation, /pdf-presentation,
  /md-presentation (build) and /narr8-render (render). Grades by per-item binary
  checks plus a downstream-answerability comprehension probe — never a bare
  holistic 1–10.
---

# presentation-evaluator — grade the artifact, name the fix

The **quality gate** the production skills don't have. `/html-presentation` says
the visual check "is on you"; `/pdf-presentation` only checks page count; narr8
has `T0`/`T1` QC but no *didactic* judgment. This skill grades any artifact the
other five produce against the verified frontier of explanation-design research,
then emits a scorecard and a verdict with the highest-yield fixes.

It deliberately does **not** ask a model for a single holistic score. The
literature is blunt here: a bare 1–10 barely tracks humans, while a **per-item
binary checklist roughly doubles human alignment** (PresentBench 2026), and
**coherence is best measured by downstream answerability**, not a Likert rating
(PPTEval 2025; ELOQUENT 2025). So it runs mechanical checks in code, per-claim
binary checks in focused model calls, and a comprehension probe — then rolls
them into anchored 0–3 dimension scores.

It slots in **after** a deck is built (`/html-/pdf-/md-presentation`) and
**after** `/narr8-render`, and for narr8 it maps to a batch disposition
(`ready | regen | flagged`) so it can plug into `pipeline/batch`.

## When to use

- A deck or explainer video is built and you want a real go/no-go before sharing.
- A narr8 render needs didactic QC beyond T0/T1 (does it actually *teach*?).
- You're triaging a batch of generated decks and need a consistent, grounded gate.

If the user just wants to *build* a deck, that's the production skill's job, not
this one. This skill judges; it does not author.

## Inputs — detect the artifact, read it

Take **one** artifact and resolve its type:

| Artifact | How to read it |
|---|---|
| **HTML deck** | parse `<section class="slide">` blocks; run `check-deck.js` for overflow |
| **PDF deck** | judge from the source `.html` if present; else page-count parity via `render-pdf.js` |
| **Markdown deck** | split on `---` horizontal rules into slides |
| **narr8 deck YAML** | `python -c "from pipeline import schema; schema.load('<deck>')"`, then read `meta`/`slides`/`segments` |
| **narr8 MP4** | use the `.srt` + the deck YAML as the transcript-of-record; sample keyframes (reuse narr8 `T1`'s Ollama `qwen2.5vl:7b` where available) |

You also need the **source of truth** the artifact was built from (the PR / code /
article / URL; for a Mode-2 narr8 deck, the original page) to fact-check against.
If no source is recoverable, mark Content-Fidelity items **unverifiable** and cap
that dimension at 2 — don't bluff a 3.

## The rubric — ten anchored dimensions (0–3)

Skip N/A dimensions (e.g. Narration for a static deck) and say they were skipped.
**Hard gate: Content Fidelity < 2 caps the overall verdict at REGEN**, no matter
how good everything else is. Any single **0** forces at least **POLISH**.

**1 · Content Fidelity** *(hard fact-check)* — one binary yes/no per number and
factual claim, against the source. Verify each number's **frame, not just its
value**: a true number shown at a wider scope than it covers (a last-mile count
framed as the whole journey) is a fidelity failure, not a rounding nit.
`3` every claim verified, zero unsupported numbers, every frame honest · `2` all
supported but 1–2 unverifiable-without-source (flagged, not wrong) · `1` a claim
drifts from the source, a number is fabricated, **or a true number sits in a false
frame** · `0` multiple fabricated/contradicted claims.
*(Layout & factual fidelity are the bottleneck, not coverage — PresentBench 2026.)*

**2 · Coherence by Answerability** — does it actually teach. Auto-generate ~4–6
retrieval questions + 1 predictive-transfer probe from the transcript; have a
separate **"student" model answer using ONLY the artifact content**.
`3` all retrieval Qs + the transfer probe answerable from content · `2` all
retrieval Qs answerable, transfer probe fails · `1` some retrieval Qs
unanswerable (looks polished, doesn't teach) · `0` most unanswerable. Split any
miss into **clarity** ("audience couldn't follow") vs **faithfulness** ("content
was wrong", already caught by Fidelity) so it's actionable.
*(Score coherence by answerability, not Likert — PPTEval / ELOQUENT 2025.)*

**3 · Concept-Dependency & One-Insight Structure** — each beat introduces exactly
one insight using only ideas already taught; beats ordered by narrative intent
(contrast / cause / escalation / reframe); terms glossed at first use.
`3` strict dependency order, one insight per slide/`speak`-line, narrative-intent
ordering, terms glossed · `2` mostly, 1–2 slides carry two insights · `1` several
multi-insight slides or a forward reference · `0` no discernible order.
*(One insight per beat — CHI'24; plus the skills' own concept-dependency spine.)*

**4 · Friction & Curiosity Conversion** — at least one productive-struggle /
pose-and-resolve beat at a *why*-juncture (not a fluent walkthrough end-to-end);
and any curiosity / knowledge-gap opener is immediately followed by a
stakes/utility hook.
`3` one well-placed pose→resolve beat **and** every curiosity gap paired with
utility · `2` one but not the other · `1` fully fluent with no retrieval friction,
**or** a dangling curiosity gap with no stakes · `0` neither — a frictionless
info-dump that invites metacognitive offloading.
*(Productive struggle / curiosity-needs-stakes / friction-vs-offloading — 2024–26.)*

**5 · Coherence over Decoration** *(audience-tuned)* — seductive-detail /
decorative-garnish density relative to the stated audience; affect channeled onto
the one key element vs washed across the slide; refutation used only when the
audience holds the misconception.
`3` no decorative asides; warmth/accent aimed at the key element; decoration
matches audience (stripped for captive, light for curious) · `2` minor garnish,
low-risk for the audience · `1` distracting decorative motion/garnish, **or** a
whole-interface warm wash, **or** a myth-first slide for a mixed/unknown audience
· `0` pervasive seductive detail. When scoring < 3, **call out seductive-detail
removal first** — it's the single highest-yield edit (2025 corpus re-analysis).

**6 · Visual / Layout Fidelity** *(mechanical — compute in code)* — overflow
(`check-deck.js` / page-count parity / portrait-frame bbox), WCAG contrast,
margins, and for group-comparison data-viz whether **spread is shown** rather than
one bar per group.
`3` zero overflow, contrast passes, no single-bar group comparisons · `2` passes
mechanical checks but a data-viz shows disparity without dispersion · `1` one
overflowing slide or a contrast failure · `0` multiple overflow/contrast failures.
Reserve the MLLM judge for *subjective* visual quality only.
*(Renderer owns geometry; show dispersion before disparity — IEEE VIS 2024.)*

**7 · Narration & Caption Quality** *(narr8 / narrated artifacts only)* —
spoken-register rewrite (not read-aloud bullets); neutral consistent voice with
emotion carried in writing/visuals; captions mirror the script verbatim, terse and
proficiency-appropriate; emphasis/count-ups land on the spoken word; pacing reads
lively (~90+ WPM, ≤ ~1.5×).
`3` distinct spoken-register narration, captions == script verbatim and terse,
emphasis synced to the spoken word, lively pacing · `2` solid but captions
paraphrase the script or one emphasis cue is mistimed · `1` read-aloud bullets,
**or** captions re-translate/drift, **or** slow-equals-better / rushed past 1.5× ·
`0` caption/script mismatch throughout. **N/A** for static HTML/PDF/MD decks.

**8 · Experience Arc** — across the whole run (especially multi-shot narrated
video): does engagement hold, does utility accumulate, does it land on a
why-it-matters closer (not operative minutiae); any embodied/interactive moment
earns its place only by **relevance to the target content**.
`3` engagement holds, utility accumulates, lands on a why-it-matters closer · `2`
locally fine but globally flat in one stretch · `1` ends on operative details / a
reference dump, **or** sags badly mid-run · `0` no arc, no closure.
*(Score the whole experience arc — XEQ scale 2024; relevance×integration, Nature
Human Behaviour 2025.)*

**9 · Standalone Legibility & Framing** — does each element deliver its message on
a *skim* and survive out of context; are numbers and codes self-explaining; does
every frame match its actual scope. Per-item binary (like dim 1), not a vibe read.
Items: every **headline states its takeaway in plain words** — a stranger gets it
on a skim, future-you in two years (not a teaser or abstraction); **one message per
element** (no subtitle/note doing three jobs); the **note/caption slot pays a
dividend** — a *why*, a stake, a surprising fact, never a restatement of the slide's
mechanics; **no naked codes or cross-refs** (§-refs, error codes, internal IDs)
without a plain-language name; **every number carries its legend** (what it measures
+ why it matters) and **never `X / Y` when it means `X and Y`** (the fraction
misread); the **headline metric's frame matches its scope**.
`3` headlines self-deliver, one message each, notes pay off, no naked codes, every
number legend'd, frames honest · `2` mostly — 1–2 slips (a teaser headline **or** an
unglossed code **or** a number with no "why") · `1` several abstract headlines /
mechanics-only notes / an `X/Y` misread **or** a true-number-in-a-false-frame · `0`
pervasive — can't be skimmed or trusted to mean what it says.
*(Skim-legibility & honest framing — surfaced by human-reviewer dogfooding, 2026;
extends answerability (#24) from the captive reader to the skimmer and the
two-years-later reader, pairs with one-insight-per-beat (#11). A per-number
fact-check passes a true number in a false frame; this dimension catches it.)*

**10 · Cross-Channel Complementarity & Engagement** *(narr8 / narrated artifacts
only)* — when a voice track plays over on-screen text, the voice must **add to** the
screen, not read it. Per-beat binary (like dim 1): each `speak` line carries at least
one idea **not printed on that slide** (a *why* / stake / consequence / human aside)
and does **not** restate its kicker / headline / subhead / note / labels. Plus: the
**opening beat states the stakes or tension** (not a title or greeting), and a
**consistent second-person persona** holds across the run (no lapse into impersonal
exposition for more than ~2 beats).
`3` every beat complements the screen, stakes-first hook, persona consistent · `2`
mostly — 1–2 beats restate on-screen text, or the hook/persona is soft · `1` several
beats read the slide (voice duplicates the printed headline/note), **or** no real
hook, **or** persona absent through the middle · `0` the voice reads the slides
throughout. **N/A** for static HTML/PDF/MD decks (no second channel). Scored on the
YAML+script at **Gate A** — it needs no pixels.
*(Redundancy principle — verbatim narration of on-screen text feels engaging yet
lowers learning: Schmidt 2025 / Mayer PMC4088922; personalization & persona — Couch &
Mayer 2025 meta-analysis g≈0.37; stakes-first hook & retention — 2025 watch-through
analytics. Second reviewer-dogfood-sourced dimension, from the Wrapped-deck
engagement pass, 2026; extends dim 7's "not read-aloud bullets" from register to
content.)*

## Procedure

1. **Detect the artifact type and read it** (table above). Build the
   transcript-of-record: slide text for decks; `.srt` + deck YAML for a narr8 MP4.
2. **Establish the source of truth** for the fact-check. If none is recoverable,
   mark Content-Fidelity items unverifiable (cap 2), don't bluff a 3.
3. **Run mechanical checks in code first** (deterministic, cheap): overflow
   (`check-deck.js` for Twilight HTML, page-count parity for PDF, portrait-frame
   bbox for narr8), WCAG contrast, `caption == speak.text` diff for narr8
   (`.srt` vs `speak.text`), pacing WPM from `.srt` timings. These feed
   dimensions 6 and 7 **without a model call**.
4. **Build the per-item binary checklist grounded in the source** — one yes/no
   item per factual claim/number (dim 1), bucketed items for Structure (3),
   Friction (4), Decoration (5), Legibility & Framing (9), Complementarity (10). Grade each item in its
   **own focused model call** — never a single holistic score.
5. **Run the answerability probe** (dim 2): auto-generate retrieval questions + a
   transfer probe; a separate "student" pass answers from **artifact content
   only**; score by how many transfer; split failures into clarity vs faithfulness.
6. **For narrated / multi-shot artifacts**, run the Experience-Arc pass (dim 8)
   over the whole run; confirm any interactive/embodied moment is content-relevant.
7. **Roll item results into the ten anchored 0–3 scores.** Apply the hard gate
   (Fidelity < 2 → REGEN). Mark N/A dimensions skipped.
8. **Run the Register & Cadence advisory** (see below) — **default-on for any
   static deck** (where Dim 7 is N/A), and also whenever the artifact is prose-heavy
   or requested. Unscored: it never folds into the 0–3 scores or the verdict.
9. **Emit the scorecard + verdict** and, for narr8, map to a batch disposition
   (`ready | regen | flagged`) so it plugs into `pipeline/batch`.

## Two-gate order for expensive renders (narr8 video)

A narr8 render costs minutes; most of the rubric never needs pixels. So for any
artifact that will be rendered (a narr8 deck YAML → MP4), split the evaluation by
render cost and **gate before you spend the render** — shift the cheap checks left:

- **Gate A — spec-check (pre-render, on the deck YAML + narration script).** Run the
  render-independent dims now: **Dim 1 Fidelity** (owns the REGEN gate — a wrong
  number kills the render *before* it runs), **Dim 2 Answerability, Dim 3 Structure,
  Dim 4 Friction, Dim 9 Legibility & Framing** (text-level: naked codes, number
  legends, true-number-false-frame), **Dim 10 Complementarity** (does the voice add to
  the screen or just read it — pair each narration beat against the slide's text), the
  **`caption == speak.text` diff**, and the **Register & Cadence advisory**. Fix everything fixable here. WPM is an *estimate*
  at this stage (words ÷ target duration). Verdict gates the render: Fidelity < 2 →
  REGEN the script, don't render.
- **Gate B — render-check (post-render, on the MP4).** Run only what needs
  pixels/audio/timing: **Dim 6 mechanical** (overflow / mis-scroll / letterbox /
  WCAG on real frames — extract one keyframe per slide), **Dim 5 rendered
  decoration, Dim 7 exact pacing & caption-sync, Dim 8 end-to-end arc**, the **T1
  keyframe-legibility judge**, and a **captions-off burn check** (no stray karaoke).

Gate A is seconds and catches wrong numbers, dead framing, and a weak script before a
multi-minute render; Gate B confirms the pixels Gate A can't see — does a dense slide
actually fit, did captions-off hold, no letterbox. For a cheap render (HTML→PDF) the
split is optional; run it inline. For narr8 video it is the default order.

## Output format

A compact **scorecard** — one row per applicable dimension:

| Dimension | Score | Failed items | Principle it tests |
|---|---|---|---|

Below it:
- **Answerability result** — questions asked, how many the student model answered
  from content alone, transfer-probe pass/fail, and the clarity-vs-faithfulness
  split for any miss.
- **VERDICT** — one of **SHIP / POLISH / REGEN**, with the gate rule shown
  (Fidelity < 2 forces REGEN; any single 0 forces at least POLISH).
- **Highest-yield fixes** (max 3, ordered by leverage) — each names the dimension
  and the concrete edit. Seductive-detail removal is called out first when present.
- For a narr8 artifact: the mapped **batch disposition** (`ready | regen | flagged`).
- *(default-on for static decks; also when prose-heavy or requested)* a separate **Register & Cadence** advisory (see below) — unscored, kept out of the verdict.

Never return prose praise without the scorecard, and **never a bare single number**.

## Register & Cadence (advisory — unscored, default-on for static decks)

The ten dimensions grade whether a deck is *true, teaches, and is well-built* —
not whether the *prose* is good. For a **static** deck (where Dim 7 is N/A) that
leaves voice, register, and cadence ungraded — so for any static deck this pass
runs **by default** (also whenever the artifact is prose-heavy or the user asks).
It is a **separate copy pass** — the same delegated shape as
`/every-style-editor`, but grounded in **this user's** house-style canon, *not*
Every's guide (which would fight the deck's own voice):

- confident, no hedging; light humor OK (`feedback_copy_tone_confident_humor`)
- the Twilight technical-deck voice (`feedback_deck_house_style`)
- no chat-artifacts / clichés in deliverables (`feedback_no_chat_artifacts_in_deliverables`)
- gloss non-obvious / proprietary terms at first use (`feedback_deck_gloss_terms`)
- one consistent register (or a *deliberate* contrast); any voice device (2nd-person,
  etc.) held, not abandoned mid-deck; headlines pass a read-aloud / single-parse test;
  cadence varied, not a monotone wall or a runaway sentence.

Report it **separately, and name what to KEEP as well as what to cut.** It **never**
folds into the 0–3 average or the SHIP / POLISH / REGEN verdict — advisory only, so
the grounded objectivity of the score stays uncontaminated. Reserve a real
`/every-style-editor` invocation for a deck actually destined for Every.

## Notes

- This skill **invokes** existing tooling (`check-deck.js`, `schema.load`, narr8
  `T1`'s Ollama keyframe judge) — it adds no code. It is a judgment layer, not a
  pipeline change.
- The grounding for every rubric dimension is web-sourced 2024–2026 research, not
  generic advice — see the parenthetical citations per dimension. The full library —
  25 comprehension principles plus a 7-item engagement addendum — with every source
  URL is in `references/explanation-design-principles.md` next to this file. **The
  exceptions are Dimensions 9 and 10**, surfaced by human-reviewer dogfooding (2026):
  Dim 9 catches skim-illegible headlines, mechanics-only notes, unlabeled numbers, and
  the *true-number-false-frame*; Dim 10 catches a voice track that *reads the slide*
  instead of complementing it (the redundancy principle) — failure modes the
  per-number fact-check (dim 1) and the captive-reader probe (dim 2) structurally miss.
- When a dimension is N/A (a static deck has no narration), say so explicitly and
  average over the applicable dimensions only — don't penalize for an absent
  channel.

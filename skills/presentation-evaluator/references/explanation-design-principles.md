# Explanation-design principle library

The grounded, web-sourced (2024–2026) evidence base behind the
`presentation-evaluator` rubric and the upgrades to `/html-presentation`,
`/pdf-presentation`, `/md-presentation`, `/narr8-deck`, and `/narr8-render`.

Collected by a 16-agent research swarm (7 web-research dimensions → adversarial
verify → synthesis): **47 findings kept / 8 cut**. Every principle below is
backed by a real source published or revised in **2024–2026** that survived a
fetch-and-confirm verification pass — deliberately *excluding* canon (Mayer-2009,
Tufte, Duarte, Presentation Zen, classic explorable-explanations). Where a source
contests or bounds canon, that's noted.

`media` tags: which artifact channels the principle governs — `slides`,
`narration`, `motion`, `data-viz`, `evaluation`.

---

## Cognition — what to teach, in what order

### 1. Coherence over decoration (and it's eroding) · `slides narration motion data-viz`
Strip seductive/decorative asides, redundant on-screen text, and impressive-but-
irrelevant mechanism detail; spend design effort on coherence, text+diagram
pairing, and self-explanation prompts. Treat classic multimedia wins as real but
modest (g≈0.37) and **shrinking** as baseline materials improve — don't chase
diminishing-return tweaks. Removing seductive detail is the single highest-yield
move; decorative neuro/tech garnish now mostly fools only novices.
- https://www.sciencedirect.com/science/article/pii/S1747938X25000673
- https://par.nsf.gov/servlets/purl/10637927
- https://pmc.ncbi.nlm.nih.gov/articles/PMC11972428/

### 2. Decoration is audience-conditioned, not banned · `slides motion`
Seductive details impaired performance only when **extrinsic motivation was
high** (captive/obligated audiences); harmless or slightly helpful when low
(self-selected, curious). Replaces the blanket "no decoration" rule.
- https://www.sciencedirect.com/science/article/pii/S0959475224001816

### 3. Affect as a spotlight, not a wash · `slides motion`
Warming the *whole* interface lifts mood yet hurts learning by distracting;
depicting the **key content element** with positive features (warm color, rounded
shapes, friendly face-cues) channels emotion onto what matters and improves
retention + transfer (Zhao & Mayer 2025, two experiments).
- https://onlinelibrary.wiley.com/doi/10.1111/jcal.70028

### 4. Match scaffolding to expertise (expertise reversal) · `slides narration evaluation`
"More guidance = better" is not universal. Heavy signaling, worked examples, and
redundant cues that aid beginners **measurably depress** learning for high-prior-
knowledge viewers. Offer a fast/expert path; segment when expertise is mixed.
2025 meta-analysis, 176 effects, N=5924.
- https://www.sciencedirect.com/science/article/pii/S0959475225000660

### 5. Don't gamify expository content · `slides narration`
For conceptual/expository material, state the principle plainly — do **not** turn
it into a fill-in-the-blank/sentence-reconstruction puzzle expecting better
memory; clean reading often wins. A generation benefit appears only under
intentional learning + unrestricted time + immediate testing (a narrow combo).
Seven-experiment conceptual replication, 2025.
- https://pmc.ncbi.nlm.nih.gov/articles/PMC12185794/

### 6. Productive struggle before the reveal · `slides narration motion`
Open a segment with a short genuine problem (or "pause and predict / why doesn't
the obvious approach work?") **before** teaching the canonical solution, then
consolidate the confusion. Place **one** self-explanation prompt at a conceptual
"why" juncture, with viewer pacing control — not many. Productive failure (2024,
HRV-measured) showed better delayed retention + lower later load; self-explanation
meta-analysis g=0.46 overall but transfer only 0.33.
- https://arxiv.org/html/2411.11227v1
- https://link.springer.com/article/10.1007/s10648-025-10001-x

### 7. Engineer friction against fluent offloading · `slides narration evaluation`
Never let a slick, perfectly-fluent walkthrough substitute for the viewer's own
recall: pose a question on one slide, resolve it on the next; insert "try it
before I show you" points. Treat polished AI-narrated fluency as itself a risk —
viewers confuse "I followed that" with "I learned that." Fan et al. 2025 (BJET,
N=117): ChatGPT group wrote the best essays, gained the least — "metacognitive
laziness."
- https://arxiv.org/abs/2412.09315

### 8. Puncture overconfidence once, early · `slides narration`
Spend one opening beat on "try to explain how X works" (or "could you explain this
to a friend right now?") to deflate the illusion of explanatory depth before
explaining — you don't need it for every concept. The humbling **transfers** to
related unexplained items and persists ~a week; the illusion is trait-driven (low
working-memory headroom / low cognitive reflection), so those who most need the
explanation are least aware of their gap.
- https://preserve.lehigh.edu/_flysystem/fedora/2025-07/Wilson_lehigh_0105N_12971.pdf
- https://pmc.ncbi.nlm.nih.gov/articles/PMC12053339/

### 9. Curiosity gap must be followed by stakes · `slides narration`
A "how much you already know vs. don't" gauge is an evidence-backed attention
spike **only** if the very next beat answers "why this matters to you." Without a
utility/relevance hook the aroused curiosity does not convert to retained
understanding. 2026 J. Cognition (Frede et al.).
- https://journalofcognition.org/articles/10.5334/joc.501

### 10. Refutation is conditional, not default · `slides narration`
Only lead with "myth vs. fact" / state-the-wrong-idea when you're confident the
audience **holds** the misconception. For mixed/unknown audiences, state the
correct mechanism affirmatively and skip the myth — naming a false idea to someone
who never held it makes it feel familiar and thus more credible. 2026 Ed Psych
Review (Dersch, Thacker & Eitel).
- https://link.springer.com/article/10.1007/s10648-026-10116-9

### 11. One insight per beat · `slides narration data-viz`
Engineer each slide/narration sentence around exactly **one** insight; when a
section needs several, split into separate single-insight beats. Order beats by
narrative intent (contrast, cause, escalation, reframe), not by what the data
trivially supports. Storytelling aids single-insight retrieval but **not** multi-
insight synthesis (CHI'24, n=103); the lever is the narrative transition type
(Remex 2025).
- https://arxiv.org/abs/2402.12634
- https://arxiv.org/abs/2501.03603

---

## Data visualization

### 12. Show dispersion before stating disparity · `data-viz slides narration`
On any group comparison (regions, demographics, cohorts) do not default to one
bar/dot per group. Surface the spread — jitter, prediction intervals, overlap
annotation — and voice the overlap explicitly before stating the gap. Compressing
a group to a single bar fuels deficit-thinking attribution; within-group
variability + contextual framing reduces it. Holder & Padilla, IEEE VIS 2024.
- https://ieeexplore.ieee.org/document/10771107/

### 20. Reveal annotations progressively, by reading path · `data-viz motion`
Don't dump all callouts at once. Reveal annotations progressively as the narration
reaches each point, placing them by local data density and reading order rather
than fixed template slots; in narrated video each annotation appears, holds, and
recedes in step with its voiceover beat. 2026 two-phase practitioner/educator study.
- https://arxiv.org/abs/2604.07691

---

## Motion & interaction

### 13. Motion buys experience, not comprehension · `motion slides evaluation`
Justify scrollytelling and choreographed reveals on the metrics they move — lower
abandonment, lower felt load, higher perceived clarity — **not** recall or trust.
If the goal is test-passable comprehension, bolt on retrieval separately. If you
add interactivity, scaffold it as a mini-experiment (predict → change one variable
→ observe the surprise → reconcile), never a fiddle-the-slider toy. Engagement
alone does not predict learning; the active reasoning loop does. CHI'26 (N=454);
605-participant simulation study.
- https://arxiv.org/abs/2603.04367
- https://arxiv.org/abs/2507.21090

### 14. Animate with eased motion; speed is for appeal · `motion narration`
Pick reveal/playback speed for appeal and pacing (~90 WPM reads lively; up to
~1.5× fine), not under the belief that slower = better comprehension. The real
retention lever is **motion quality** — custom Bezier easing over default linear.
Playback speed had no comprehension effect even at 2×, yet perceived clarity
collapses at 2× (asymmetric trade). 2024 kinetic-typography; 2026 study (N=328).
- https://www.rit.edu/croatia/sites/rit.edu.croatia/files/docs/Temporal%20typography%20-%20The%20impact%20of%20animation%20speed%20and%20interpolation%20on%20information%20transmission%20efficiency,%20Dolic%20et%20al.,%202024.pdf
- https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2026.1790320/full

---

## Narration, voice & captions

### 15. Pick a neutral synthetic voice and keep one register · `narration`
For a fully-synthesized explainer, do **not** chase a "human-sounding," cute, or
characterful voice — a consistent neutral synthetic register lowers extraneous
load and is the documented sweet spot. The danger zone is half-human (synthetic VO
on real footage); keep voice and visuals in one register. Because synthetic voices
feel flat, carry emotional beats in the **writing and visuals**. A "cute" TTS voice
produced the worst learning; the natural-voice recall advantage vanished after a
week.
- https://link.springer.com/article/10.1007/s10639-025-13654-x
- https://www.tandfonline.com/doi/full/10.1080/00220973.2024.2446169
- https://www.tandfonline.com/doi/full/10.1080/23311908.2025.2576785

### 16. Engineer social presence and accuracy back into AI video · `narration motion evaluation`
A fully AI-generated explainer can **match** human-shot video on factual/transfer
learning — so optimize for speed and multilingual personalization — but explicitly
rebuild the measured weak point, **social/emotional presence**, via warm
conversational narration, a consistent persona, and direct second-person address.
Always add a human accuracy-check pass; generative pipelines introduce subtle
content errors that erode trust. Frontiers rapid review, Jan 2026 (15 studies).
- https://www.frontiersin.org/journals/computer-science/articles/10.3389/fcomp.2025.1721093/full

### 17. Caption policy is gated by proficiency, not a single rule · `narration evaluation`
For native, high-proficiency viewers full verbatim captions are redundant load —
signal key terms only. For L2 / mixed / low-proficiency audiences (e.g. non-native
Spanish) keep matching captions ON, and on by default for visually busy or
multi-speaker segments. Auto-generated captions: surface fluency is **not** a
sufficient quality bar — budget a human polish pass, keep them terse, mirror the
narration script (don't re-translate). Fluent-looking GPT-4o subtitles cost 48%
more fixations / 81.5% more reading time than professional ones.
- https://pmc.ncbi.nlm.nih.gov/articles/PMC12024247/
- https://pmc.ncbi.nlm.nih.gov/articles/PMC12286245/

### 18. Narration is a spoken-register rewrite with duration control · `narration motion`
Treat narration as a distinct spoken-register rewrite stage (not read-aloud of the
bullets), with an explicit seconds-per-segment budget so pacing is controlled, and
hold each slide for its audio. Author voiceover and on-screen emphasis as one
coupled unit per beat. PresentAgent 2025; Data Playwright "annotated narration"
(IEEE TVCG 2024).
- https://arxiv.org/abs/2507.04036
- https://arxiv.org/abs/2410.03093

### 19. Sync signaling and reveals to the spoken word · `motion narration data-viz`
Fire visual cues — highlight/underline/zoom, progressive build, stroke draw — on
the **spoken word**, not on slide change. Use word-level TTS timestamps (edge-tts
word-boundary events) with LLM phrase→element matching over edit-distance; reveal
diagrams stroke-by-stroke time-locked to narration. Cross-channel coordination,
not any single channel, is the measured gap. AutoLectures 2025 (>92% F1, <~$1/
video-hour); speech-synchronized whiteboard 2026; CHI'25 46-tool review.
- https://arxiv.org/abs/2505.02966
- https://arxiv.org/abs/2603.25870
- https://arxiv.org/abs/2502.04801

---

## Generation & evaluation

### 21. Renderer owns geometry; model fills slots · `slides motion`
Never have the model emit raw coordinates or numeric layout (LLMs do this poorly).
Keep a small library of hand-tuned slide archetypes; the model picks an archetype
and fills named slots. On overflow risk, render 3–5 variants (font size, image
scale, column split) and let a vision model — or a deterministic bbox/overflow
check — pick the fitting one. PPTAgent 2025; Paper2Video "tree search visual
choice" 2025.
- https://arxiv.org/abs/2501.03936
- https://arxiv.org/abs/2510.05096

### 22. Layout and factual fidelity are the bottleneck, not coverage · `slides evaluation`
For machine-generated decks, allocate disproportionate effort to (1) a strong
layout system and (2) a per-slide factual-grounding pass that checks every number
and claim against the source before render. Stop adding text — content coverage is
the easy dimension; visual layout and numeric fidelity are where generated decks
measurably fail. PresentBench 2026 (238 instances).
- https://arxiv.org/abs/2603.07244

### 23. Grade decks by per-item binary checklist, not a holistic score · `evaluation`
Never ask a judge for a single 1–10. Auto-generate a per-deck list of binary
yes/no items grounded in the source, bucket them into dimensions (Fundamentals,
Visual Design & Layout, Content Completeness, Content Correctness/Fidelity), and
grade each in its own model call. Make Content Fidelity a hard fact-check — one
binary item per factual claim. Run mechanical checks (bbox overlap, margins, WCAG
contrast) in code; reserve the MLLM judge for subjective Text/Image/Color quality.
Per-item binary nearly **doubled** human alignment (Spearman 0.532 vs 0.303).
PresentBench 2026; SlidesBench 2025; PPTEval 2025.
- https://arxiv.org/abs/2603.07244
- https://arxiv.org/html/2501.00912v1
- https://arxiv.org/html/2501.03936v3

### 24. Score coherence by downstream answerability, not Likert · `evaluation`
Use Content/Design/Coherence as the spine, but because a bare Coherence rating
only weakly tracks humans (0.55), back it with a downstream comprehension test:
auto-generate a short quiz from the transcript and have a separate "student" model
answer using **only** the artifact content. High answerability = concepts
transferred. Add a predictive-transfer probe (a novel "what happens if…"). Split
low scores into "audience couldn't follow" (clarity) vs "content was wrong"
(faithfulness). PPTEval 2025; ELOQUENT 2025; Information Power 2024;
counterfactual-simulatability 2026.
- https://arxiv.org/html/2501.03936v3
- https://arxiv.org/pdf/2507.12143
- https://www.frontiersin.org/journals/computer-science/articles/10.3389/fcomp.2024.1412341/full
- https://arxiv.org/pdf/2601.03775

### 25. Score the whole experience arc, not just slides · `evaluation motion`
A narrated explainer is multi-shot, so layer an experience rubric — Learning,
Utility, Fulfilment, Engagement — on top of per-slide scores: does engagement
hold across the run, does utility accumulate, does it reach closure. This catches
a deck that's locally fine but globally flat. Embodied/interactive moments earn
their place only when the movement maps onto the target content (relevance ×
integration), not generic "engagement" wiggle. XEQ scale 2024; Zou et al., Nature
Human Behaviour 2025.
- https://arxiv.org/abs/2407.10662
- https://www.nature.com/articles/s41562-025-02152-2

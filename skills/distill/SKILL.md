---
name: distill
description: >-
  Transform dense, machine-generated, or technical content into clear human-readable
  communication that a busy reader instantly gets. Trigger phrases: "/distill",
  "clarify this", "simplify", "tighten this up", "make this readable", "translate
  into plain language", "make this scannable", or any request to turn raw model
  output, eval results, agent status blurbs, PR descriptions, specs, or reports into
  something a non-specialist can act on. Dual-use: (1) transform mode — rewrites
  given content and audits it against the 12-rule checklist; (2) self-check mode —
  the same checklist applied by any agent to its own human-facing output before
  sending. Pairs with /presentation-evaluator (deck-level grader) but is
  content-agnostic: text, tables, metrics dumps, bus updates, specs, all qualify.
  Also supports decision-queue mode (open questions one at a time) and the CEO
  sentence — a single plain-language fork an executive can answer without reading
  the technical walkthrough.
---

# distill — cut the fog, keep the signal

The missing copy layer between what machines produce and what humans can use. Raw
model output is structurally biased toward verbosity, passive constructions, buried
conclusions, and naked metrics nobody can act on. Agent status updates accumulate
jargon, undefined codes, and fractions that look like ratios. Eval dumps lead with
the methodology and end, if you're lucky, with a verdict. This skill corrects all
of that.

**Dual use — lens and self-check.** `/distill` works as a transform: hand it
content, get back a clarified rewrite plus an audit. It also works as a standing
discipline: every agent should run the same 12-rule checklist against its own
human-facing output — status updates, summaries, reports, PR descriptions — before
it sends. The rules are the same in both modes; only the direction changes (you are
either rewriting someone else's content or catching your own drift before it lands).
When in self-check mode, **revise in place before sending** — don't report the
checklist result; fix what it flags and be done.

**Grounded, not generic.** The 12 rules below are not writing-teacher platitudes.
They are distilled from verified external research: plain-language standards, UX
reading-behavior studies, data-communication research, and AI-output legibility work.
The sourced library backing each rule — frameworks, prescriptions, URLs — is in
`references/clarity-principles.md` next to this file. The rules here carry short
source tags; the library has the full citations.

## When to use

**Transform mode** — any of:
- Dense or opaque content that needs to reach a human: eval/metrics results, agent
  status blurbs, bus updates, technical analyses, PR descriptions, specs, raw model
  output, release notes, Notion docs.
- Content you suspect is fine but can't tell — run the checklist and find out fast.
- Another agent's output you are relaying to a non-technical stakeholder.

**Self-check mode** — before sending any human-facing output you produced: confirm
it passes rules 1–12. Revise. Then send. No separate checklist report needed.

**Decision-queue mode** — when the user has several open decisions (stakeholder
queue, AC gaps, operator inbox): walk **one question at a time**. Each turn =
one distilled question + optional supporting detail on request. Do not dump the
full queue unless asked. After the technical explanation (if any), be ready to
collapse the fork into a **CEO sentence** (see below).

**Do not use** to author content from scratch — that is the producing skill's job
(the spec skill, the PR-description skill, etc.). /distill clarifies existing
content; it does not originate it. Do not run it on **code**: code readability
follows different principles and `/code-review` is the right gate. Do not run it
on content that is already final-form and has cleared a human review — at that point
you are second-guessing a decision that has already been made.

## Inputs

Accept any of:
- **Raw text** pasted inline.
- **A file path** — read it, treat the full text as the content to distill.
- **"The content I just produced"** (self-check mode) — the agent applies the
  checklist to its own last output and revises before sending.

For files: read the whole file unless it is clearly split into sections, in which
case distill the section the user identifies. Do not truncate silently.

## The 12 rules — the checkable spine

These are the core of the skill. Every rule has a one-line prescription, a concrete
check (the thing you actually look for), and a source tag. In the output checklist,
grade each rule **PASS** or **FAIL** with a one-line note on what failed.

**Rule 1 — Answer first (BLUF / Minto / inverted pyramid).**
Open with the conclusion, recommendation, or headline finding. Never bury the lede
in a preamble about methodology, context, or caveats.
*Check:* Is the most important sentence the first sentence? Could you cut the first
paragraph and lose no decision-relevant information? If yes to both, fail.
*(US Army AR 25-50; Minto Pyramid Principle / SCQA; Poynter inverted-pyramid
journalism; plainlanguage.gov)*

**Rule 2 — Pass the "So what?" test on every claim.**
State the implication for the reader's decision, not just the observation. "Accuracy
is 84%" is an observation. "Accuracy is 84% — below the 90% threshold; hold
deployment" is a claim the reader can act on.
*Check:* On each factual claim, ask "so what does this mean for me?" If the answer
is not in the text, the claim fails.
*(Minto Pyramid Principle; Google Technical Writing One; USC/Purdue exec-summary
checklist)*

**Rule 3 — One idea per sentence; one idea per paragraph; topic sentence first.**
Busy readers read openers and skip the rest. A sentence that does two things teaches
neither. A paragraph whose topic sentence is buried on line four is an obstacle.
*Check:* Read the first sentence of each paragraph. Does it carry the paragraph's
main claim on its own? Flag any sentence with more than one main clause doing
separate work.
*(Google Technical Writing One; plainlanguage.gov Plain Writing Act 2010; Indiana
University Writing Tutorial Services)*

**Rule 4 — Short sentences, common words, active voice, present tense.**
Kill jargon, nominalizations (-tion/-ment/-ance), and hedging qualifiers ("somewhat,"
"it could be argued," "in some sense"). Define unavoidable terms on first use.
*Check:* Count sentences over 25 words — flag each. Find the nominalizations and
passive constructions; mark them for rewrite. Find every hedge ("may," "might,"
"potentially," "kind of") and decide: is it calibrated uncertainty (keep) or
defensive fog (cut)?
*(plainlanguage.gov; Google Technical Writing One; Hemingway App grade targets)*

**Rule 5 — Omit needless words.**
Halve the word count; every word does work. Nngroup research found that halving page
copy lifted usability by 58% (further cuts reached 124% in follow-ons). That is not
a style preference — it is a measured productivity effect.
*Check:* Identify filler phrases ("it is important to note that," "in order to,"
"the fact that," "as previously mentioned") and cut each one. After the rewrite, the
word count should be no more than 60% of the original.
*(Strunk & White; Zinsser On Writing Well; Nielsen Norman Group 1997 / follow-ons)*

**Rule 6 — Make it scannable.**
Lead headings with the info-bearing word. Use bullets and tables where a list is
genuinely a list. Add white space between chunks. Readers consume ≤28% of words on
a page and scan in an F-pattern (NN/g 2008; replicated 2023) — structure must carry
the message without requiring the prose.
*Check:* Read only the headings and the first sentence of each bullet. Does the key
message survive? If content is buried in the middle of a paragraph, restructure.
*(Nielsen Norman Group F-pattern and scannability research; plainlanguage.gov)*

**Rule 7 — Target a readability grade and check it.**
Aim grade 8–9 for general professional content; grade 6–8 for broad or public
audiences. Flag hard sentences, passive-voice clusters, and adverb pileups.
*Check:* Paste into the Hemingway Editor or compute Flesch-Kincaid. Flag every
sentence graded "hard" or "very hard." The rewrite must eliminate or simplify each
one.
*(Hemingway App targets; Nielsen Norman Group readability guidance)*

**Rule 8 — Every number carries its context.**
Attach units. State the denominator and sample size. Provide a baseline or
comparison ("versus last week," "against the 90% target"). Name the direction
(better / worse / unchanged). Add a one-line interpretation. Report absolute
alongside relative change. Never write "X / Y" when you mean "X and Y" — the
fraction misread is pervasive and consequential.
*Check:* Isolate every number. Ask: unit present? comparison present? direction
named? interpretation given? absolute + relative both shown? "X/Y" used for a list?
Fail each missing item individually.
*(Stray / Tow Center for Digital Journalism; Sense About Science Making Sense of
Statistics; Knaflic Storytelling with Data)*

**Rule 9 — Every chart or metric gets an explicit takeaway title.**
The title states the insight ("Conversion dropped 12 pp after the Nov 3 deploy"),
not the label ("Conversion rate by date"). Strip decorative elements; maximize
data-ink. A metric block with no prose interpretation is a number dump, not a
finding.
*Check:* Read each chart title or metric header in isolation. Does it state a
finding, or does it describe the data? If it describes, rewrite it as a finding.
*(Knaflic Storytelling with Data; Tufte The Visual Display of Quantitative
Information — data-ink ratio, chartjunk)*

**Rule 10 — Communicate confidence honestly and calibratedly.**
Match language to actual reliability. Prefer categorical (High / Medium / Low) over
false-precision percentages when the underlying estimate doesn't support decimals.
Declare uncertainty explicitly ("we don't know X yet") rather than softening it with
hedges that obscure the gap. Overconfident framing erodes trust when it's wrong;
underconfident framing wastes the reader's time.
*Check:* Find every confidence or probability claim. Is the precision justified? Is
uncertainty named or buried in a hedge? Is categorical language available and
cleaner?
*(Microsoft HAX Guidelines G2 — calibrated trust; Google PAIR Guidebook —
calibrated confidence, categorical > numeric; OpenAI Prover-Verifier Games
arXiv:2407.13692 — legibility must be explicitly trained for)*

**Rule 11 — Ground claims and stay faithful to the source.**
Cite or attribute. Never invent a number, paraphrase a finding into a claim stronger
than the source supports, or omit a qualifier the source included. Faithfulness is
the top summarization quality dimension — above fluency and relevance.
*Check:* For each factual claim, can you point to a source line? Does the rewrite
preserve the strength (or weakness) of the original claim? Did any paraphrase
accidentally strengthen or weaken it?
*(Anthropic guidance — be direct, ground claims, specify format; SummEval TACL 2021;
G-Eval arXiv:2303.16634 — faithfulness as primary summarization dimension)*

**Rule 12 — Progressive disclosure of detail.**
Headline by default. Reasoning, supporting data, full traces, and raw outputs should
be available on request or clearly marked as appendix-level material. Explain *why*,
not just *what* — the why is what makes findings durable and transferable.
*Check:* Is the executive-level finding on top? Is supporting detail collapsible,
sectioned, or clearly subordinated? Is there at least one "why" that gives the
finding meaning beyond the immediate data point?
*(Nielsen Norman Group progressive disclosure; Microsoft HAX G11 — scope + detail on
demand; Google PAIR Guidebook)*

## CEO sentence — the executive fork in one line

When the audience is a decision-maker (CEO, operator, product owner) who will not
read the technical walkthrough, produce **one sentence** that names the choice —
not the implementation.

**Prescription:** One sentence. Two plain-language outcomes. No ticket codes, no
field names, no "Option A/B" headers. Frame what each side *means for the user or
the business*, including the main downside of the default if there is one.

**Check:** Could an executive answer yes/no or pick a side from this sentence alone,
without reading anything below it? If the sentence mentions scalars, Realm, write-
through, or internal IDs, rewrite.

**When to emit:**
- User asks explicitly ("single sentence for the CEO," "how would you put it for
  the founder," "one line for the ops lead").
- Decision-queue mode, after the technical pass — offer or emit on request.
- Self-check before escalating a fork to a non-technical stakeholder.

**Example (CR-TC weekly timesheet, 2026-06):**

> Should the weekly timesheet show employees the hours they entered on their phone,
> or the official payroll totals that may stay blank until the foreman submits and
> the back office syncs?

That sentence replaces paragraphs about `stHrs`, ClockSession, and write-through.
The technical detail stays available for the builder who asks "what does prod do
today?" — progressive disclosure (Rule 12), not deletion (Rule 11).

## House-style overlay

After the 12-rule pass, apply this user's standing preferences. These are not
optional style suggestions — they are standing canon, referenced here by memory
slug:

- **Confident, no hedging or apologetic phrasing; light humor is fine.** Cut "I
  think," "it seems," "hopefully," "sorry for the confusion," and similar. State
  things. (`feedback_copy_tone_confident_humor`)
- **No chat-artifacts or reply-artifacts in deliverables.** Remove phrasing that
  only makes sense in the context of a conversation: "as I mentioned," "not a second
  X," "to build on what you said," "as you can see above," "going back to the
  original question." Deliverables must be self-contained. (`feedback_no_chat_artifacts_in_deliverables`)
- **Gloss non-obvious terms, proprietary names, codenames, and internal IDs at
  first use.** "The m1b bid" → "the m1b bid (Merlin phase 1b cost estimate)." An
  unlabeled run ID or service codename is a naked code — Rule 8 fails it; this
  overlay names it. (`feedback_deck_gloss_terms`, `feedback_onboarder_friendly_refs`)
- **If the content is in Spanish, match the audience's regional variant.** For a Latin
  American audience, avoid Spain-isms (vosotros, leísmo, "coger" in the wrong register);
  match the locale the reader expects rather than defaulting to Castilian.

## Procedure

Work through these steps in order.

**Step 1 — Identify the audience and the one decision.**
Before touching a word, answer: who reads this, and what is the single decision or
action they need to leave with? If you cannot answer both questions from the
content, flag it as a structural problem (the author didn't know either) and state
your best inference. Every rule is applied in service of that audience and that
decision.

**If decision-queue mode:** inventory open items briefly (count + what's stale),
then present **only question 1** in distilled form. End with "next question" or
wait for an answer — do not pre-load the rest of the queue.

**Step 1b — Draft the CEO sentence (when audience is executive).**
Even when the full rewrite is long, write the one-sentence fork first (internally
or on request). The long form supports the builder; the CEO sentence is the
deliverable for the decider.

**Step 2 — Apply rules 1–12 as a transform.**
Rewrite the content. Do not annotate or explain as you go — just produce the
clarified version. Sequence:
- (a) Restructure for BLUF: conclusion first, evidence second, methodology last or
  cut entirely.
- (b) Cut word count to ≤60% of original (Rule 5). Remove filler, redundant
  qualifiers, and preamble.
- (c) Break sentences over 25 words. Replace nominalizations and passive voice.
- (d) Attach context to every number (unit, comparison, direction, interpretation).
  Rewrite any "X/Y" list.
- (e) Rewrite headings and metric titles as findings.
- (f) Apply house-style overlay: confidence register, no chat-artifacts, gloss terms.

**Step 3 — Run the checklist as binary pass/fail.**
After rewriting, audit the result (not the original) against rules 1–12. The output
checklist shows PASS or FAIL per rule with a one-line note. If anything fails in the
rewrite, fix it before reporting.

**Step 4 (self-check mode only) — Revise in place before sending.**
Do not emit the checklist. Fix what it flags. Send the clean version. The discipline
is invisible to the reader, which is the point.

**Sanity checks to run on every pass:**
- *"So what?"* — read each paragraph; is the implication stated?
- *"Would a stranger get this on a skim?"* — read only headings and first sentences.
- *"Would future-me understand this in two years?"* — are terms glossed, are
  numbers self-explaining, is the context embedded?

## Output format (transform mode)

Return in this exact order — practice what the skill preaches: answer first.

---

**DISTILLED**

[The clarified rewrite in full. This is the main deliverable. Lead with it.]

---

**Changed**

- [What changed and why — max 5 bullets, each naming the rule number and the
  edit. E.g.: "Rule 1 — moved verdict to opening sentence; methodology moved to
  footnote." "Rule 8 — attached unit, baseline, and direction to every metric."]

---

**Checklist**

| Rule | Result | Note |
|---|---|---|
| 1 · Answer first | PASS/FAIL | [one line] |
| 2 · So what? | PASS/FAIL | [one line] |
| 3 · One idea/sentence | PASS/FAIL | [one line] |
| 4 · Short, active, common words | PASS/FAIL | [one line] |
| 5 · Omit needless words | PASS/FAIL | [one line] |
| 6 · Scannable | PASS/FAIL | [one line] |
| 7 · Grade 8–9 | PASS/FAIL | [one line] |
| 8 · Numbers carry context | PASS/FAIL | [one line] |
| 9 · Takeaway titles | PASS/FAIL | [one line] |
| 10 · Calibrated confidence | PASS/FAIL | [one line] |
| 11 · Grounded, faithful | PASS/FAIL | [one line] |
| 12 · Progressive disclosure | PASS/FAIL | [one line] |
| House style | PASS/FAIL | [one line] |

---

Never lead with the checklist. Never lead with "Changed." The rewrite is the
deliverable — everything else is audit.

### Decision-queue turn (one question)

When walking an open-question queue, a single turn looks like:

---

**Question N of M — [short title]**

**DISTILLED**

[Verdict-first explanation: what the decision is, options, default, your call if
any. Scannable. No queue dump.]

---

**DECISION SENTENCE** *(include when user asks for CEO/operator framing, or on
request after technical detail)*

[One sentence. Plain language. Both forks named.]

---

**Coming next:** [one-line teaser for question N+1, or "reply with your pick / say
next"]

Full transform checklist (Changed + Checklist table) is optional in decision-queue
mode — use it when the user invokes `/distill` on a blob, not on every queue step.

## Worked examples

### Example 1 — Eval result dump

**Before (112 words, buried verdict, naked metric, X/Y misread):**

> The evaluation run conducted on 2026-06-14 leveraged a suite of test prompts
> across the document-intelligence/parity-gate benchmark. The system under evaluation
> (SUT) was Claude claude-sonnet-4-6 with the cr-api retrieval backend. Results
> indicated that precision/recall values of 0.81 and 0.74 were obtained respectively
> across the 312-item evaluation set. It should be noted that there may potentially
> be some variance attributable to the chunking strategy deployed in the retrieval
> pipeline. At this time it is difficult to say definitively whether the system meets
> threshold. Further investigation into the chunking parameters would potentially be
> warranted before a deployment decision is reached.

**After (48 words — 57% cut, BLUF, numbers with context, verdict explicit):**

> Doc-intel parity gate: **hold deployment.** Precision 81% and recall 74% (on 312
> test items, 2026-06-14 run) both fall below the 90% threshold. The gap is likely
> chunking strategy — run an ablation on chunk size before re-evaluating. Two weeks
> estimated for the ablation cycle.

**Changed:** Rule 1 — verdict moved to line 1. Rule 2 — "hold deployment" names the
decision. Rule 5 — 57% word cut. Rule 8 — precision and recall separated (were
"precision/recall" — fraction misread risk), units added, denominator stated, gap
named. Rule 4 — "it should be noted," "potentially," "at this time it is difficult"
all cut.

---

### Example 2 — Agent status update (bus message)

**Before (68 words, chat-artifact phrasing, naked ID, no implication):**

> As per the previous discussion, I wanted to provide an update on the m1b-v2
> assembly tasks. The IT-023 item has been addressed as part of this cycle. The
> relevant PRs (PR-3b and PR-4a) are in a state where they are awaiting review. It
> is hoped that the review will be completed soon so we can proceed with the next
> milestone. Please let me know if you have any questions.

**After (32 words — 53% cut, no chat-artifacts, terms glossed, next action named):**

> m1b-v2 assembly (Merlin phase 2 build): two PRs pending operator review — PR-3b
> (reusability cleanup) and PR-4a (eval scaffold). IT-023 (Windows path-wall fix)
> closed. Blocking: review sign-off. ETA: unblocked same day as review.

**Changed:** Rule 1 — status and blocker up front, not buried after a recap. Rule 5 —
53% cut; "as per the previous discussion," "I wanted to provide," "it is hoped,"
"please let me know" all removed. House style — "IT-023" glossed, "PR-3b" and
"PR-4a" named. Rule 2 — "Blocking: review sign-off" names the decision gate.
Rule 8 — no naked numbers left unexplained.

---

### Example 3 — Technical fork → CEO sentence (decision queue)

**Context:** Open question AC-WEEKLY — weekly Timesheets tab hours after window
entry ships. Builder needs prod behavior; CEO needs the fork only.

**Technical pass (abbreviated — for the builder who asks "why would this change?"):**

> Today each day shows punch Start/Stop from ClockSession and Pay Hrs from foreman
> timecard ST/OT/DT scalars — never summed from punches. Window entry breaks the
> Start/Stop half; Pay Hrs only updates when foreman scalars sync (#1160).

**CEO sentence (the decider deliverable):**

> Should the weekly timesheet show employees the hours they entered on their phone,
> or the official payroll totals that may stay blank until the foreman submits and
> the back office syncs?

**Changed:** Rule 12 — technical detail subordinated; one sentence carries the
decision. Rule 11 — both forks faithful to source (local rollup vs scalar lag).
House style — no `stHrs`, no Realm, no ticket IDs in the CEO sentence.

## Notes

- **This skill adds no code** and invokes no tooling. It is a judgment and copy
  layer — applied by reading, reasoning, and rewriting.

- **Scope is universal.** Eval dumps, agent status blurbs, PR descriptions, specs,
  Notion docs, bus messages, release notes, technical analyses — any dense
  human-facing text qualifies. The content type does not change the rules; only the
  audience and the single decision vary.

- **Cross-references (do not duplicate — inherit from these):**
  - `/presentation-evaluator` SKILL.md — **Dimension 9 (Standalone Legibility &
    Framing)** and the **Register & Cadence advisory** are the deck-specific
    ancestors of this skill: they apply rules 1, 3, 6, 8, and the house-style
    overlay to slide content. /distill generalizes them to any content type. When
    evaluating a deck, run /presentation-evaluator for the full rubric; /distill
    handles the prose pass.
  - `~/.claude/skills/subscribe/SKILL.md` — its **"Relay comm rules"** section is
    the bus-message-specific application of these same principles: headline-first
    (Rule 1), every number carries its legend (Rule 8), no naked codes (Rule 8 +
    house style), never "X/Y" for a list (Rule 8), declare uncertainty (Rule 10).
    /distill is the general form; the relay rules are the specialization for bus
    update content. When writing bus messages, apply both.

- **Decision-queue + CEO sentence are the executive layer of Rule 12.** Walk one
  fork at a time; collapse to one sentence when the reader is a decider, not a
  builder. The technical walkthrough is still faithful (Rule 11) — it just comes
  on request or in the same turn below the sentence, never instead of it when they
  asked for the sentence.

- **The checklist is meant to become a reflex, not an on-demand command.** The
  highest-value use of this skill is not the transform (which requires invoking it)
  but the internalized discipline: every agent that runs Rule 1 before sending a
  status update and Rule 8 before reporting a number is practicing /distill
  continuously. The on-demand command surfaces failures after the fact; the reflex
  prevents them.

- **Faithfulness (Rule 11) is non-negotiable.** Clarity is worthless if the
  clear version misrepresents the source. When distilling a complex analysis, the
  simplification must preserve the original's confidence bounds, caveats, and
  scope. A finding that was "likely" in the source cannot become "confirmed" in the
  distilled version. When the source is ambiguous about its own strength, say so —
  that is itself information.

- **In self-check mode, stay silent about the process.** The reader does not need
  to know you ran the checklist. Produce clean output. The discipline is structural,
  not performative.

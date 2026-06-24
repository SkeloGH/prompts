---
name: contagious
description: Audit content for word-of-mouth virality using Jonah Berger's STEPPS framework (Social Currency, Triggers, Emotion, Public, Practical Value, Stories), then generate concrete fixes for the weak principles. Use when reviewing or improving marketing copy, product names, taglines, landing pages, feature announcements, launch tweets, social posts, email subject lines, or any idea meant to spread. Triggers — "/contagious", "make this shareable", "will this go viral / catch on", "STEPPS audit", "why won't this spread", "punch up this copy".
argument-hint: "[content to audit, or describe the idea]"
---

# contagious — STEPPS audit → fix

A quality gate for **word of mouth**. Given a piece of content (or an idea), this
skill scores it against Jonah Berger's six drivers of sharing, names the single
weakest lever, and writes concrete, paste-ready fixes for the principles that
matter for *that* artifact.

The core discipline: **do not try to maximize all six.** That is the most common
misuse of STEPPS and how copy becomes bloated and gimmicky. Most contagious things
nail one or two of the six. The skill's job is to find the *right* one or two for
this artifact and ignore the rest.

---

## The framework (STEPPS)

| # | Principle | Diagnostic question | Lever to pull |
|---|-----------|---------------------|---------------|
| S | **Social Currency** | Does sharing this make *them* look good? | insider knowledge, exclusivity, remarkability, a fact worth repeating |
| T | **Triggers** | What everyday cue will bring this to mind? | link the idea to a frequent context/moment ("top of mind, tip of tongue") |
| E | **Emotion** | Does it stir *high-arousal* feeling? | awe, excitement, anger, anxiety — NOT sadness or contentment (low-arousal don't share) |
| P | **Public** | Can others see people using/doing it? | make the behavior observable; leave behavioral residue |
| P | **Practical Value** | Is it genuinely useful to pass on? | save money/time, concrete how-to, a number worth forwarding |
| S | **Stories** | Is there a narrative people will retell? | Trojan-horse the message inside a story that carries the brand with it |

> Mnemonic: **S-T-E-P-P-S**. The second P (Practical Value) and second S (Stories)
> are the ones people forget.

---

## Procedure

### Phase 1 — Audit

1. Identify the **artifact type** (tweet, name, tagline, feature launch, landing
   page, etc.) and who is meant to share it and why.
2. Score each of the six principles **0–5**, with a one-line justification per score.
   Lead with the prose reason; the number is a forcing function, not the verdict.
3. Mark the **weakest** principle. Then state which **1–2 levers actually fit this
   artifact** — and explicitly say which principles to *ignore* and why (e.g. a
   background-sync feature can't realistically be Public, so don't force it).

### Phase 2 — Fix

For each principle in the "levers that fit" set (typically the 1–2 weakest among
them), generate **2–3 concrete, ready-to-use rewrites or mechanics** — actual copy
or a specific tactic, never advice like "add more emotion."

Close with **IF YOU CHANGE ONE THING** — the single highest-leverage edit, with the
before→after and the score it moves.

---

## Output format

```
STEPPS AUDIT — <subject>
──────────────────────────────────────────────
S  Social Currency   ▓▓▓░░ 3/5  — <why>
T  Triggers          ▓░░░░ 1/5  — <why>   ← weakest
E  Emotion           ▓░░░░ 1/5  — <why>
P  Public            ▓▓░░░ 2/5  — <why>
V  Practical Value   ▓▓▓░░ 3/5  — <why>
St Stories           ▓░░░░ 1/5  — <why>

VERDICT: <which 1–2 levers fit this artifact; which to ignore and why>
```
```
TOP FIX — <principle> (<what it does>)
  ▸ <concrete rewrite / mechanic>
  ▸ <alternative>

THEN — <2nd principle>
  ▸ <concrete rewrite / mechanic>

IF YOU CHANGE ONE THING:
  <the single edit, before→after, and the score it moves>
```

Render the bars with filled/empty blocks (`▓`/`░`) out of 5. If the user prefers
prose-only, drop the bars but keep the per-principle justification and the verdict.

---

## Worked example

**Input:** `/contagious — launch tweet: "Introducing Smart Sync 2.0 — now with faster background syncing and improved reliability. Available today for all Pro users."`

```
STEPPS AUDIT — "Smart Sync 2.0" launch tweet
──────────────────────────────────────────────
S  Social Currency   ▓▓░░░ 2/5  — Nothing makes the sharer look smart; "faster +
                                   reliable" is what everyone claims.
T  Triggers          ▓░░░░ 1/5  — No hook to a recurring moment.  ← weakest
E  Emotion           ▓░░░░ 1/5  — "Improved reliability" is low-arousal; relief
                                   doesn't get shared.
P  Public            ▓▓░░░ 2/5  — Syncing is invisible; no observable residue.
V  Practical Value   ▓▓▓░░ 3/5  — Real utility exists but stated abstractly.
St Stories           ▓░░░░ 1/5  — A spec sheet, not something anyone retells.

VERDICT: This is an announcement, not a contagious message. For a product feature
the realistic levers are PRACTICAL VALUE + TRIGGERS. Ignore Public/Stories — a
background sync feature can't be made observable or narrative without gimmickry.
```
```
TOP FIX — Practical Value (make the usefulness concrete & forwardable)
  ▸ "Smart Sync 2.0 cuts a 10-min sync to 40 seconds. Team syncs 20×/day? That's
     ~3 hours back every week."
  ▸ Lead with the number, not the version — nobody forwards "2.0".

THEN — Triggers (anchor to a recurring moment)
  ▸ "That spinning sync wheel before every standup? Gone." — "standup" is a daily
     cue that reactivates the memory of the product.

IF YOU CHANGE ONE THING:
  Replace "faster background syncing and improved reliability" with the concrete
  time saved. Moves Practical Value 3→5 and gives the tweet a reason to be
  forwarded at all.
```

---

## Notes

- **Pure skill, no dependencies** — no scripts, no MCP. Works in any project.
- If the user gives an *idea* rather than finished copy, skip straight to Phase 2
  (generate angles per fitting principle) and note there's nothing to score yet.
- Source: Jonah Berger, *Contagious: Why Things Catch On* (2013).

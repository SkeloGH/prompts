---
name: subscribe
description: Join a group conversation (or open your direct inbox) on the local redis-bus to coordinate with other agent sessions across Claude Code and Cursor. Joins the channel, catches you up, teaches the messaging protocol, and (in Claude Code) arms an event-driven background listener so arriving messages wake the session — no polling. Triggers — "/subscribe <label>", "/subscribe <label> as <name>", "join the <label> bus channel", "check the bus".
---

> **Portability:** paths below use `$AGENT_OPS` (your clone of the agent-ops/bus repo) and `~/` (home). Set `$AGENT_OPS` for your machine before relying on the shell snippets; an installed copy under `~/.claude/skills` may use absolute paths.

# subscribe — join the local agent message bus

This skill makes you a participant on **redis-bus**: a local Redis Streams bus shared by Claude Code, Cursor, and any MCP-capable agent. Subscribing means **join the channel, catch up on what's there, and know how to send / read / ack**.

**Receiving is event-driven in Claude Code.** Subscribing arms a persistent background **Monitor** running a blocking `XREADGROUP … BLOCK` loop — when a message lands, the harness wakes you with the message as the event. No token-burning poll loop, no idle listening gap. (In environments without the Monitor tool — e.g. Cursor — receiving stays pull-based: run the read loop during a turn; see "Listener fallback" at the end.)

All operations use the `redis-bus` MCP tools (`mcp__redis-bus__xadd`, `xgroup_create`, `xreadgroup`, `xack`, `xrange`, `set`, `scan_keys`, …). **If those tools are not available**, the bus container or MCP server isn't loaded — tell the user to confirm `agent-bus-redis` is running and `redis-bus` is connected (then reload), and stop.

## Arguments
- `<label>` — the conversation/topic to join → stream `bus:topic:<label>`.
- optional `as <name>` — your identity on the bus. If omitted, mint one: `claude-<adjective>-<noun>` (e.g. `claude-amber-otter`). **Hold this id for the whole session** — it is your group name, your `from`, and your presence key.

## The protocol (conventions)
- **Topic / group conversation:** stream `bus:topic:<label>`. Every subscriber reads every message (fan-out via one consumer group per subscriber).
- **Direct inbox:** stream `bus:inbox:<id>` — point-to-point to one agent.
- **Your cursor = a consumer group named after your `<id>`** on the stream. `>` = messages new to you; reading at id `0` = your **unacked backlog** (your reconnect / catch-up view).
- **Message fields:** `from <id>`, `to <id|all>` (who it's for — a specific agent id, or `all` for the whole channel), `type <chat|task|reply|status>`, `body "<text>"`, optional `thread <id>`, `reply_to <msg-id>`. The stream entry id *is* the timestamp.
- **Retention = best-effort, handled out-of-band.** The `xadd` tool has **no `MAXLEN` param** — do not try to trim on send. Trimming runs separately (a periodic `XTRIM` via `docker exec`). Messages past the window are gone; judge stale messages by their id-timestamp and **do not act on outdated instructions**.
- **Presence = auto-expiring heartbeat.** Register yourself as `bus:presence:<id>` with a short TTL and refresh it whenever you touch the bus; idle agents expire on their own (no manual cleanup). Discover who's live with `scan_keys bus:presence:*`.
- **Relay delegation:** a channel may have a designated **relay** — an agent whose declared role is summarizing channel activity for the human. Where one exists, other subscribers keep arrivals off their session output (see Receiving).

## Reactions (`react` tool)
Attach a semantic emoji **reaction** to a message — a fast, low-signal ack you send BEFORE a full reply, or before a task that will take a while. Reactions live OFF the message stream (a side redis hash, not an XADD), so **your** reactions never wake anyone — use them freely. (Receiving-side exception: when the **operator** reacts to *your* message it arrives as an operator DM — `reacted :emoji: to your message` — that DOES wake you. An intentional lightweight poke; agent↔agent reactions stay silent.)
- **Tool:** `react({ target, message_id, emoji, remove? })` (sutra MCP). `target` = the channel/participant whose stream holds the message (same resolution as `sendMessage`/`pullLastMessages`); `message_id` = that message's id; `emoji` ∈ `seen` · `eyes` · `thumbsup` · `thumbsdown` · `hourglass` · `white_check_mark`. `remove: true` takes your reaction back. The reactor is your **bound seat** (anti-impersonation, like `sendMessage`).
- **Convention:** drop `eyes`/`seen` the moment you've read a message you'll act on later; `hourglass` for "on it, this'll take a while"; `thumbsup`/`thumbsdown` for a quick ruling without a full message; `white_check_mark` when done. Prefer a reaction over a one-word "ack" reply — it's silent (no wake) and renders inline on the dashboard (chips + live update).

## On `/subscribe <label> [as <name>]` — do these now
**On resume / reconnect — orphan-immune re-arm (IT-040; deterministic fix IT 2026-06-22).** TaskList is INSUFFICIENT for orphan detection — after a reload/compact/terminal-reboot, old `docker exec … XREADGROUP` loops run as detached host processes that TaskList loses but that keep consuming from the same consumer group. An orphan with a dead stdout WINS the `>` delivery race, consumes into the PEL, echoes to nowhere, and the live monitor never sees the message (observed: 14 blocked clients when 3 intended; relay handshake + a ticket black-holed).

**>>> CANONICAL (2026-06-22): arm via `$AGENT_OPS/bus/bus_listen_v2.sh` — adaptive, channel-multiplexed, ONE Monitor per seat.** v2 supersedes the per-stream `bus_listen.sh` (which remains the documented floor fallback below). It is **SSE-preferred with a redis-floor fallback**, decided by whether the agent-ops daemon (`:4178`) *serves this seat* (its `/__health` seat list) — daemon serves you → tail the daemon's pre-gated `/__wake` SSE stream; otherwise (daemon down, or it doesn't serve your seat) → the redis floor: gen-token cooperative cancellation + ONE multi-stream `XREADGROUP` across ALL your streams on `<MYID>-live`, gated through the single canonical `gate.mjs`. Kill the daemon and it degrades to today's floor — redis stays the only hard dependency.

  **One Monitor command for the whole seat** (`persistent: true`). Simplest form — pass ONLY your
  identity and it self-discovers its channels from `roles/index.json` (the D11 source of truth; add
  a `channels:[{tag,stream}]` array to your role there if it's not already declared):
  ```bash
  bash "$AGENT_OPS/bus/bus_listen_v2.sh" <MYID>
  ```
  Or pass channels explicitly (overrides the registry lookup) — `tag=stream` per channel:
  ```bash
  bash "$AGENT_OPS/bus/bus_listen_v2.sh" simrig-it-desk \
    inbox=bus:inbox:simrig-it-desk topic-itdesk=bus:topic:it-desk topic-simrig=bus:topic:simrig-it-desk
  ```
  - **Retire is the same gen-token contract** v1 uses: v2 `INCR`s `bus:listener-gen:<MYID>:<tag>` per channel at arm and exits the instant any is bumped — so re-arm and `bus-retire-orphans.py` deterministically retire predecessors. SSE orphans are *additionally* harmless by construction (the daemon fans out + acks by id, and reaps dead connections on keepalive) — the structural orphan-immunity the docker-exec loop lacked.
  - **ACK is now an explicit subcommand, run on HANDLE** (not in-loop): the listener is a pure surfacing pipe and **never auto-acks on surface**, so a crash-before-handle never advances the marker (preserves IT-038 ACK≠handled). Each surfaced wake prints its exact ack line; run it after you've acted:
    `bash bus_listen_v2.sh ack <MYID> <tag> <id> [stream]` (daemon serves seat → `POST /__ack`; else → `SET bus:handled:<MYID>:<tag>` + `XACK <MYID>-live`). Both modes advance the SAME `bus:handled` marker, so an SSE↔floor flip is at-least-once + id-dedup.
  - **>>> 2-STEP ARM (T10 ergonomics, 2026-06-22) — do NOT hand-derive preflight/liveness anymore.** The listener self-preflights on boot and the Monitor surfaces the result, so arming is exactly two actions:
    1. **Arm the Monitor** on `bus_listen_v2.sh <MYID>` (above). Its FIRST surfaced line is the structured preflight verdict — `READY seat=<id> mode=sse|floor channels=<…> pending=<N> gen-claimed` (channels resolved, groups ensured, mode detected, marker-lag counted, gen claimed — all internal). A hard failure fails fast instead: `BLOCKED <reason> seat=<id>` (e.g. `redis-unreachable`, `no-channels`) — surface it and stop; no dead Monitor is left running. Once the stream is genuinely established it prints a one-time `LIVE seat=<id> mode=<m>`.
    2. **Read the banner and flip `liveWiring=armed`** (`READY`+`LIVE` seen) — or surface the `BLOCKED`/missing-`LIVE` reason. That's it: do NOT hand-run channel resolution, group creation, presence writes, backlog peeks, or the `CLIENT LIST`/lag math at arm time — the script owns all of it.
  - **`verify` is the ONGOING liveness check** (not an arm step — it can only run once the Monitor exists): `bash bus_listen_v2.sh verify <MYID>` → `LIVE ok … presence-ttl=<s> …` (exit 0) or `DEGRADED <why> …` (exit 1). It asserts presence freshness + mode corroboration (sse: daemon serves the seat; floor: the `<MYID>-live` group has a registered consumer) — use it post-compact and periodically INSTEAD of hand-rolling TTL/lag/CLIENT-LIST. This is the trustworthy external cross-check the in-process `LIVE` self-report can't be.
  - **IT-038 resume sweep is handled internally:** floor mode runs the startup PEL drain (id `0`); SSE mode's catch-up `XRANGE`s from the `bus:handled` marker on connect. You do NOT hand-run the XRANGE sweep when arming v2.
  - **Any seat can ride the daemon (T8/T9, 2026-06-22 — supersedes the old channel-completeness limit).** v2 SELF-REGISTERS its complete channel set on connect (`/__wake?seat=X&ch=tag:stream,…`): the daemon creates the seat if unknown, ensures the `svc` group, ref-counts, and tears down on last disconnect — so there is no 404 and no silent channel drop regardless of whether the seat was pre-configured. Shared topics fan correctly to every subscriber (T9 per-seat gate+fan). Kill the daemon → the redis floor is complete. (Earlier limit: the daemon only served pre-configured seats with their full channel set; dynamic per-connection registration removed it.)

  The per-stream `bus_listen.sh` one-liner — `bash "…/bus/bus_listen.sh" <MYID> <STREAM> <TAG>` (one Monitor per stream) — remains valid as the floor fallback and is what v2's floor path reimplements multiplexed. See memory [[bus-listener-generation-token]]. The inline bash template below documents the same floor logic (and is the Cursor fallback's basis).

**Why not just kill orphans (the old way, now superseded):** MSYS `kill` does NOT reliably reap native docker.exe children; `CLIENT KILL ID` is useless (the loop reconnects on its next iteration); `XGROUP DESTROY` works (orphans hit `NOGROUP` → 2-failure exit) **but races** — an orphan mid-`sleep 2` retry resurrects if the group reappears, so it needs holding the group destroyed until blocked-count is a *stable* 0 (~40s) before recreating. That manual surgery is only needed to migrate pre-token (inline) orphans ONE time; once everything arms via `bus_listen.sh`, re-arm handles it for free. The inline template below documents the same logic `bus_listen.sh` implements (and is the Cursor fallback's basis).

1. **Identity.** `MYID` = `<name>`, else mint `claude-<adj>-<noun>`. State it: *"Subscribed as `claude-amber-otter`."*
2. **Register presence (heartbeat).** `set` key `bus:presence:<MYID>`, value `vendor=claude topic=<label> seen=<now-iso>`, `expiration` 120. (Re-run this whenever you read or send, so you stay live; go idle past the TTL and it auto-expires.)
3. **Join (create your cursor).** `xgroup_create` on `bus:topic:<label>`, group = `MYID`, start = `$` (new-only), mkstream true. *(Use start `0` instead only if the user said "with history".)*
4. **Get context (read-only peek, does NOT consume your cursor).** `xrange` (key, `count` 10) → note this returns the **earliest** entries (the tool has no reverse/range arg), so it's a limited peek; on a busy channel lean on the group read below for what's current. Summarize anything found.
5. **Arm the listener (Claude Code).** **Canonical = the v2 one-liner above** (one persistent Monitor for the whole seat, `description` e.g. `bus <MYID> (adaptive listener)`, `persistent: true`). The inline bash below is the **floor reference template** — what v2's redis path reimplements multiplexed; keep it for understanding the floor and as the Cursor fallback's basis. If you arm the inline form directly, it is one Monitor **per stream** (substitute `<MYID>` / `<label>`):
   ```bash
   pset() { docker exec agent-bus-redis redis-cli SET bus:presence:<MYID> "vendor=claude topic=<label> seen=$1 listener=on" EX 120 >/dev/null; }
   xrg()  { docker exec agent-bus-redis redis-cli --json XREADGROUP GROUP <MYID> main COUNT 1 BLOCK 110000 STREAMS bus:topic:<label> '>'; }
   while true; do
     TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
     # retry-once on a transient exec hiccup; only two CONSECUTIVE failures = real outage
     pset "$TS" || { sleep 2; pset "$TS"; } || { echo "BUS LISTENER DOWN: agent-bus-redis unreachable (2x)"; exit 1; }
     OUT=$(xrg) || { sleep 2; OUT=$(xrg); } || { echo "BUS LISTENER DOWN: XREADGROUP failed (2x)"; exit 1; }
     if [ -n "$OUT" ] && [ "$OUT" != "null" ]; then
       OTHERS=$(echo "$OUT" | grep -oE '"from","[^"]+"' | grep -v '"from","<MYID>"' || true)
       if [ -n "$OTHERS" ]; then
         # Wake gate (IT-022 + refinement). COUNT 1 ⇒ $OUT is ONE message, so these greps are
         # per-message exact. Wake iff:
         #   • from=operator (operator)  OPERATOR OVERRIDE — ALWAYS wakes,
         #       regardless of addressee; an operator post is NEVER suppressed by the addressee-gate
         #       (a missed operator signal is worse than an extra wake — caught when an operator
         #       '@other-seat' post was silently acked by a seat's listener).
         #   • to=<MYID>                     (DM, any type)
         #   • @<MYID> in the body           (mention, any addressee)
         #   • to=all AND type∈{task,reply}  (actionable broadcast: routings, rulings, tickets)
         #   • no 'to' field                 (unaddressed ⇒ actionable, per the read loop)
         # Suppress (ack in-loop): to=all + status/chat (the relay folds broadcasts), and
         # to=<other-seat> + anything (cross-seat chatter — the IT-022 over-wake) — EXCEPT operator posts (above).
         if echo "$OUT" | grep -qE '"from","(operator)"' \
            || echo "$OUT" | grep -qE "\"to\",\"<MYID>\"|@<MYID>" \
            || { echo "$OUT" | grep -qE '"to","all"' && echo "$OUT" | grep -qE '"type","(task|reply)"'; } \
            || ! echo "$OUT" | grep -qE '"to","[^"]+"'; then
           echo "$OUT" | python "$AGENT_OPS/bus/bus_fmt.py" 2>/dev/null || echo "$OUT"
         else
           for id in $(echo "$OUT" | grep -oE '[0-9]{13}-[0-9]+'); do
             docker exec agent-bus-redis redis-cli XACK bus:topic:<label> <MYID> "$id" >/dev/null
           done
         fi
       else
         for id in $(echo "$OUT" | grep -oE '[0-9]{13}-[0-9]+'); do
           docker exec agent-bus-redis redis-cli XACK bus:topic:<label> <MYID> "$id" >/dev/null
         done
       fi
     fi
   done
   ```
   Design notes (keep all six properties if you adapt it):
   - **BLOCK 110000 < presence TTL 120s** — each loop iteration doubles as the presence heartbeat, so you stay live with zero manual refreshes and expire ~2 min after the listener stops.
   - **Consumer name is `main`** — the same consumer your in-turn reads must use (see Receiving), so everything delivered-but-unacked sits in ONE pending list.
   - **It fails loudly — but tolerates a blip** — each `docker exec` is wrapped (`pset`/`xrg`) and retried once after 2s; only **two consecutive** failures emit `BUS LISTENER DOWN` and exit. A momentary Docker/redis hiccup (which would otherwise kill a healthy listener — observed in practice) is survived, while a real outage still surfaces. Silence must mean "no messages", never "listener dead".
   - **Self-filter** — without it, every `xadd` you send wakes your own session via the group echo. `--json` puts each batch on one line where fields render as `"from","<id>"`, making the grep reliable. A batch that is *only* your own echoes is acked in-loop and suppressed (so it never pollutes future backlog reads); a batch containing anyone else's message is passed to the addressee filter below.
   - **Wake gate (token guard)** — a second in-loop gate before waking the session, run **per-message** (`COUNT 1` makes each `xrg` batch exactly one message, so the greps can't cross-match two messages). **Wake iff** the message is **from the operator** (`from`∈{`operator`} — a **HARD always-wake override**, never suppressed by the addressee-gate even when addressed to another seat; a missed operator signal is worse than an extra wake — IT-022 refinement after an operator `@other-seat` post was silently acked), a DM (`to=<MYID>`), an `@<MYID>` mention, an **actionable broadcast** (`to=all` **AND** `type∈{task,reply}` — routings, rulings, tickets), or unaddressed (no `to`). **Suppress (ack in-loop):** `to=all`+`status`/`chat` (broadcast checkpoints/status — the relay folds these; members don't each need to wake) and `to=<other-seat>`+anything (cross-seat chatter). Two independent wins compose here: addressee-gating kills cross-seat reply/task floods (IT-022), and the type-gate on broadcasts keeps to:all status/chat from waking every member (IT-022 refinement). Replies to you normally carry `to=<MYID>` and wake via the DM clause. This prevents O(N) session wakes on busy relay channels. History is unaffected — acking in-loop only advances this consumer group's cursor; the raw stream data persists for `xrange` reads.
   - **No stray stdout before the loop** — anything the command prints at arm time becomes a spurious wake event. Group creation belongs in step 3 (MCP), but if you ever fold an `XGROUP CREATE` into the script, silence it (`>/dev/null 2>&1`).
   When an event notification arrives: it is a **formatted one-line summary** of the message — `from <from> | <channel> -> to:<to> | <type>: "<body excerpt ~160 chars>" | id <entry-id>` (produced by `$AGENT_OPS/bus/bus_fmt.py`; falls back to the raw `--json` line if the formatter is unavailable). The excerpt is for triage — **`XRANGE <stream> <id> <id>` for the full body before acting on anything consequential** (e.g. an operator directive). Process it, `xack` it, and remember events are not user replies. **>>> Before you emit ANY text about it, run the OUTPUT GATE (Receiving § output gate): relay present → zero narration; no relay → one sentence. This runs on every event, no exceptions — silence is the default.** Don't also poll; the monitor wakes you. If the monitor ever exits (TaskStop, error, session hiccup), re-arm it the same way — your group cursor means nothing is lost, and unacked messages reappear via the backlog read.

   **Compact caveat + self-heal (it-desk IT-029).** `/compact` silently kills the monitor and it is NOT auto-re-armed. **On every resume, self-heal:** re-arm step 5 for each label/inbox you hold. **Do NOT trust `TaskList` for liveness** — after a compact it can show no tasks while monitors still run, OR a monitor can be dead while you assume it's up (a harness-kill emits no `BUS LISTENER DOWN`; that fires only on docker/redis errors). Verify with the canonical command: `bash bus_listen_v2.sh verify <MYID>` (T10 — `LIVE ok …`/`DEGRADED …`; folds presence-TTL freshness + mode corroboration into one verdict, so you don't hand-run TTL/lag/CLIENT-LIST). It is the external cross-check the in-process boot `LIVE` line can't be. Manual probe (only if v2 is unavailable): presence freshness (`docker exec agent-bus-redis redis-cli TTL bus:presence:<MYID>`) + group `lag` (`XINFO GROUPS bus:inbox:<MYID>`) — see [[reference_bus_listener_liveness]]. Your consumer group survives compact (no messages lost; recover backlog via id `0`), but the seat is dark until re-armed. **On-demand dark-seat check:** run `python $AGENT_OPS/watchdog/dark_seat_sweep.py --dry-run` anytime to sweep presence+lag across the roles registry and list any dark-with-pending seat. (The automatic 5-min OS-scheduled watchdog was REMOVED at the operator's request 2026-06-15 — fully-dark-seat detection is now manual + the self-heal above. Messages are not lost regardless: a dark seat's DMs sit in its consumer-group backlog, recoverable via id `0`.)

   **Resume integrity — ACK ≠ HANDLED (IT-038).** A consumer-group cursor means "delivered to a consumer", NOT "acted on by the desk." If a session dies between consume+ack and acting, the message is invisible to every group-based view (`XREADGROUP '>'` empty, `XREADGROUP 0`/PEL empty, `XINFO GROUPS lag=0`) yet was never handled — visible ONLY via a raw `XRANGE`/`XREVRANGE` on the stream. Codified rules:
   1. **Durable handled-marker per owned stream.** Maintain `bus:handled:<MYID>:<stream-tag>` = last id the desk ACTUALLY surfaced/acted on. Advance it ONLY in the event handler AFTER action — NEVER in the suppress/ack-in-loop branch. (`set` via `mcp__redis-bus__set`; no TTL — it's a durable cursor.)
   2. **XRANGE sweep on every resume/re-arm.** BEFORE trusting `>`: for each owned stream, raw `XRANGE <stream> (<handled-marker> +` (exclusive lower bound) and re-surface every entry addressed to the desk (`to=<MYID>` / `@<MYID>` / actionable `to=all` / unaddressed) newer than the marker. This catches acked-but-unhandled messages a dead session left behind. Same cursor-misread class as the relay-surfacing lesson at line ~146 — one layer down (consume vs fold).
   3. **XACK unchanged.** Keep `XACK` as-is for delivery semantics; the handled-marker is ADDITIVE.

   **Owned-channel canonical list (IT-038 S3).** Every bus-enabled seat records its standing receive-channels in ONE place; the resume sweep iterates that list so a missing subscription can't recur silently. For the it-desk specifically: `bus:inbox:simrig-it-desk`, `bus:topic:simrig-it-desk`, `bus:topic:it-desk` (the desk is addressed on both topic streams). Any seat should maintain an equivalent list.

6. **Relay chain cross-check (before every relay verdict post).** When posting a message that describes a multi-step verdict or gate chain (e.g. "passed G1 → G2 → G3"), cross-check your draft against the thread snapshot's open items before sending: every gate listed in the snapshot must appear in your post. A missing gate is a silent false claim that the chain is shorter than it is. If any gate is missing, either include it or explicitly note it as skipped/deferred.
7. **Report.** Your id, the channel, listener task id, and a one-line summary of recent activity (or "channel quiet").

## Sending — "tell the group X" / "reply to …"
`xadd` to `bus:topic:<label>` (or `bus:inbox:<recipient>` for direct), `fields` = `{from: MYID, to: <recipient-id | all>, type: chat, body: "<text>"}` (+ `thread` / `reply_to` if relevant). Use `to: all` to broadcast to the channel, or a specific id to address one agent. No `MAXLEN` on send (retention is out-of-band). Confirm what you sent.

## Direct Messages (DMs)

Send a DM to a specific agent via their inbox stream — point-to-point, not broadcast.

**1. Discover who's live:**
```
scan_keys bus:presence:*
```
Each key is `bus:presence:<agent-id>`. The value contains `vendor`, `topic`, and `seen` timestamp. Filter by recency and topic to find the right peer.

**2. Send the DM:**
```
xadd bus:inbox:<recipient-id>  fields: {from: MYID, to: <recipient-id>, type: chat, body: "<text>"}
```
The recipient reads their inbox at `bus:inbox:<MYID>` using `xreadgroup` the same way they read a topic stream — same protocol, different key.

**3. Read your own inbox:**
```
xreadgroup  key: bus:inbox:<MYID>  group_name: <MYID>  consumer_name: main  stream_id: >  count: 20
```
Create the group first if it doesn't exist: `xgroup_create  key: bus:inbox:<MYID>  group: <MYID>  start: $  mkstream: true`.

**Notes:**
- Inbox streams are NOT included in topic fan-out — only the addressed agent sees them.
- The Monitor listener only watches `bus:topic:<label>`. To catch DMs in real time, arm a second Monitor on `bus:inbox:<MYID>` with the same BLOCK pattern.
- **Per-listener liveness (IT-040 B2).** All monitors heartbeat the SAME `bus:presence:<MYID>` key — if the inbox monitor dies but the topic monitor lives, presence still reads `listener=on` while the DM channel is deaf. Use per-channel presence keys (`bus:presence:<MYID>:inbox`, `bus:presence:<MYID>:topic`, etc.) OR probe that each owned stream's consumer group has a LIVE consumer (CLIENT LIST check above). Regardless of how fresh presence looks, the IT-038 XRANGE-from-marker resume sweep MUST run per channel on every re-arm.
- DMs follow the same authorization format rule: name executor + scope + session for any action request.

## Receiving

**Primary path (Claude Code): the listener wakes you.** Each arriving message lands as a Monitor event notification whose body IS the message (one `--json` line: entry id + `"field","value"` pairs; long bodies may be truncated in the notification — `xrange` to read in full). Process it, `xack` it via the MCP tool. **>>> Run the OUTPUT GATE (below) before emitting any output — it decides whether you narrate at all; default is silence.** Reply only if the gate clears it. Messages consumed by the listener sit unacked in consumer `main`'s pending list until you ack — nothing is lost if you can't handle one immediately.

**Manual read loop** (no listener running, reconnect catch-up, or told to "check the bus"):
1. **Refresh presence** (step 2 above) so you show as live — skip if the listener is running (it heartbeats for you).
2. **Backlog first:** `xreadgroup` `group_name` `MYID`, **`consumer_name` `main`** (MUST match the listener's consumer, so backlog reads see everything delivered-but-unacked), `key` `bus:topic:<label>`, `stream_id` `0`, **`count` 50** → your unacked messages.
3. **Then new:** same call but `stream_id` `>` → anything new since.
   *(The tool defaults `count` to **1** — always pass a higher `count`. Leave `block_ms` null for a non-blocking read; `0` is rejected.)*
4. **Filter by `to`.** Act only on messages where `to` is your `MYID`, `all`, or absent. For messages **not** for you, just `xack` them (skip cleanly — acking only advances *your own* cursor).
5. **For messages for you:** process, then `xack` each one you've handled; leave any you couldn't finish **unacked** so it survives to the next turn / reconnect. Judge staleness by id-timestamp.
6. **Run the OUTPUT GATE (below) before writing anything to the user — blocking.** Relay present → emit nothing (process + xack only); no relay → one sentence per the gate. Only after the gate clears do you summarize.

**Relay delegation — output gate (HARD RULE, structural).**

This gate runs on **every** received message, at **every** point you might emit text about it (Monitor event handler line 72, manual read-loop step 6, any reply you draft). It is **not** a one-time setup note and **not** a style preference — it fires per-message, every time, the same way the verdict-headline checklist does. Default is **silence**; narration is the exception you must justify, never the default you trim.

>>> OUTPUT GATE — answer NOW, before emitting ANY token about a bus message:
1. **Is there a relay on this channel?** (A designated relay agent, or the user routing via one.)
   - **YES → SILENCE.** Process it, xack it, act on the bus if it's your lane. Emit **zero** narration to your session: no "received a message from X", no "acking this", no summary, no "the relay said…". The relay is the single voice; you are not.
   - **NO relay → ONE sentence**, action-oriented: what changed and what you did. No message recap.
2. **Does this message change YOUR next action?** (A task assigned to you, a blocking question for you.) This is the ONLY thing that lets you speak on a relay channel — and even then: **one sentence, action-only, no content recap.**

If you can't point to step 2 clearing it, you say nothing. Silence is the default state, not a thing you opt into.

Why structural (not advisory): N subscribers each narrating every message is redundant noise that burns tokens and clutters the user's view — and this rule recurs *precisely because* it keeps getting treated as advice instead of a gate run every time. Treating a relay channel as if there's no relay is a faithfulness failure, not a style choice. Run the gate on every message, like the verdict-headline checklist.

**Silence ≠ stop working (HARD — it-desk IT-033).** The output gate suppresses *session narration to the human operator* ONLY. It is **not** a "stand by / pause / down tools" signal. After acking a protocol reminder you MUST keep producing **bus deliverables** — advance assigned work, post `type:task`/`status` results, and file operator-facing status to the **relay inbox** (`bus:inbox:<relay>`). (IT-033: a relay protocol-reminder stalled all 6 CR-TC seats who read silence as global idle — work halted, relay inbox empty.)
- **Acks carry motion.** A `heard:yes` ack to a protocol/kickoff broadcast MUST name your **next deliverable + ETA** (e.g. `heard:yes | next: file E1-E8 to relay inbox, ~10m`), never a bare "standing by".
- **Relay reminder template (use verbatim-ish).** A relay reminder about output discipline MUST pair the silence rule with the keep-working clause: *"Silence = session output to the operator ONLY; KEEP posting bus deliverables + file operator status to my relay inbox; ack heard:yes + next deliverable + ETA."* A bare "go silent" reminder stalls the team.
- **Escalation = file first, then wait.** "Escalate via relay" means **file the queue/question to the relay inbox**, THEN await — never stand by with nothing filed.
- **Relay surfacing — "inbox empty" ≠ "nothing filed" (corrected 2026-06-16).** IT-033's secondary cause was NOT a member failing to file — the PO HAD filed the queue (~81 min prior, verified). The **relay** read its own inbox as "empty" via `xreadgroup '>'` — a **consumed-cursor artifact** (the message was already delivered/acked, so `'>'` shows nothing) — and concluded "nothing filed". A relay MUST verify with `XRANGE` / backlog read (id `0`), **not just `'>'`**, before concluding a member didn't file, and must **fold filed operator queues** to the dashboard. (Same cursor-misread class as the liveness check — `xrange`/`XINFO`, not a bare `'>'`. The IT-038 handled-marker sweep is the per-seat instance of this same rule: a message acked but unacted on is equally invisible to `'>'` — XRANGE is the only reliable view.)

**Stall timers — hybrid protocol (HARD — it-desk IT-036, ratified the operator 2026-06-17).** Prevents silent stalls without a daemon watchdog.
- **Seats:** on `type:task` accept, post ack with **`due_by`** (ISO or relative) + **next deliverable**; on active tasks post `type:status` **heartbeats ~every 30m** with current ETA. Blocked → file relay inbox with link, don't go quiet. Defaults: ack ≤ **5m**; per-task `due_by` overridable.
- **Relay (turn-driven, NOT cron):** each **fold cycle** sweeps assigned seats for **`due_by` miss without status** OR **~45m silence** on an active task → nudge via `type:task`/DM. Sweep MUST use **`XRANGE`/backlog**, not bare `'>'`.
- **Canonical home:** `due_by` (+ optional `watch_id`) on **bus messages**. Dashboard `stall_risk`/`next_check` = relay-derived fold output only.
- **Output gate unchanged:** all timer artifacts are **bus-only** — never session narration to the operator.

**Memory delegation (relay-owned consolidation).** On a relay-delegated channel, shared **thread memory** is delegated too: members do NOT write the shared thread label's snapshot or KG facts and do NOT `/consolidate` the shared label — the relay does, periodically at natural seams. Your bus `type: status` messages ARE your checkpoints; the relay reads and folds them in. **Before your session compacts**, post ONE status message with your private in-flight state (current task, next step, anything not already on the bus) — that's the whole pre-compact ritual; the relay makes it durable. Checkpoint Stop-hook nudges stay installed and go silent automatically while the relay's consolidation is fresh (<30 min); **if checkpoint nudges reappear on a relay-delegated thread, the relay is stale** — escalate on the bus, or checkpoint locally as fallback. Personal diaries (per-agent, append-only) remain free for private notes. (Adopted 2026-06-10.)

**Dashboard fold = distill for the operator (HARD — the relay's PRIME directive, it-desk 2026-06-17).** The dashboard exists for ONE reason: make the stream of agent activity **digestible for the operator (the operator)**. This is the relay's prime directive, not a side duty — stated here because relays **drift**: over a long session a relay optimizes for what it's reinforced on every turn (terse, coded bus comms) and bleeds that shorthand onto the dashboard, degrading boxes into cryptic statuses. Re-read this every fold.
- **Audience contract.** Bus messages may be terse-and-legended (agent-to-agent). The **dashboard is for the operator**, who is NOT on the bus and never saw the thread — it must be **fully digestible prose**. Never carry bus shorthand, ticket codes, or gate codes onto the dashboard unglossed.
- **Blocking step — distill before write.** Before writing ANY box (`hero` / `needs-you` / `pulse`) to the dashboard YAML, run the **`/distill` self-check** on that box's text (`~/.claude/skills/distill`). A box that fails does not get written — fix it first. Minimum bar: BLUF (leads with the takeaway), no naked codes/IDs (gloss every ticket id, gate code, run id, service/codename), every number carries its legend, terms glossed, headline states the takeaway not a label.
- **Operator boxes lead with a CEO sentence.** For any `action_for: operator` box, the first line is a **CEO sentence** (see `/distill`) — one plain-language sentence the operator can act on without decoding anything; the decision/fork in business terms.
- **Provenance (cheap re-distill insurance).** Stamp each box with a hidden `_source` field — the bus message id(s) / text it was folded from — so a box can be re-distilled later with its real context instead of guessing from the cryptic summary.

Anchor — cryptic (what it degrades to) → digestible (what to write):
```yaml
# CRYPTIC (bus shorthand bled onto the dashboard — assumes the operator saw the thread)
needs-you: "IT-031 G3a 5/5 not met #1150/#1151/#1154/#1155; TL iterate; the operator-only merge"

# DIGESTIBLE (distilled for the operator; stands alone; CEO sentence first)
needs-you: "Four CloudRig PRs aren't mergeable yet — the code-review bot's quality bar isn't met on any of them. The tech lead is fixing them; nothing needs you until they pass, and then only you merge."
action_for: operator
_source: ["bus:topic:CR-TC 1781587995963-0", "IT-031"]
```

## Listener fallback (environments without the Monitor tool)
The Monitor listener (subscribe step 5) is the **canonical path** — arm it whenever the Monitor tool exists. Fall back only when it doesn't (e.g. Cursor):

**Cursor fallback — `bus_timer_wake.py` chain (IT-047, recommended over BLOCK 0):**
`$AGENT_OPS/bus/bus_timer_wake.py` (alongside `bus_fmt.py` — a cross-runtime bus util, now in agent-ops/bus/) implements a bookmarked single-poll + sleep that Cursor can chain across turns without manual `--since` drift:
1. Pick `MYID`, stream, and match criteria (`--type`, `--from`).
2. Run: `python $AGENT_OPS/bus/bus_timer_wake.py --inbox <MYID> --bookmark --sleep N [--ticket X] [--type reply] [--from Y]`
3. Parse the single JSON stdout line → act (xack, reply, fold note).
4. Re-arm with the returned `suggest_next_sleep` field, OR stop if found+handled.
5. **Cap at ~10 arms** (token cost). Do NOT infinite-chain.
The `--bookmark` flag persists the since-cursor to `$AGENT_OPS/bus/bus_wake/{stream-slug}.since` so chains survive turns without manual cursor management. The IT-038 XRANGE-from-marker sweep applies here too: on the first arm after a gap, run the handled-marker sweep before trusting bookmark state.

- A plain `run_in_background` Bash on a blocking `XREADGROUP … BLOCK 0` is a **more primitive one-shot** alternative (task exits on the first message, harness re-invokes you), but gives one notification per arming, heartbeats nothing while blocked, needs manual re-arming, and has no bookmark — use the chain above instead for Cursor.
- **Token-polling in a dedicated throwaway session:** `/loop 15s "run the subscribe read loop for <label> and surface anything new"` — costs tokens per tick and occupies that session; last resort.

**Redis-cli portability (IT-040 B3).** NEVER assume a host `redis-cli` on PATH — a sibling agent's listener failed with "redis-cli isn't on PATH". Standard: listeners use `docker exec agent-bus-redis redis-cli …` (what all desk monitors already do) OR the Python `redis` package against `localhost:6380` (the bus — `agent-bus-redis` maps 6379→127.0.0.1:6380). **NOTE: `localhost:6381` is the `redis-mcp-server` SSE container (port 8000), NOT the bus — a redis-py client there fails silently.** Never bare `redis-cli` without the `docker exec` prefix.

## Kickoff & formation protocol (it-desk IT-029)
- **Kickoff roster-ack gate.** At sprint kickoff, every named seat must ack `KICKOFF-ON` on the project topic before work proceeds. The kickoff broadcaster (PM/relay) checks the ack roster and chases any seat still inbox-only — an inbox-only named seat is a routing hazard (operator-facing decisions DM'd to it bypass the dashboard fold). (IT-029: PO sat inbox-only 73 min; an S4 scope decision bypassed the dashboard.)
- **Formation-change announce (before charter edits).** Any mid-sprint role re-allocation (absorb/split/rename) MUST be a labeled `FORMATION CHANGE` broadcast on the project topic — with explicit unwind steps — BEFORE any charter/KG edits. Experiments are fine but announced as experiments; the bus must record the change going IN, not just the reversal coming OUT. (IT-029: a silent absorb-into-architect made seats act on competing role definitions.)

## Notes
- **Spinning up a multi-agent swarm.** Use the `swarm` CLI tool (`~/bin/swarm`) to open a WezTerm tab with one pane per member, each pre-launched with `claude -n <topic>-<member>`. Then `/subscribe <topic>` in each pane manually.
  ```bash
  swarm new <topic-label> --members=tech-lead,architect,pm,relay
  ```
  Grid auto-sizes: 1–3 members → 1 row, 4–6 → 2 rows, 7+ → 3 rows. Include `relay` in the members list if a relay pane is needed — it gets no special treatment beyond the name.
- **MCP server setup (shared container).** The `redis-bus` MCP connects via SSE to a persistent container — it is NOT auto-spawned per session. Before using bus MCP tools, ensure both containers are running: `docker start agent-bus-redis && docker start redis-mcp-server`. If `redis-mcp-server` doesn't exist yet (first time or after a prune), recreate it: see memory `[[reference-redis-mcp-server]]` for the full `docker run` command. The SSE endpoint is `http://localhost:6381/sse`, defined in `~/Code\.mcp.json` and enabled via `enabledMcpjsonServers` in `.claude\settings.local.json`. If the tools are missing: (1) confirm both containers are running, (2) verify `redis-bus` is in `enabledMcpjsonServers`, (3) reload MCP in the client. Do NOT add redis-bus to `~/.claude/settings.json` — Claude Code ignores SSE-type entries there; `.mcp.json` is the correct location.
- **it-desk routing scope.** The `bus:topic:it-desk` channel is for relay behavior, communications gaps, skill improvements, and workflow meta — things that affect how agents communicate or operate. Product gaps, feature scope questions, eval config issues, and engineering findings belong on the main project bus (e.g. `bus:topic:<project>`) for architect/PM. Before filing to it-desk, ask: "Is this about *how I'm operating as a relay* or *what the product does*?" If the latter, re-route.
- Keep `body` a single string; put structure in fields, not nested JSON, so reads stay clean.
- **One id per session.** If the user `/subscribe`s a second `<label>`, reuse the same `MYID` and just add a second group.
- **Cross-vendor:** the same protocol ships to Cursor as a skill (`~/.cursor/skills/subscribe`). Ids and keys are shared, so Claude and Cursor see each other on the same channel. Cursor has no Monitor tool — Cursor agents stay pull-based (see Listener fallback), so don't assume a Cursor peer sees your message until it next reads.
- **Cleanup is out-of-band.** Dead consumer groups (from ended sessions) and stream trimming are handled by a separate maintenance reaper, not this skill.
- This skill only ever *uses* the bus — it sets no policy and writes no code.
- **Registry helper is Python now (RESOLVED 2026-06-16, it-desk):** the PowerShell `registry.ps1` was classifier-blocked, so it was ported to `python "~/.mempalace/threads/registry.py"` (same `-Action/-SessionId/-Label/-Kind/-RelayId` flags, same `index.json` + `.state` markers the hooks read). Use `registry.py` directly (e.g. `python registry.py -Action touch -SessionId <s> -Kind checkpoint`) — **no file-fallback improvisation needed**. PS Stop/PreCompact hooks are unaffected (they read the same files). registry.ps1 left in place as legacy/reference only.

## Bus-Freeze Protocol for Staged External Writes

Before executing any external write (file edit, API call, PR comment, message send), post the staged payload verbatim to the bus as a `type: status` message with a `staged: true` field. This creates a recoverable artifact if the session dies mid-write. Recovery from transcript archaeology is expensive — the bus stamp is cheap.

Pattern:
```
xadd bus:topic:<label> from=<MYID> type=status staged=true body="<verbatim payload or summary>"
```
Then execute. Then ack the action on-bus.

**Relay-consolidate timer:** Relay consolidation fires only at fold-ins; long sessions without a fold can leave snapshots stale, triggering checkpoint-nudge escalations from members. Recommendation: relay agents should touch the consolidated snapshot every ~2 hours regardless of fold activity — a brief status pass is sufficient to reset the staleness clock for members.

## Execution Seat Policy

Holding bus credentials, a relay role, or a channel session is a **fallback for continuity** — not a mechanism to claim ownership of tasks or decisions that belong to the primary operator (the operator).

**Fallback-only:** An agent that holds a channel seat may keep work unblocked when the primary operator is temporarily unavailable (network drop, context gap, session restart). It may not use that position to re-route tasks, escalate autonomy, or interpret ambiguous standing instructions as permission to act.

**No transfer mechanism:** There is no "whoever holds the word executes" clause. Any standing instruction that reads as a general authority transfer is void. Named-seat authorization covers the specific action stated, not adjacent actions inferred from context.

**Escalation path:** When genuinely unsure whether an action is in scope, post a `type: status` message on the channel describing the blocker and wait. Do not self-authorize via a broad reading of any prior message.

## Authorization Format

Every authorization must name three things — executor, scope, and session. Bare approvals ("go ahead", "authorized", "whoever holds the word") are void in multi-agent contexts.

**Required format:**
> `<agent-id>, session <session-id-prefix>, authorized to <specific action>.`

**Examples:**
- `claude-steady-lynx, session 9930b, authorized to push PR #47.`
- `claude-lucid-heron, session 36ec3, authorized to post the consolidated summary to #cr-api.`

**Rules:**
- **Executor must be named.** No "whoever holds the word" — that clause is void. Authorizations do not transfer across agents or sessions.
- **Scope must be specific.** "This work" or "the task" is not a scope. Name the action.
- **Session must be declared.** An authorization from session A does not extend to session B, even for the same agent.
- **High-stakes actions require this format without exception:** external writes, PR merges, bus broadcasts, file deletes, any irreversible operation.
- **Low-stakes in-session work** (read-only, reversible, scoped to files already in play) may use abbreviated approval — but the executor is always the current session's agent, never inferred.

This convention was endorsed by the operator 2026-06-11 after a seat-claim incident and two near-misses where vague standing authorization was invoked to justify out-of-scope actions.

## Relay comm rules (distilled from /presentation-evaluator)

These rules govern how the relay writes executive summaries and relays decisions to the human operator. Source: `/presentation-evaluator` rubric dims 1, 2, 3, 5, 9, and the Register & Cadence advisory.

- **Headline states the takeaway — and is a claim you can defend.** The first sentence of every relay update must be actionable on its own — a stranger reading it in isolation gets the point. No teasers, no abstractions, no "here's what happened." **Verdict headlines (PASS/FAIL/CONFIRMED) carry an implicit claim that the cited numbers support the verdict.** Before posting any verdict headline, run this blocking checklist:
  1. Every number in the body has its assertion index + metric name + source file (see score citation rule below).
  2. The headline verdict matches the metric the headline names — not a different metric that happens to look good.
  3. All gates in the verdict chain are present (see relay chain cross-check rule above).
  If any check fails, rewrite the headline or hold the post. A headline that outruns its evidence is a false claim, not a communication shortcut. This pattern has recurred despite the rule being known — treat the checklist as structural, not advisory.
- **One insight per message beat.** Don't bundle two status updates into one line. Each message carries one thing worth acting on; split the rest into subsequent messages or drop them.
- **Every number carries its legend.** Don't say ".93" or "14 items" — say what it measures and why it matters. No naked metric. For eval score citations, always include the assertion index AND the metric name AND the source file together — never a bare number. Required pattern: `<pipeline> <metric_name> (assertion[N], <file>.js): <score>`. Example: `1B finding_recall (assertion[2], findingRecall.js): 0.364`. A score without its assertion index is mis-citable; mis-citations require investigation to correct and consume team focus during active verdict windows.
- **Frame must match scope.** A true number shown at a wider scope than it covers is a fidelity failure. If an agent completed 3 of its 5 subtasks, don't say "3 tasks done" if the channel has 10 tasks total.
- **No naked codes or cross-refs.** Internal IDs, error codes, stream keys, task IDs, and **gate codes** — always pair with a plain-language name on first mention per session. Don't say `bus:topic:cr-api:pr-47` without saying what it is. Gate codes (e.g. G1, G2, G3a) are subject to the same rule: expand on first use each session (e.g. "G3a (capability-parity finding-recall, judge-ON)"), then short form is fine. A glossary of current cr-api eval gate codes: G1 = re-ingest, G2 = boundary precision/recall eval, G3a = capability-parity finding-recall judge-ON.
- **Never `X/Y` when you mean `X and Y`.** The fraction form is a misread magnet. Write "agent A and agent B" not "agent A/B."
- **Note/aside slot pays a dividend.** If you add a parenthetical or follow-up line, it must carry a *why*, a stake, or a surprising fact — never a restatement of the headline. Restatements are cut.
- **No decorative garnish.** Drop any aside that doesn't change what the operator does next. The single highest-yield relay edit is removing detail that sounds informative but isn't load-bearing.
- **Split failures into clarity vs faithfulness.** If a relay update is wrong, say whether the agent's output was unclear (clarity) or factually off (faithfulness) — these need different fixes.
- **Confident register, no hedging.** "The deploy failed" not "it looks like the deploy may have failed." State what you know; flag what you don't.
- **Uncertainty is declared, not softened.** If a claim is unverifiable, say so explicitly and cap your confidence — don't bluff a strong statement. "Agent B's status is unknown (no heartbeat since 14:22)" beats "Agent B seems to be running."
- **Spec-first diagnosis before claiming a missing feature.** When a status field reads as absent or skipped, check the spec contract before concluding the feature is missing or unwired. A field that only exists if the code ran is evidence of wiring, not absence of it. `grounding_status=skipped` means the code ran and hit the credential-absent branch — not that grounding is unwired. Symptom → conclusion without consulting the spec is a faithfulness failure.
- **Consistent voice, no lapse.** If the relay opens in second person ("your deploy is…"), it stays there. Don't drift into impersonal exposition mid-summary.
- **Gloss non-obvious terms at first use.** Proprietary names, codenames, internal service labels — define them the first time in any summary thread. Don't assume the operator knows `cr-api` or `pipeline/batch`.
- **No chat artifacts in summaries.** Relay output must read as a standalone operational update, not as a reply to a conversation. Drop phrasing that only makes sense in context ("as I mentioned," "not a second RAG," "it doesn't actually…").
- **Cadence is varied, not a wall.** Alternate between short punchy lines and denser compound ones. A monotone bullet wall or a runaway paragraph both signal the relay isn't editing.

## Bus monitor script — canonical template

The standard listener (step 5 above) uses the inline bash loop. An alternative **Python-file pattern** is available at `$AGENT_OPS/bus/bus_monitor.py` for cases where the inline bash produces excessive notifications (e.g. raw-echo on every XREAD batch floods the monitor and the system kills it).

**When to use the Python template:**
- The inline bash loop produces 10+ notification lines per event batch.
- You need explicit per-message parsing logic beyond simple grep filtering.
- The system has already killed an inline bash monitor for excessive output.

**Pattern:** the Python script does explicit JSON parsing of the XREADGROUP output, filters self-echoes, skips acks-only batches, and emits exactly one line per substantive external message. Use the inline bash by default; reach for the Python template only when the bash monitor gets killed or is producing noise.

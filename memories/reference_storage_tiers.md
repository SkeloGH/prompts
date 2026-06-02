---
name: reference-storage-tiers
description: "This machine's three storage tiers (NVMe C:, Toshiba 2TB exFAT T:, pen drive D:) and their intended roles + gotchas"
metadata: 
  node_type: memory
  type: reference
---

Storage layout on the Windows desktop (as of 2026-06-01):

- **C:** WD SN850X 1TB NVMe SSD — system + dev. Fast, scarce. Keep live/random-IO things here (Docker, active repos, live mempalace DB). Was ~91% full; freed to ~122 GB after moving Downloads off.
- **T:** "Toshiba Canvio DTB520 2TB" — **REJECTED: defective/unreliable (2026-06-01). Do not use; return for refund.** Behind a JMicron JMS580 bridge (VID_152D PID_0580). Symptom stack: initial "No Media" until reseated; `smartctl -d sat` returns a **bogus placeholder identity** ("Hitachi HTS541612J9SA00", POH=1) so its SMART is meaningless; real speed read ~67 MB/s (robocopy) but write ~31 (possible SMR); ValiDrive showed **read errors** then **the drive fully dropped off the USB bus under load and de-enumerated** ("failed to take the drive online"). Fake-vs-genuine 2TB stays technically unconfirmed but is moot — a drive that disconnects under load can't be trusted. Possibly counterfeit. Downloads (37.81GB) had been moved here then fully recovered byte-exact back to C:. **Plan needs a genuine, verified 2TB drive instead — ValiDrive/f3 + speed-check ANY new drive before trusting.**

  **Post-reboot confirmation (2026-06-01, drive left plugged in):** the JMicron bridge enumerates fine and Status OK (`USB\VID_152D&PID_0580`, UAS Mass Storage), but the media behind it presents as **`Win32_DiskDrive` Size=0 GB / "External hard disk media"** and is **absent from `Get-Disk`** (the storage stack can't bring a 0-capacity disk online → no size, no partition, no letter). The bus also shows two **"Device Descriptor Request Failed" / Problem-code-43** phantoms = the storage side repeatedly failing to enumerate. So it is **NOT** a cable/port issue (the bridge came up OK on its own root hub): the bridge is healthy, the storage media is dead/failing-to-present. Highest-confidence verdict: **return it.**
- **D: "Games"** 478GB USB flash pen drive — being repurposed as the **cross-machine transfer** tier (flash + portable); games being migrated OFF it (flash is bad at the random-write that game patching needs).

**exFAT rules for T::** no journaling → eject cleanly, keep backups (not the only copy); **no live git repos (no symlinks) or live databases** on it — only archived/artifact forms.

**USB link gotcha (important, confirmed 2026-06-01):** T: connects via a JMicron bridge and is **power/cable-sensitive** — it failed to enumerate ("No Media", phantom NORELSYS 0GB RAW LUNs = the empty card-reader slots E:/F:, a red herring) until moved to a different port. The machine HAS USB3 (AMD USB 3.10 xHCI) and the Canvio is USB3-capable, BUT the link runs at **USB 2.0**: measured read 36 MB/s + write 31 MB/s (both capped ~35 = USB 2.0 HighSpeed; this rules out SMR-throttle, which would read fast). Cause: **the cables tried are plain USB-2 micro-USB** — they fit the Canvio's **USB 3.0 Micro-B** port (wide two-part connector) but only wire the 2.0 pins. **Fix = the real USB-3 Micro-B cable** (the one from the drive's box). Verify with a single-threaded 2GB sequential read+write test; expect ~100 MB/s on USB3. Until fixed, hold large transfers (e.g. game library migration) — 35 MB/s makes them painfully slow.

**robocopy to T::** use **`/MT:1`** (single-threaded). `/MT:8` thrashes the single spinning head on small-file batches and tanked throughput. Larger context: this drive is part of a plan to share mempalace + dev work between this desktop and a Mac laptop — see [[reference-thread-memory-system]] and the mempalace data dir (~/.mempalace, chroma.sqlite3 ~1.5GB + knowledge_graph.sqlite3).

---
name: feedback-deck-fluid-not-pdf
description: "For HTML presentations viewed in browser, prefer fluid window-filling slides over PDF-style fixed pages"
metadata: 
  node_type: memory
  type: feedback
---

When generating HTML slide decks (via the html-presentation skill) that the user will view in a browser, they prefer each slide to **fill the browser window and adapt fluidly** to its width — not look like discrete, fixed-size PDF pages stacked with margins, gaps, and drop shadows.

**Why:** The default html-presentation template uses fixed `in`-based 16:9 slides for clean PDF rendering. In a browser that reads as "a stack of PDF pages," which the user dislikes — they want the content to adapt to the containing window.

**How to apply:** Do REAL responsive CSS, not scaling. Any `zoom`/`transform: scale()` approach (fixed breakpoints OR fluid JS `zoom = innerWidth/1280`) was explicitly rejected — it shrinks the font uniformly, so text gets tiny on mobile. The user wants the layout to *reflow* and text to stay readable.

The accepted approach (see `presentations/plan-recibo-luz-pareja.html`):
- **Fluid typography** with `clamp(min, vw, max)` on every font-size — readable floor on mobile, capped ceiling on desktop.
- **Reflow** with `flex-wrap` so card rows / comparison panels stack on narrow screens instead of squishing.
- **Full-bleed slides**: `.slide{ width:100%; min-height:100vh; padding: clamp(...) max(5vw, calc((100% - 1080px)/2)); }` — fills the window, content centered and capped to ~1080px on wide screens. No grey side margins, no PDF-page look.
- **Keep print/PDF intact** via `@media print{ .slide{ width:13.333in; height:7.5in; min-height:0; overflow:hidden; page-break-after:always } }` — clamp ceilings ≈ the original desktop px, so the printed 16:9 deck matches.

No framework needed: the user asked about Tailwind, but a CDN adds an external dependency (breaks offline viewing + the machine's AVG TLS inspection can block it). Native CSS `clamp()` + `flex-wrap` does it in one self-contained file.

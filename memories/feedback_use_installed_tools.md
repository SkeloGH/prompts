---
name: feedback-use-installed-tools
description: "Prefer using already-installed tools, fonts, and resources over suggesting new installs — pick the best of what's available"
metadata: 
  node_type: memory
  type: feedback
---

When making ergonomic/utility decisions (font selection, tool choice, dependency picks), prefer **what is already installed on the system** over asking the user to install something new. If a "best" choice requires an install, first check what's already available and pick the best from that set.

**Why:** During wezterm setup (2026-05-14), I kept suggesting fonts that needed installation (Fira Code, Cascadia Mono). User pushed back: "then use whatever the system has and offers the best ergonomic." They value pragmatism over chasing the platonic ideal — getting a working, good-enough setup *now* beats a marginally better setup that requires extra steps.

**How to apply:**
- Before recommending a tool/font/library, check what's installed (`ls /c/Windows/Fonts`, `where <tool>`, etc.)
- Pick the most ergonomic option from the available set, even if it's not the most fashionable
- Only suggest installs when the user explicitly asks for a specific thing or when nothing installed is workable
- This is a *general* preference, not just for fonts — applies to editors, shells, package managers, etc.

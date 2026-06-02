---
name: feedback-prefer-git-bash
description: "On this Windows machine, use the Bash tool (git bash), not the PowerShell tool"
metadata: 
  node_type: memory
  type: feedback
---

On this machine the user works in a git bash session and wants Claude to use the Bash tool, not the PowerShell tool, for shell commands.

**Why:** The user's interactive `!` shell is git bash; keeping Claude in the same shell environment avoids divergence and matches how they verify things.

**How to apply:** Default to the Bash tool. `winget` is NOT available in git bash (it's a Windows app) — for installs, download installers directly with `curl` and run them. curl on this machine fails TLS revocation checks (`CRYPT_E_NO_REVOCATION_CHECK`) — add `--ssl-no-revoke`. For Windows .exe args starting with `/` (installer flags like `/VERYSILENT`, `reg /v`), prefix the command with `MSYS_NO_PATHCONV=1` so MSYS doesn't rewrite them into filesystem paths. See CLAUDE.md "Shell patterns" for bash+Windows quirks. Relates to [[feedback-use-installed-tools]].

# Memories

Portable, sanitized snapshot of the auto-memory facts from my primary dev
machine — the reusable engineering knowledge and working preferences, with all
machine-specific user paths parameterized to `%USERPROFILE%` and internal
session IDs stripped. Personal facts (finances, location, etc.) are **not**
synced here.

Each file is one fact with YAML frontmatter (`name`, `description`,
`metadata.type`). `[[wiki-links]]` reference related memories by `name`; links
to omitted personal memories are left as inert markers.

## Engineering reference

| Memory | Hook |
|--------|------|
| [AVG breaks node TLS](reference_avg_tls_npm.md) | AVG HTTPS inspection breaks npm installs; fix with `NODE_EXTRA_CA_CERTS` → exported Windows root bundle |
| [AVG strict-TLS exceptions](reference_avg_strict_tls_exceptions.md) | AVG cert breaks gcloud/strict validators even via bundle; fix is AVG domain exceptions |
| [MCP npx hang on Windows](reference_mcp_npx_windows.md) | npx-based MCP servers hang; install to `~/.mcp-servers` and use `command:node` |
| [Windows dir-rename splits repos](reference_windows_dir_rename_split.md) | `mv`/`Move-Item` copy+delete fallback under open handles can split a git repo; prefer `Rename-Item` |
| [Storage tiers](reference_storage_tiers.md) | NVMe C: + pen drive; a "2TB Toshiba" was rejected as defective/likely counterfeit |
| [Thread memory system](reference_thread_memory_system.md) | `/thread` `/checkpoint` `/consolidate` `/hydrate-context` for cross-session continuity |

## Working preferences

| Memory | Hook |
|--------|------|
| [No hardcoded secrets](feedback_no_hardcoded_secrets.md) | Reference system env vars; never write API keys into config files |
| [Prefer git bash](feedback_prefer_git_bash.md) | Use the Bash tool, not PowerShell; winget unavailable in git bash |
| [Use installed tools](feedback_use_installed_tools.md) | Prefer what's already on the system; check before suggesting installs |
| [Copy tone: confident + humor](feedback_copy_tone_confident_humor.md) | No apologetic/hedging phrasing; be confident, use light humor, fact-check claims |
| [Decks: fluid, not PDF-pages](feedback_deck_fluid_not_pdf.md) | HTML presentations should fill the window fluidly, not look like stacked fixed PDF pages |
| [Pitch: include the cost](feedback_pitch_include_the_cost.md) | Investment pitches must state price + payback upfront; audiences jump straight to "how much?" |

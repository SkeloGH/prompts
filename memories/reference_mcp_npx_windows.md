---
name: mcp-npx-hang-windows
description: npx-based MCP servers hang on this Windows machine; configure them as node + absolute path instead
metadata: 
  node_type: memory
  type: reference
---

On this Windows + nvm machine, MCP servers configured to launch via `npx` (e.g. `cmd /c npx -y <pkg>@latest`) hang with zero output, never complete the MCP `initialize` handshake, and Claude Code reports "Failed to connect". The broken layer is `npx` itself (the `@latest` registry lookup plus an extra child-process spawn) when spawned with piped non-TTY stdio. `node` directly and `cmd /c node ...` both work fine — so it is not nvm and not `cmd /c`.

Fix pattern for any stdio MCP server: install the package to a fixed location `%USERPROFILE%\.mcp-servers` via `npm install --prefix %USERPROFILE%\.mcp-servers <pkg>`, then configure the server as `command: "node"`, `args: ["%USERPROFILE%\\.mcp-servers\\node_modules\\<pkg>\\...\\index.js"]`. That location is outside the nvm version tree, so it survives `nvm use`.

mobile-mcp (`@mobilenext/mobile-mcp`) is installed there; all 4 project entries in `~/.claude.json` use this pattern. A backup of the pre-fix config is at `~/.claude.json.bak-mobilemcp-20260520`.

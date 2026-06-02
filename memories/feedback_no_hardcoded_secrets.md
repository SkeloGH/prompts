---
name: feedback-no-hardcoded-secrets
description: Never hardcode API keys/secrets into config files — reference system env vars instead
metadata: 
  node_type: memory
  type: feedback
---

The user does not want API keys or secrets written into config files (`.env`, docker-compose, etc.). Reference them from system environment variables instead.

**Why:** Keeps secrets off disk and out of anything that could be committed; the user manages secrets at the OS level.

**How to apply:** When a service needs a secret, check for an existing system env var first. The Zep API key lives in `LOCAL_DEV_ZEP_API_KEY` (Windows User scope). In docker-compose, inject via `environment: - SERVICE_KEY=${HOST_VAR}` rather than putting the value in `.env`. Caveat: env vars set after a shell launched aren't visible to that shell — read persisted values with `[Environment]::GetEnvironmentVariable(name,'User')` or `'Machine'`, and hydrate the session before running tools that interpolate them. Relates to [[feedback-use-installed-tools]].

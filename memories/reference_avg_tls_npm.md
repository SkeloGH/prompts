---
name: avg-https-inspection-breaks-node-tls
description: AVG antivirus HTTPS inspection breaks npm/node TLS; fix with NODE_EXTRA_CA_CERTS pointing to exported Windows root bundle
metadata: 
  node_type: memory
  type: reference
---

AVG Antivirus on this machine does HTTPS/SSL inspection ("Web/Mail Shield") — it intercepts TLS, decrypts, and re-signs certs with its own root `AVG Web/Mail Shield Root`. Browsers trust this (AVG installs the root in the Windows cert store) but Node.js uses its own bundled Mozilla CA list, so `npm install` of any **uncached** package fails with `UNABLE_TO_VERIFY_LEAF_SIGNATURE`. Cached packages still install fine, which masks the problem until a fresh package is needed.

Fix (secure — does NOT disable TLS verification): all Windows root CAs were exported to `%USERPROFILE%\.node-ca-bundle.pem` (PowerShell: `Get-ChildItem Cert:\LocalMachine\Root,Cert:\CurrentUser\Root` → base64 PEM). Run npm/node with `NODE_EXTRA_CA_CERTS=%USERPROFILE%\.node-ca-bundle.pem` so Node trusts what Windows trusts (including the AVG root). One-off: `export NODE_EXTRA_CA_CERTS=...` before the command. Permanent: `setx NODE_EXTRA_CA_CERTS "%USERPROFILE%\.node-ca-bundle.pem"`.

Re-export the bundle if AVG rotates its root cert. Do NOT use `npm config set strict-ssl false` — that disables verification entirely. The bundle trick does NOT work for gcloud / strict RFC-5280 validators — see [[avg-strict-tls-needs-domain-exceptions]] for those (use AVG domain exceptions instead). Related: [[mcp-npx-hang-windows]].

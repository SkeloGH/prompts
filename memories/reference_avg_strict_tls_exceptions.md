---
name: avg-strict-tls-needs-domain-exceptions
description: "AVG's root cert is non-RFC-compliant; strict-TLS tools (gcloud) reject it even via a CA bundle — fix is AVG domain exceptions, not the bundle trick"
metadata: 
  node_type: memory
  type: reference
---

The AVG Web/Mail Shield Root cert has `BasicConstraints` **not marked critical**, which violates RFC 5280 §4.2.1.9. Browsers and Node tolerate this (Windows' cert engine is lenient; Node's `NODE_EXTRA_CA_CERTS` path doesn't enforce it), so the [[avg-https-inspection-breaks-node-tls]] bundle trick works for npm/node. But strict RFC-5280 validators reject the cert outright — e.g. gcloud 569's bundled Python fails with `certificate verify failed: Basic Constraints of CA cert not marked critical` **even when the AVG root is present in a CA bundle**. The bundle trick does NOT generalize to gcloud or other strict-validator tools, and the cert can't be repaired (it's self-signed; we don't have AVG's private key).

The durable fix for strict-TLS tools: stop AVG from intercepting those domains. In AVG → Menu → Settings → **General → Exceptions**, add the hostnames as URL exceptions. AVG then leaves those connections alone, the tool sees the genuine Mozilla-trusted cert chain, and works with its own bundled `certifi`. This is *more* secure than the MITM, not less — it restores true end-to-end TLS, and the affected tools (npm, pip) do their own SHA hash verification anyway.

Exceptions added 2026-05-21 (safe set — trusted infra with tool-level integrity checks only):
`*.google.com`, `*.googleapis.com`, `*.gstatic.com`, `accounts.google.com`, `dl.google.com`, `registry.npmjs.org`, `pypi.org`, `files.pythonhosted.org`. Deliberately NOT added: broad catch-alls, or registries not actually used (crates.io, Go proxy, etc.) — an unused exception is coverage loss for no benefit.

gcloud-specific: after the AVG exceptions are in place, run `gcloud config unset core/custom_ca_certs_file` — the custom bundle is unnecessary (and pointing it at the node bundle actually re-triggers the failure, since that bundle contains the malformed AVG cert). gcloud was installed via `scoop install gcloud` (extras bucket); shims in `~/scoop/shims`.

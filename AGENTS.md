# Capability Intelligence Agent Contract

## Purpose

Build and maintain a standalone, local-first capability intelligence product. It inventories and explains agent capabilities; it is not an autonomous coding executor and it is not OpsTruth.

## Hard Boundaries

- Treat local metadata as evidence, not proof that a capability works.
- Never read or emit credentials, secret values, authorization headers, cookies, sessions, attachments, memories, conversation logs, shell snapshots, `.env` contents, or arbitrary user configuration.
- Use allowlisted source adapters. Do not recursively scan a home directory.
- Keep raw connector IDs, app IDs, server origins, install URLs, and absolute home paths out of reports.
- Mark inferred capabilities as inferred. Never convert missing metadata into a verified claim.
- Keep all discovered records, including unlabelled manifests, visible in coverage results.
- Do not install, enable, authenticate, invoke, update, or remove capabilities during inventory.
- Do not make network requests during a default scan.
- Do not merge this product into OpsTruth or the autonomous coding workflow library.

## Verification

Run:

```bash
npm run check
node bin/capability-intelligence.js coverage
node bin/capability-intelligence.js ask "create a product video"
```

Review coverage counts, unknown states, redaction findings, and source failures before claiming completion.

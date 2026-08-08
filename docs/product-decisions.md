# Product Decisions

## Current Product

Capability Intelligence remains a standalone, private, local-first alpha for a technical operator. It inventories capability metadata and evidence state. It does not execute capabilities, run autonomous coding workflows, or verify engineering outcomes.

## Interface

The CLI is the complete operator surface. The loopback dashboard remains one compact inspector with bounded inventory, evidence detail, diagnostics, and host comparison. Mobile is supported for inspection, not positioned as the primary operating environment.

## Search And Scale

CLI, API, and dashboard outcome matching use the same deterministic implementation. Type and risk remain explicit filters. Empty outcome search produces no matches, while an unfiltered inventory page lists artifacts. Inventory responses default to 50 records and reject limits above 200.

## Evidence And Risk

`verified: yes` requires an explicitly imported, validated `capability-observation.v1` receipt that matches the current artifact fingerprint. Structural or declared metadata cannot become verified execution evidence. V1 uses an operator trust boundary and does not authenticate issuers cryptographically. Risk remains a metadata-derived heuristic; every displayed level must retain its reasons and source context.

Cached connector `isEnabled` and `isAccessible` values remain metadata hints. They do not prove installed, enabled, runnable, authenticated, or verified lifecycle state.

## OpenClaw Integration

The product reads allowlisted OpenClaw plugin manifests as a native local source. It does not read OpenClaw configuration, credentials, agent stores, sessions, logs, or channel state. Manifest presence and startup declarations do not prove runtime activation.

## Export

Redacted export is intended for reduced-data, team-local evidence. It is not described as anonymous or safe to publish. Existing files are protected unless `--force` is explicit.

## Reconnaissance Provenance

Seven product-recon handoff/model drafts are retained as a dated historical snapshot of commit `d79bcc6`. None is current product authority because later commits resolved material search, CLI, API, schema, export, dashboard, and receipt findings. The archive remains outside package contents; canonical contracts and live CLI evidence govern current work.

## Distribution And Licence

The package remains `private: true`. No public repository, npm publication, binary distribution, or hosted launch is approved. There is no licence file, so public distribution remains blocked until ownership and licence terms are chosen deliberately.

## Hosted Direction

The hosted architecture is deferred product research. No accounts, organisation roles, billing, remote workstation crawl, telemetry upload, or hosted import are implemented. A hosted prototype first requires a threat model, tenant and retention design, reviewed redacted-import contract, legal terms, and a separate product decision.

## Remaining Product Questions

- When multiple independent receipt producers exist, what issuer-authentication mechanism is proportionate?
- Which cached plugin version, if any, can be proven active without reading private runtime state?
- Should connector enabled flags remain lifecycle hints or move entirely to metadata?
- Which non-Chromium browsers become supported if the product is distributed?
- What ownership and licence model applies before any public release?

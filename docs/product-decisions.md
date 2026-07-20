# Product Decisions

## Current Product

Capability Intelligence remains a standalone, private, local-first alpha for a technical operator. It inventories capability metadata and evidence state. It does not execute capabilities, run autonomous coding workflows, or verify engineering outcomes.

## Interface

The CLI is the complete operator surface. The loopback dashboard remains one compact inspector with bounded inventory, evidence detail, diagnostics, and host comparison. Mobile is supported for inspection, not positioned as the primary operating environment.

## Search And Scale

CLI, API, and dashboard outcome matching use the same deterministic implementation. Type and risk remain explicit filters. Empty outcome search produces no matches, while an unfiltered inventory page lists artifacts. Inventory responses default to 50 records and reject limits above 200.

## Evidence And Risk

`verified: yes` requires a future validated observed receipt. Until that contract exists, structural or declared metadata cannot become verified execution evidence. Risk remains a metadata-derived heuristic; every displayed level must retain its reasons and source context.

## OpenClaw Integration

The product reads allowlisted OpenClaw plugin manifests as a native local source. It does not read OpenClaw configuration, credentials, agent stores, sessions, logs, or channel state. Manifest presence and startup declarations do not prove runtime activation.

## Export

Redacted export is intended for reduced-data, team-local evidence. It is not described as anonymous or safe to publish. Existing files are protected unless `--force` is explicit.

## Distribution And Licence

The package remains `private: true`. No public repository, npm publication, binary distribution, or hosted launch is approved. There is no licence file, so public distribution remains blocked until ownership and licence terms are chosen deliberately.

## Hosted Direction

The hosted architecture is deferred product research. No accounts, organisation roles, billing, remote workstation crawl, telemetry upload, or hosted import are implemented. A hosted prototype first requires a threat model, tenant and retention design, reviewed redacted-import contract, legal terms, and a separate product decision.

## Remaining Product Questions

- What receipt format can safely support observed verification?
- Which cached plugin version, if any, can be proven active without reading private runtime state?
- Should connector enabled flags remain lifecycle hints or move entirely to metadata?
- Which non-Chromium browsers become supported if the product is distributed?
- What ownership and licence model applies before any public release?

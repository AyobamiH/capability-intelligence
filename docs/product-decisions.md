# Product Decisions

## Current Product

Capability Intelligence remains a standalone, public-source, local-first alpha for a technical operator. It inventories capability metadata and evidence state. It does not execute capabilities, run autonomous coding workflows, or verify engineering outcomes.

## Interface

The CLI is the complete operator surface. The loopback dashboard remains one compact inspector with bounded inventory, evidence detail, diagnostics, and host comparison. Mobile is supported for inspection, not positioned as the primary operating environment.

## Search And Scale

CLI, API, and dashboard outcome matching use the same deterministic implementation. Type and risk remain explicit filters. Empty outcome search produces no matches, while an unfiltered inventory page lists artifacts. Inventory responses default to 50 records and reject limits above 200.

The agent-facing `recommend` command is a decision aid over that search surface, not a broker. It rejects generic requests, ranks the complete relevant set, favors task-name and domain alignment over incidental concept matches, labels requested and candidate authority separately, and shows readiness blockers. Constraint clauses are not treated as requested capabilities. Read-only candidates are preferred; write and destructive candidates are deferred. A recommendation never grants permission or performs setup or execution.

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

John selected the MIT License and the public repository identity `AyobamiH/capability-intelligence`. MIT permits use, modification, redistribution, sublicensing, and commercial use when the copyright and licence notice are retained, and supplies the software without warranty. The independently verified npm release is `capability-intelligence@0.1.0`; its registry artifact hash matches the locally reviewed tarball. This decision does not approve a hosted launch or weaken runtime authority boundaries.

## Hosted Direction

The hosted architecture is deferred product research. No accounts, organisation roles, billing, remote workstation crawl, telemetry upload, or hosted import are implemented. A hosted prototype first requires a threat model, tenant and retention design, reviewed redacted-import contract, legal terms, and a separate product decision.

## Remaining Product Questions

- When multiple independent receipt producers exist, what issuer-authentication mechanism is proportionate?
- Which cached plugin version, if any, can be proven active without reading private runtime state?
- Should connector enabled flags remain lifecycle hints or move entirely to metadata?
- Which non-Chromium browsers become supported if the product is distributed?
- What operational support level is sustainable as public users exercise additional environments?

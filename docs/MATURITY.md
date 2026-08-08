# Capability Intelligence Maturity

## Current Level

Capability Intelligence is a private local-first alpha with a proven read-only inventory core, deterministic query surfaces, strict coverage accounting, bounded loopback inspection, and an explicit observed-receipt overlay. It is useful to one technical operator and has synthetic integration coverage. It is not a public package, hosted service, capability executor, or cryptographic attestation system.

## Intended Role

The product answers:

1. which allowlisted capabilities are structurally present;
2. what evidence exists for each lifecycle state;
3. which capabilities are relevant to an outcome;
4. what risks and authority boundaries apply;
5. whether an explicitly supplied observation matches the current artifact.

It complements the autonomous coding workflow library. The workflow chooses and governs work; Capability Intelligence inventories and explains capability evidence.

## Supported Use Cases

- local allowlisted inventory across Codex, shared skills, Claude skills, OpenClaw plugin manifests, cached app metadata, and workflow-library resources;
- strict source accounting and privacy scanning;
- deterministic outcome search, filters, host differences, duplicates, and artifact inspection;
- bounded loopback dashboard and API inspection;
- owner-only redacted export with explicit overwrite approval;
- explicit import of a size-bounded `capability-observation.v1` receipt bundle;
- current-artifact fingerprint matching and latest-observation lifecycle overlay.

## Unsupported Or Fragile Areas

- issuer authenticity is not cryptographically proven;
- no component generates receipts or invokes capabilities;
- enabled, authenticated, runnable, and verified states remain unknown unless evidence supports them;
- cached plugin versions do not identify the active runtime version;
- dashboard browser proof is Chromium-specific;
- local product-recon drafts have unresolved provenance and remain untracked;
- no public licence, remote repository, hosted tenancy, telemetry import, or distribution support exists.

## Architectural Boundaries

- adapters read only allowlisted metadata roots;
- raw connector IDs are used only for local deduplication and are never emitted;
- receipts are explicit inputs, never discovered by scanning;
- a receipt file is read, validated, and left unchanged;
- receipt overlays do not mutate source metadata or capability installations;
- schema-valid input is not described as cryptographic provenance;
- arbitrary sessions, logs, env files, memories, credentials, and user configuration remain excluded.

## Reliability And Verification

Normal acceptance requires `npm run check`: recursive syntax validation, deterministic fixture tests, and a strict real local scan. Direct UI changes additionally require the bounded browser audit. Receipt work requires passed, failed, stale, unmatched, malformed, unsafe, and repeated-observation fixtures.

Lifecycle truth is monotonic only within the evidence available to one report. A latest matching passed receipt yields `verified=yes`; a latest matching failed receipt yields `verified=no`; stale or unmatched receipts do not change lifecycle state. This means “verified in this report under this observation contract,” not “universally reliable.”

## Safety And Privacy

- default scans make no network request and perform no external mutation;
- the server binds to loopback and exposes GET-only inspection routes;
- export is the only file-writing product command and refuses overwrite by default;
- receipt import is read-only and rejects arbitrary fields, unsafe path/token patterns, oversized files, unsupported checks, and future-dated observations;
- credentials and secret values are never valid inventory or receipt evidence.

## Portability Goals

The core remains dependency-free Node.js with deterministic fixtures on supported Node versions. Platform-specific file permissions degrade safely on Windows. Browser audits remain optional until browser distribution is selected.

## Near-Term Direction

1. Use the v1 receipt contract with a second independent local producer before designing issuer authentication.
2. Resolve provenance for the existing untracked product-recon drafts.
3. Keep source coverage and lifecycle semantics under regression as local catalogues evolve.

## Longer-Term Direction

Only evidence may promote signed receipts, additional browsers, public distribution, or a hosted import service. Capability acquisition, automatic installation, and autonomous invocation remain separate product concerns and should not be folded into this inventory layer merely to make it appear more autonomous.

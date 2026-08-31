# Capability Intelligence Maturity

## Current Level

Capability Intelligence is an MIT-licensed, public-source, public-npm, local-first alpha with a proven read-only inventory core, deterministic query surfaces, strict coverage accounting, bounded loopback inspection, and an explicit observed-receipt overlay. Version `0.1.0` is verified on npm. It is useful to one technical operator and has synthetic integration coverage. Distribution does not make it a hosted service, capability executor, or cryptographic attestation system.

## Intended Role

The product answers:

1. which allowlisted capabilities are structurally present;
2. what evidence exists for each lifecycle state;
3. which capabilities are relevant to an outcome;
4. what risks and authority boundaries apply;
5. whether an explicitly supplied observation matches the current artifact.

It operates independently from workflow executors and engineering evidence systems. Another repository may appear as an allowlisted metadata source, but Capability Intelligence does not require that repository, govern its work, or inherit its roadmap.

## Current Product Direction

The current direction is to make capability evidence useful at the moment an agent chooses how to approach a concrete task. That means improving recommendation quality, explanation, confidence calibration, lifecycle blockers, source coverage, and receipt-backed observations while keeping every recommendation advisory.

Current development must preserve three boundaries:

1. inventory and recommendation do not become installation or execution;
2. structural metadata does not become runtime proof;
3. evidence from one environment does not become a universal capability claim.

No generic broker, autonomous invocation layer, workflow-engine integration, or multi-agent role system is active work.

## Supported Use Cases

- local allowlisted inventory across Codex, shared skills, Claude skills, OpenClaw plugin manifests, cached app metadata, and workflow-library resources;
- strict source accounting and privacy scanning;
- deterministic outcome search, filters, host differences, duplicates, and artifact inspection;
- bounded capability recommendation with authority labels, readiness blockers, and broad-outcome rejection;
- bounded loopback dashboard and API inspection;
- owner-only redacted export with explicit overwrite approval;
- explicit import of a size-bounded `capability-observation.v1` receipt bundle;
- current-artifact fingerprint matching and latest-observation lifecycle overlay.

## Unsupported Or Fragile Areas

- issuer authenticity is not cryptographically proven;
- no component generates receipts or invokes capabilities;
- recommendation is advisory only and does not install, authenticate, enable, or invoke its selected candidate;
- enabled, authenticated, runnable, and verified states remain unknown unless evidence supports them;
- cached plugin versions do not identify the active runtime version;
- dashboard browser proof is Chromium-specific;
- the dated product-recon archive describes commit `d79bcc6` and must not be treated as current behavior;
- public distribution is new and operational support remains limited; no hosted tenancy, telemetry import, or managed service exists.

## Architectural Boundaries

- adapters read only allowlisted metadata roots;
- raw connector IDs are used only for local deduplication and are never emitted;
- receipts are explicit inputs, never discovered by scanning;
- a receipt file is read, validated, and left unchanged;
- receipt overlays do not mutate source metadata or capability installations;
- schema-valid input is not described as cryptographic provenance;
- arbitrary sessions, logs, env files, memories, credentials, and user configuration remain excluded.

## Reliability And Verification

Normal maintainer acceptance requires `npm run check`: recursive syntax validation, deterministic fixture tests, and a strict real local scan. Public CI uses `npm run test:portable` because a clean runner does not contain the operator's allowlisted local capability sources. Direct UI changes additionally require the bounded browser audit. Receipt work requires passed, failed, stale, unmatched, malformed, unsafe, and repeated-observation fixtures.

The recommendation contract has three sanitized operator evaluations. The first covered nine broad engineering tasks. A second, independent 12-case task set exercised interrupted-run recovery, source-size checks, autonomy outcomes, multi-project proof, public-path checks, pre-commit validation, skill-gap recording, skill hygiene, session extraction, browser verification, npm readiness, and protected secret delivery. A third 12-case live service/media/app task set exercised Google Drive, Sheets, Slides, plugin settings, deep research, skill creation and installation, captions, Three.js, website video, product launch video, and PR video. It initially selected 10/12 accepted task surfaces and exposed missing authority verbs plus two ranking defects; after bounded target-term and intent-coverage correction it selected 12/12 with high confidence and no automatic action. The combined 33 cases are useful local evidence, not a claim of universal ranking quality.

The same live evaluation found 64 marketplace index records but only 62 materialized plugin manifests. Strict coverage now represents both missing manifests as structural placeholders with `present=no`, yielding complete accounting without claiming those plugins are installed or runnable. See `docs/evaluations/2026-08-31-service-media-recommendation.md`.

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

1. Exercise recommendation behavior in real task handoffs and additional environments, then improve explanation and confidence only where a failed selection or misleading authority classification is observed.
2. Use the v1 receipt contract with a second independent local producer before designing issuer authentication.
3. Keep source coverage, recommendation safety, lifecycle semantics, and the agent-facing documentation contract under regression as local catalogues evolve.

## Longer-Term Direction

Only evidence may promote signed receipts, additional browsers, stronger distribution support, or a hosted import service. Capability acquisition, automatic installation, and autonomous invocation remain separate product concerns and should not be folded into this inventory layer merely to make it appear more autonomous.

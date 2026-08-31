# Changelog

All notable changes to this project are documented in this file.

## Unreleased

### Added

- A read-only `recommend <outcome>` command that ranks task-level capability candidates, labels authority, exposes lifecycle blockers, and defers write or destructive matches.
- Explicit rejection of broad requests that do not contain a concrete, meaningful outcome.
- Separate requested-authority and candidate-authority alignment, with stop-clause handling and complete relevant-set ranking before pagination.
- Name-coverage ranking and context-aware intent normalization derived from a second independent 12-case agent-task evaluation.
- Target-term and intent-coverage ranking derived from a materially different 12-case service/media/app evaluation, including correct caption and Codex skill-creation selection.
- Read-only versus local-write intent classification for common agent verbs including summarize, prove, record, and extract.
- Local-write classification for add, animate, capture, and turn tasks, plus external-write classification for explicit plugin/app/connector permission-setting changes and named Google app mutations.
- Marketplace-index placeholders for catalogue entries whose plugin manifests are not locally materialized, preserving strict accounting with `present=no` rather than a false parse failure.
- An agent-facing documentation continuity contract that identifies product authorities, current direction, update triggers, and handoff requirements without coupling this product to a workflow executor.

### Boundaries

- Recommendation does not install, enable, authenticate, invoke, or grant authority to use a capability.

## 0.1.0 - 2026-08-08

Published to npm on 2026-08-10 as `capability-intelligence@0.1.0` from the exact reviewed public package artifact.

### Added

- Allowlisted, local-first inventory for agent skills, plugins, tools, connectors, hooks, and workflow resources.
- Explicit lifecycle truth from discovery through observed verification, with `unknown` retained as a first-class state.
- Deterministic CLI search, inspection, coverage, diagnostics, comparison, redacted export, and loopback dashboard surfaces.
- Bounded observed-receipt overlays that cannot silently convert structural metadata into runtime proof.
- Strict source coverage, privacy exclusions, portable tests, package controls, and public CI.

### Boundaries

- Default scans do not authenticate, install, enable, invoke, update, or remove capabilities.
- Reports exclude credentials, sessions, private runtime configuration, and absolute home paths.
- The release is a local-first alpha, not a hosted service or autonomous capability executor.

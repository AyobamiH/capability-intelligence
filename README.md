# Capability Intelligence

[![Validate](https://github.com/AyobamiH/capability-intelligence/actions/workflows/validate.yml/badge.svg)](https://github.com/AyobamiH/capability-intelligence/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Capability Intelligence answers three questions:

1. What capabilities are present or discoverable?
2. Are they installed, enabled, authenticated, runnable, or verified?
3. What authority, dependencies, and risks would be involved in using them?

It is a standalone, local-first product. It does not execute autonomous coding workflows and does not verify engineering claims like OpsTruth.

## Agent Orientation

Capability Intelligence is heading toward better **agent decision support**: truthful capability discovery, lifecycle readiness, bounded recommendation, authority visibility, and explicit evidence gaps. It is not heading toward workflow execution, automatic installation, a generic capability broker, or a multi-agent control plane without new evidence and a separate product decision.

Available now:

- allowlisted local inventory across skills, plugins, app tools, connectors, commands, routes, schemas, templates, and documentation controls;
- strict source coverage and privacy validation;
- deterministic search, inspection, diagnostics, host comparison, and redacted export;
- advisory `recommend` decisions with confidence, authority, name and intent coverage, and lifecycle blockers;
- explicit observed-receipt overlays tied to current artifact fingerprints;
- a bounded loopback dashboard and read-only local API.

Agents should read `AGENTS.md`, `docs/product-contract.md`, `docs/MATURITY.md`, and `docs/BACKLOG.md` before changing product direction. `docs/MATURITY.md` states current proof and limitations; `docs/BACKLOG.md` owns priority and acceptance. Material behavior changes must update those authorities and `CHANGELOG.md` before handoff.

## Distribution

The source is released under the [MIT License](LICENSE) at `AyobamiH/capability-intelligence`. The public npm package is `capability-intelligence`, with `0.1.0` as the first published version.

```bash
npm install --global capability-intelligence
capability-intelligence coverage
```

For source development:

```bash
git clone https://github.com/AyobamiH/capability-intelligence.git
cd capability-intelligence
npm ci --ignore-scripts --no-audit --no-fund
npm run test:portable
```

## Current Sources

The default scanner uses an allowlist rooted at the current user's home directory:

- Codex system and user skills
- shared `.agents/skills`
- Claude skills
- the local Codex plugin catalogue and marketplace policy, including visible `present=no` placeholders for indexed entries whose manifests are not materialized
- installed Codex plugin metadata
- cached app-tool schemas and safety annotations
- cached app-directory connector metadata
- OpenClaw bundled, local-extension, and managed-package plugin manifests
- the autonomous coding workflow library's skills, scripts, routes, schemas, templates, and documentation controls

It deliberately excludes authentication state, environment values, sessions, attachments, memories, logs, credentials, shell snapshots, and arbitrary configuration.

## CLI

```bash
node bin/capability-intelligence.js scan
node bin/capability-intelligence.js scan --json
node bin/capability-intelligence.js scan --strict --summary
node bin/capability-intelligence.js coverage
node bin/capability-intelligence.js ask "create a product video"
node bin/capability-intelligence.js recommend "review a GitHub pull request"
node bin/capability-intelligence.js recommend "review a GitHub pull request" --json
node bin/capability-intelligence.js inspect plugin:hyperframes
node bin/capability-intelligence.js doctor
node bin/capability-intelligence.js risks --level high
node bin/capability-intelligence.js duplicates
node bin/capability-intelligence.js unlabelled
node bin/capability-intelligence.js unlabelled --json
node bin/capability-intelligence.js receipts --input /path/to/receipts.json
node bin/capability-intelligence.js scan --receipts /path/to/receipts.json --json
node bin/capability-intelligence.js diff --host codex --host claude
node bin/capability-intelligence.js export --output /tmp/capabilities.json --redacted
node bin/capability-intelligence.js export --output /tmp/capabilities.json --redacted --force
node bin/capability-intelligence.js serve --port 4317
```

Outcome search returns only artifacts with a positive lexical or concept match. Lifecycle readiness helps order those relevant results; empty or unrelated queries do not receive readiness-ranked fallback results.

`recommend` turns a concrete outcome into one bounded agent-facing decision record. It prefers task-level, lower-authority candidates, reports confidence, requested authority, candidate-authority alignment, name coverage, intent coverage, and unproven lifecycle gates, and defers write or destructive matches. Generic name words such as `create`, `new`, and `add` cannot outrank the requested object merely because they appear in a capability name. Negative clauses such as `without writes` do not become tool-selection targets, while useful context such as `before a local commit` remains available to distinguish a pre-commit check from an unrelated scanner. Broad prompts are rejected instead of being dressed up as useful recommendations. The command evaluates the complete relevant set rather than only the first display page, but never installs, enables, authenticates, or invokes a capability; use still requires a separate authority decision.

CLI options are command-specific. Unknown options and repeated singleton options fail instead of being ignored. `risks --level` accepts only `critical`, `high`, `medium`, `low`, or `unknown`.

`unlabelled` makes plugin-manifest metadata gaps inspectable. It lists every catalogue plugin without the standard capability field together with its safe description, manifest category, broad inferred labels, declared integration-surface counts, risk, and lifecycle. Inferred purpose remains inferred, and every unobserved runtime state remains unknown.

Connector directory flags are retained only as metadata hints. They do not set installed, enabled, authenticated, runnable, or verified lifecycle state.

Observed receipts are an explicit local overlay. A bounded v1 receipt must match the current artifact fingerprint and required observation checks before it can affect the report. Receipt import does not invoke capabilities or mutate their sources, and the v1 operator-trust boundary is not a cryptographic issuer attestation.

The loopback dashboard uses the same outcome-matching contract as the CLI. Inventory requests are paginated with an exact total and a default page size of 50. Evidence detail includes structural relationships, while diagnostics and host comparison remain read-only views.

The local API exposes bounded `GET` routes for inventory, coverage, search, artifact detail, diagnostics, and host comparison. It has no mutation route and does not rescan sources while the server is running.

All commands are read-only except `export`, which writes the requested report, and `serve`, which starts a local HTTP process. Export refuses to replace an existing file unless `--force` is explicit and writes the resulting file with owner-only permissions where the platform supports them. Neither command changes a capability source.

## Lifecycle Truth

Every artifact carries separate state:

```text
discovered -> present -> installed -> enabled -> authenticated -> runnable -> verified
```

`unknown` is a first-class answer. `not_applicable` is distinct from both `no` and `unknown`. A cached tool schema does not prove authentication. An installed plugin does not prove it is enabled. A manifest description does not prove runtime behaviour.

## Development

```bash
npm install --package-lock-only --ignore-scripts
npm run test:portable
npm run check
```

`test:portable` is the deterministic public CI gate. `check` additionally validates a strict scan of the current operator's allowlisted local capability sources; CI cannot manufacture that private local source surface.

See [docs/product-contract.md](docs/product-contract.md), [docs/source-coverage.md](docs/source-coverage.md), [docs/privacy.md](docs/privacy.md), [docs/product-decisions.md](docs/product-decisions.md), [docs/observed-receipts.md](docs/observed-receipts.md), [docs/BACKLOG.md](docs/BACKLOG.md), [docs/MATURITY.md](docs/MATURITY.md), the [service/media recommendation evaluation](docs/evaluations/2026-08-31-service-media-recommendation.md), and [docs/saas-architecture.md](docs/saas-architecture.md).

Bounded product reconnaissance is indexed in [docs/product-recon/README.md](docs/product-recon/README.md), including the [unlabelled plugin manifest audit](docs/product-recon/UNLABELLED_PLUGIN_MANIFEST_AUDIT.md). The seven pre-contract handoff/model drafts are retained in a dated, package-excluded historical archive with a per-file disposition; they are not current product authority.

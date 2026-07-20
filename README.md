# Capability Intelligence

Capability Intelligence answers three questions:

1. What capabilities are present or discoverable?
2. Are they installed, enabled, authenticated, runnable, or verified?
3. What authority, dependencies, and risks would be involved in using them?

It is a standalone, local-first product. It does not execute autonomous coding workflows and does not verify engineering claims like OpsTruth.

## Current Sources

The default scanner uses an allowlist rooted at the current user's home directory:

- Codex system and user skills
- shared `.agents/skills`
- Claude skills
- the local Codex plugin catalogue and marketplace policy
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
node bin/capability-intelligence.js inspect plugin:hyperframes
node bin/capability-intelligence.js doctor
node bin/capability-intelligence.js risks --level high
node bin/capability-intelligence.js duplicates
node bin/capability-intelligence.js unlabelled
node bin/capability-intelligence.js unlabelled --json
node bin/capability-intelligence.js diff --host codex --host claude
node bin/capability-intelligence.js export --output /tmp/capabilities.json --redacted
node bin/capability-intelligence.js export --output /tmp/capabilities.json --redacted --force
node bin/capability-intelligence.js serve --port 4317
```

Outcome search returns only artifacts with a positive lexical or concept match. Lifecycle readiness helps order those relevant results; empty or unrelated queries do not receive readiness-ranked fallback results.

CLI options are command-specific. Unknown options and repeated singleton options fail instead of being ignored. `risks --level` accepts only `critical`, `high`, `medium`, `low`, or `unknown`.

`unlabelled` makes plugin-manifest metadata gaps inspectable. It lists every catalogue plugin without the standard capability field together with its safe description, manifest category, broad inferred labels, declared integration-surface counts, risk, and lifecycle. Inferred purpose remains inferred, and every unobserved runtime state remains unknown.

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
npm run check
```

See [docs/product-contract.md](docs/product-contract.md), [docs/source-coverage.md](docs/source-coverage.md), [docs/privacy.md](docs/privacy.md), [docs/product-decisions.md](docs/product-decisions.md), and [docs/saas-architecture.md](docs/saas-architecture.md).

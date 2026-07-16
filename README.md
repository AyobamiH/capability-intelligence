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
node bin/capability-intelligence.js diff --host codex --host claude
node bin/capability-intelligence.js export --output /tmp/capabilities.json --redacted
node bin/capability-intelligence.js serve --port 4317
```

All commands are read-only except `export`, which writes the requested report, and `serve`, which starts a local HTTP process. Neither command changes a capability source.

## Lifecycle Truth

Every artifact carries separate state:

```text
discovered -> present -> installed -> enabled -> authenticated -> runnable -> verified
```

`unknown` is a first-class answer. A cached tool schema does not prove authentication. An installed plugin does not prove it is enabled. A manifest description does not prove runtime behaviour.

## Development

```bash
npm install --package-lock-only --ignore-scripts
npm run check
```

See [docs/product-contract.md](docs/product-contract.md), [docs/source-coverage.md](docs/source-coverage.md), [docs/privacy.md](docs/privacy.md), and [docs/saas-architecture.md](docs/saas-architecture.md).

# Repository knowledge entry point

## Purpose and authority
[Product contract](../../docs/product-contract.md) owns scope and truth semantics: local-first capability inventory and explanation, not execution or engineering-outcome verification. Read [AGENTS](../../AGENTS.md), [maturity](../../docs/MATURITY.md), [backlog](../../docs/BACKLOG.md), and [product decisions](../../docs/product-decisions.md) before selecting work. This map does not replace their precedence.

## Architecture and entry paths
- [CLI entry](../../bin/capability-intelligence.js) and [CLI implementation](../../src/cli.js) own command dispatch.
- [Scanner](../../src/scanner.js) and [adapters](../../src/adapters/) own allowlisted metadata discovery.
- [Recommendation policy](../../src/recommend-policy.js), [recommendations](../../src/recommend.js) and [receipts](../../src/receipts.js) separate advisory relevance from observed execution evidence.
- [Local server](../../src/server.js) serves the bounded inspector/API; [privacy](../../docs/privacy.md) and [source coverage](../../docs/source-coverage.md) constrain collection.

## Setup and checks
[README](../../README.md) documents Node source installation: npm ci --ignore-scripts --no-audit --no-fund, then npm run test:portable. [Package scripts](../../package.json) define lint, tests and strict scan. npm run check additionally scans local allowlisted metadata; it is not equivalent to the portable fixture suite. AGENTS also requires coverage, outcome search and receipt checks for applicable product work. Use disposable synthetic roots for tests; do not copy host metadata into Git.

## Durable lessons and boundaries
[Product decisions](../../docs/product-decisions.md) explains why present, enabled and verified are distinct. Receipt overlays must match artifact fingerprints; v1 operator trust is not cryptographic issuer authentication. Recommendations do not grant authority or invoke capabilities. Default scans make no network requests and must not read credentials, sessions, memories or arbitrary home configuration. Redacted export is not a promise of anonymity or permission to publish.

## Maintenance
Update the existing contract, maturity, backlog, decisions and changelog as AGENTS requires for material changes; update this map with changed paths/commands. This foundation is behavior-neutral navigation and security guidance, not a product capability or release claim. Preserve rationale/verified lessons, not raw chats, secrets or stale live status. Validate with node .agents/validate-foundations.mjs.

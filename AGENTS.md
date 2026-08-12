# Capability Intelligence Agent Contract

## Purpose

Build and maintain a standalone, local-first capability intelligence product. It inventories and explains agent capabilities; it is not an autonomous coding executor and it is not OpsTruth.

## Agent Start Sequence

Before broad product work, read these authorities in order:

1. `AGENTS.md` for hard boundaries and completion rules.
2. `docs/product-contract.md` for product scope and truth semantics.
3. `docs/MATURITY.md` for what is proven, fragile, unsupported, and currently being matured.
4. `docs/BACKLOG.md` for the evidence-backed queue and acceptance conditions.
5. `docs/product-decisions.md` before changing a durable product or distribution decision.
6. `README.md` for the public interface and supported commands.

Select work from the current backlog or record the new evidence that justifies changing it. Do not infer a new direction from an available tool, an adjacent repository, or an interesting implementation idea.

## Documentation Continuity

Documentation is part of the product change, not cleanup deferred to another agent.

- A material capability, source, lifecycle, recommendation, or interface change updates `README.md`, `docs/MATURITY.md`, and `CHANGELOG.md`.
- A priority, dependency, status, or acceptance change updates `docs/BACKLOG.md`.
- A scope, safety, evidence, or execution-boundary change updates `docs/product-contract.md`; durable decisions also update `docs/product-decisions.md`.
- A distribution change updates `README.md`, `docs/MATURITY.md`, `docs/product-decisions.md`, and `CHANGELOG.md` as applicable.
- A historical evidence file never becomes current authority merely because it is newer or more detailed.

Before handoff, reconcile changed behavior with these authorities and run the documentation-continuity test through `npm test`. If no product document changed, state why the change is behavior-neutral.

## Hard Boundaries

- Treat local metadata as evidence, not proof that a capability works.
- Never read or emit credentials, secret values, authorization headers, cookies, sessions, attachments, memories, conversation logs, shell snapshots, `.env` contents, or arbitrary user configuration.
- Use allowlisted source adapters. Do not recursively scan a home directory.
- Keep raw connector IDs, app IDs, server origins, install URLs, and absolute home paths out of reports.
- Mark inferred capabilities as inferred. Never convert missing metadata into a verified claim.
- Keep all discovered records, including unlabelled manifests, visible in coverage results.
- Do not install, enable, authenticate, invoke, update, or remove capabilities during inventory.
- Do not make network requests during a default scan.
- Do not merge this product into OpsTruth or the autonomous coding workflow library.
- Do not make another repository a runtime dependency merely because its metadata is one allowlisted inventory source.

## Verification

Run:

```bash
npm run check
node bin/capability-intelligence.js coverage
node bin/capability-intelligence.js ask "create a product video"
node --test test/receipts.test.js
```

Review coverage counts, unknown states, receipt overlay findings, redaction findings, and source failures before claiming completion.

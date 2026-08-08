# Contributing

Capability Intelligence is an evidence-first, local-first inventory. Contributions must preserve the distinction between structural metadata and observed runtime proof.

## Development

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run test:portable
npm run check
```

`npm run test:portable` is the deterministic public CI gate. `npm run check` additionally runs a strict scan of the current operator's allowlisted local capability sources and is required before maintainer acceptance when that environment is available.

## Change Boundaries

- Add source adapters through explicit allowlists; never recursively scan a home directory.
- Do not read or emit credentials, sessions, conversations, arbitrary configuration, or secret values.
- Keep inferred metadata labelled as inferred.
- Do not claim a capability is authenticated, runnable, or verified without matching observed evidence.
- Add deterministic synthetic tests for new parsing, lifecycle, search, receipt, and privacy behavior.
- Prefer exact-file commits and keep generated inventory, screenshots, caches, and local evidence out of Git.
- External mutations such as installation, authentication, publication, or service calls require separate explicit authority.

Run the browser audit for dashboard changes:

```bash
npm run audit:browser
```

# Source Coverage

## Allowlisted Sources

| Source | Records | Authority |
|---|---|---|
| Codex plugin catalogue | Plugin manifests, marketplace policy, bundled skills and components | Read-only |
| Installed plugin cache | Installed versions, bundled skills, declared integrations, agents, commands, hooks, scripts, and UI components | Read-only |
| Codex/Agents/Claude skill roots | Skill metadata and structural resources | Read-only |
| App tool cache | Tool names, descriptions, schemas counts, and safety annotations | Read-only |
| App directory cache | De-duplicated connector names, descriptions, availability flags, and plugin labels | Read-only |
| OpenClaw native plugin manifests | Bundled extensions, local extensions, and managed `@openclaw` package manifests | Read-only |
| Coding workflow library | Skills, scripts, routes, schemas, templates, and control docs | Read-only |

## Explicit Exclusions

The scanner never reads:

```text
auth.json
sessions/
archived_sessions/
attachments/
memories/
shell_snapshots/
logs/
credentials/
.env
arbitrary config.toml values
raw tool-call history
```

## Unlabelled Manifests

The initial environment contained 111 plugin manifests with no standard `interface.capabilities` list. They are not skills and they are not discarded. Each remains a plugin artifact with:

```text
manifestCapabilityStatus: unlabelled
classificationEvidence: structural or inferred
lifecycle.verified: unknown
```

The exact count is environment-dependent and is recalculated on every scan.

Use `capability-intelligence unlabelled` or `capability-intelligence unlabelled --json` to inspect the retained set. The report uses already-normalised safe metadata and does not inspect credentials, private configuration, or capability runtime state. A description or inferred broad label explains likely purpose only; it does not prove installation, authentication, runnability, or verification.

## Initial Hard-Cutover Baseline

The first complete local scan on 16 July 2026 reconciled:

```text
6,353 capability artifacts
180 plugin manifests
111 unlabelled plugin manifests retained
7 installed plugin versions
734 skills across catalogue, installed plugins, and local roots
161 app integration declarations
9 MCP server declarations
250 cached app-tool definitions
4,768 de-duplicated connector identities
32 coding-workflow routes
10 available source surfaces
0 unaccounted source records
```

These numbers describe one local environment at one point in time. They are inventory evidence, not proof that every capability is authenticated, runnable, or reliable.

## Current Maturity Snapshot

A strict scan on 20 July 2026 accounted for:

```text
6,558 capability artifacts
13 available source surfaces
249 plugin artifacts
723 skills
252 cached app-tool definitions
4,838 de-duplicated connector identities
69 OpenClaw native plugin manifests
39 coding-workflow routes
111 unlabelled Codex catalogue manifests retained
0 unaccounted source records
```

This is a later environment snapshot, not a replacement for the dated hard-cutover baseline. Counts will change as local catalogues, caches, skills, plugins, and workflow resources change.

## OpenClaw Boundary

The OpenClaw adapter reads only `openclaw.plugin.json` files in three allowlisted layouts. It does not read `openclaw.json`, agent databases, channel credentials, sessions, auth stores, logs, or request payloads. `enabledByDefault` and startup declarations are retained as manifest metadata; lifecycle enablement and authentication remain `unknown` until a separate safe runtime-evidence contract exists.

## Coverage Failure

Strict mode fails when:

- a discovered manifest or skill cannot be represented;
- a JSON source cannot be parsed;
- source enumeration and artifact counts disagree;
- unsafe fields or absolute home paths reach a redacted export;
- duplicate artifact identifiers would overwrite records;
- an adapter reports an internal error.

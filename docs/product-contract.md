# Product Contract

## Positioning

Capability Intelligence is an environment and outcome-readiness layer for agent-powered work.

It does not replace:

- a skill or plugin registry;
- a package manager;
- an MCP gateway;
- an autonomous workflow engine;
- an evidence verifier.

It consumes metadata from those systems and explains what a specific environment can plausibly do now.

## Core Truth Rules

1. Discovered is not installed.
2. Installed is not enabled.
3. Enabled is not authenticated.
4. Authenticated is not runnable.
5. Runnable is not verified.
6. Manifest claims are declared evidence.
7. Classification derived from files or language is inferred evidence.
8. Cached tool definitions are not proof that a connector is currently reachable.
9. Missing metadata remains unknown and visible.
10. No default command invokes an external capability.

## Artifact Types

- plugin
- skill
- app tool
- connector
- hook
- agent
- command
- helper script
- workflow route
- schema
- template
- documentation control

## Capability Evidence

Capability statements carry one of:

- `declared`: explicitly stated by a manifest or tool annotation;
- `structural`: proven by a file or component being present;
- `inferred`: derived conservatively from metadata or naming;
- `observed`: supplied by a future validated execution receipt;
- `unknown`: insufficient evidence.

Only observed evidence may move a capability to `verified=yes`.

## Hard Cutover Acceptance

- All discovered plugin manifests are represented.
- All plugin-bundled `SKILL.md` files are represented.
- Manifests without standard capability labels are retained and counted.
- Local Codex, Agents, and Claude skills are represented.
- Cached tool definitions are represented without raw connector identifiers.
- Cached connector records are de-duplicated and represented without install URLs or IDs.
- Coding workflow library resources are represented without copying their implementation.
- Coverage can distinguish absent source roots from adapter failures.
- Strict mode fails on silent loss, parse failures, unsafe output, or source count mismatch.

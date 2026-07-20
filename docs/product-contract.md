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
11. Outcome search requires a positive lexical or concept match; readiness may rank relevant results but never creates relevance.
12. CLI commands reject unsupported options, repeated singleton options, and risk levels outside the documented risk model before scanning source metadata.
13. Unlabelled plugin manifests remain directly inspectable with their safe descriptions, categories, inferred broad labels, integration surfaces, and unknown runtime states.
14. OpenClaw plugin manifests prove structural presence only; they do not prove enablement, authentication, runnability, or successful execution.
15. Inventory browsing and outcome search share one deterministic query implementation, but an empty outcome search remains a no-match rather than an unfiltered inventory.
16. Loopback inventory responses are bounded to 200 artifacts per request and default to 50.
17. Export never overwrites an existing path unless `--force` is explicit.

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
- resource provider
- user interface
- workflow
- plugin installation
- app integration
- MCP server

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
- Nested lifecycle, evidence, risk, source-accounting, graph, finding, and coverage shapes are schema constrained and runtime validated.
- The dashboard exposes bounded inventory, evidence detail, diagnostics, and host differences without adding mutation routes.

# SaaS Architecture

## Local Plane

- allowlisted collectors
- metadata normalisation
- capability graph
- lifecycle readiness
- duplicate and drift detection
- deterministic outcome search
- policy and risk summaries
- local dashboard
- redacted export

## Hosted Plane

- public capability metadata
- private team catalogues
- outcome-to-capability mappings
- compatibility intelligence
- approved capability sets
- version and configuration drift
- publisher evidence profiles

## Boundary

The hosted service does not execute local tools. A chosen agent host remains responsible for execution and its own approval system.

## Integration Direction

Capability Intelligence can consume:

- Codex marketplaces and plugin manifests;
- skills.sh metadata;
- Agent Package Manager manifests and lockfiles;
- the official MCP Registry;
- local agent skill roots;
- tool schemas exposed by supported hosts.

Those systems remain the source of distribution truth. Capability Intelligence adds environment readiness, outcome matching, compatibility, and evidence state.

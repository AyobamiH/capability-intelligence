# Privacy And Safety

## Local First

Inventory runs locally and makes no network request. The local UI binds to loopback by default.

## Data Minimisation

Reports keep capability metadata and omit operational secrets. Raw connector IDs, application IDs, URLs containing private identifiers, server origins, authorization material, environment values, input payloads, and output payloads are never included.

## Redacted Export

`export --redacted` additionally removes source descriptions that may have been authored privately, replaces local source paths with semantic labels, and omits starter prompts from non-catalogue sources.

Redaction is data minimisation, not anonymity and not approval for public distribution. New exports use owner-only permissions where supported. An existing path is preserved unless the operator supplies `--force`.

## SaaS Boundary

A future hosted control plane may receive only an explicitly generated redacted export. It must not remotely crawl a workstation and must not require uploading skill bodies, scripts, prompts, sessions, or credentials.

No hosted import is implemented or approved. Before one exists, it requires a threat model, a reviewed import schema, retention and deletion rules, tenant isolation, and sample-export review.

## Unsafe Source Handling

An adapter must fail closed when a source cannot be parsed safely. Coverage reports the failure without echoing file contents.

# Observed Receipt Contract

`capability-observation.v1` is a local evidence overlay for one inventory report. It does not invoke a capability, discover receipt files, change a capability source, or authenticate an issuer cryptographically.

## Commands

```bash
capability-intelligence receipts --input /path/to/receipts.json
capability-intelligence receipts --input /path/to/receipts.json --json
capability-intelligence scan --receipts /path/to/receipts.json --json
```

The operator must name the input explicitly. The file is limited to 1 MiB and 1,000 records, is never rewritten, and is not copied into product state.

## Required Evidence

A passed receipt must contain these bounded checks:

- `artifact_identity_matched`
- `invocation_completed`
- `expected_outcome_observed`
- `no_secret_output`

It also carries an artifact fingerprint built from the current safe identity, source, hosts, and capability labels. A receipt for an absent or changed artifact is reported as unmatched or stale and cannot change lifecycle state.

Only the latest receipt per artifact is applied. A latest matching pass sets `verified=yes`; a latest matching failure sets `verified=no`. The source inventory remains unchanged.

The dedicated `receipts` command exits `2` for stale or unmatched evidence. A normal overlaid scan remains usable with a warning, while `scan --strict --receipts ...` exits `2` unless the receipt report passes.

## Trust Boundary

The v1 contract treats explicit operator import as the trust decision. Validation proves bounded shape, current-artifact identity, supported checks, safe metadata, and time sanity. It does not prove who created the file. Cryptographic issuer authentication remains a separate backlog item that requires evidence from multiple real receipt producers.

## Example Shape

```json
{
  "schemaVersion": "1.0",
  "receipts": [
    {
      "receiptId": "local-check-2026-01-01",
      "artifactId": "plugin:example",
      "artifactFingerprint": "sha256:<64 lowercase hexadecimal characters>",
      "contract": "capability-observation.v1",
      "outcome": "passed",
      "observedAt": "2026-01-01T12:00:00.000Z",
      "environment": "fixture",
      "issuer": "local-verifier",
      "checks": [
        "artifact_identity_matched",
        "invocation_completed",
        "expected_outcome_observed",
        "no_secret_output"
      ]
    }
  ]
}
```

Do not put command output, prompts, paths, tokens, headers, credentials, source content, or free-form notes in a receipt.

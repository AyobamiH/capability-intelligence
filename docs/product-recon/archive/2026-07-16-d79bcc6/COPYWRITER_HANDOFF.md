# Capability Intelligence Copywriter Handoff

## Evidence Boundary

This brief documents current product truth and copy needs. It does not approve final marketing language. Claims must remain inside the classifications and evidence in `PRODUCT_DOSSIER.md`.

## Product Explanation

### Confirmed One-Line Explanation

Capability Intelligence is a local, read-only inventory that shows which agent-related capabilities are discoverable and what is known about their readiness, evidence, and risk.

### What It Does

- Scans an allowlisted set of local metadata sources.
- Normalises skills, plugins, installed plugin versions, app tools, connectors, agents, commands, hooks, workflows, schemas, templates, and documentation resources.
- Keeps discovered, present, installed, enabled, authenticated, runnable, and verified separate.
- Reports source-accounting coverage and preserves unknowns.
- Supports search, inspection, risk review, duplicate detection, host difference, and redacted export.
- Provides a CLI and a loopback dashboard.

### What It Does Not Do

- Execute a capability.
- Install or enable a plugin.
- Authenticate a connector.
- Prove a tool is currently reachable or reliable.
- Verify engineering claims like OpsTruth.
- Run autonomous coding workflows.
- Upload the workstation inventory by default.
- Provide accounts, teams, billing, or administration.

## Audience

### Primary Functional Audience

**INFERRED:** Technical operators and maintainers of agent environments. They are likely comfortable with terminals, local files, manifests, tools, and plugins, but they should not need repository knowledge to understand the product's conclusions.

### Knowledge Assumptions

The current copy assumes users understand:

- Plugin and skill.
- Connector and app tool.
- Host.
- Manifest.
- Read-only.
- Metadata.

The following terms require in-product explanation:

- Source coverage.
- Classification evidence.
- Structural versus inferred evidence.
- Lifecycle readiness.
- Unlabelled manifest.
- Open-world effect.
- Verified.

## Core User Goals

1. Understand what capabilities exist in the current environment.
2. Avoid confusing installation or cached metadata with operational readiness.
3. Find a plausible resource for an intended outcome.
4. Understand risk and evidence before choosing a resource.
5. Diagnose missing, failed, duplicated, or host-specific capability metadata.
6. Produce a redacted report for another person or system.

## User Anxieties And Objections

- Will this read secrets or private conversations?
- Does a listed capability actually work?
- Does `enabled` mean authenticated and reachable?
- Does a pass mean every capability is verified?
- Is a low-risk label a security guarantee?
- Will the product execute or mutate anything?
- Can the redacted export be shared publicly?
- Why are there thousands of connectors and duplicate skills?
- Why did search return an apparently unrelated result?

## Evidence-Supported Value Proposition

**CONFIRMED:** The product combines fragmented local capability metadata into a deterministic inventory with explicit lifecycle, evidence, risk, source coverage, and unknown states.

Do not claim that it finds the `best` tool, guarantees compatibility, verifies every capability, secures the environment, or prevents all unsafe agent behaviour.

## Current Voice

### Characteristics

- Technical and compact.
- Declarative.
- Cautious about proof.
- Comfortable stating `unknown`.
- Focused on source accounting and evidence boundaries.
- British/neutral spelling is not consistently established; use one style consistently once approved.

### Owner-Supported Direction

The product should not sound like generic AI marketing. Avoid hype, vague intelligence claims, futurism, and decorative language. Clarity should come from precise distinctions and useful explanations.

## Unsupported Claims To Avoid

- Every capability is available.
- Every listed integration is installed.
- Enabled means connected.
- The inventory is complete across the whole computer.
- Capability Intelligence verifies tools work.
- Capability Intelligence executes workflows.
- Capability Intelligence replaces OpsTruth.
- The redacted export is anonymous or safe for public release.
- Risk labels are a security audit.
- Search recommends the best or most compatible tool.
- Hosted team features exist.
- The product is open source, enterprise-ready, production-ready, or commercially available.

## Product Glossary

| Preferred term | Definition | Avoid | Reason | Status |
|---|---|---|---|---|
| Capability Intelligence | Product name | CapabilityIntel, CI | No alternate product name is established | Established |
| Artifact | A normalised capability-related record | Asset | Asset implies media/file | Established |
| Capability | A plausible ability represented by metadata | Guaranteed function | Operation is not proven | Established |
| Source | An allowlisted metadata surface | Live integration | Most sources are local files/caches | Established |
| Inventory coverage | Whether discovered source records were accounted for | Complete coverage (alone) | Can imply verification | Recommended |
| Lifecycle | Separate readiness states | Status (alone) | A single status is insufficient | Established |
| Readiness | Highest known lifecycle state used as a summary | Working | Runnability may be unknown | Established |
| Evidence | Basis for a classification | Proof (for all levels) | Declared/inferred is not proof | Established |
| Declared | Explicitly present in manifest/tool metadata | Confirmed working | Runtime not observed | Established |
| Structural | Supported by a file or component existing | Verified | Existence is not execution | Established |
| Inferred | Derived conservatively from names or metadata language | Known | Inference can be wrong | Established |
| Observed | Supported by a validated future execution receipt | Tested (without receipt) | Receipt contract is not implemented | Planned |
| Unknown | Insufficient evidence | Failed | Unknown is not failure | Established |
| Risk | Metadata-derived caution | Security score | No live security assessment | Established |
| Unlabelled manifest | Plugin manifest without standard capability labels | Missing skill | The 111 records are plugins | Established |
| Redacted export | Report with selected private fields removed | Anonymous export | Redaction is not anonymity | Established |

## Terminology Conflicts

| Current wording | Conflict | Copy decision needed |
|---|---|---|
| Complete coverage | Could mean complete operational proof; code means source accounting | Prefer `Inventory coverage complete` if approved |
| Find an outcome or capability | Dashboard is substring filtering; API is scored search | Align product behaviour and wording |
| Compatibility in meta description | No current compatibility screen/model | Remove or explain current host-difference scope |
| Structural metadata in helper | Dashboard does not render artifact metadata | Narrow helper or expose metadata |
| Readiness badge | Only the highest `yes` state | Explain that detail contains the full lifecycle |

## Existing Copy Inventory

### Product And Metadata

| Location | Current copy | Purpose | Issue |
|---|---|---|---|
| Browser title | Capability Intelligence | Identity | None |
| Meta description | Inspect the capability readiness, evidence, compatibility, and risk of local agent tools. | Search/browser summary | Compatibility is under-specified |
| Header eyebrow | Local capability map | Scope | `Map` is not defined |
| Header H1 | Capability Intelligence | Identity | None |

### Dashboard Controls And Status

| Location | Current copy | Purpose | Issue |
|---|---|---|---|
| Loading status | Scanning inventory | Loading | No duration or progress |
| Pass status | Complete coverage | Source accounting | Ambiguous overclaim risk |
| Failure status | Review required | Coverage failure | Does not say what needs review |
| Manifest detail | `[count] unlabelled manifests retained` | Transparency | Technical term unexplained |
| Search label | Find an outcome or capability | Field label | Semantics differ by surface |
| Search placeholder | e.g. create a product video | Example | Natural-language expectation may not match filter |
| Type select | Type / All types | Filter | Clear |
| Risk select | Risk / All risk levels | Filter | Risk methodology absent |

### Dashboard Information

| Location | Current copy | Purpose | Issue |
|---|---|---|---|
| Metrics | Artifacts, Skills, Plugins, Tools, Connectors | Summary | Selected types only |
| Section | Environment inventory / Capabilities | Table context | Uses capability and artifact closely |
| Count | Loading; `[count]+ shown` | Result status | `+` means capped, not explained |
| Columns | Name, Type, Readiness, Risk, Source | Table | Readiness needs definition |
| Detail eyebrow | Evidence detail | Detail context | Clear |
| Detail title | Select a capability | Empty state | Clear |
| Detail helper | Choose a row to inspect lifecycle truth, capability evidence, risk, and structural metadata. | Instruction | Metadata is not displayed |
| Description fallback | No public description supplied. | Missing content | Clear |
| Capability fallback | unknown | Missing evidence | Correct truth boundary |
| Risk fallback | No elevated risk reason identified from available metadata. | No reasons | Good qualification |
| Sources section | Coverage ledger / Sources | Accounting | Needs definitions |
| Fetch error | Inventory unavailable | Error | No recovery |

### CLI Actions And Messages

| Command/message | Purpose | Copy issue |
|---|---|---|
| scan | Inventory | Clear technical verb |
| coverage | Source accounting | Needs qualification in docs/UI |
| ask | Outcome search | Conversational verb; results may be unrelated |
| inspect | Exact artifact detail | Clear |
| doctor | Source/finding diagnosis | Familiar developer metaphor, unexplained |
| risks | Risk list | Clear plural noun |
| duplicates | Duplicate skill names | UI absent |
| diff | Host presence difference | Generic verb; context comes from flags |
| export | Write inventory JSON | Clear |
| serve | Start local UI/API | Clear technical verb |
| Coverage: PASSED | Strict success | Could be confused with capability pass |
| No capability matches found for | Empty search | Current populated search cannot reach it |
| Artifact not found | Invalid ID | Clear, no recovery suggestion |
| No matching risk records | Empty risk filter | Could also mean invalid risk level |
| Inventory unavailable | Fetch failure | No error cause/retry |

## Button And Action Inventory

There are no visible buttons in the current dashboard. Current actions are:

- Type in search.
- Change type select.
- Change risk select.
- Click or keyboard-activate an inventory row.
- Scroll the inventory table horizontally on mobile.

CLI commands function as explicit actions. No create, edit, delete, approve, save, sign-in, invite, payment, or subscription actions exist.

## Form-Field Inventory

| Field | Input type | Required | Validation | Current helper/example |
|---|---|---|---|---|
| Outcome/capability | Search text | No in dashboard; yes for CLI `ask` | None in dashboard | `e.g. create a product video` |
| Type | Select | No | Generated from summary types | `All types` |
| Risk | Select | No | Fixed UI values | `All risk levels` |
| CLI home | Path flag | No | Resolved to absolute path | Help only |
| CLI host | Repeated string | Exactly two for diff | Count only | Help only |
| CLI level | String | No | None | Help only |
| CLI output | Path | Required for export | Presence only | Help/error |
| CLI port | Integer | No | 0-65535 | Error message |

## Empty-State Requirements

### Confirmed Existing

- No selected artifact: selection instruction.
- Missing description: public-description fallback.
- Missing capability labels: `unknown`.
- Risk reasons absent: qualified metadata fallback.

### Missing Copy Needs

- No rows match current filters.
- More than 500 results exist and only the first 500 are shown.
- A source root is absent by design.
- An adapter failed safely without exposing source content.
- Search has no relevant outcome match after the algorithm is corrected.
- Duplicate list is empty in a future visual surface.
- Host comparison has no differences in a future visual surface.

## Validation-Message Requirements

Current CLI messages cover missing outcome, artifact ID, host count, output path, option value, and port range. Future copy must distinguish:

- Missing input.
- Invalid input.
- Valid input with no results.
- Valid input with results omitted by a display cap.

Do not label an invalid risk level as an empty successful result.

## Error-State Requirements

### Dashboard

Must eventually explain:

- Inventory could not be loaded.
- Whether the local server is running.
- Whether the scan failed coverage.
- Whether a source is absent versus failed.
- A safe retry or restart action.

Do not expose paths, credentials, raw source contents, or parser payloads in user-facing errors.

### CLI

Preserve concise stderr messages and non-zero exits. Consider future copy for closest artifact match, accepted risk values, unknown flags, and filesystem recovery.

## Success-State Requirements

- Inventory scan completed and source accounting passed.
- Redacted export written to the chosen path.
- No duplicate skill names found.
- No host differences found.

Always qualify source coverage separately from artifact verification.

## Onboarding Requirements

No onboarding exists. If one is later required, evidence supports explaining only:

1. The scan is local and read-only.
2. The exact source categories inspected.
3. The source categories intentionally excluded.
4. The lifecycle distinctions.
5. The meaning of coverage, evidence, risk, and unknown.
6. The fact that no capability is invoked.

Do not invent account creation or cloud connection steps.

## Notification Requirements

No email, push, toast, webhook, or background notification system exists. Do not create notification copy. Inline and CLI feedback are the only current channels.

## Trust, Privacy, And Security Explanations

Required factual points:

- The default scan makes no network request.
- The dashboard binds to `127.0.0.1`.
- The scanner uses allowlisted metadata roots rather than recursively scanning the whole home directory.
- Authentication files, environment values, sessions, attachments, memories, logs, credentials, shell snapshots, and raw tool history are excluded.
- Raw connector IDs, application IDs, private URLs, server origins, and authorization material are omitted.
- Redacted export withholds additional descriptions and path metadata.
- Risk is metadata-derived, not a live security verdict.

## Legal Review

No privacy policy, licence, terms, consent, pricing, or warranty text exists. Legal review would be required before public distribution or a hosted service, especially for:

- Claims about privacy and redaction.
- Treatment of third-party catalogue metadata.
- Product licence and dependency/source licences.
- Hosted team data retention and processing.
- Use of product and integration names.

## Screen Content Worksheets

## Screen: Capability Inventory Dashboard

**Audience:** Local technical operator.
**User objective:** Find and evaluate a capability without overstating readiness.
**Required context:** Local/read-only scope, point-in-time inventory, source coverage meaning.
**Primary message:** This environment contains capability metadata; each record shows what is and is not known.
**Primary action:** Filter and select an artifact.
**Secondary actions:** Review totals and source accounting.
**Required labels:** Product, coverage, search, type, risk, inventory columns, evidence detail, sources.
**Required helper text:** Lifecycle meaning; risk boundary; source-count definitions.
**Required empty state:** No filters matched; reset filters.
**Required errors:** Inventory load failed; coverage failed; source unavailable.
**Required confirmation:** None for current read-only dashboard.
**Important terminology:** Artifact, lifecycle, evidence, risk, source, inventory coverage.
**Claims requiring evidence:** Complete inventory accounting, local/no-network scan, redaction.
**Open questions:** Dashboard scope, mobile priority, search contract, source explanations.

## Screen: Artifact Evidence Detail

This is a panel, not a separate route.

**Audience:** Operator evaluating a candidate.
**User objective:** Understand exactly what is known before choosing a resource.
**Required context:** Artifact came from metadata; it has not been invoked.
**Primary message:** Lifecycle and evidence are separate.
**Primary action:** Read/compare evidence; no mutation action exists.
**Secondary actions:** None implemented.
**Required labels:** Type, source, evidence, risk, every lifecycle state.
**Required helper text:** Evidence definitions and risk limitations.
**Required empty state:** Select a capability; no public description; no capability label.
**Required errors:** None in current selected-row flow.
**Required confirmation:** None.
**Claims requiring evidence:** Any statement of installed/enabled/authenticated/runnable/verified.
**Open questions:** Whether to show graph relationships, source metadata, and comparison.

## Screen: Source Coverage Ledger

This is a page section, not a separate route.

**Audience:** Maintainer or advanced operator.
**User objective:** Confirm that source records were accounted for.
**Required context:** Records, represented, deduplicated, and parse failures are accounting terms.
**Primary message:** Coverage is about inventory completeness, not operational capability.
**Primary action:** Review source status.
**Secondary actions:** Run CLI doctor/coverage; not linked in dashboard.
**Required labels:** Source, status, records, represented, deduplicated, parse failures.
**Required empty state:** Source absent.
**Required errors:** Adapter failed, parse failed, mismatch, unsafe output.
**Required confirmation:** None.
**Open questions:** Whether this belongs in a separate diagnostic view.

## Screen: CLI Help And Feedback

**Audience:** Terminal-first operator.
**User objective:** Choose a command and interpret exit/output truthfully.
**Required context:** Default scan is local, read-only, allowlisted, and network-free.
**Primary action:** Run one command.
**Required helper text:** Valid values, exact side effects, human/JSON modes.
**Required empty state:** No duplicates, no host differences, no matching risk records.
**Required errors:** Missing argument, invalid port, unknown artifact, failed coverage, filesystem failure.
**Required confirmation:** Export overwrite is unresolved.
**Open questions:** Unknown-option policy and accepted risk/host vocabulary.

## Unresolved Copy Questions

1. Is `inventory coverage complete` approved visible terminology?
2. Should `artifact` remain visible to ordinary users or be reserved for technical detail?
3. Should outcome search be positioned as search, matching, or recommendation after logic is corrected?
4. What is the approved explanation of metadata-derived risk?
5. Is `doctor` an approved public command name?
6. Can redacted reports be described as shareable, and with whom?
7. Is compatibility a current product promise or future roadmap language?
8. Which spelling convention should public copy use?
9. What product/licence/commercial status may be stated publicly?

Until answered, preserve current precise language, qualify coverage and risk, and avoid marketing claims beyond the observed local inventory behaviour.

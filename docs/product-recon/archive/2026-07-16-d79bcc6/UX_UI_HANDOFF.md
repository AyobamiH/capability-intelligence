# Capability Intelligence UX/UI Handoff

## How To Use This Brief

This is a factual handoff, not a redesign specification. Labels use the classifications defined in `PRODUCT_DOSSIER.md`. Preserve unknowns and product boundaries. Do not add accounts, billing, execution controls, team administration, or verified claims without new product evidence.

## Product And Audience

**CONFIRMED:** Capability Intelligence is a local, read-only inventory of agent skills, plugins, tools, connectors, commands, hooks, and workflow resources. It explains what is discoverable and what lifecycle evidence is available. It does not execute those resources.

**INFERRED primary audience:** A technically capable local operator or maintainer who understands developer tooling and needs to distinguish installed metadata from enabled, authenticated, runnable, or verified capability.

**PLANNED audience:** Team catalogue users are mentioned only in a future SaaS architecture note. No team role or screen is currently defined.

## Primary Jobs

1. Inventory all allowlisted capability sources without losing records.
2. Find plausible capabilities for an intended outcome.
3. Inspect lifecycle, evidence source, risk, and relationships before choosing a tool.
4. Confirm whether source coverage passed and understand gaps.
5. Detect duplicate skills and host availability differences.
6. Export a redacted inventory for another system or reviewer.

## High-Frequency Workflows

### Scan And Assess

- Run a scan.
- Review coverage and summary counts.
- Distinguish absent source roots from failed adapters.
- Inspect findings before treating inventory as complete.

### Find And Inspect

- Enter an outcome or capability term.
- Narrow by artifact type or risk.
- Compare readiness summaries.
- Open an artifact.
- Review the full lifecycle, evidence classification, source, risk reasons, and relationships.

### Diagnose Metadata

- Review source accounting.
- Find duplicate skill names.
- Compare two host labels.
- Identify unlabelled manifests and unknown states.

## High-Risk Workflows

The product does not invoke destructive capabilities. The current product-side risks are informational and filesystem-related:

- Misreading inventory coverage as operational verification.
- Treating inferred capability or metadata-derived risk as runtime proof.
- Exporting private descriptions without `--redacted`.
- Overwriting a chosen export path.
- Acting on irrelevant outcome-search results.

## Current Screen Inventory

| Screen | Route | Purpose | Status |
|---|---|---|---|
| Capability inventory dashboard | `/` | Filter, browse, and inspect local inventory | Working with limitations |
| No other application screen | N/A | Accounts, settings, admin, billing, onboarding, and hosted catalogues do not exist | CONFIRMED absent |

The JSON API routes are local integration surfaces, not screens: `/health`, `/api/inventory`, `/api/coverage`, and `/api/search`.

## Current Navigation Structure

There is no navigation component. The single page is organised in this order:

1. Product identity and coverage message.
2. Outcome text field, type filter, and risk filter.
3. Five summary metrics.
4. Capability inventory table.
5. Evidence detail panel beside the table on desktop and after it on smaller screens.
6. Source coverage ledger.

Any future navigation requires a product decision about which CLI-only workflows belong in the visual application.

## Content Hierarchy By Screen

### Capability Inventory Dashboard

**Primary task:** Find and assess a capability.
**Secondary tasks:** Understand inventory scale, inspect source coverage, and filter risk/type.
**Required data:** Coverage, summary, artifacts, sources, and selected artifact.
**Current primary interaction:** Filter controls and interactive table rows.
**Current supporting information:** Artifact IDs, source IDs, lifecycle, evidence and risk.

#### Header

- Product name.
- Local context label.
- Inventory coverage status.
- Count of unlabelled plugin manifests retained.

The coverage label must explicitly mean source accounting. It must never imply that capabilities were executed or verified.

#### Filter Bar

- Free-text search.
- Artifact-type select.
- Risk-level select.
- Current implementation applies filters immediately and has no submit button.

#### Metrics

- Total artifacts.
- Skills.
- Catalogue plugins.
- App tools.
- Connectors.

The inventory includes more artifact types than these five, so this strip is a selected overview rather than a complete type breakdown.

#### Inventory Table

Required current columns:

- Name and artifact ID.
- Type.
- Condensed readiness.
- Risk.
- Source.

The readiness badge is the highest lifecycle state with value `yes`; it does not replace the full lifecycle.

#### Evidence Detail

Required current content:

- Name.
- Public or withheld description.
- Capability labels or `unknown`.
- Type.
- Source.
- Classification evidence.
- Risk level and reasons.
- Every lifecycle field.

The model also has metadata and graph relationships, but the current dashboard does not show them.

#### Source Ledger

For every source:

- Status.
- Records discovered.
- Records represented.
- Records deduplicated.
- Parse failures.

## Important Data Objects

### Artifact

The central visible object. It has identity, type, name, description, source, host labels, capability labels, evidence classification, lifecycle, risk, and metadata.

### Lifecycle

The UI must keep these separate:

```text
discovered -> present -> installed -> enabled -> authenticated -> runnable -> verified
```

Possible values are currently `yes`, `no`, `unknown`, and `not_applicable` by convention.

### Source And Coverage

Coverage measures whether scanned source records were accounted for. It is not a capability reliability or security score.

### Risk

Risk is computed from cached annotations or component type. It is not a live permission audit.

### Evidence Classification

- Declared: manifest/tool metadata says it.
- Structural: a file/component exists.
- Inferred: metadata text/naming suggests it.
- Observed: planned validated receipt; none observed now.
- Unknown: insufficient evidence.

## Permissions

**CONFIRMED:** There are no application roles or permission states. The local operating-system user is the effective user. The process reads only allowlisted metadata and binds the dashboard to loopback. The export command writes to a user-chosen local path.

Do not design role switchers, account menus, invitation flows, organisation settings, or permission-denied screens for the current product.

## Business Rules Affecting UX

1. Unknown must remain visible and must not be presented as failure or success.
2. Installed must not imply enabled, authenticated, runnable, or verified.
3. Unlabelled plugin manifests must not disappear from totals.
4. Source roots can be available, absent, or failed.
5. Strict coverage fails on parsing errors, unsafe output, duplicate IDs, and source-accounting mismatch.
6. Risk labels require their reasons and evidence boundary.
7. The server inventory is a startup snapshot; changes require a restart.
8. Dashboard output is currently capped at 500 visible rows.
9. Redacted export removes private descriptions and local path metadata, but is not documented as safe for public release.

## States Requiring Designs

| Area | Required state | Currently present? | Evidence-based need |
|---|---|---|---|
| Dashboard | Initial scan/loading | Partial | `Scanning inventory` only |
| Dashboard | Successful complete inventory | Yes | Main working state |
| Dashboard | Coverage failed | Partial | Header colour/copy only |
| Dashboard | Source absent | Data only | Source row uses raw status |
| Dashboard | Adapter failed | Data only | Source row and coverage failure |
| Dashboard | Inventory request failed | Partial | `Inventory unavailable` only |
| Search/filter | No matching rows | Partial | Empty table plus `0 shown` |
| Search/filter | More than display cap | Yes, minimal | `500+ shown` |
| Artifact | No description | Yes | Fallback sentence |
| Artifact | No capability labels | Yes | `unknown` badge |
| Artifact | Selected | Yes | Highlight and detail update |
| Artifact | Unknown lifecycle values | Yes | Detail values |
| Artifact | Not applicable lifecycle | Yes | Detail values |
| Export | Success | CLI only | Written path message |
| Export | Missing/unwritable path | CLI only | Error only |
| Export | Existing file/destructive confirmation | No | Current overwrite behaviour |
| API | Not found | Yes | 404 JSON |
| API | Method rejected | Yes | 405 JSON |
| Authentication/session | Any | Not applicable | No identity model |
| Queued/cancelled/archived | Any | Not applicable | No persistent job/object model |

## Forms And Validation

### Dashboard Controls

- Search input: free text; no character limit or validation.
- Type: options generated from current inventory summary.
- Risk: fixed critical/high/medium/low/unknown options.
- Filtering is immediate and client-side.

### CLI Inputs Relevant To UI Decisions

- `ask` requires text in the CLI, while `/api/search` accepts an empty query.
- `inspect` requires an exact artifact ID.
- `diff` requires exactly two host options.
- `risks --level` does not validate the level value.
- Unknown CLI flags are accepted and ignored.
- `serve --port` validates integer range 0-65535.
- `export` requires an output path.

## Search And Filtering Requirements

The current product has two conflicting behaviours:

- Dashboard: all typed terms must be substrings of the artifact text.
- CLI/API: concept tokens are scored with readiness bonuses and up to 20 results.

**Resolution needed before redesign:** Choose one contract. A no-match query currently returns readiness-ranked API/CLI results, which is a confirmed defect. The designer should include a real no-results state but must not imply it works until the search logic is corrected.

## Tables And Data Display

- The inventory is dense and technical; a table is appropriate.
- Artifact IDs and source IDs are meaningful troubleshooting data.
- Table rows are interactive through click, Enter, and Space.
- Current rows lack button semantics, `aria-selected`, and detail announcement.
- Mobile uses a 720px minimum-width table in a horizontal scroll container.
- Initial ordering is artifact ID, not relevance or user-controlled sort.
- No pagination, sorting control, column chooser, bulk action, or saved view exists.

## Responsive Requirements

**Observed:**

- 1440x900: five metrics in one row; table and sticky detail side by side.
- Below 980px: metrics use three columns; table and detail stack; source ledger uses two columns.
- 320x800: filters stack, metrics use two columns, source ledger uses one column, table scrolls internally, and no document-level horizontal overflow occurs.

**Constraint:** On stacked layouts the detail panel appears after the entire inventory section. With 500 rows, this makes selected evidence difficult to reach. Treat this as a high-severity workflow problem.

## Accessibility Requirements

### Existing

- Semantic labels for search and selects.
- 44px minimum input/select height.
- Visible focus outlines.
- Table structure and headings.
- Row keyboard activation.
- Coverage `aria-live` and final `aria-label`.

### Missing Or Unverified

- No automated accessibility suite or screen-reader test.
- Interactive rows do not expose an action role or selected state.
- Detail changes are not announced.
- Risk is partly colour-coded; text labels are present, which helps.
- No reduced-motion issue because no animation exists.
- Colour contrast has not been formally measured.
- No light/high-contrast mode.

## Trust And Privacy Considerations

- Always state that the scan is local and metadata-only.
- Explain that the default scan makes no network request.
- Never expose credentials, authorization material, raw connector IDs, private install URLs, server origins, sessions, attachments, logs, or home paths.
- Explain what redaction removes and avoid calling it anonymisation or guaranteed safe publication.
- Keep coverage, readiness, evidence, and verification visually distinct.
- Do not show an `enabled` or `accessible` cache hint as proof of current reachability.

## Existing Brand And Design Constraints

### Existing Visual Facts

- Dark-only, near-black technical interface.
- System sans-serif and monospace pair.
- Compact spacing, square-to-small-radius controls, one-pixel borders.
- Restrained semantic colours for pass and risk states.
- No logo asset, icon set, imagery, animation, gradient, shadow system, or decorative illustration.

### Owner-Stated Exclusions

The interface must avoid neon styling, cyberpunk visuals, glowing controls, generic AI imagery, purple-blue gradient templates, excessive glassmorphism, random bento layouts, and other generic AI-generated SaaS patterns. Visual quality should come from hierarchy, typography, proportion, spacing, clarity, interaction quality, and product-specific decisions.

## Known UX Problems

1. **High:** Search relevance and empty-state logic are incorrect in CLI/API.
2. **High:** Coverage wording can imply more proof than exists.
3. **High:** Mobile selection detail is separated from the selected row by the remaining table.
4. **High:** Initial dashboard transfer is 6.5 MB for a 500-row display.
5. **Medium:** Dashboard omits duplicate, host-diff, graph, finding, and export workflows.
6. **Medium:** Search semantics differ across surfaces.
7. **Medium:** Error and empty states lack recovery.
8. **Medium:** Source-accounting terms are unexplained.
9. **Medium:** Interactive table semantics are incomplete.
10. **Medium:** Risk method and confidence are not explained in-product.

## Unresolved Design Questions

- Is the dashboard meant to replace common CLI workflows or remain a compact inspector?
- Is mobile a primary context or a fallback inspection context?
- Which artifact metadata and graph relationships are decision-critical?
- Should source coverage be a separate screen or remain on the inventory page?
- What is the expected inventory scale beyond the observed 6,353 artifacts?
- Should users compare candidates side by side?
- Does the product need a first-run source-availability explanation?
- What approved brand assets exist, if any?

See `OPEN_QUESTIONS.md` for evidence and defaults. Work may continue on factual information architecture and state design, but search, mobile detail placement, and future SaaS roles require product decisions before implementation.

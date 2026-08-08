# Capability Intelligence Lovable Build Context

## 1. Product Summary

Capability Intelligence is a standalone, local-first developer tool. It inventories metadata for agent skills, plugins, installed plugin versions, tools, connectors, agents, commands, hooks, workflows, schemas, templates, and documentation resources.

It must show what is known without pretending a capability works. Keep these lifecycle states separate:

```text
discovered -> present -> installed -> enabled -> authenticated -> runnable -> verified
```

The product does not execute capabilities, authenticate connectors, run autonomous coding workflows, or verify engineering claims.

## 2. Intended Users

- Primary: a technical local operator inspecting an agent environment.
- Secondary: a capability or workflow maintainer diagnosing source coverage, duplicates, and host drift.
- Future team catalogue users are planned only. Do not implement team roles.

## 3. Primary Workflows

1. Scan allowlisted local metadata and assess source coverage.
2. Find a plausible capability for an outcome.
3. Inspect an artifact's lifecycle, evidence, risk, source, and relationships.
4. Review risk categories and reasons.
5. Diagnose failed/absent sources.
6. Find duplicate skill names.
7. Compare capability-name presence across two host labels.
8. Export a redacted JSON inventory.
9. Browse and filter the inventory in a loopback dashboard.

## 4. Roles And Permissions

There is no application account, authentication, role, organisation, or administrator model.

- The effective user is the local operating-system user.
- Filesystem permissions control source reads and export writes.
- The HTTP server binds to `127.0.0.1` only.
- HTTP routes are read-only GET routes.

Do not invent owner, admin, member, guest, billing, invitation, or permission-management interfaces.

## 5. Required Pages

### Current Required Page

- `/`: Capability inventory dashboard.

### Current API-Only Routes

- `/health`: process and coverage health.
- `/api/inventory`: full point-in-time inventory.
- `/api/coverage`: coverage object.
- `/api/search?q=`: scored outcome results.

Do not create landing, login, signup, pricing, account, settings, admin, team, billing, or integration-connection pages unless the product owner separately approves them.

## 6. Navigation Structure

The current application is one screen and has no navigation component.

Current content order:

1. Product identity and inventory coverage.
2. Search, type filter, and risk filter.
3. Summary metrics.
4. Artifact inventory.
5. Evidence detail.
6. Source coverage ledger.

CLI-only workflows must not become new screens without a scope decision.

## 7. Data Entities

### Inventory

- `schemaVersion`
- `generatedAt`
- `mode` (`local-read-only`)
- `summary`
- `sources`
- `artifacts`
- `graph`
- `findings`
- `coverage`

### Artifact

- `id`
- `type`
- `name`
- `description`
- `source`
- `hosts[]`
- `capabilities[]`
- `classificationEvidence`
- `lifecycle`
- `risk`
- `metadata`

### Source

- `id`
- `status`
- `records`
- `represented`
- `deduplicated`
- `parseFailures`
- optional metadata

### Coverage

- `status`: passed or failed
- `failures[]`
- `unlabelledManifests`
- `sourceCount`
- `artifactCount`

### Graph

- `edges[]`: from, to, type
- `duplicates[]`: name, artifactIds

## 8. Required Information On The Dashboard

### Header

- Capability Intelligence.
- Local/read-only context.
- Inventory coverage status.
- Count of unlabelled manifests retained.

Coverage means source-accounting completeness. Do not imply capabilities were verified.

### Filters

- Outcome/capability text.
- Artifact type.
- Risk level.

### Summary

- Total artifacts.
- Skills.
- Catalogue plugins.
- App tools.
- Connectors.

### Inventory Table

- Name and artifact ID.
- Type.
- Condensed readiness.
- Risk.
- Source.

### Evidence Detail

- Description.
- Capability labels.
- Type.
- Source.
- Evidence classification.
- Risk and reasons.
- All lifecycle states.

### Source Ledger

- Source status.
- Discovered records.
- Represented records.
- Deduplicated records.
- Parse failures.

## 9. Primary And Secondary Actions

### Primary

- Filter inventory.
- Select an artifact.
- Inspect lifecycle/evidence/risk.

### Secondary

- Review source accounting.
- In CLI only: strict scan, doctor, risks, duplicates, host diff, export, serve.

No current action creates, edits, deletes, installs, enables, authenticates, invokes, approves, or purchases anything.

## 10. Forms And Validation

Dashboard controls use native search and select inputs.

- Search currently filters locally by requiring every term as a substring.
- Type options come from current inventory types.
- Risk options are critical, high, medium, low, and unknown.
- Filtering is immediate.

Known defect: CLI/API outcome search gives readiness points even without a lexical match, so unrelated and empty queries return results. Do not design copy that claims reliable recommendations until corrected.

## 11. Required States

Design for:

- Initial inventory loading.
- Successful inventory.
- Coverage passed.
- Coverage failed.
- Source available.
- Source absent.
- Source failed.
- No filtered rows.
- More than 500 displayable rows.
- Artifact selected.
- Missing public description.
- Unknown capability labels.
- Unknown lifecycle values.
- Not-applicable lifecycle values.
- Inventory API unavailable.
- API not found/method rejected.
- Export success/error in CLI.

Do not add authentication, session-expiry, permission-denied, queued-job, billing, archive, or subscription states. Those models do not exist.

## 12. API And Backend Constraints

- Backend is dependency-free Node.js using `node:http`.
- Server scans once at startup and holds inventory in memory.
- There is no database or mutation API.
- The observed `/api/inventory` response was approximately 6.5 MB for 6,353 artifacts.
- The current UI renders at most 500 rows.
- Static path resolution rejects traversal outside `static/`.
- Non-GET requests return 405 JSON.
- Missing paths return 404 JSON.
- Default scan makes no network request.

Do not replace these APIs with fictional cloud endpoints.

## 13. Existing Frontend Stack

- Static HTML.
- Hand-authored CSS.
- Browser JavaScript ES modules.
- No React, Vue, Svelte, Tailwind, component library, icon library, form library, or state library.
- No build step.
- Browser data fetching uses `fetch('/api/inventory')`.

If implementation remains in this repository, prefer the existing stack unless the owner approves a framework migration.

## 14. Existing Component And Design Constraints

- Dark-only technical visual system.
- System sans-serif plus monospace.
- Compact density.
- One-pixel borders and 4-6px radii.
- Semantic green/yellow/orange/red risk colours.
- 44px minimum form-control height.
- Explicit focus-visible outline.
- Internal table scrolling on mobile.
- Breakpoints at 980px and 680px.

There is no approved logo asset, illustration style, icon family, or marketing imagery.

## 15. Responsive Requirements

- Preserve zero document-level horizontal overflow at 320px.
- Filters stack at narrow widths.
- Metrics reduce from five to three to two columns.
- Source ledger reduces from three to two to one column.
- Technical table may scroll inside its container.
- Evidence detail must remain reachable after selecting a row.

Known high-severity issue: in the current stacked layout, detail appears after up to 500 rows. Do not reproduce that behaviour in a redesigned interaction without explicitly documenting it.

## 16. Accessibility Requirements

Preserve:

- Visible labels.
- Native controls.
- At least 44px practical input targets.
- Visible keyboard focus.
- Keyboard artifact selection.
- Text labels in addition to risk colour.
- Coverage live status.

Address if implementation is approved:

- Semantic interactive rows or equivalent controls.
- `aria-selected` or current-selection state.
- Announcement/focus management when detail changes.
- Formal colour-contrast and screen-reader testing.
- Clear empty and error recovery.

## 17. Copy And Terminology Rules

- Use Capability Intelligence as the product name.
- Use artifact for a normalized capability record.
- Qualify coverage as inventory/source coverage.
- Never equate installed with enabled/authenticated/runnable/verified.
- Never call inferred or declared metadata proof of operation.
- Describe risk as metadata-derived.
- Preserve unknown as distinct from failed.
- Call the 111 records unlabelled plugin manifests, not skills.
- Call export redacted, not anonymous.

## 18. Design Exclusions

- No neon styling.
- No cyberpunk visuals.
- No glowing controls.
- No generic AI imagery.
- No gratuitous purple-blue gradients.
- No excessive glassmorphism.
- No random bento layouts.
- No generic AI-generated SaaS appearance.
- No meaningless decorative effects.
- No visual novelty that reduces technical usability.

## 19. Features That Are Real

- Allowlisted local scanning.
- Ten source surfaces in the observed environment.
- Strict coverage reconciliation.
- Artifact lifecycle/evidence/risk.
- Human and JSON CLI output.
- Outcome search with documented current defect.
- Exact artifact inspection.
- Doctor, risk, duplicate, and host-difference CLI views.
- Redacted local export.
- Loopback dashboard and read-only API.

## 20. Features That Must Not Be Invented

- Capability execution.
- Autonomous coding workflow control.
- OpsTruth-style claim verification.
- Account registration or login.
- Organisations, workspaces, teams, and invitations.
- Admin roles and permission editing.
- Billing, plans, payments, trials, and subscriptions.
- Cloud inventory crawl or automatic upload.
- Live connector authentication.
- Marketplace installation or plugin updates.
- Notifications, analytics, or activity feeds.
- Fake compatibility, reliability, or security scores.
- Customer logos, testimonials, usage metrics, or adoption claims.

## 21. Known Incomplete Functionality

- Search no-match semantics are incorrect in CLI/API.
- Dashboard and API search use different algorithms.
- Dashboard downloads the full inventory and caps display at 500.
- Mobile selected detail is poorly positioned.
- Dashboard does not expose graph, duplicates, findings, host diff, or export.
- Error and filtered-empty recovery is minimal.
- Risk and source-accounting methodology is not explained in the interface.
- Hosted SaaS features are documentation-only.

## 22. Owner Decisions Still Required

- Primary first user and commercial/open-source status.
- Dashboard scope versus CLI-only workflows.
- Search contract.
- Mobile priority.
- Verified execution-receipt contract.
- Meaning of installed cached versions and connector enabled hints.
- Redacted-export sharing policy.
- Approved brand assets and browser support.

## Lovable Non-Negotiables

- Do not invent product functionality.
- Do not replace the product's terminology.
- Do not create fake customer logos, testimonials, analytics, or claims.
- Do not build a generic SaaS landing page unless the dossier confirms one is required.
- Prioritize the application interface and real workflows.
- Do not use neon colors, glowing controls, cyberpunk visuals, excessive gradients, generic AI imagery, or purple-blue AI-template styling.
- Do not use glassmorphism as the primary design language.
- Do not put every piece of content inside a rounded card.
- Use hierarchy, spacing, typography, alignment, and interaction quality to create visual distinction.
- Account for all documented loading, empty, error, success, permission, and destructive-action states.
- Respect existing APIs, authentication, data models, and technical constraints.

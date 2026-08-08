# Capability Intelligence Open Questions

## Reading This File

Only unresolved questions are included. Priority labels are:

1. Blocks product functionality.
2. Blocks UX structure.
3. Blocks copywriting.
4. Blocks visual design.
5. Can be deferred.

`Continue?` states whether evidence-backed work can continue without an answer.

## Product Decisions

| Priority | Question | Why it matters | Available evidence | Options and consequences | Recommended default | Confidence | Continue? |
|---|---|---|---|---|---|---|---|
| 2 | Who is the primary first user: individual developer, capability maintainer, or team lead? | Determines default page hierarchy and terminology depth | CLI and local dashboard imply a technical local operator; team catalogue is future only | Individual: task-first; maintainer: diagnostics-first; team lead: governance features that do not yet exist | Technical local operator | Medium | Yes for recon; no for major IA changes |
| 3 | Is Capability Intelligence intended to be private tooling, open source, commercial SaaS, or mixed? | Controls distribution, trust, legal, and launch copy | Package is private; no licence or remote; SaaS architecture is planned | Private: minimal public copy; open source: licence/community needed; SaaS: accounts/operations needed | Private local alpha | High | Yes for product work; no for launch copy |
| 1 | What exact condition should allow `verified: yes`? | Verification is the strongest product claim | Contract says only validated observed receipts; no receipt schema exists | Signed execution receipt, local test receipt, publisher evidence, or never automated; each has different trust | Keep verified unknown until a receipt contract is approved | High | Yes, if no verified claims are added |
| 2 | Should the visual product remain one inventory screen or expose CLI-only diagnostics? | Determines route and navigation structure | Dashboard omits doctor, duplicates, host diff, findings, graph, and export | Single inspector: compact but incomplete; multi-view: more capable but larger product | Preserve one screen until workflows are prioritised | Medium | Yes for current UI maintenance |

## User And Permission Decisions

| Priority | Question | Why it matters | Available evidence | Options and consequences | Recommended default | Confidence | Continue? |
|---|---|---|---|---|---|---|---|
| 2 | Will a future hosted service have organisation roles? | Roles affect every route and data-access decision | No current identity model; hosted notes mention teams but no roles | No roles: personal catalogue; owner/member/viewer: team governance; custom roles: substantial complexity | Do not design roles yet | High | Yes for local product only |
| 1 | Is a cached installed plugin version necessarily active? | Current `installed: yes` may overstate old cached versions | Adapter inventories every version directory; no active-version file is read | Mark all installed, mark all present, or identify active version from a new safe source | Mark cached versions present; reserve installed for active evidence in a future change | Medium | Yes, but copy must qualify cached versions |
| 1 | Does connector `isEnabled` justify lifecycle `enabled: yes`? | It affects 4,768 observed artifacts | Connector adapter maps cache flag to lifecycle but runnability/auth remain unknown | Keep as lifecycle; move to metadata hint; validate against a live safe source | Present it as an enabled hint, not proof | High | Yes with clear qualification |

## Workflow Decisions

| Priority | Question | Why it matters | Available evidence | Options and consequences | Recommended default | Confidence | Continue? |
|---|---|---|---|---|---|---|---|
| 1 | What should outcome search return when no text matches? | Current unrelated results undermine trust | Readiness bonus produces 20 results for unrelated and empty queries | Require lexical match; show discovery suggestions separately; allow readiness-only browse | Require at least one lexical/concept match | High | No for search redesign |
| 2 | Should dashboard filtering use the same scored search as CLI/API? | Current surfaces disagree | Dashboard uses AND substring; API uses concept scoring | One shared search: consistent; separate filter/search: must be labelled clearly | Share one contract and keep type/risk as filters | High | No for search interaction redesign |
| 2 | How should users reach evidence detail on mobile? | Current detail follows up to 500 rows | DOM order and responsive CSS confirm the issue | Inline expansion, drawer, separate detail route, or move panel above table | Inline expansion or a dedicated detail surface | Medium | No for mobile redesign |
| 2 | Should the dashboard show all matches, pagination, or virtualised rows? | Current 500 cap hides records | Full inventory is 6.5 MB; UI slices first 500 | Pagination: clear totals; virtualisation: dense; server search: lower payload | Server-side bounded query with exact total | Medium | No for data-table redesign |
| 5 | Should server inventory refresh without restart? | Sources can change during a long session | Server scans once before listening | Restart only: simple; manual rescan: explicit; watcher: hidden churn | Manual explicit rescan only, if approved | Medium | Yes |
| 2 | Should redacted export overwrite an existing file? | Current behaviour can destroy a previous report | `writeFileSync` replaces the path | Always refuse, confirm interactively, or require `--force` | Refuse unless explicit force | High | Yes, if behaviour is documented |

## Business-Rule Decisions

| Priority | Question | Why it matters | Available evidence | Options and consequences | Recommended default | Confidence | Continue? |
|---|---|---|---|---|---|---|---|
| 1 | Is source-accounting coverage allowed to pass with warnings? | Warnings currently do not directly fail, but missing identities can create accounting failure | `evaluateCoverage` fails errors and mismatches; warnings remain findings | Warnings pass; selected warning codes fail; all warnings fail strict | Pass warnings only when all records remain accounted for | Medium | Yes |
| 1 | Which risk vocabulary and method are product commitments? | Risk can be mistaken for security assessment | Fixed five levels; rules use tool hints/component type | Keep current heuristic; add confidence; replace with authority model | Keep levels but always expose reason and evidence source | High | Yes for current display |
| 3 | Is `unknown` distinct from `no` in all exported consumers? | Truth model depends on this distinction | Lifecycle uses both; schema does not constrain values | Enforce enum in schema or leave convention-only | Enforce documented enum in future schema | High | Yes |
| 1 | Is a redacted export safe for external sharing? | Copy and hosted import depend on this | It removes paths/private descriptions but no formal threat model exists | Team-local only; approved external; public | Describe as reduced-data team-local evidence until audited | High | Yes with conservative copy |

## UX Decisions

| Priority | Question | Why it matters | Available evidence | Options and consequences | Recommended default | Confidence | Continue? |
|---|---|---|---|---|---|---|---|
| 2 | Which information must remain visible while scanning thousands of artifacts? | Determines density and progressive disclosure | Current table shows five fields; detail shows lifecycle | Keep current columns; add evidence; custom columns | Keep current five, make lifecycle detail easy to reach | Medium | Yes |
| 2 | Should source coverage be a main-screen section or a dedicated diagnostic view? | Raw ledger is specialist content | Current ledger is below inventory and uses internal field names | Inline: transparent but dense; dedicated: clearer hierarchy | Keep concise status inline; move full accounting only if diagnostics expand | Medium | Yes |
| 4 | Is mobile a primary operating context? | Determines whether table-first design is acceptable | Browser audit exists; CLI/desktop context dominates | Primary: redesign navigation/table; secondary: responsive inspection | Treat as secondary inspection until owner confirms | Medium | Yes for accessibility fixes |
| 2 | Should users compare candidate artifacts side by side? | Lifecycle/risk decisions may need comparison | No comparison exists; multiple search results are common | No comparison, temporary selection, or dedicated compare | Do not add until user research confirms | Low | Yes |

## Copy Decisions

| Priority | Question | Why it matters | Available evidence | Options and consequences | Recommended default | Confidence | Continue? |
|---|---|---|---|---|---|---|---|
| 3 | Is `Inventory coverage complete` the approved replacement for `Complete coverage`? | Avoids implying verification | All artifacts are verified unknown; current wording is ambiguous | Keep current; qualify; add explanatory helper | Use qualified wording | High | Yes with a documented recommendation |
| 3 | Should `artifact` be visible in primary UI? | It is precise but technical | Current metric uses Artifacts; table section says Capabilities | Artifact everywhere, capability everywhere, or artifact as technical subtype | Use capability in task copy and artifact in model/detail copy | Medium | Yes |
| 3 | Should `ask` be described as search, matching, or recommendation? | Each word promises different intelligence | Current command is `ask`; algorithm is deterministic scoring | Search: modest; matching: evidence-based; recommendation: too strong | Outcome matching after the defect is fixed | High | Yes, without recommendation claims |
| 3 | Which English spelling convention applies? | Public documentation should be consistent | Repository mixes neutral technical language; owner prompt uses British context | British or American | British English for new public copy unless owner says otherwise | Low | Yes |

## Brand Decisions

| Priority | Question | Why it matters | Available evidence | Options and consequences | Recommended default | Confidence | Continue? |
|---|---|---|---|---|---|---|---|
| 4 | Is there an approved logo or wordmark? | Affects header, metadata, and external assets | No asset exists; product name is text | Text-only, new wordmark, parent brand | Preserve text-only identity | High | Yes |
| 4 | Is dark-only presentation a brand rule or implementation starting point? | Affects accessibility and future contexts | CSS declares dark scheme only | Dark-only, dual theme, system preference | Preserve dark current state; do not claim formal rule | Medium | Yes |
| 4 | Which current colours are approved brand colours? | Semantic and brand colours should not be conflated | CSS has functional colours but no token/brand document | Approve current, create tokens, or redesign | Treat them as implementation tokens only | High | Yes |

## Technical Decisions

| Priority | Question | Why it matters | Available evidence | Options and consequences | Recommended default | Confidence | Continue? |
|---|---|---|---|---|---|---|---|
| 2 | Must the frontend remain framework-free? | Lovable may generate a disconnected React app | Existing static stack has no build step/dependencies | Preserve; approved migration; separate prototype | Preserve until migration is explicitly approved | High | Yes |
| 1 | What is the inventory/API scale target? | 6.5 MB already affects startup | Observed 6,353 artifacts and 17,712 connector records before dedupe | Current scale only; 10x; enterprise multi-user | Design bounded server queries before growth | Medium | Yes for current scale only |
| 2 | What browser matrix must be supported? | Current audit uses headless Chrome only | No browser policy | Chromium only; evergreen browsers; broader | State current Chromium evidence only | High | Yes |
| 1 | Should the JSON schema validate complete nested shapes? | External consumers need a stable contract | Current schema checks top-level and required keys only | Keep permissive; progressively constrain; version per release | Constrain lifecycle/evidence/risk enums first | High | Yes, but no broad compatibility claims |
| 5 | Should HTTP responses include cache/security headers? | Relevant if local server grows beyond current scope | Current response only sets content type | Current minimal; add local hardening | Review before any non-loopback use | Medium | Yes |

## Launch Decisions

| Priority | Question | Why it matters | Available evidence | Options and consequences | Recommended default | Confidence | Continue? |
|---|---|---|---|---|---|---|---|
| 3 | What is the licence? | Blocks public distribution | No licence file | Proprietary, open-source licence, dual licence | Do not distribute publicly yet | High | Yes locally; no public launch |
| 3 | What privacy/security review is required before hosted import? | Redacted exports may still contain sensitive metadata | No formal threat model or audit | Internal review, external audit, staged pilot | Require a threat model and sample review | High | Yes locally |
| 3 | What constitutes release readiness? | Version is 0.1.0 private with no release process | Tests and package dry run exist; no deployment | Local alpha, npm release, hosted beta | Keep local alpha | High | Yes locally |
| 3 | Is a marketing site required? | Prevents generic SaaS landing-page invention | Current product is the dashboard only | No site, documentation site, product marketing | No marketing site until positioning is approved | High | Yes |

## Development Conversation Availability

No development-chat export exists inside the project repository. The complete local IDE/LLM conversation history was not inspected because it was outside the project boundary and could contain unrelated or private material. If historical decisions are needed, export a curated, redacted source to:

```text
docs/research/development-chat-history.md
```

The export should identify decisions, dates, rejected alternatives, and owner statements without credentials or unrelated conversation content.

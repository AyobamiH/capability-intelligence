# Capability Intelligence Evidence Index

## Scope

This index links major dossier conclusions to repository or runtime evidence. Runtime observations were performed on 16 July 2026 against commit `d79bcc6`. Temporary screenshots were stored outside the repository under `/tmp/capability-intelligence-product-recon/` and were not committed.

| Conclusion | Classification | Evidence | Notes |
|---|---|---|---|
| Product name is Capability Intelligence | CONFIRMED | `package.json`; `README.md`; `static/index.html` | Consistent across surfaces |
| Product is standalone and local-first | CONFIRMED | `README.md`; `AGENTS.md`; `docs/product-contract.md` | Explicit positioning |
| Product is not OpsTruth or an autonomous workflow executor | CONFIRMED | `README.md`; `AGENTS.md`; `docs/product-contract.md` | Explicit exclusion |
| Product inventories metadata and does not invoke capabilities | CONFIRMED | `AGENTS.md`; no invocation adapter; CLI command set | Default commands are inventory operations |
| Package is private version 0.1.0 | CONFIRMED | `package.json` | No publication conclusion implied |
| Current maturity is early local alpha | INFERRED | `package.json`; two-commit `git log`; no remote/deployment | Maturity label is not explicitly documented |
| User-facing applications are CLI and loopback dashboard | CONFIRMED | `src/cli.js`; `src/server.js`; `static/` | No other package or app |
| Frontend and backend share one Node package | CONFIRMED | `package.json`; 35 tracked files; repository tree | No monorepo/workspace configuration |
| Node.js 20+ is required | CONFIRMED | `package.json#engines` | Runtime requirement |
| Runtime has no third-party dependencies | CONFIRMED | `package.json`; `package-lock.json` | Development uses built-in Node APIs |
| Default source paths are allowlisted | CONFIRMED | `src/scanner.js#defaultConfig`; adapters | Paths are constructed, not user-wide recursive crawl |
| Sessions, logs, credentials, `.env`, and similar paths are excluded | CONFIRMED | `src/utils.js#EXCLUDED_SEGMENTS`; `AGENTS.md`; `docs/privacy.md` | Safety contract and implementation agree |
| Default scan makes no network request | CONFIRMED | README/AGENTS; adapters use filesystem only | HTTP is used only for local `serve` |
| Current scan mode is `local-read-only` | CONFIRMED | `src/scanner.js#scanEnvironment`; runtime JSON | Top-level inventory field |
| Lifecycle has seven separate states | CONFIRMED | `src/model.js#LIFECYCLE_STATES`; product contract | discovered through verified |
| Lifecycle values include yes/no/unknown/not_applicable by convention | CONFIRMED | observed inventory; adapter code | JSON schema does not currently constrain values |
| Installed does not imply later lifecycle states | CONFIRMED | `docs/product-contract.md`; test `installed does not imply...` | Explicit regression test |
| Only future observed evidence may set verified yes | CONFIRMED/PLANNED | product contract evidence section | Rule confirmed; receipt source planned |
| No observed artifact is verified | CONFIRMED | runtime aggregate: 6,353 `verified: unknown` | Point-in-time environment evidence |
| Evidence levels defined are declared, structural, inferred, observed, unknown | CONFIRMED | `src/model.js#EVIDENCE_LEVELS`; product contract | Runtime used first three only |
| Risk has critical/high/medium/low/unknown levels | CONFIRMED | `src/model.js#normaliseRisk`; dashboard filters | Risk is metadata-derived |
| Destructive and open-world app tools are critical | CONFIRMED | `src/model.js#toolRisk`; scanner test | Rule, not runtime security proof |
| Hooks are high risk by component rule | CONFIRMED | `src/model.js#componentRisk` | Structural heuristic |
| Six adapters produce ten source surfaces | CONFIRMED | `src/scanner.js#ADAPTERS`; runtime source list | Some adapters emit multiple source records |
| Current strict inventory contains 6,353 artifacts | CONFIRMED | strict runtime scan; `docs/source-coverage.md` | Point-in-time count |
| Current inventory contains 734 skills | CONFIRMED | strict runtime scan | Includes catalogue, installed and local roots |
| Current inventory contains 180 catalogue plugin manifests | CONFIRMED | strict runtime scan; marketplace reconciliation | All represented |
| 111 records are unlabelled plugin manifests, not skills | CONFIRMED | `docs/source-coverage.md`; plugin adapter | All retained and counted |
| Current installed-plugin cache has 7 represented versions | CONFIRMED | runtime source/artifact counts | Cache presence does not prove active enablement |
| Current inventory contains 161 app integrations and 9 MCP servers | CONFIRMED | strict runtime scan | Catalogue plus installed artifacts |
| Current inventory contains 250 app tools | CONFIRMED | strict runtime scan; app-tools source | Raw input/output schemas are not emitted |
| Current connector snapshots contain 17,712 records deduplicated to 4,768 | CONFIRMED | runtime source accounting | 12,944 deduplicated |
| Current workflow library contributes 126 records and 32 routes | CONFIRMED | runtime source accounting; strict summary | Library implementation is not copied |
| Strict coverage passes with no findings | CONFIRMED | `scan --strict --summary`; `doctor`; runtime JSON | Point-in-time result |
| Strict coverage fails on adapter/parse/accounting/safety errors | CONFIRMED | `src/scanner.js#evaluateCoverage`; scanner tests | Failure semantics |
| Duplicate artifact IDs are rejected | CONFIRMED | `src/scanner.js#scanEnvironment` | Error finding is added |
| Unsafe keys and values are detected | CONFIRMED | `findUnsafeOutput`; scanner safety test | Includes auth fields, home paths, JWT-like values, keys |
| Current graph has 1,157 edges and 54 duplicate skill-name groups | CONFIRMED | runtime aggregate | Duplicate logic is name-only |
| CLI has ten main commands | CONFIRMED | `src/cli.js#HELP` | scan, coverage, ask, inspect, doctor, risks, duplicates, diff, export, serve |
| CLI supports human and JSON output | CONFIRMED | `src/cli.js#emit`; tests | Export is always JSON |
| Outcome search returns at most 20 results | CONFIRMED | `src/query.js#searchArtifacts` | Fixed default limit |
| Outcome search returns unrelated results for empty/unmatched queries | CONFIRMED defect | `src/classify.js#matchOutcome`; runtime probes `qxvplm` and empty q returned 20 | Readiness score does not require a matched token |
| Dashboard search uses different semantics from CLI/API | CONFIRMED | `static/app.js#applyFilters`; `src/query.js` | AND substring versus scored concepts |
| Artifact inspection returns graph relationships in CLI | CONFIRMED | `src/query.js#inspectArtifact`; runtime `plugin:hyperframes` | Dashboard omits graph edges |
| Risk level input is not validated | CONFIRMED defect | runtime `risks --level nonsense` returned exit 0 | No accepted-value check in CLI |
| Unknown CLI options are silently accepted | CONFIRMED defect | runtime `scan --bogus value` exited 0; parser code | Options are collected but not rejected |
| Redacted export removes home paths and selected private fields | CONFIRMED | `redactedInventory`; tests; runtime export | Does not claim complete anonymisation |
| New redacted export file was mode 0600 | CONFIRMED | runtime `stat` on `/tmp/capability-recon-redacted.json` | Existing-file mode behaviour not proven safe |
| Export can overwrite a chosen file | CONFIRMED | `fs.writeFileSync` in `src/cli.js` | No confirmation or force flag |
| Server binds to loopback only | CONFIRMED | `src/server.js#startServer` | `127.0.0.1` hard-coded |
| Server inventory is scanned once at startup | CONFIRMED | `startServer` | No refresh route |
| HTTP routes accept GET only | CONFIRMED | request handler; runtime POST `/health` -> 405 | No mutation API |
| `/`, CSS and JS return 200 | CONFIRMED | runtime route probe | Static user interface reachable |
| `/health` returns process and coverage status | CONFIRMED | runtime route probe; server code | Observed status ok/passed |
| `/api/inventory` returned 6,353 artifacts and ten sources | CONFIRMED | runtime route probe | Startup snapshot |
| `/api/coverage` returned passed and 111 unlabelled manifests | CONFIRMED | runtime route probe | Source accounting only |
| Missing path returns 404 JSON | CONFIRMED | runtime `/missing`; server code | `not_found` |
| Non-GET request returns 405 JSON | CONFIRMED | runtime POST; server code | `method_not_allowed` |
| Observed full inventory JSON is 6,507,138 bytes | CONFIRMED | `/tmp/capability-recon-inventory.json` stat | Performance evidence for current machine |
| Dashboard renders at most 500 rows | CONFIRMED | `static/app.js#applyFilters` | Count displays `500+ shown` |
| Dashboard uses full inventory API rather than search API | CONFIRMED | `static/app.js#boot` | Full payload is loaded client-side |
| Dashboard has loading and generic error copy | CONFIRMED | `static/index.html`; `static/app.js#boot` | No retry or error detail |
| Dashboard has no dedicated filtered-empty message | CONFIRMED | `renderRows` | Empty table and `0 shown` only |
| Dashboard row supports click, Enter and Space | CONFIRMED | `static/app.js#renderRows` | Keyboard path exists |
| Interactive row lacks explicit role and selected ARIA | CONFIRMED | `renderRows`, `selectArtifact` | Accessibility gap |
| Mobile table scrolls internally without page overflow | CONFIRMED | CSS; browser audit at 320x800 | Automated assertion passed |
| Mobile evidence panel follows inventory after stacking | CONFIRMED | HTML order; CSS <=980px | High UX impact with up to 500 rows |
| Desktop uses table/detail two-column layout | CONFIRMED | CSS; 1440x900 screenshot | Detail is sticky |
| Current UI is dark-only and framework-free | CONFIRMED | `static/styles.css`; package | No formal brand policy implied |
| There are no logo, icon, image or illustration assets | CONFIRMED | complete tracked-file inventory | Text identity only |
| There are no accounts, roles, database, billing, notifications, or analytics | CONFIRMED | complete source/tree/route inspection | Absence in current repository |
| Hosted control plane is future-only | PLANNED | `docs/saas-architecture.md` | No code, routes, model or deployment |
| skills.sh, APM, and MCP Registry sources are future directions | PLANNED | `docs/saas-architecture.md` | No adapters exist |
| Owner excludes neon/cyberpunk/glow/generic AI design | CONFIRMED owner requirement | Supplied reconnaissance brief | External product-owner constraint |
| No project-local development chat was inspected | CONFIRMED limitation | Repository contains no chat export | External histories were outside project boundary |

## Test Evidence

The following named behaviours are covered in `test/scanner.test.js` and `test/cli-server.test.js`:

- Complete synthetic source representation without silent loss.
- First-class catalogue integrations and installed plugin resources.
- Retention of unlabelled manifests.
- Separation of installed from later lifecycle states.
- Risk from app-tool annotations without raw schema output.
- Connector deduplication without private identity output.
- Duplicate skill names and host drift.
- Deterministic outcome search.
- Graph relationships in inspection.
- Redacted export path/description removal.
- Fail-closed malformed JSON handling.
- Unsafe-value detection.
- Byte-equivalent repeated scans.
- CLI argument parsing, strict scan, query, diff, and export.
- HTTP handler health/inventory/coverage/search.
- Responsive CSS constraints.

The test suite does not currently assert correct no-match search behaviour, unknown-option rejection, risk-level validation, export overwrite policy, complete JSON-schema enforcement, or accessibility semantics.

## Development History Evidence

The local git history contains two product commits:

- `c6194d6 Build local capability intelligence hard cutover`
- `d79bcc6 Complete installed capability source coverage`

There is no configured remote in the observed product repository and no project-local issue, pull-request, changelog, design file, or development-chat export.

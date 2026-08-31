# Service, Media, And App Recommendation Evaluation

## Purpose

This evaluation exercises Capability Intelligence against a materially different local task family from the earlier coding-workflow evaluations. It is a sanitized product test, not capability execution evidence.

## Boundaries

- The scan used only allowlisted local metadata.
- No capability was installed, enabled, authenticated, invoked, or removed.
- No network request or external service mutation was performed.
- Expected selections were chosen from currently discoverable task-specific capabilities before policy correction.
- Passing these cases does not prove universal recommendation quality or runtime readiness.

## Live Source Finding

The initial strict scan discovered 64 Codex marketplace index records and 62 materialized plugin manifests. The two indexed-only records were silently absent from the artifact inventory and caused a marketplace/manifests count failure.

The corrected adapter emits a structural placeholder for each indexed-only entry:

- `discovered=yes`
- `present=no`
- no invented integration surfaces
- unknown enabled, authenticated, runnable, and verified states

After correction, strict coverage passed with 14 accounted source records and 7,548 artifacts in this environment. These counts are an observation of this run, not a portable package constant.

## Recommendation Results

| Outcome | Accepted capability | Initial | Corrected | Requested authority |
| --- | --- | --- | --- | --- |
| Find and summarize a Google Drive document without changing it | `google-drive` | pass | pass | read only |
| Analyze and update a Google spreadsheet | `google-sheets` | pass, authority wrong | pass | external write |
| Create a product launch video from a marketing URL | `product-launch-video` | pass | pass | local write |
| Add captions to a talking-head video | `embedded-captions` | `talking-head-recut`, authority wrong | pass | local write |
| Animate a deterministic Three.js scene for HyperFrames | `three` or `hyperframes-animation` | pass, authority wrong | pass | local write |
| Inspect and change plugin permission settings | `plugin-management` | pass, authority wrong | pass | external write |
| Research deeply with authoritative sources and citations | `deep-research` | pass, authority unspecified | pass | read only |
| Install a Codex skill from a GitHub repository | `skill-installer` | pass | pass | local write |
| Create a new Codex skill | `skill-creator` | `figma-create-new-file` | pass | local write |
| Turn a pull request into a code-change explainer video | `pr-to-video` | pass, authority wrong | pass | local write |
| Capture a website into a social video | `website-to-video` or `website-to-hyperframes` | pass, authority wrong | pass | local write |
| Edit a Google Slides deck using its template | `google-slides` | pass, authority wrong | pass | external write |

Initial accepted selections: 10/12. Corrected accepted selections: 12/12. Every result retained `automaticAction=false`.

## Defect Boundary

Two scoring problems and eight authority-classification problems were proven:

1. context words in `talking-head-recut` outweighed complete description coverage for the requested caption operation;
2. generic name words in `figma-create-new-file` outweighed the requested `skill` object.

The authority defects covered missing local artifact verbs, deep research, plugin-setting mutation, and writes to named Google app content. The corrected result distinguishes local artifact production from external service mutation.

The correction discounts generic action/name terms (`add`, `create`, `new`) as discriminating name evidence and adds explicit intent coverage. It does not add an LLM, task-specific hardcoded capability map, execution broker, or automatic action.

## Regression Review

The prior independent 12-case workflow-foundation evaluation remained 12/12. Three exact names from the older nine-case environment changed under the current catalogue: a dedicated migration helper superseded its wrapper skill, a generic Supabase skill replaced a scheduler/Vault mutation skill for a read-only query, and the former `gh-fix-ci` artifact was no longer present. Those are catalogue changes, not reasons to force stale candidates back into current ranking.

## Next Evidence

Further recommendation changes require a failed real task handoff or another genuinely different environment. Issuer authentication remains blocked until at least two independent receipt producers exist.

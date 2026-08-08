# 2026-07-16 Product Reconnaissance Archive

These files are an evidence snapshot of Capability Intelligence at commit `d79bcc6`. They are retained because they contain unique research and handoff context, but they are not current product authority.

Later commits resolved material findings in the snapshot:

- `248bf65` requires positive outcome relevance;
- `b25a805` rejects invalid CLI input;
- `1de53d8` adds shared search, bounded pagination, relationship detail, diagnostics, host comparison, nested validation, and safe export overwrite;
- `e299196` adds connector lifecycle truth and bounded observed receipts.

Use `docs/product-contract.md`, `docs/product-decisions.md`, `docs/BACKLOG.md`, and `docs/MATURITY.md` for current decisions. Use live CLI output for current counts.

## File Decisions

| File | Decision | Evidence-based reason |
| --- | --- | --- |
| `COPYWRITER_HANDOFF.md` | Archive | Preserves terminology, audience, and trust-copy research, but calls receipts planned and search/overwrite behavior unresolved. |
| `EVIDENCE_INDEX.md` | Archive | Preserves the strongest source-to-claim index for the baseline, but records defects and schema limitations repaired after `d79bcc6`. |
| `LOVABLE_BUILD_CONTEXT.md` | Archive | Preserves a bounded implementation handoff, but no Lovable build is selected and its required states describe the old dashboard. |
| `OPEN_QUESTIONS.md` | Archive | Preserves decision provenance, but search, pagination, export, schema, and receipt questions are now resolved in canonical documents. |
| `PRODUCT_DOSSIER.md` | Archive | Preserves the most complete baseline narrative, but its counts, six-adapter architecture, UI behavior, and current limitations are historical. |
| `UX_UI_HANDOFF.md` | Archive | Preserves useful accessibility and design constraints, but its high-severity search, payload, row-cap, and detail-placement findings no longer describe the current UI. |
| `product-model.json` | Archive | Preserves a machine-readable `d79bcc6` model, but it has no current consumer and encodes resolved defects as active limitations. |

## Boundaries

- The archive is tracked historical evidence, not an active build brief.
- It is excluded from package contents.
- It contains no detected secret-shaped values or maintainer-specific absolute paths.
- Future work may extract still-valid constraints into canonical docs, but must not silently revive historical defect claims.

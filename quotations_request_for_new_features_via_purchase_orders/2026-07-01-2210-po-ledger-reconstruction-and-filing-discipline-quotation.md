# Quotation: 2026-07-01-2210-po-ledger-reconstruction-and-filing-discipline

status: quotation request
quotation number: 2026-07-01-2210
title: PO Ledger Reconstruction and Filing Discipline
target repo: Ventusltd/data-federation-map-for-globalgrid2050-all-repos
target folder after acceptance: build_ladder_purchase_orders
target folder for this quotation record: quotations_request_for_new_features_via_purchase_orders
logged because: Vikram explicitly requested this quotation request to be recorded
purchase order status: not yet accepted as a PO

## Quotation request to Claude

Claude, this is a quotation request, not yet a purchase order. Vikram wants every future request for a purchase order to first be called a quotation, given a proper chronological number, and only converted into a PO after acceptance. Quotations do not need to be logged unless Vikram explicitly asks. This quotation is being logged only because Vikram explicitly asked for it to be recorded.

This quotation is for creating a proper purchase-order ledger inside the repository Ventusltd/data-federation-map-for-globalgrid2050-all-repos. The target folder is build_ladder_purchase_orders. The purpose is to make the repo itself preserve the build-control history, instead of relying on long chat threads, memory, or screenshots.

The README inside build_ladder_purchase_orders should remain commentary and a simple progress note only. The actual purchase orders should be individual Markdown files inside that folder. Each PO or work order should have its own file. The files should follow this naming format:

YYYY-MM-DD-HHMM-title-of-po.md

For the POs already executed or presently active, use 2026-07-01 as the filing date and use neat chronological filing times up to 22:00. The timestamp in the filename is the ledger filing time, not necessarily the real execution time. The real audit, branch, merge, apply, receipt, and closing times should be preserved inside each file where known.

The proposed filing order is:

2026-07-01-2100-po-7a-auditor-clean-clone-verification-contract.md

2026-07-01-2110-po-0-scanner-endpoint-integrity-and-committed-parquet-truth-store.md

2026-07-01-2120-po-2a-provenance-discriminator-field-for-base-federation-edges.md

2026-07-01-2130-ui-po-the-spider-engine-sandbox-and-live-promotion.md

2026-07-01-2140-homepage-flag-po-future-homepage.md

2026-07-01-2150-homepage-flag-po-current-live-homepage.md

2026-07-01-2200-po-1-declared-only-per-repo-cartridges.md

This quotation, if accepted, should also become its own PO file after acceptance, probably:

2026-07-01-2210-po-ledger-reconstruction-and-filing-discipline.md

Do not create or log quotation files unless Vikram explicitly asks. Only accepted POs should become Markdown files in build_ladder_purchase_orders.

Each PO file should include a clear plain-text header with the following fields:

status

PO number or work-order label

title

executor

auditor

target repository

target files

branch if relevant

PR number if relevant

merge SHA if relevant

audit SHA if relevant

apply SHA if relevant

closing SHA if received

receipt status

evidence source

The closing SHA must be the actual completion, receipt, promotion, or apply SHA. It must not be the later documentation filing commit SHA. The ledger commit is only the filing commit. It is not the proof of the PO.

Known PO close-out details to preserve:

PO 7a — Auditor Clean-Clone Verification Contract. Status received / closed. Target repo Ventusltd/data-federation-map-for-globalgrid2050-all-repos. Target file every-drop-is-the-ocean/AUDITOR_VERIFICATION_CONTRACT.md. Closing SHA deb028daead61cc8ebb472bc1058fa2490c9fe7d. Purpose: create the reusable independent clean-clone verification contract.

PO 0 — Scanner Endpoint Integrity and Committed Parquet Truth Store. Status received / closed. PR #1. Code/workflow merge SHA caf6b42d1fef24b2b1d57e003025067932df60ab. Apply and closing SHA 7462ecaf2b3b171fd53c8bbeabb55ce2a7462f48. Receipt: clean clone, edge endpoints resolve to zero dangling endpoints. Purpose: fix endpoint integrity, canonicalise repo references, and make committed Parquet the truth store.

PO 2a — Provenance Discriminator Field for Base Federation Edges. Status received / closed. PR #2. Merge SHA ca2baf4da84af379f2cb415fc088a73bd14ad989. Audit SHA fa2a451dc37a2d3ef8f81defa0683db1432572d4. Apply and closing SHA 76cc95f1ddc9943e874d654cba848427da25e20b. Receipt: clean clone recomputed 303 edges, provenance column present equals 1, null provenance rows 0, invalid provenance rows 0, derived rows in base 0, declared rows 303, dangling endpoints 0, verification passed, data law PASS.

UI PO — The Spider Engine Sandbox and Live Promotion. Status received / live. This is a UI track item, not part of the data PO ladder. The Spider README commit 71bc26d64139546d811fbe488e359e0c3ab22547. Sandbox commit 9bd6352d90b1390225bca351a652e2afdf17f589. Live promotion and closing SHA 2c3c8b53dfd2dedc64ed095a18ce0feb0d8c87f3. Purpose: create the uniform default column layout, optional spider view, and promote the accepted sandbox to live.

Homepage Flag PO — Future Homepage. Status received / closed. Target repo Ventusltd/globalgrid2050-hompage. Closing SHA 657c2d74f898fc5f7d80aca754b0be2b90e88cf4. Purpose: plant The Spider flag above the red line on the future homepage repository.

Homepage Flag PO — Current Live Homepage. Status received / closed. Target repo Ventusltd/globalgrid2050. Closing SHA 4d6d9c2de3786651fa2c0a9d516a474fd6985087. Purpose: plant The Spider flag on the current live homepage served at globalgrid2050.com.

PO 1 — Declared-Only Per-Repo Cartridges. Status in flight / audit branch. PR #3 is open. Branch po1-declared-cartridges. Branch head SHA at PR creation e3f110902838d57c334e26239bc1eb665bb4eff1. Closing SHA pending. This must not be marked received or closed. It has not been applied to main.

For the body of each file, include the actual PO wording where available. If exact wording is not available, mark the text as reconstructed and state the evidence source, such as PR body, commit history, audit receipt, or chat handoff. Do not invent missing scope. If the PO had technical requirements, include those requirements. If it was a UI PO, include the UI requirements. If it was a data PO, include the data law and receipt checks.

There is already an accidental short PO 7a summary file in the folder. Treat it as insufficient. Recommend whether to replace it, rename it, or mark it superseded. Preserve the audit chain. Do not silently delete or hide history without saying what happened.

Out of scope for this quotation: no code changes, no data changes, no workflow changes, no UI changes, no homepage changes, no scanner changes, no cartridge generation, no PO 1 execution, no merging, and no apply run. This task is documentation-only inside build_ladder_purchase_orders after acceptance.

Deliverable from Claude now: provide the exact Markdown content for each PO file and the recommended rename or supersede action for the accidental PO 7a file. If renumbering is proposed, give an old-to-new mapping and preserve all old references.

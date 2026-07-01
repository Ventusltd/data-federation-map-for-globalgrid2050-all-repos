# QT-2026-07-01-2220 — PO Ledger Chronology Fixes and Canonical PO Files

status: quotation request
document type: QT
quotation number: QT-2026-07-01-2220
title: PO Ledger Chronology Fixes and Canonical PO Files
target repo: Ventusltd/data-federation-map-for-globalgrid2050-all-repos
target folder after acceptance: build_ladder_purchase_orders
target folder for this quotation record: quotations_request_for_new_features_via_purchase_orders
extends QT: QT-2026-07-01-2210
answered by PO: pending
purchase order status: not yet accepted as a PO
logged because: Vikram explicitly requested this additional quotation to be recorded

## Quotation request to Claude

Claude, this is a quotation request, not yet an accepted purchase order. It extends QT-2026-07-01-2210 and adds stricter chronology and tag rules for the purchase-order ledger.

The repository is Ventusltd/data-federation-map-for-globalgrid2050-all-repos.

The target folder for accepted purchase orders is build_ladder_purchase_orders.

The target folder for quotations and RFIs is quotations_request_for_new_features_via_purchase_orders.

The README in build_ladder_purchase_orders is only commentary and a light progress log. The accepted PO records themselves must be separate Markdown files in that folder.

The rule is now:

QT means quotation. It is a pre-PO scope or quotation request.

RFI means request for information. It is a pre-PO information request that may later lead to a QT or PO.

PO means accepted purchase order. Only accepted purchase orders go into build_ladder_purchase_orders.

The file prefix must always begin with the sortable filing timestamp, then the document tag, then the title:

YYYY-MM-DD-HHMM-QT-title.md

YYYY-MM-DD-HHMM-RFI-title.md

YYYY-MM-DD-HHMM-PO-title.md

The tag should be uppercase in filenames. Use QT, RFI, and PO. Do not use lowercase qt, rfi, or po in future canonical filenames.

The timestamp in the filename is the ledger filing timestamp. It is not claimed to be the actual execution time. Actual execution, audit, merge, apply, receipt, and close-out times must be preserved inside the file body where known.

The body header should preserve truth. The filename preserves chronology. The closing SHA preserves proof.

A QT may later be answered by one or more POs. When that happens, the QT file should be updated or referenced with:

answered by PO: <PO file or PO number>

The accepted PO file should include:

answered QT: <QT number>

For this current case, QT-2026-07-01-2210 and QT-2026-07-01-2220 should be answered by a later accepted PO for the PO ledger reconstruction, if Vikram accepts it.

A small cleanup has already been performed to improve chronology. The lowercase QT filename was replaced with an uppercase QT filename. The accidental non-chronological PO 7a summary file at 2026-07-01-2213-po-7a-auditor-clean-clone-verification-contract.md was replaced by a chronological placeholder at 2026-07-01-2100-PO-7a-auditor-clean-clone-verification-contract.md. That placeholder must be treated as incomplete. It preserves known facts only and explicitly says the canonical body is pending Claude reconstruction.

Please now prepare the full canonical accepted PO ledger contents for Vikram to approve. Do not commit them yourself. Return exact Markdown content that can be placed into files.

Accepted PO files should be prepared in this chronological order:

2026-07-01-2100-PO-7a-auditor-clean-clone-verification-contract.md

2026-07-01-2110-PO-0-scanner-endpoint-integrity-and-committed-parquet-truth-store.md

2026-07-01-2120-PO-2a-provenance-discriminator-field-for-base-federation-edges.md

2026-07-01-2130-PO-ui-the-spider-engine-sandbox-and-live-promotion.md

2026-07-01-2140-PO-homepage-flag-future-homepage.md

2026-07-01-2150-PO-homepage-flag-current-live-homepage.md

2026-07-01-2200-PO-1-declared-only-per-repo-cartridges.md

If this QT itself is accepted, prepare a later accepted PO file:

2026-07-01-2220-PO-po-ledger-chronology-fixes-and-canonical-po-files.md

That accepted PO should include:

answered QT: QT-2026-07-01-2210 and QT-2026-07-01-2220

status: issued / accepted, then later received / closed once committed and verified

For each canonical accepted PO file, include a plain header with:

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

answered QT if applicable

The closing SHA must be the actual apply, promotion, receipt, or close-out SHA. It must not be the later documentation filing commit SHA.

Known received / in-flight entries to preserve:

PO 7a — Auditor Clean-Clone Verification Contract. Status received / closed. Target repo Ventusltd/data-federation-map-for-globalgrid2050-all-repos. Target file every-drop-is-the-ocean/AUDITOR_VERIFICATION_CONTRACT.md. Closing SHA deb028daead61cc8ebb472bc1058fa2490c9fe7d. Purpose: create the reusable independent clean-clone verification contract. The current 21:00 placeholder is incomplete and should be replaced with a fuller canonical body if exact or reconstructed evidence is available.

PO 0 — Scanner Endpoint Integrity and Committed Parquet Truth Store. Status received / closed. PR #1. Code/workflow merge SHA caf6b42d1fef24b2b1d57e003025067932df60ab. Apply and closing SHA 7462ecaf2b3b171fd53c8bbeabb55ce2a7462f48. Receipt: clean clone, edge_endpoints_resolve = 0. Purpose: fix endpoint integrity, canonicalise repo references, and make committed Parquet the truth store.

PO 2a — Provenance Discriminator Field for Base Federation Edges. Status received / closed. PR #2. Merge SHA ca2baf4da84af379f2cb415fc088a73bd14ad989. Audit SHA fa2a451dc37a2d3ef8f81defa0683db1432572d4. Apply and closing SHA 76cc95f1ddc9943e874d654cba848427da25e20b. Receipt: clean-clone recompute showed provenance column present = 1, null provenance rows = 0, invalid provenance rows = 0, derived rows in base = 0, declared rows = 303, dangling endpoints = 0, verificationPassed true, dataLawResult PASS.

UI PO — The Spider Engine Sandbox and Live Promotion. Status received / live. This is a UI track PO, not part of the data ladder. The Spider README commit 71bc26d64139546d811fbe488e359e0c3ab22547. Sandbox commit 9bd6352d90b1390225bca351a652e2afdf17f589. Live promotion and closing SHA 2c3c8b53dfd2dedc64ed095a18ce0feb0d8c87f3. Purpose: create the uniform default column layout, optional spider view, and promote the accepted sandbox to live.

Homepage Flag PO — Future Homepage. Status received / closed. Target repo Ventusltd/globalgrid2050-hompage. Closing SHA 657c2d74f898fc5f7d80aca754b0be2b90e88cf4. Purpose: plant The Spider flag above the red line on the future homepage repository.

Homepage Flag PO — Current Live Homepage. Status received / closed. Target repo Ventusltd/globalgrid2050. Closing SHA 4d6d9c2de3786651fa2c0a9d516a474fd6985087. Purpose: plant The Spider flag on the current live homepage served at globalgrid2050.com.

PO 1 — Declared-Only Per-Repo Cartridges. Status in flight / audit branch. PR #3 is open. Branch po1-declared-cartridges. Branch head SHA at PR creation e3f110902838d57c334e26239bc1eb665bb4eff1. Closing SHA pending. This must not be marked received or closed. It has not been applied to main.

Do not invent missing original PO text. If exact wording is unavailable, mark that section as reconstructed and state the evidence source. Good evidence sources include PR body, commit history, audit receipt, report text, and chat handoff. If the original PO contained code-level requirements, include those requirements as PO text. If it was UI work, include the UI requirements. If it was data work, include the data law and clean-clone receipt checks.

Do not perform code changes. Do not perform data changes. Do not perform workflow changes. Do not perform UI changes. Do not perform homepage changes. Do not run PO 1. Do not merge anything. This quotation is only about producing canonical Markdown text for accepted PO ledger files after Vikram accepts the quotation.

Deliverables requested from Claude:

Provide the exact Markdown content for each accepted PO file.

Provide a note explaining how QT files are answered by PO files.

Provide any old-to-new mapping if you recommend renumbering.

Preserve old PO references even if you recommend cleaner chronology.

State clearly which entries are exact and which are reconstructed.

State clearly that the 21:00 PO 7a file is currently only a placeholder pending canonical content.

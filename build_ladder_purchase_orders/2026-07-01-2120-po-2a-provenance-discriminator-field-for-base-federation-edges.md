# PO 2a — Provenance Discriminator Field for Base Federation Edges

status: received / closed
po: PO 2a
title: Provenance Discriminator Field for Base Federation Edges
executor: ChatGPT
auditor: Claude
target repository: Ventusltd/data-federation-map-for-globalgrid2050-all-repos
target files: federation-map edge store data/federation_map/current/edges.parquet; report reports/json/FEDERATION_MAP_LATEST.json; contract clause every-drop-is-the-ocean/AUDITOR_VERIFICATION_CONTRACT.md §4.3
branch: po2a-provenance-discriminator
PR number: PR #2
merge SHA: ca2baf4da84af379f2cb415fc088a73bd14ad989
audit SHA: fa2a451dc37a2d3ef8f81defa0683db1432572d4
apply SHA: 76cc95f1ddc9943e874d654cba848427da25e20b
closing SHA: 76cc95f1ddc9943e874d654cba848427da25e20b
receipt status: RECEIVED — independent clean-clone receipt run by the auditor (Claude) this session against the apply SHA
evidence source: auditor clean-clone recompute at 76cc95f (this session) + provided close-out details

## Scope

Add a provenance discriminator column to every base federation edge so that declared references and (future) derived references are strictly separable at the data layer. PO 2a stamps the existing base as provenance = declared and forbids any derived rows in the base edge store. The provenance enum is exactly {declared, derived}.

## Data law / receipt checks (acceptance bar)

Reproduced by the auditor from a clean clone at 76cc95f1ddc9943e874d654cba848427da25e20b:

- methodVersion = federation_map_dna_v3_provenance_discriminator
- currentNodeRows = 16
- currentEdgeRows = 303
- edgeProvenanceColumnPresent = 1
- edgeProvenanceNullRows = 0
- edgeProvenanceInvalidRows = 0 (only value present across all 303 rows is "declared")
- derivedRowsInBaseEdges = 0
- declaredRowsInBaseEdges = 303 (equals total edge rows exactly)
- danglingEdgeEndpoints = 0
- verificationPassed = true
- dataLawResult = PASS

Extra confirmations by the auditor: the report carries all five provenance fields; AUDITOR_VERIFICATION_CONTRACT.md §4.3 `provenance_field_present_and_valid` is present; committed current/edges.parquet is byte-identical (md5) to the latest snapshot at month=07/week=27.

## Receipt

RECEIVED. Merged at PR #2 (ca2baf4…), audited at fa2a451…, applied and closed at 76cc95f…. The auditor independently reproduced every acceptance number from a fresh clone rather than reading back the committed report.

## Known follow-on (parked, not part of PO 2a)

- Snapshot partitioning shows two folders for the same ISO week (year=2026/month=06/week=27 = pre-apply 302 edges; month=07/week=27 = this apply 303 edges). ISO week 27 straddles June/July. Explicitly parked for PO 2b layout/partition discipline. Not a PO 2a defect.

## Notes

- Acceptance checks above are exact (auditor-authored and auditor-reproduced). Surrounding scope prose is faithful to the recorded purpose.
- Filing note: the ledger commit adding this file is the filing commit only, not proof of the PO. Closing SHA above is the actual apply/completion SHA.

# QT — Spider NESO and Elexon Foundation Sources

status: QUOTATION ONLY — not accepted, not a purchase order, not authorised for build
quote: QT Spider API 2
title: Spider NESO and Elexon Foundation Sources
target repository: Ventusltd/data-federation-map-for-globalgrid2050-all-repos
source study: dashboard/BEST-API-for-VENTUS-SPIDER.md
current gate: PO 1 must be independently receipted and applied before this can become a build PO
required predecessor if accepted: Spider External API Registry and Licence Triage, unless Vikram explicitly waives it
executor if accepted: ChatGPT
auditor if accepted: Claude
principal / apply authority: Vikram

## Purpose

Formalise the two foundation GB system and market sources for the Spider: NESO as the system and carbon/context spine, and Elexon as the existing electricity-market source that should be deepened rather than re-added.

## Scope if accepted

Create declared source-contract records for:

```text
NESO Data Portal / CKAN
NESO Carbon Intensity API
Elexon Insights / BMRS
```

For each source, record:

```text
official name
owner
licence / terms
attribution wording if known
endpoint family
rate limit or access caveat
authentication requirement
candidate consuming repos
candidate declared edges
classification: ingest / interoperate / align
recommended caching cadence
open questions for auditor review
```

Expected candidate declared edges to stage, not apply:

```text
globalgrid2050 -> NESO_data_portal
data-gb-electricity -> NESO_data_portal
gb-electricity-ui -> NESO_carbon_intensity_api
data-gb-electricity -> Elexon_Insights_BMRS
data-interconnectors -> Elexon_Insights_BMRS
globalgrid2050 -> Elexon_Insights_BMRS
```

## Out of scope

No live API fetch.

No new committed Parquet rows.

No mutation of `data/federation_map/current/`.

No UI wiring.

No derived rollups.

No acceptance that licence terms are complete until auditor review.

No credentials.

## Acceptance checks if accepted

The executor must return a report proving:

```text
source_contracts_present_for_neso_data_portal_neso_carbon_intensity_and_elexon
licence_or_terms_recorded_for_each_source
rate_limit_or_access_caveat_recorded_for_each_source
candidate_edges_declared_but_not_applied
no_parquet_files_changed
no_live_api_fetch_performed
no_credentials_committed
no_ui_files_changed
po1_gate_respected
```

Claude must independently verify from a clean clone that the work is documentation/source-contract only and that no data or UI target was touched.

## Notes

This quotation intentionally separates foundation source contracts from ingestion. A later ingestion PO may only follow after the contracts, licence fields and source registry have been accepted.

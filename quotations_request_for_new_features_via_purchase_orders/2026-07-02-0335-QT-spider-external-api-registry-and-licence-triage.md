# QT — Spider External API Registry and Licence Triage

status: QUOTATION ONLY — not accepted, not a purchase order, not authorised for build
quote: QT Spider API 1
title: Spider External API Registry and Licence Triage
target repository: Ventusltd/data-federation-map-for-globalgrid2050-all-repos
target area if accepted: config/, schemas/, docs/ or dashboard/ only until a later accepted data PO
governance source: dashboard/BEST-API-for-VENTUS-SPIDER.md
current gate: PO 1 must be independently receipted and applied before this can become a build PO
executor if accepted: ChatGPT
auditor if accepted: Claude
principal / apply authority: Vikram

## Purpose

Turn the external API study into a controlled, machine-readable source registry before any API is ingested or any committed Parquet truth store is changed.

This quotation exists because the Spider can only become an operative controller if each external source is declared with its licence, access mode, rate-limit caveat, attribution duty, consuming repo, and role in the federation.

## Scope if accepted

Create a declared external-source registry schema and registry document covering the API candidates from `dashboard/BEST-API-for-VENTUS-SPIDER.md`.

Each candidate source record must carry at minimum:

```text
source_id
display_name
owning_body
source_family
endpoint_type
licence
required_attribution
authentication_requirement
rate_limit_or_access_caveat
cost_status
consuming_repos
classification: ingest / interoperate / align
provenance: declared
status: proposed / active / deferred / blocked
sensitivity_note
last_verified_utc
verification_source
```

The first registry pass should include these families as declared candidates only:

```text
NESO Data Portal and Carbon Intensity API
Elexon Insights / BMRS
DNO open-data portals
DESNZ REPD
Ordnance Survey OS Data Hub OpenData
Sheffield Solar PV_Live
Octopus Energy REST API
National Highways data services
Network Rail open data feeds
British Geological Survey open OGC / geothermal datasets
```

## Out of scope

No API fetch.

No data ingestion.

No mutation of `data/federation_map/current/`.

No cartridge change.

No derived rows.

No UI data wiring.

No committed credentials or tokens.

No claim that a source is legally safe beyond what the registry declares and the auditor verifies.

## Acceptance checks if accepted

The executor must return a report proving:

```text
registry_file_present
schema_file_present
all_candidate_sources_have_required_fields
licence_field_non_empty_for_each_source
classification_is_one_of_ingest_interoperate_align
provenance_is_declared_for_each_source
no_credentials_or_tokens_committed
no_data_fetch_performed
no_parquet_files_changed
no_ui_wiring_changed
po1_gate_respected
```

Claude must independently clean-clone the target SHA and verify the same checks without using executor self-report as proof.

## Notes

This should be the first API-related PO if accepted, because it creates the declared source vocabulary without pulling any data.

It is deliberately a registry and licence-triage task, not an ingestion task.

# QT — Spider DNO Open Data Bundle

status: QUOTATION ONLY — not accepted, not a purchase order, not authorised for build
quote: QT Spider API 3
title: Spider DNO Open Data Bundle
target repository: Ventusltd/data-federation-map-for-globalgrid2050-all-repos
source study: dashboard/BEST-API-for-VENTUS-SPIDER.md
current gate: PO 1 must be independently receipted and applied before this can become a build PO
required predecessor if accepted: Spider External API Registry and Licence Triage
executor if accepted: ChatGPT
auditor if accepted: Claude
principal / apply authority: Vikram

## Purpose

Stage the six GB distribution-network open-data portals as declared external-source candidates for future connection-viability screening, without ingesting data yet.

## Scope if accepted

Create a DNO source-contract template and declared candidate records for:

```text
UK Power Networks open data
National Grid Electricity Distribution connected data
SSEN data portal
SP Energy Networks open data
Northern Powergrid open data
Electricity North West open data
```

For each DNO, record:

```text
portal URL or official access location
API family or download family
licence / terms
registration or token requirement
rate limit or operational caveat if known
available dataset families: ECR, LTDS, DFES, flexibility, curtailment, network geometry
normalised source_id
candidate consuming repos
candidate declared edges
classification: ingest / interoperate / align
field-alignment risk note
```

## Out of scope

No DNO login or token use.

No API fetch.

No scraping.

No committed data.

No mutation of `data/federation_map/current/`.

No statement that a DNO record is engineering-grade.

No UI map overlay.

## Acceptance checks if accepted

The executor must return a report proving:

```text
dno_template_present
six_dno_candidate_records_present
licence_or_terms_recorded_for_each_dno
access_caveat_recorded_for_each_dno
field_alignment_risk_recorded
no_api_fetch_performed
no_credentials_committed
no_parquet_files_changed
no_ui_files_changed
po1_gate_respected
```

Claude must clean-clone and verify that this remains a source-contract and registry task only.

## Notes

This quotation should not be accepted as an ingestion build. It is the discovery and contract step needed before any DNO data product can be safely designed.

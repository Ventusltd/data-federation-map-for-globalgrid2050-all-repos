# QT — Spider Geospatial Route and Market Context Sources

status: QUOTATION ONLY — not accepted, not a purchase order, not authorised for build
quote: QT Spider API 4
title: Spider Geospatial Route and Market Context Sources
target repository: Ventusltd/data-federation-map-for-globalgrid2050-all-repos
source study: dashboard/BEST-API-for-VENTUS-SPIDER.md
current gate: PO 1 must be independently receipted and applied before this can become a build PO
required predecessor if accepted: Spider External API Registry and Licence Triage
executor if accepted: ChatGPT
auditor if accepted: Claude
principal / apply authority: Vikram

## Purpose

Stage the non-DNO external sources that support planning, basemap, solar, price, road, rail and ground-condition context for future Spider-controlled screening.

## Scope if accepted

Create declared source-contract records for:

```text
DESNZ Renewable Energy Planning Database
Ordnance Survey OS Data Hub OpenData
Sheffield Solar PV_Live
Octopus Energy public tariff/pricing API
National Highways open data services
Network Rail open data feeds
British Geological Survey open OGC / geothermal point datasets
```

For each source, record:

```text
official owner
source family
licence / terms
attribution duty
bulk versus REST access
registration or key requirement
rate limit or operational caveat
cost status
known licence caveats
candidate consuming repos
candidate declared edges
classification: ingest / interoperate / align
```

## Out of scope

No data fetch.

No token or credential use.

No API client code.

No Parquet mutation.

No UI overlay or chart wiring.

No route-optimisation calculation.

No engineering-grade ground-condition claim.

No use of fee-licensed BGS datasets without a later accepted commercial decision.

## Acceptance checks if accepted

The executor must return a report proving:

```text
seven_source_contracts_present
licence_or_terms_recorded_for_each_source
attribution_duty_recorded_where_known
access_caveat_recorded_for_each_source
bgs_fee_licensed_caveat_explicitly_recorded
no_api_fetch_performed
no_credentials_committed
no_parquet_files_changed
no_ui_files_changed
po1_gate_respected
```

Claude must independently verify the source-contract records from a clean clone and confirm that no data or UI was changed.

## Notes

This quotation groups planning, basemap, solar, price, transport and ground-context sources because all are context layers for the Spider. If Claude prefers smaller scopes, this quotation can be split into separate planning/basemap, market/solar, transport and ground-condition quotations before acceptance.

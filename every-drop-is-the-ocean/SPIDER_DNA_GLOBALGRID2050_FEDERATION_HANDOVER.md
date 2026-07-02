# Spider DNA — GlobalGrid2050 Federation Handover

Status: doctrine summary and transfer record. Documentation-only. This file does not close any purchase order, does not receipt any branch, does not apply any data, and does not alter code, workflows, UI, Parquet, ledgers, or quotations.

Commit location: every-drop-is-the-ocean/SPIDER_DNA_GLOBALGRID2050_FEDERATION_HANDOVER.md

Owner and approver: Ventus Ltd / GlobalGrid2050.

Executor for this file: ChatGPT.

Independent auditor role for build receipts: Claude, clean-clone verification.

Date: 2026-07-02.

## 1. The correction that governs everything

GlobalGrid2050 is not primarily a data project. It is a builder's engineering capability being opened through a controlled software federation.

The software, data, dashboards and ledgers exist so that rare grid, cable, solar, BESS and transmission-and-distribution judgement can be trusted at distance without becoming guesswork.

The database is the means, not the end. The federation is the control layer. The public map is made free so opportunity cannot be hoarded.

## 2. The mission

The grid shortage is physical, informational and procedural.

Connection knowledge, buildability judgement, cost-risk judgement, cable judgement, safety judgement and practical route-to-construction knowledge often sit in specialist heads, paid studies, tender rooms and private consultant drawers.

GlobalGrid2050 exists to turn that judgement into a governed, open, machine-readable federation of repos and data products, while keeping a hard boundary between public screening-grade outputs and certified engineering.

## 3. The standing discipline

The binding law remains:

```text
every-drop-is-the-ocean/AUDIT_AND_COMMIT_EMPLOYERS_REQUIREMENT.md
```

Core rules:

```text
Audit before apply.
Reports are evidence, not proof.
Green GitHub Actions are not proof.
A committed report is not proof.
The executor never grades its own bar.
The human holds the apply trigger.
Done exists only after independent clean-clone reproduction at the exact SHA.
The closing SHA is the real completion or apply SHA, never the paperwork filing commit.
```

The auditor contract remains:

```text
every-drop-is-the-ocean/AUDITOR_VERIFICATION_CONTRACT.md
```

## 4. Provenance spine

Every fact must remain one of two things:

```text
declared — a source openly states it

derived — the engine inferred, calculated, parsed or transformed it
```

Declared and derived must be physically and visibly separated. An inference may never wear the clothes of a fact.

That separation is the core trust boundary between a public screening map and real engineering output that requires professional responsibility.

## 5. Federation repo

The control-ledger repository is:

```text
Ventusltd/data-federation-map-for-globalgrid2050-all-repos
```

Its role is to record the GlobalGrid2050 repo federation as a metadata object:

```text
repo nodes
external-service nodes
repo dependency edges
provenance labels
purchase-order state
verified Parquet truth store
Spider / Jean Luc dashboard views
```

It is not the homepage repo and not the GB electricity UI repo.

Current important paths:

```text
every-drop-is-the-ocean/                         doctrine and binding laws
build_ladder_purchase_orders/                   accepted PO and work-order ledger
quotations_request_for_new_features_via_purchase_orders/  pre-PO quotation and RFI staging
data/federation_map/current/nodes.parquet       committed node truth store
data/federation_map/current/edges.parquet       committed edge truth store
dashboard/federation_radial.html                Spider dependency-map UI
live_sandbox/federation_control_ledger/         live federation-control ledger data and board
jean-luc/                                       navigation / trajectory concept
```

## 6. Current federation data baseline

The accepted PO 2a data baseline is:

```text
SHA: 76cc95f1ddc9943e874d654cba848427da25e20b
methodVersion: federation_map_dna_v3_provenance_discriminator
nodes: 16
edges: 303
edge provenance column present: 1
edge provenance null rows: 0
edge provenance invalid rows: 0
derived rows in base edges: 0
declared rows in base edges: 303
dangling edge endpoints: 0
```

The base truth store contains declared base edges only. No derived overlay has been accepted or applied.

## 7. Current main-state note

Before this documentation commit, the federation repo main branch had advanced to:

```text
8a19b86cf256b8c7d1ec34baaa82e23ceea8449d
```

That main movement added only:

```text
grid_authorities/README.md
```

Future audits must check the live branch state and exact SHA rather than assuming an older ledger-clean SHA.

## 8. Purchase-order ladder state

Received and closed or received/live:

```text
PO 7a — Auditor Clean-Clone Verification Contract
PO 0  — Scanner Endpoint Integrity and Committed Parquet Truth Store
PO 2a — Provenance Discriminator Field
UI PO — The Spider Engine sandbox and live promotion
Homepage flag — future homepage
Homepage flag — current live homepage
PO Ledger Reconstruction and Filing Discipline — documentation filing discipline
```

The live gate remains:

```text
PO 1 — Declared-Only Per-Repo Cartridges
branch: po1-declared-cartridges
PR: #3
last known PR head: e3f110902838d57c334e26239bc1eb665bb4eff1
status: in flight
received: no
closed: no
applied to main: no
```

No new build purchase order should begin until PO 1 is clean-clone receipted, applied by the human, and recorded with the real closing SHA.

## 9. PO 1 scope guard

PO 1 partitions the declared base edges into one declared edge-only cartridge per eligible repo node.

Eligible repo node means:

```text
nodeKind = github_repo
archived = false
```

Expected current eligible repo nodes:

```text
12
```

Expected base declared edge union:

```text
303
```

Known expected zero-edge cartridges:

```text
Ventusltd/Podcast-transcripts
Ventusltd/Solar-PV-Hybrid-and-off-grid
Ventusltd/pv-arc-protection-circuit
Ventusltd/solar-repowering-whitepaper
Ventusltd/youengineer-code-review
```

PO 1 must not change the scanner, dashboard, homepage, live UI, base current Parquet, snapshots, derived overlays, PMTiles, Tree-sitter, stack-graphs, PROV-O, SWHID or any UI surface.

## 10. The Spider

The Spider is the live dependency-map interface for the federation.

Current path:

```text
dashboard/federation_radial.html
```

Current live URL:

```text
https://ventusltd.github.io/data-federation-map-for-globalgrid2050-all-repos/dashboard/federation_radial.html
```

It shows repo and external-service dependencies, supports focus selection, incoming/outgoing/both views, column view, optional spider view, GitHub and external tap modes, and live or snapshot data indication.

The Spider is a control-room view. It must not invent truth. It renders federation state; it does not certify engineering.

## 11. Monolith, data repo, UI repo and federation split

The original large source/archive repo is:

```text
Ventusltd/globalgrid2050
```

It became too large and data-heavy to remain the single operating home for everything. It remains a public archive and source of existing tools, charts, pages and machines.

The GB electricity data repo is:

```text
Ventusltd/data-gb-electricity
```

It proves the Parquet strategy in action: compact partitioned Parquet, zstd compression, declared keys, DuckDB audit, no raw CSV committed, and no monolith clone committed.

The GB electricity UI repo is:

```text
Ventusltd/gb-electricity-ui
```

It exists to receive the UK electricity tracker and generation-history chart machines only after upstream data repos sit clean.

The rule is:

```text
Data repos carry truth.
UI repos carry presentation.
The monolith becomes source/archive.
The Spider controls the federation.
```

## 12. data-gb-electricity achievement

The data-gb-electricity repo records a clean historical backfill with:

```text
456 Parquet files
prices checked across 126 partitions
FUELHH checked across 126 partitions
FUELINST checked across 67 partitions
zero duplicate key groups
FUELINST 2023 month 9 canary: 156,960 rows
```

The important result is not the file count. The important result is row-level key proof.

This is the pattern for future data repos: cloneable, auditable, regenerable, compact and keyed.

## 13. gb-electricity-ui pre-port gate

The UI repo must not copy old JSON, CSV, GeoJSON or generated data products merely to make charts look alive.

The governing order is:

```text
1. Make data sit clean, audited and documented.
2. Bring chart structure across.
3. Wire charts only after upstream data proof.
```

Known upstream blockers before live chart wiring:

```text
data-gb-electricity must prove FUELINST, FUELHH and prices for exact chart dependencies.
data-gb-electricity may need derived browser/rollup products.
data-interconnectors must land clean Parquet for named interconnector flows.
PVLive solar must be scoped separately, included deliberately, or deferred.
Frequency, carbon, oil, road fuel and EV feeds must be scoped separately or left as no-data structure.
```

The UI repo consumes data contracts. It does not author them.

## 14. Recognised authorities and alignment

The project should align with recognised authorities rather than reinvent them.

Relevant authority tracks:

```text
LF Energy and OpenSSF for open-source energy software governance
IEC CIM / IEC 61970 / IEC 61968 / IEC 62325 for grid data modelling
ENTSO-E CGMES for European CIM exchange discipline
PyPSA, pandapower and PowSyBl as open power-system modelling engines
OpenStreetMap, OpenInfraMap and MapYourGrid for open physical grid atlas alignment
NESO data portal, Virtual Energy System and Data Sharing Infrastructure for GB energy data sharing
Elexon balancing data for GB market data
DESNZ Renewable Energy Planning Database for UK renewable project data
Icebreaker One / Open Energy for federated energy-data trust frameworks
W3C PROV, SLSA, in-toto, Sigstore and SWHID / ISO IEC 18670 for provenance and software-supply-chain discipline
Dublin Core / ISO 15836-1 and Ofgem Data Best Practice for data catalogue metadata
```

The position is implementer and participant, not rival standards-setter.

## 15. Confirmed strategic gaps

The major confirmed gaps remain:

```text
No accepted CIM / CGMES topology crosswalk yet.
No accepted PyPSA / pandapower / PowSyBl integration yet.
No accepted W3C PROV / SWHID / in-toto / Sigstore formalisation yet.
No accepted OpenSSF governance artifact set yet.
No accepted Dublin Core / Ofgem-style data catalogue yet.
No accepted partition-discipline correction yet.
No accepted external-source registry yet.
```

These are future quotation and PO candidates only. They are not already applied.

## 16. Eight durable laws to seed and refine

The following laws should guide future doctrine and purchase orders.

```text
Builder-first law:
The federation is a control layer for an evidenced engineering capability being opened to others. The database is the means, not the end.

Declared-versus-derived law:
A stated fact and an inferred judgement are physically and visibly separate. An inference may never wear the clothes of a fact.

Clean-clone law:
Done exists only after an independent auditor reproduces the checks from a fresh clone of the exact commit. The closing record is the real completion commit, never the paperwork filing commit.

Two-person and signed-record law:
The reviewer is never the executor. Future close-outs should move toward signed commits, signed tags and explicit sign-off trailers.

Authority-alignment law:
Where a recognised authority already governs a thing, this project implements and connects rather than reinvents.

Topology law:
Electrical grid structure should be modelled in the Common Information Model vocabulary so cable schedules, single-line diagrams and future calculations become one continuous standards-shaped object.

Chartered-engineer boundary law:
Public outputs are screening-grade and indicative. Real engineering is verified and signed by an appropriately qualified professional. The two are never presented as the same thing.

Open-map mission law:
The map is made free so opportunity cannot be hoarded. A faster, better-built grid serves everyone.
```

## 17. Ten quotation candidates

These are quotation candidates only. They are not accepted purchase orders.

```text
QT 1 — Topology Crosswalk
Map federation and cable-schedule fields to IEC 61970 CIM classes including Terminal, ConnectivityNode, ACLineSegment and PowerTransformer. Declared-only and read-only first.

QT 2 — Provenance Formalisation
Serialise declared versus derived lineage to W3C PROV, attach SWHID identifiers to committed artifacts, and hash-chain the PO ledger.

QT 3 — Open-Source Governance Artifacts
Add governance, maintainers/codeowners, security and contributing files; adopt sign-off trailers; prepare for signed records and OpenSSF posture.

QT 4 — Partition Discipline
Replace hand-computed partition-key discipline with transform-of-raw-timestamp discipline so the ISO-week/month bug class cannot recur.

QT 5 — Open-Data Metadata Conformance
Attach Dublin Core metadata, create an open-data triage record and publish a machine-readable catalogue.

QT 6 — Authority Engagement Study
Map engagement with NESO Virtual Energy System, Data Sharing Infrastructure and Icebreaker One / Open Energy as implementer and participant.

QT 7 — External-Source Registry
File outside data sources and modelling tools as declared external-source nodes with licence and ingest/interoperate/align classification.

QT 8 — Chartered-Engineer Boundary
Write the screening-grade versus certified-engineering law and add visible markers to relevant data and UI surfaces.

QT 9 — Engineering-Evidence Cartridge
Record shareable delivery evidence as declared, not-yet-independently-verified nodes, excluding confidential material.

QT 10 — Public Why and Positioning
Rewrite public why and homepage framing around builder-open-sourcing-capability and free-map-against-gatekeeping, with related-work positioning.
```

## 18. Correct next order

The next order is:

```text
1. Finish PO 1 audit branch.
2. Obtain independent clean-clone receipt at exact PO 1 head.
3. Human applies PO 1.
4. Record the real PO 1 closing SHA.
5. File the ten quotation requests in the quotations folder.
6. Seed/refine the eight durable laws.
7. Accept the topology crosswalk first, if approved.
8. Then proceed to provenance formalisation, governance, partition discipline, metadata and authority engagement in controlled order.
```

Do not jump to derived overlays, UI wiring, PMTiles, Tree-sitter, PROV-O, SWHID or modelling engines inside PO 1.

## 19. Public and private evidence boundary

The project may state its public mission, technical method and non-confidential capability thesis.

Private client documents, confidential commercial figures, non-disclosure material and sensitive project evidence stay private unless the human explicitly approves publication.

Delivery record can be declared. It must not be presented as independently verified inside the federation until it is independently receipted under a defined evidence cartridge or equivalent PO.

## 20. How future sessions should behave

A future session should:

```text
Read the doctrine first.
Check the live repo state and exact SHA.
Treat quotations as quotations, not accepted POs.
Treat PO ledger files as authoritative for accepted work.
Treat committed reports as evidence, not proof.
Keep declared and derived separate.
Keep data repos and UI repos separate.
Avoid copying monolith data into UI repos.
Use the Spider as the federation map, not as a source of certified truth.
Never close a PO without independent clean-clone receipt.
```

One true drop before ocean-scale claims.

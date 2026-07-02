# Architectural Study — data-federation-map-for-globalgrid2050-all-repos

status: architectural study / declared research note, not a purchase order, not an auditor receipt, not a closing record
source status: user-provided study assessed by ChatGPT against the live repository context available in this session
provenance: declared study with executor assessment
commit purpose: preserve the architectural study in the grid-authorities research area so it is not lost in chat
repository under study: Ventusltd/data-federation-map-for-globalgrid2050-all-repos
current operational gate at filing: PO 1 remains the live gate until independently receipted and applied

## Assessment before filing

This study is directionally useful and belongs in `grid_authorities/` rather than in the purchase-order ledger or the binding doctrine folder.

It compares the federation-control-ledger repo with recognised governance, provenance, lakehouse, open-grid and energy-data-sharing authorities. It should be treated as supporting research for later quotations, especially documentation hygiene, provenance formalisation, governance artefacts, external-source registry, and future authority engagement.

It must not be treated as proof that any future alignment has already been implemented.

It must not close PO 1.

It must not start a new build order.

It must not override `every-drop-is-the-ocean/AUDIT_AND_COMMIT_EMPLOYERS_REQUIREMENT.md`.

A few parts of the supplied study are time-sensitive and may drift. Commit counts, language percentages, current branch head and GitHub Actions visibility can change quickly. Since this file is a study record rather than an audit receipt, those quantities are preserved as study context, not as operational truth. The live repository state and exact SHA must always be checked before acting.

One live update since the study text: `GridBot Declared Cartridges` has now been exposed on `main` as a workflow dispatcher, with a `target_ref` defaulting to `po1-declared-cartridges`, so it can be run from the Actions UI without treating PO 1 as closed.

## TL;DR

The repository is a disciplined, single-owner federation control ledger: a DuckDB plus zstd-Parquet metadata data product that records Ventusltd repos as nodes and their dependencies as edges, governed by strict audit-before-apply doctrine, and rendered read-only by a Spider dashboard designed never to invent data.

Its architecture is coherent and honest, but it remains a single-person, single-point-of-failure system whose doctrine and studies still need better SHA, provenance, status and source headers.

The in-flight PO 1 work adds declared-only per-repo cartridges in a Hive-style layout under `data/federation_map/cartridges/provenance=declared/repo=owner__repo/`. It should not be marked received or closed until the audit and apply artefacts are committed, independently clean-clone receipted, applied by the principal, and recorded with the real closing SHA.

Measured against recognised authorities, the design already embodies the spirit of W3C PROV, transparency-log thinking, lakehouse discipline and separation of duties. It does not yet implement formal IEC CIM / CGMES crosswalks, SLSA / in-toto / Sigstore / SWHID provenance, OpenSSF-style governance artefacts, Dublin Core metadata, or explicit NESO / Icebreaker One alignment. These are later quotation and PO candidates, not defects to patch inside PO 1.

## Key findings

The repository presents itself as the GlobalGrid2050 Federation Control Ledger and as the source-of-truth data product for the GlobalGrid2050 federation systems map. That description is consistent with the structure of the project: this repo is not the public homepage and not a UI repo; it is the backend metadata database for which repositories exist, what role each repo has, and how repositories depend on each other.

The controlling doctrine sits under `every-drop-is-the-ocean/`. The binding files are named in the repo README and include the federation-ledger scope requirement, the audit-and-commit requirement, and the folder README. The governing law is audit before apply, report always, prove on the declared key, and keep a clean evidence trail.

The data architecture is expressed through the repo data contract and manifest conventions. Nodes are grained as one row per discovered repository or external-source node per scan. Edges are grained as one row per dependency edge per evidence source per scan. The core invariants are distinct keys, zero null keys, endpoint resolution, DuckDB read-back verification, and paired Markdown plus JSON reports.

Storage law is compact, auditable and Git-friendly: zstd Parquet written and verified with DuckDB. CSV is acceptable as scanner-internal staging, not as the long-term data product.

PO 1 is the open gate. It is not a broad feature. It is a narrow declared-only transcription of the existing base edges into per-repo edge-only cartridges. No derived overlays, no inferred edges, no Tree-sitter, no stack graphs, no PROV-O, no SWHID, no PMTiles, no UI change, no homepage change, and no mutation of `data/federation_map/current/` belong inside it.

The twelve named PO 1 checks form a useful verification battery: they test cartridge presence, manifest presence, manifest parent-scope declaration, edge-key uniqueness, endpoint resolution, declared-only provenance, zero derived rows, union-equals-base reconciliation, valid empty cartridges, base-store immutability, no UI invention, and determinism.

## Architecture details

The repository is organised around a permanent control ledger.

Important locations include:

```text
every-drop-is-the-ocean/                         binding doctrine and laws
build_ladder_purchase_orders/                   accepted PO / work-order ledger
quotations_request_for_new_features_via_purchase_orders/  pre-PO quotation and RFI staging
config/                                         configuration
dashboard/                                      Spider UI
data/federation_map/current/                    committed Parquet truth store
data/federation_map/snapshots/                  dated Parquet snapshots
docs/                                           documentation
grid_authorities/                               authority-comparison and architecture studies
jean-luc/                                       navigation / trajectory notes
live_sandbox/federation_control_ledger/         live control-ledger board and data
reports/ and reports/json/                      paired evidence reports
schemas/                                        schema artefacts
scripts/                                        scanner, publish bridge and dashboard scripts
```

The main output layout remains:

```text
data/federation_map/current/nodes.parquet
data/federation_map/current/edges.parquet
data/federation_map/snapshots/year=YYYY/month=MM/week=WW/nodes.parquet
data/federation_map/snapshots/year=YYYY/month=MM/week=WW/edges.parquet
reports/FEDERATION_MAP_LATEST.md
reports/json/FEDERATION_MAP_LATEST.json
```

The scanner and publish bridge implement the basic federation data path:

```text
GitHub API metadata
canonical-file probes
repo and external-source nodes
explicit dependency edges
DuckDB write to zstd Parquet
DuckDB read-back verification
paired reports
Parquet-derived JSON for the live sandbox
Spider dashboard render
```

The scanner does not clone every repo, which is correct for scale.

The Spider UI is a control-room view. Its job is to render committed or Parquet-derived federation state. It must not infer truth, hand-author status colours, or certify engineering.

## Provenance assessment

The most important current design idea is the provenance discriminator:

```text
declared — evidence exists in a canonical file, manifest, source register, or explicit record

derived — the engine inferred, calculated, parsed or transformed the fact
```

This is conceptually aligned with W3C PROV because it separates source-stated facts from derived entities. It is not yet formal PROV-O, PROV-N, SLSA, in-toto, Sigstore, Rekor or SWHID.

That gap is an alignment opportunity, not a reason to disrupt PO 1.

The correct future path is to keep the simple discriminator in place while later adding formal serialisation and content identifiers under a separate accepted PO.

## PO 1 cartridge assessment

The PO 1 cartridge design is sound in principle.

Expected shape:

```text
data/federation_map/cartridges/provenance=declared/repo=<owner>__<repo>/edges.parquet
data/federation_map/cartridges/provenance=declared/repo=<owner>__<repo>/manifest.json
```

That is a sensible Hive-style partition layout. `provenance=declared` keeps declared data physically separate. `repo=owner__repo` keeps the owner/repo identity without using a slash inside the partition directory name.

Acceptance must be evidence-based. A workflow run is not proof. The committed audit report is not proof. The auditor must independently recompute the acceptance checks from a clean clone at the exact branch head being receipted.

The current practical implementation issue is that GitHub only exposes manual workflow dispatches reliably when the workflow exists on the default branch. Therefore the dispatcher has been made available on `main`, while the target ref remains the PO 1 branch.

## Governance assessment

The project already has stronger internal discipline than many small open-source projects:

```text
principal / executor / auditor separation
quotation before PO
PO ledger
clean-clone receipt
real closing SHA discipline
audit before apply
reports separate from code
base truth store in Parquet
```

The main governance gaps are not conceptual; they are formalisation gaps:

```text
LICENSE not yet treated as part of the authority-alignment package
GOVERNANCE / MAINTAINERS / CODEOWNERS not yet formalised
SECURITY policy not yet formalised
OpenSSF posture not yet prepared
DCO or sign-off trailers not yet consistently required
signed commits and tags not yet enforced
continuity plan not yet written
```

These should become a later quotation and PO, not a side-effect of PO 1.

## Authority alignment assessment

The project should align with recognised authorities rather than present itself as a rival standards-setter.

Relevant authority tracks include:

```text
LF Energy and OpenSSF for open-source energy-software governance
IEC CIM / IEC 61970 / IEC 61968 / IEC 62325 for grid modelling
ENTSO-E CGMES for CIM exchange discipline
W3C PROV for provenance modelling
SLSA, in-toto, Sigstore and SWHID for supply-chain and artifact identity
DuckDB, Parquet and Hive-style partitioning for data-product mechanics
NESO Virtual Energy System and Data Sharing Infrastructure for GB energy-data sharing
Icebreaker One / Open Energy for trust-framework alignment
Elexon and DESNZ REPD for GB electricity and planning data sources
OpenStreetMap, OpenInfraMap and MapYourGrid for open physical-grid mapping context
```

This repository currently maps repos and dependencies. It is not yet an electrical grid topology model. CIM / CGMES becomes necessary when the federation starts modelling electrical assets, cables, terminals, connectivity nodes, bus-branch views, line segments or transformers as first-class data objects.

## Recommendations after PO 1

No recommendation in this study should be applied before PO 1 is received and applied.

After PO 1 closes, the first new quotation should be documentation hygiene and provenance stamping, not CIM.

Reason: the repository history shows drift, renamed files, retagging and unstamped studies. Before the project adds more authority layers, every important document should carry a status, source SHA, provenance class and intended authority level.

The next sequence should be:

```text
1. Close PO 1 with independent clean-clone receipt and real closing SHA.
2. Raise one documentation-hygiene quotation.
3. If accepted, stamp unstamped docs and fix fragmented or space-broken filenames under a controlled PO.
4. Raise the topology CIM crosswalk quotation.
5. Then provenance formalisation.
6. Then governance artefacts and partition discipline.
7. Then open-data metadata and external-source registry.
8. Then chartered-engineer boundary markers, evidence cartridge, authority engagement and public positioning.
```

## Caveats

This is an architectural study, not an auditor receipt.

It does not independently certify the binary Parquet store.

It does not certify the live Spider UI.

It does not close PO 1.

It does not prove that any authority alignment has been implemented.

Operational truth remains the live repository at the exact SHA under review, verified by clean-clone checks under the auditor contract.

One true drop before ocean-scale claims.

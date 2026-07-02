# Federation Declared Cartridges Latest

Schema version: `federation_declared_cartridges_report.v1`
Generated UTC: `2026-07-02T02:35:30.909989Z`
Method version: `federation_declared_cartridges_v1`
Mode: `audit`
Repository: `Ventusltd/data-federation-map-for-globalgrid2050-all-repos`
Data-law result: `PASS`

## Base store

- Node rows: `16`
- Edge rows: `303`
- Declared edge rows: `303`
- Derived edge rows: `0`
- Dangling edge endpoints: `0`
- Nodes md5: `5c9a1953f2a3283ddcb851ce0b3738fc`
- Edges md5: `3c75b4d0ed73caad78a0c2f1c231d120`

## Per-repo edge counts

| Repo | Edge count | Cartridge path |
|---|---:|---|
| `Ventusltd/Podcast-transcripts` | `0` | `data/federation_map/cartridges/provenance=declared/repo=Ventusltd__Podcast-transcripts` |
| `Ventusltd/Solar-PV-Hybrid-and-off-grid` | `0` | `data/federation_map/cartridges/provenance=declared/repo=Ventusltd__Solar-PV-Hybrid-and-off-grid` |
| `Ventusltd/data-federation-map-for-globalgrid2050-all-repos` | `18` | `data/federation_map/cartridges/provenance=declared/repo=Ventusltd__data-federation-map-for-globalgrid2050-all-repos` |
| `Ventusltd/data-gb-electricity` | `20` | `data/federation_map/cartridges/provenance=declared/repo=Ventusltd__data-gb-electricity` |
| `Ventusltd/data-interconnectors` | `19` | `data/federation_map/cartridges/provenance=declared/repo=Ventusltd__data-interconnectors` |
| `Ventusltd/gb-electricity-ui` | `4` | `data/federation_map/cartridges/provenance=declared/repo=Ventusltd__gb-electricity-ui` |
| `Ventusltd/globalgrid2050` | `228` | `data/federation_map/cartridges/provenance=declared/repo=Ventusltd__globalgrid2050` |
| `Ventusltd/globalgrid2050-hompage` | `11` | `data/federation_map/cartridges/provenance=declared/repo=Ventusltd__globalgrid2050-hompage` |
| `Ventusltd/pandapower` | `3` | `data/federation_map/cartridges/provenance=declared/repo=Ventusltd__pandapower` |
| `Ventusltd/pv-arc-protection-circuit` | `0` | `data/federation_map/cartridges/provenance=declared/repo=Ventusltd__pv-arc-protection-circuit` |
| `Ventusltd/solar-repowering-whitepaper` | `0` | `data/federation_map/cartridges/provenance=declared/repo=Ventusltd__solar-repowering-whitepaper` |
| `Ventusltd/youengineer-code-review` | `0` | `data/federation_map/cartridges/provenance=declared/repo=Ventusltd__youengineer-code-review` |

## Checks

| Check | Result | Numbers |
|---|---:|---|
| `cartridge_exists_for_every_repo_node` | PASS | eligibleRepoNodes=12; cartridgeCount=12; excludedArchivedRepoNodes=0 |
| `cartridge_has_manifest` | PASS | manifestCount=12; cartridgeCount=12 |
| `cartridge_declares_parent_repo_and_scope` | PASS | manifests=12; wrongParentScope=0 |
| `cartridge_keys_unique` | PASS | totalRows=303; distinctEdgeIds=303; duplicateEdgeIds=0 |
| `cartridge_endpoints_resolve` | PASS | toNodeDangles=0; fromNodeNotOwnRepo=0 |
| `cartridge_provenance_declared_only` | PASS | nonDeclaredRows=0 |
| `zero_derived_in_cartridges` | PASS | derivedRows=0 |
| `cartridge_union_equals_base_declared` | PASS | cartridgeRows=303; baseDeclaredRows=303; extraEdgeIds=0; missingEdgeIds=0 |
| `empty_repo_yields_valid_empty_cartridge` | PASS | expectedEmptyRepos=5; actualEmptyCartridges=5; missingExpectedEmptyRepos=0 |
| `base_store_unchanged` | PASS | nodesMd5Before=5c9a1953f2a3283ddcb851ce0b3738fc; nodesMd5After=5c9a1953f2a3283ddcb851ce0b3738fc; edgesMd5Before=3c75b4d0ed73caad78a0c2f1c231d120; edgesMd5After=3c75b4d0ed73caad78a0c2f1c231d120; nodeRows=16; edgeRows=303; danglingEdgeEndpoints=0 |
| `ui_invents_no_data` | PASS | generatedUiFiles=0 |
| `cartridge_deterministic_from_clean_clone` | PASS | deterministicMd5Match=1 |

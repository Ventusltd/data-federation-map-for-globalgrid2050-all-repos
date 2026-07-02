# Federation Publish Latest

Schema version: `1.0`
Generated UTC: `2026-07-02T01:58:25Z`
Method version: `federation_publish_json_v1_duckdb_projection`
Mode: `audit`
Repository: `Ventusltd/data-federation-map-for-globalgrid2050-all-repos`
Commit SHA: `52de58c034b0ad687065786f8301e6e88d5fe145`

## Target

- Directory: `live_sandbox/federation_control_ledger/data`
- Nodes JSON: `live_sandbox/federation_control_ledger/data/nodes.json`
- Edges JSON: `live_sandbox/federation_control_ledger/data/edges.json`

## Sprawl check

Result: `PASS`
Choice: `extend_existing_weekly_scanner_workflow`
Justification: The existing weekly scanner workflow already runs scripts/build_federation_map.py, so the clean bridge is to extend that workflow rather than add a second scanner workflow.

## Source audit numbers

| Number | Value |
|---|---:|
| `currentSeedNodeCount` | `16` |
| `currentSeedNodeIdsMatched` | `16` |
| `duplicateProjectedEdgeRowsCollapsed` | `268` |
| `nullEndpointEdgeRows` | `0` |
| `projectedDistinctDeclaredEdgeKeys` | `35` |
| `projectedEdgeRows` | `35` |
| `projectedNodeRows` | `16` |
| `propertyKeys` | `['label', 'repo_type', 'scope_type', 'rag', 'status', 'status_reason', 'importance_score', 'child_manifest']` |
| `rawResolvableProjectedEdgeRows` | `303` |
| `sourceDistinctNodeIds` | `16` |
| `sourceDistinctSourceEdgeIds` | `303` |
| `sourceEdgeRows` | `303` |
| `sourceNodeRows` | `16` |
| `sourceNullNodeIds` | `0` |
| `sourceNullSourceEdgeIds` | `0` |
| `unresolvedEdgeRows` | `0` |

## Scanner read-back verification

Passed: `True`
Workflow scanner outcome: `success`
Scanner report present: `True`

## Declared checks

| Check | Result | Detail |
|---|---:|---|
| `mode_is_valid` | PASS | mode=audit |
| `apply_runs_only_from_human_workflow_dispatch` | PASS | mode=audit; github_event_name=workflow_dispatch |
| `source_parquet_files_exist` | PASS | nodes_parquet_exists=True; edges_parquet_exists=True |
| `current_ui_json_shape_files_exist` | PASS | nodes_json_exists=True; edges_json_exists=True |
| `scanner_readback_verification_passed` | PASS | scanner_outcome=success; report_present=True |
| `current_nodes_json_is_feature_collection` | PASS | nodes.json type must be FeatureCollection |
| `current_edges_json_has_edges_array` | PASS | edges.json must contain an edges array |
| `node_count_equals_distinct_node_id_count` | PASS | sourceNodeRows=16; sourceDistinctNodeIds=16 |
| `zero_null_node_ids` | PASS | sourceNullNodeIds=0 |
| `every_edge_from_index_and_to_index_resolves_to_real_node` | PASS | unresolvedEdgeRows=0; edgeIndexFailures=0 |
| `edge_count_equals_distinct_declared_edge_key_count` | PASS | projectedEdgeRows=35; projectedDistinctDeclaredEdgeKeys=35 |
| `planned_json_reconciles_exactly_against_parquet_projection` | PASS | expectedHash=489e4b859ed73e45560110272207d21ca2d05a14324a2d2b4304b0ea678e723e; plannedHash=489e4b859ed73e45560110272207d21ca2d05a14324a2d2b4304b0ea678e723e |

## Planned changed files

- `live_sandbox/federation_control_ledger/data/nodes.json`
- `live_sandbox/federation_control_ledger/data/edges.json`
- `reports/FEDERATION_PUBLISH_LATEST.md`
- `reports/json/FEDERATION_PUBLISH_LATEST.json`
- `live_sandbox/federation_control_ledger/PUBLISH_LEDGER.md`
- `DEPENDENCIES.md`

## Actually changed files under apply

- None

## Data-law result

`PASS`

## Rollback method

Revert the apply commit. The publish target is limited to live_sandbox/federation_control_ledger/data/nodes.json, live_sandbox/federation_control_ledger/data/edges.json, DEPENDENCIES.md, and the paired report/ledger evidence files.

## Fatal errors

- None

## Next action

No apply is required unless a human wants to refresh the evidence trail.


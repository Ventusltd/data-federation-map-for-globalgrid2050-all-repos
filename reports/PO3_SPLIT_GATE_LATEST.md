# PO 3 Split Gate Latest

Schema version: `po3_split_gate_report.v1`
Generated UTC: `2026-07-03T00:10:41.417915+00:00`
Repository: `Ventusltd/data-federation-map-for-globalgrid2050-all-repos`
Target: `po3a`
Mode: `audit`
Data-law result: `PASS`

## Checks

| Check | Result | Detail |
|---|---:|---|
| `audit_law_present` | PASS | binding audit law file must be present |
| `po_ledger_present` | PASS | ledger must be present for split gate context |
| `failed_po3_external_js_absent` | PASS | failed PO3 external JS must not be present |
| `live_dashboard_present` | PASS | live dashboard must exist |
| `live_css_present` | PASS | live CSS must exist |
| `dashboard_inline_renderer_preserved` | PASS | dashboard should not load failed PO3 JS and should retain inline Spider renderer marker |
| `spider_tokens_present` | PASS | basic Spider renderer/style tokens should remain present |
| `back_mirror_directory_present` | PASS | dashboard/back_mirrors should exist as recovery anchor |
| `po3a_manifest_present` | PASS | data/federation_map/contents/provenance=declared/repo=Ventusltd__globalgrid2050/manifest.json |
| `po3a_nodes_present` | PASS | data/federation_map/contents/provenance=declared/repo=Ventusltd__globalgrid2050/nodes.json |
| `po3a_edges_present` | PASS | data/federation_map/contents/provenance=declared/repo=Ventusltd__globalgrid2050/edges.json |
| `po3a_manifest_stamps_monolith_sha_88894be` | PASS | manifest should tie cartridge to scanned monolith state |
| `po3a_generation_history_path_correct` | PASS | generation_history must not be treated as root folder |
| `po3a_why_pages_are_markdown_blobs` | PASS | why_ventusltd entries must be markdown blobs |
| `po3a_edges_have_rows` | PASS | edgeRows=11 |
| `po3a_declared_only_text` | PASS | PO3A committed contents cartridge should not claim derived rows |

## Notes

- No direct federation_radial.html mirror file found for byte comparison.
- No direct federation_radial.css mirror file found for byte comparison.

## Next action

seek independent clean-clone receipt before closing

## Rollback

revert the workflow commit if this gate itself is wrong; do not revert target PO commits from this workflow

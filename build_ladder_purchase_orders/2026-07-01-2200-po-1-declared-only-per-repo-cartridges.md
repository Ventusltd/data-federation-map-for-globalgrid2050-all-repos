# PO 1 — Declared-Only Per-Repo Cartridges

status: IN FLIGHT / audit branch — NOT received, NOT closed, NOT applied to main
po: PO 1
title: Declared-Only Per-Repo Cartridges
executor: ChatGPT
auditor: Claude
target repository: Ventusltd/data-federation-map-for-globalgrid2050-all-repos
target files: data/federation_map/cartridges/provenance=declared/repo=<owner>__<repo>/edges.parquet and manifest.json (one per eligible repo)
branch: po1-declared-cartridges
PR number: PR #3 (open)
merge SHA: pending
audit SHA: pending
apply SHA: pending
closing SHA: pending
receipt status: NOT received — awaiting auditor clean-clone receipt at the PR head
evidence source: exact PO wording authored by the auditor (Claude) this session; branch head at PR creation e3f110902838d57c334e26239bc1eb665bb4eff1 confirmed by the auditor against origin/po1-declared-cartridges

## Status guard

This PO has an open audit branch only. It must not be marked received or closed until the auditor clones the PR head fresh and reproduces the acceptance checks, and the human applies. The ledger records it as in flight.

## PO wording (as issued to the executor — actual, not reconstructed)

You are the EXECUTOR for Ventusltd/data-federation-map-for-globalgrid2050-all-repos. This is Purchase Order 1. Obey every-drop-is-the-ocean/AUDIT_AND_COMMIT_EMPLOYERS_REQUIREMENT.md; if anything here conflicts with it, the file wins — stop and say so. Audit is the default: build on a branch, open a PR, report the numbers, and do NOT apply to main. The human holds the apply trigger; the auditor receipts from a clean clone before any apply. You do not self-mark and you never grade your own bar.

CONTEXT. PO 2a is received (receipted from a clean clone at SHA 76cc95f). Base store data/federation_map/current/ holds 16 nodes (12 github_repo all archived=false, 4 external_source_or_service) and 303 edges, every edge provenance='declared', zero dangling, methodVersion federation_map_dna_v3_provenance_discriminator. PO 1 partitions that declared base into per-repo declared cartridges. It creates NO new truth — it is faithful transcription of existing declared edges into a per-repo layout. Nothing is inferred, nothing synthesised.

ELIGIBLE REPO NODE = nodeKind='github_repo' AND archived=false. That is 12 repos today. If a repo is archived later it becomes ineligible and that exclusion must be recorded in the run report; do not silently drop it.

SCOPE (what PO 1 must do).
1. Emit exactly one declared cartridge per eligible repo node. Assignment rule: an edge belongs to the cartridge of its fromNode repo. (Verified: all 303 edges originate from a github_repo, so this partitions the base with no duplication and no orphan.)
2. Cartridges are EDGES-ONLY. Node truth stays canonical in the base nodes.parquet — do not copy or fork node rows into cartridges. Each cartridge edge row is a byte-faithful copy of the base edge: same edgeId, fromNode, toNode, edgeType, cardinality, evidencePath, evidenceText, generatedUTC, scanId, methodVersion, provenance. Add nothing, drop nothing, rewrite nothing.
3. Output path, physically separated from base and reserving the derived sibling for PO 3: data/federation_map/cartridges/provenance=declared/repo=<owner>__<repo>/edges.parquet and manifest.json. Use '__' as the owner/repo separator in the partition dir; carry the exact original nodeId ('owner/repo') inside the manifest. Hive-partition on provenance= and repo= so DuckDB globbing works.
4. Empty repos yield a VALID EMPTY cartridge, never a missing directory and never a crash: a schema-correct zero-row edges.parquet plus a well-formed manifest with edgeCount 0. Five repos have zero outgoing declared edges and must each produce one: Ventusltd/Podcast-transcripts, Ventusltd/Solar-PV-Hybrid-and-off-grid, Ventusltd/pv-arc-protection-circuit, Ventusltd/solar-repowering-whitepaper, Ventusltd/youengineer-code-review.
5. Each manifest.json declares at minimum: nodeId (exact 'owner/repo'), parentScope, provenance 'declared', edgeCount, scanId, methodVersion, generatedUTC — scanId and methodVersion matching the base snapshot the cartridge derives from.
6. Determinism: stable row ordering (ORDER BY edgeId), fixed Parquet writer options, canonical sorted-key JSON in every manifest, so a re-run from a clean clone is byte-identical.

OUT OF SCOPE — do NOT do any of these: no derived overlay, no derived edges of any kind; no Tree-sitter, no stack-graphs, no inferred call edges (PO 3); no PROV-O and no SWHID (PO 6); no PMTiles/tiling/LOD/rendering escalation (PO 5); no UI/browser/dashboard/homepage change; no scanner redesign beyond the strict minimum needed to emit and verify the declared cartridges; no mutation of data/federation_map/current/; no new provenance enum values ('declared' and 'derived' remain the only two; PO 1 emits 'declared' exclusively); no snapshot partition redesign (the June/July ISO-week split is parked for PO 2b).

NAMED CHECKS THAT MUST PASS (proposed as PO 1 clauses for AUDITOR_VERIFICATION_CONTRACT.md):
1. cartridge_exists_for_every_repo_node — exactly one cartridge per eligible repo node (12).
2. cartridge_has_manifest — every cartridge directory contains a well-formed manifest.json.
3. cartridge_declares_parent_repo_and_scope — each manifest carries the exact nodeId and a parentScope.
4. cartridge_keys_unique — edgeId unique within each cartridge and across the whole declared set; no duplicate rows.
5. cartridge_endpoints_resolve — every edge's fromNode equals the cartridge's own repo nodeId; every toNode resolves to a real node in base nodes.parquet. Zero dangle.
6. cartridge_provenance_declared_only — every cartridge edge provenance='declared'.
7. zero_derived_in_cartridges — zero cartridge rows provenance='derived'.
8. cartridge_union_equals_base_declared — UNION ALL of every cartridge equals the base 303 declared edges exactly; total rows = 303.
9. empty_repo_yields_valid_empty_cartridge — each of the 5 zero-edge repos has a schema-valid zero-row edges.parquet and manifest edgeCount 0.
10. base_store_unchanged — data/federation_map/current/ byte-identical to pre-PO1 (md5), still 16 nodes / 303 edges, danglingEdgeEndpoints = 0 re-verified.
11. ui_invents_no_data — no changes to any UI/browser/dashboard/homepage file.
12. cartridge_deterministic_from_clean_clone — regeneration from a fresh clone reproduces byte-identical outputs (stable md5).

ACCEPTANCE EVIDENCE TO RETURN. Open the PR, do not merge. Report the 12 cartridge paths, the per-repo edgeCount table (including the 5 zeros), all 12 checks PASS with numbers, base-store md5s showing no change, and the branch head SHA. The auditor then clones that SHA fresh, independently recomputes union-equals-303 and every check, and only then does the human apply.

## Open item

Empty-cartridge shape was left as explicit zero-row Parquet + manifest (not absent directories). If the operator prefers absence-as-empty, check 9 changes before merge.

## Notes

- PO wording above is the actual issued text (auditor-authored this session), not reconstructed.
- Filing note: the ledger commit adding this file is the filing commit only. Closing SHA is pending and must be the eventual apply SHA, never the filing commit.

# anchor_AI_MUST_READ.md

AI READ FIRST.

This repo is the GlobalGrid2050 Federation Control Ledger.

It is the source-of-truth data repo for the all-repos federation map. The homepage consumes its outputs. The homepage does not own the backend map.

This file is incomplete. Correct it as the system learns more.

## Core doctrine

A repo estate becomes scalable only when every repo is a node, every dependency is an edge, every edge has evidence, every workflow has a run record, and every published status colour is produced by a reproducible query.

No repo is considered fully federated until it has a local `federation.yaml` or equivalent machine-readable manifest.

Unknown is a real state. Do not hide unknowns. Grey is better than fake green.

## Storage discipline

Use DuckDB and zstd Parquet for the federation map.

The current map is a materialised view. Weekly snapshots are history.

The workflow must write reports and only commit after readback checks pass.

## Scaling law

Do not clone every repo.

For 100k or one million repos, the method is:

```text
GitHub API metadata
repository custom properties where available
small canonical file probes
repo-owned federation.yaml manifests
sharded traversal
append-only event logs
current-state Parquet marts
DuckDB verification
lean internal dashboard
```

## Control law

Observe first.

Dispatch workflows later.

The control plane must never trigger broad repo actions until the observe plane can prove repo identity, workflow identity, desired state, actual state and audit trail.

## Read next

```text
README.md
DATA_CONTRACT.md
DATA_SOURCES.md
IMPLEMENTATION.md
docs/FEDERATION_CONTROL_LEDGER_ARCHITECTURE.md
schemas/federation_manifest.schema.json
config/status_rules.json
scripts/build_federation_map.py
scripts/render_internal_dashboard.py
.github/workflows/gridbot_federation_map_weekly.yml
```

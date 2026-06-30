# Federation Control Ledger Architecture

Status: v1 design note. This is not complete. Correct as the system matures.

## Purpose

`data-federation-map-for-globalgrid2050-all-repos` is the backend federation control ledger for GlobalGrid2050.

It exists so the project can see, query and govern a growing estate of repositories without recreating the old monolith.

## Reference patterns absorbed

The deep research conclusion is simple:

```text
centralise metadata, lineage, status and control policy
federate source ownership and raw content
observe first
control later
```

NASA-style metadata repositories, public-sector catalogues, health data catalogues, scientific archive systems and open-source software catalogues all converge on the same shape: an authoritative registry with API-readable metadata, clear standards, provenance, and audit.

## Planes

### Data and observability plane

This plane records what exists and what happened.

It owns:

```text
repo nodes
repo edges
workflow metadata
run metadata
artifact metadata
status events
quality violations
current-state rollups
history snapshots
```

### Control plane

This plane will later trigger actions.

It owns:

```text
desired-state policy
workflow target table
allowed dispatch inputs
RBAC or approval policy
trigger logs
run reconciliation
```

The control plane must not mature before the observability plane is trustworthy.

## Physical storage

Current pattern:

```text
data/federation_map/current/nodes.parquet
data/federation_map/current/edges.parquet
data/federation_map/snapshots/year=YYYY/month=MM/week=WW/nodes.parquet
data/federation_map/snapshots/year=YYYY/month=MM/week=WW/edges.parquet
reports/FEDERATION_MAP_LATEST.md
reports/json/FEDERATION_MAP_LATEST.json
internal_dashboard/index.html
internal_dashboard/federation_dashboard.json
```

Future pattern:

```text
events/dt=YYYY-MM-DD/event_type=workflow_run/part-000.parquet
current/repos.parquet
current/workflows.parquet
current/edges.parquet
current/quality_boxes.parquet
marts/federation_summary.parquet
marts/repo_health.parquet
marts/workflow_health.parquet
marts/dependency_lineage.parquet
```

## Status colours

Use explicit status colours only when produced by reproducible rules.

```text
GREEN  current, passing, evidence-complete
AMBER  current but incomplete, stale soon, or warning-level drift
RED    failed, materially stale, or policy-breaching
GREY   unknown, not wired, or not yet observed
BLUE   frozen/manual-review/hold state
```

Every colour must have a reason field.

## Million repo law

A million repos is possible only as metadata.

Never clone everything.

At scale use:

```text
repository custom properties
federation.yaml manifests
API pagination
webhook deltas
sharded reconciliation
append-only event logs
DuckDB-written Parquet
precomputed marts
lean visual dashboards
```

## Internal dashboard rule

The internal dashboard must remain lean.

First version reads generated JSON derived from Parquet. Later versions can use DuckDB-WASM directly against Parquet.

The dashboard must show:

```text
total repos
node type counts
edge type counts
RAG/grey/blue status counts
missing manifest count
repos without workflows
data repos without data contracts
orphan or unknown nodes
latest scan ID
last generated UTC
```

## Control trigger warning

Central workflow dispatch is powerful and dangerous.

Before adding trigger buttons, the ledger must know:

```text
repo identity
workflow file identity
allowed inputs
expected output paths
last good run
status colour
human approval class
trigger audit log path
```

Until then, this repo observes and reports. It does not fire fleet-wide commands.

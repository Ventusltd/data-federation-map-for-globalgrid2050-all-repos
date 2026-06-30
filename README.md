# data-federation-map-for-globalgrid2050-all-repos

AI READ FIRST: Read the local binding requirements before changing this repository:

```text
every-drop-is-the-ocean/FEDERATION_LEDGER_SCOPE_EMPLOYERS_REQUIREMENT.md
every-drop-is-the-ocean/AUDIT_AND_COMMIT_EMPLOYERS_REQUIREMENT.md
every-drop-is-the-ocean/README.md
```

Historical homepage doctrine is context only. This ledger is permanent and self-sufficient.

This repo is the source-of-truth data product for the GlobalGrid2050 federation systems map.

It is not the public homepage. It is not a UI repo. It is the backend metadata database that records which repositories exist, what role each repo has, and how repositories depend on each other.

## Binding local requirements

The federation ledger scope is the approved employer's requirement. Build to it and do not exceed it.

The audit-and-commit requirement governs every workflow change: audit before apply, report always, prove on the declared key, and keep a clean evidence trail.

## Purpose

Track the GlobalGrid2050 federation as a data-science object:

```text
repo nodes
repo dependency edges
source/archive/data/UI/governance roles
explicit documented dependencies
workflow and data-product signals
weekly build reports
Parquet snapshots
DuckDB verification
```

## Core law

The map is metadata. A million repositories must not be cloned by one workflow.

The scalable pattern is:

```text
GitHub API metadata
canonical file probes only
manifest or registry rows where present
sharded traversal later if needed
DuckDB ingestion
zstd Parquet output
read-back verification
weekly audit reports
```

## Current output layout

```text
data/federation_map/current/nodes.parquet
data/federation_map/current/edges.parquet
data/federation_map/snapshots/year=YYYY/month=MM/week=WW/nodes.parquet
data/federation_map/snapshots/year=YYYY/month=MM/week=WW/edges.parquet
reports/FEDERATION_MAP_LATEST.md
reports/json/FEDERATION_MAP_LATEST.json
```

## Declared grain and keys

Nodes grain:

```text
one row per discovered repository or external source node per scan
```

Node key:

```text
scanId + nodeId
```

Edges grain:

```text
one row per inferred dependency edge per evidence source per scan
```

Edge key:

```text
scanId + fromNode + toNode + edgeType + evidencePath
```

## Current scanner

The scanner is `scripts/build_federation_map.py`.

It lists repos for owner `Ventusltd`, probes canonical files such as README, DATA_SOURCES, DATA_CONTRACT, DEPENDENCIES, IMPLEMENTATION and workflows, then builds dependency edges from explicit repo mentions and known source/API references.

The scanner writes Parquet through DuckDB and reads the Parquet back with DuckDB before reporting success.

## Weekly workflow

The workflow is `.github/workflows/gridbot_federation_map_weekly.yml`.

It runs weekly and manually, uses `GRIDBOT_PAT`, writes Parquet outputs and reports, and commits only after verification passes.

## Not yet complete

This is the first DNA script. It is not a perfect dependency graph yet.

As the federation learns more, improve:

```text
repo manifests
formal dependency contracts
workflow parsing
package dependency parsing
sharded API traversal
internal dashboard from verified Parquet
```

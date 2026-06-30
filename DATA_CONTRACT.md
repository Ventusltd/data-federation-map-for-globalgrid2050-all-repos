# DATA_CONTRACT.md

Status: v1 draft contract, active for the first weekly federation-map build.

## Product

GlobalGrid2050 federation systems map.

## Scope

Repository and dependency metadata for repositories owned by or connected to `Ventusltd`, starting with the GlobalGrid2050 federation.

## Output tables

```text
nodes.parquet
edges.parquet
```

## Node grain

One row per discovered repository or external source node per scan.

## Node key

```text
scanId + nodeId
```

## Required node fields

```text
scanId
nodeId
nodeKind
repoFullName
repoName
owner
repoType
status
visibility
defaultBranch
archived
htmlUrl
description
canonicalFilesPresent
generatedUTC
```

## Edge grain

One row per dependency edge per evidence source per scan.

## Edge key

```text
scanId + fromNode + toNode + edgeType + evidencePath
```

## Required edge fields

```text
scanId
edgeId
fromNode
toNode
edgeType
cardinality
evidencePath
evidenceText
generatedUTC
```

## Invariants

```text
node rows equal distinct scanId + nodeId
edge rows equal distinct scanId + edgeId
node null keys equal zero
edge null keys equal zero
Parquet files can be read back by DuckDB
workflow writes JSON and Markdown reports
```

## Storage law

Published map outputs are zstd Parquet, written and verified with DuckDB.

CSV is allowed only as a temporary staging/intermediate format inside the scanner.

## Scaling law

A million-repo federation must be represented by metadata and shards, not by cloning every repository. The scanner must use API metadata, canonical file probes, manifests and partitions.

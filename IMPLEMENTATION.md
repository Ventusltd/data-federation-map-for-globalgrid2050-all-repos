# IMPLEMENTATION.md

Status: v1 implementation notes.

## Build script

```text
scripts/build_federation_map.py
```

## Method

1. List repositories for owner `Ventusltd` through the GitHub API.
2. Record one node row per repository.
3. Probe a limited set of canonical files where present.
4. Infer repo role from repo name, description and canonical files.
5. Extract explicit dependency references to other `Ventusltd/*` repos.
6. Add external source edges for recognised external systems such as Elexon BMRS when named.
7. Deduplicate nodes and edges by declared keys.
8. Write staging CSV in the runner.
9. Use DuckDB to write zstd Parquet.
10. Read the Parquet back with DuckDB.
11. Assert node and edge key laws.
12. Write JSON and Markdown reports.
13. Commit generated Parquet and reports only after checks pass.

## Output

```text
data/federation_map/current/nodes.parquet
data/federation_map/current/edges.parquet
data/federation_map/snapshots/year=YYYY/month=MM/week=WW/nodes.parquet
data/federation_map/snapshots/year=YYYY/month=MM/week=WW/edges.parquet
reports/FEDERATION_MAP_LATEST.md
reports/json/FEDERATION_MAP_LATEST.json
```

## Scaling note

The scanner is a DNA script, not a brute-force clone. It is designed to evolve into sharded metadata traversal.

For a million repositories, split traversal into shards and write partitioned Parquet metadata. Do not clone every repo.

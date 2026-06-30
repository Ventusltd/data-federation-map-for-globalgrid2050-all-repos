# DEPENDENCIES.md

Status: local dependency declaration for `data-federation-map-for-globalgrid2050-all-repos`.

## Operating doctrine

This repository is governed by local files first:

```text
every-drop-is-the-ocean/FEDERATION_LEDGER_SCOPE_EMPLOYERS_REQUIREMENT.md
every-drop-is-the-ocean/AUDIT_AND_COMMIT_EMPLOYERS_REQUIREMENT.md
every-drop-is-the-ocean/README.md
README.md
DATA_CONTRACT.md
IMPLEMENTATION.md
```

The ledger must remain self-sufficient. External doctrine may provide historical context only; it is not the operating brain of this repository.

## Runtime and build dependencies

```text
GitHub API metadata
GitHub Actions
Python 3.11
requests
DuckDB
Parquet with zstd compression
```

## Explicit non-dependencies

```text
no homepage repo seed import
no homepage CSV import
no leaf-repo source-tree copying
no cross-repo workflow triggering at current scope
no GitHub App, webhook, gossip, CRDT, or P2P machinery at current scope
```

Temporary consumers may read the permanent ledger. The permanent ledger must not depend on temporary consumers.

# Purchase Order Ledger

Provenance: declared operational ledger. Status: documentation only. This file records closure receipts and active work items; it applies no data, changes no workflow and alters no UI.

## PO 1 — Declared-only per-repo cartridges

Status: CLOSED

Closing SHA: `3ab6b8be716e59b963969bc17993dd4c2cc438af`

Main branch receipt: PASS.

Auditor receipt: PASS twice — first on branch commit `f032fd29cfd233b151c99ae0f5ecd35c5a53a716`, then on main landing commit `3ab6b8be716e59b963969bc17993dd4c2cc438af`.

Scope closed:

- `scripts/build_declared_cartridges.py`
- `data/federation_map/cartridges/`
- `reports/FEDERATION_CARTRIDGES_LATEST.md`
- `reports/json/FEDERATION_CARTRIDGES_LATEST.json`

PR #3 remains closed unmerged as historical evidence.

## UI PO 3 — Focus actions and globalgrid2050 contents drill-in

Status: LIVE

Scope:

- Focus card opens the current repository when GitHub mode is selected.
- `globalgrid2050` is represented as a committed contents cartridge.
- The Spider exposes a Contents drill-in for `globalgrid2050`.

Apply rule: main only.

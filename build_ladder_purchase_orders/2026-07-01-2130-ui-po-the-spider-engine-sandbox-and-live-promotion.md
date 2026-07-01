# UI PO — The Spider Engine: Sandbox and Live Promotion

status: received / live
po: UI PO (UI track — not part of the numbered data PO ladder)
title: The Spider Engine — Sandbox and Live Promotion
executor: ChatGPT
auditor: Claude
target repository: Ventusltd/data-federation-map-for-globalgrid2050-all-repos
target files: dashboard/sandbox/federation_radial_uniform.html (sandbox engine); dashboard/federation_radial.html (live); Spider README
branch: n/a (recorded from close-out)
PR number: n/a (recorded from close-out)
merge SHA: n/a
audit SHA: n/a
apply SHA: 2c3c8b53dfd2dedc64ed095a18ce0feb0d8c87f3 (live promotion)
closing SHA: 2c3c8b53dfd2dedc64ed095a18ce0feb0d8c87f3
receipt status: received / promoted to live
evidence source: provided commit SHAs + chat handoff; auditor corroboration — the auditor read the live engine file dashboard/sandbox/federation_radial_uniform.html this session and confirmed the uniform column-default + optional spider view described below

## Recorded commits

- Spider README commit: 71bc26d64139546d811fbe488e359e0c3ab22547
- Sandbox commit: 9bd6352d90b1390225bca351a652e2afdf17f589
- Live promotion / closing SHA: 2c3c8b53dfd2dedc64ed095a18ce0feb0d8c87f3

## Scope

Create the uniform Spider engine: a default column layout with an optional spider (radial) view, focus-driven, reading the board cartridge data; then promote the accepted sandbox to live.

## UI requirements (reconstructed from the live engine + provided purpose)

- Uniform default "column" view: a focused node fans out to Depends on → / ← Depended on by, as cards with type badges (DB/UI/WEB/SRC/REPO/EXT), RAG status dots, and relationship tags coloured by edge type (data, governance, archive, external, repo, workflow).
- Optional "spider" view: the same cards on a large draggable/scrollable canvas; cards keep size, canvas grows.
- Controls: Focus selector; Show = Both / Outgoing / Incoming; Tap does = Explore / GitHub / External / (Status, disabled until live scanner data); Snapshot; breadcrumb drill-in into child scopes.
- Data source tag shows snapshot vs live; the view reads the board cartridge JSON (nodes.json / edges.json) with a curated snapshot fallback.
- Read-only: the UI invents no data and renders only what the cartridge provides.

## Receipt

Received and promoted to live at 2c3c8b53dfd2dedc64ed095a18ce0feb0d8c87f3.

## Notes

- UI requirements reconstructed from the live engine file (read by the auditor this session) plus the provided purpose. Not embellished beyond what the engine implements.
- This is a UI-track item and is deliberately not given a data-ladder number.
- Filing note: the ledger commit adding this file is the filing commit only. Closing SHA above is the actual live-promotion SHA.

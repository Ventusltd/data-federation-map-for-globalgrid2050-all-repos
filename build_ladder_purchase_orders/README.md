# build_ladder_purchase_orders

Commentary and progress note only. The authoritative record of each purchase order is its own Markdown file in this folder — not this README.

We are using Claude (01 July 2026) to issue purchase orders that control complex builds, inspired by "every drop is the ocean". The aim is a federation engine built on ethical, world-class open-source principles with full attribution.

## Filing convention

- One Markdown file per PO / work order.
- Filename: `YYYY-MM-DD-HHMM-title-of-po.md`, where the time is the ledger **filing** time, not the real execution time.
- Each file carries a plain-text header (status, po, title, executor, auditor, target repository, target files, branch, PR, merge/audit/apply SHAs, closing SHA, receipt status, evidence source) and the full scope.
- The **closing SHA is the actual completion / apply / receipt SHA** — never the ledger filing commit. The ledger commit only files the record; it is not proof of the PO.
- Requests are first issued as **quotations** with chronological numbers; only **accepted** quotations become logged PO files. Quotations are not logged.
- "Received / closed" requires an auditor clean-clone receipt. In-flight POs stay marked in flight until then.

## Progress to date (01 July 2026)

| Filed | PO | Status |
|-------|----|--------|
| 2100 | PO 7a — Auditor Clean-Clone Verification Contract | received / closed |
| 2110 | PO 0 — Scanner Endpoint Integrity & Committed Parquet Truth Store | received / closed |
| 2120 | PO 2a — Provenance Discriminator Field | received / closed (auditor clean-clone verified) |
| 2130 | UI PO — The Spider Engine (sandbox + live) | received / live |
| 2140 | Homepage Flag — Future Homepage | received / closed |
| 2150 | Homepage Flag — Current Live Homepage | received / closed |
| 2200 | PO 1 — Declared-Only Per-Repo Cartridges | **in flight** (PR #3, not applied) |
| 2210 | PO Ledger Reconstruction & Filing Discipline | accepted / filing |

Parked, not yet filed: PO 8 — Overview of the Entire Structure (study). Add on request.

## History note

The earlier accidental short file `2026-07-01-2213-po-7a-...md` is superseded by the full `2026-07-01-2100-po-7a-...md`. Recommended action: `git mv` the 2213 file to the 2100 name (preserving history) and replace its body with the full version. Nothing was deleted silently.

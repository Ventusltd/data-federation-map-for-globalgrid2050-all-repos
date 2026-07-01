# PO 7a — Auditor Clean-Clone Verification Contract

status: received / closed
po: PO 7a
title: Auditor Clean-Clone Verification Contract
executor: ChatGPT
auditor: Claude
target repository: Ventusltd/data-federation-map-for-globalgrid2050-all-repos
target files: every-drop-is-the-ocean/AUDITOR_VERIFICATION_CONTRACT.md
branch: n/a (recorded from close-out)
PR number: n/a (recorded from close-out)
merge SHA: n/a
audit SHA: n/a
apply SHA: n/a
closing SHA: deb028daead61cc8ebb472bc1058fa2490c9fe7d
receipt status: received from clean-clone verification
evidence source: provided close-out SHA + chat handoff; auditor corroboration — while receipting PO 2a the auditor read AUDITOR_VERIFICATION_CONTRACT.md at the 2a apply SHA and confirmed §4.3 `provenance_field_present_and_valid` is present and populated

## Scope

Create the reusable, independent clean-clone verification contract that gates PO 0 and every later data-producing apply. The contract defines the named checks an auditor reproduces from a fresh clone of a target SHA — rather than reading back an executor's own report — so that "done" means auditor-reproduced, never self-marked.

The contract is the mechanism the whole build ladder leans on: the executor builds on a branch and opens a PR; the auditor clones the stated SHA fresh and recomputes the named checks; only then may the human apply.

## Requirements captured

- A single canonical contract file at every-drop-is-the-ocean/AUDITOR_VERIFICATION_CONTRACT.md.
- Named, numbered verification clauses that later POs reference (for example §4.3 `provenance_field_present_and_valid`, added for PO 2a).
- Checks must be reproducible from a clean clone with no executor-supplied state.

## Receipt

Received from clean-clone verification. Closed at deb028daead61cc8ebb472bc1058fa2490c9fe7d.

## Notes

- Body reconstructed from the provided close-out details and chat handoff. Exact original PO wording was not available to the auditor at filing time; scope above is faithful to the recorded purpose and is not embellished.
- Filing note: the commit that adds this ledger file is the filing commit only and is NOT proof of the PO. The closing SHA above is the actual completion SHA.
- This file replaces the earlier accidental short file `2026-07-01-2213-po-7a-auditor-clean-clone-verification-contract.md` (see README). Same PO, same closing SHA.

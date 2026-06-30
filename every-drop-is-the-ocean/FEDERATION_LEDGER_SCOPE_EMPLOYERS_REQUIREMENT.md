# Federation Ledger Scope and Employer's Requirement

Commit location: every-drop-is-the-ocean/FEDERATION_LEDGER_SCOPE_EMPLOYERS_REQUIREMENT.md
Status: approved scope, employer's requirement. Build to this. Do not exceed it.
Owner and approver: Vikram Kumar, Ventus Ltd.
Independent auditor: Claude, read-only clone verification.
Executor: ChatGPT.

This is a binding requirement, not a suggestion. It sits in the every-drop-is-the-ocean folder because the why and the what belong together. The why is recorded in this folder already: every verified node is the whole discipline expressed at the smallest scale, one true drop before ocean-scale claims. This scope is that principle made into a contract.

## 1. Purpose

1.1 Build the permanent GlobalGrid2050 Federation Control Ledger in this repository, the authoritative metadata map of every repo in the federation, as nodes, edges, status, and an append-only event log, stored as immutable zstd Parquet, queried by DuckDB, rendered as a lean internal dashboard.

1.2 This repository is permanent. It is the source of truth for the federation systems map.

1.3 The ledger holds metadata, edges, status, and reports. It never copies leaf-repo source trees. Raw content stays in the leaf repos. The ledger points outward, it does not absorb.

## 2. The permanent versus temporary law

2.1 This ledger is permanent. The homepage repository is temporary.

2.2 The permanent ledger must not depend on, inherit from, or edit the temporary homepage. No homepage repo edits. No import of homepage federation CSVs or old builders as seed material. The ledger sources its nodes and edges fresh by scanning the live repos.

2.3 Dependency direction is fixed: temporary consumers may read from the permanent ledger, never the reverse. The ledger must not encode a dependency on any temporary thing.

2.4 The ledger is self-sufficient. Its doctrine, manual, and architecture note live inside this repo. It depends on no external repo for its operating brain.

## 3. What must be built

3.1 A harvester that lists the live Ventusltd repos via the GitHub API, probes canonical files in a fixed order, validates any federation.yaml manifest, and emits staged nodes, edges, and status events. Metadata before cloning. Canonical probes before inference.

3.2 A builder that consumes the staged metadata and writes three Parquet products: nodes current plus weekly snapshot, edges current plus weekly snapshot, and an append-only status_events log partitioned by date. DuckDB writes, zstd compression.

3.3 A verifier that runs independently of the builder and proves the declared data laws over the landed Parquet. Verification before commit.

3.4 A renderer that queries the Parquet and produces a static internal dashboard, pre-rendered JSON plus HTML and SVG, no backend. Every status colour is the output of a reproducible query, never an editorial judgement.

## 4. The declared data laws, the keys

4.1 Nodes are keyed by harvestRunId plus repoId. Total rows must equal distinct keys. Zero null keys.

4.2 Edges are keyed by harvestRunId plus edgeId. Total rows must equal distinct keys. Zero null keys.

4.3 Status events are keyed by eventId plus source. Total rows must equal distinct keys. Zero null keys.

4.4 Every edge endpoint, source and destination, must resolve to an existing node. Zero dangling endpoints.

4.5 These are exact-equality invariants. They must hold exactly. Growing quantities, row counts, file counts, megabytes, are floors and never exact-equality assertions.

## 5. The status colour law

5.1 Five colours. Green, current and passing and evidence-complete. Amber, current but incomplete or warning-level drift. Red, failed or materially stale or policy-breaching. Grey, unknown or not yet wired or not yet observed, a legal and visible state. Blue, control-plane or frozen or manual-hold.

5.2 Worst-state-wins precedence: red, amber, grey, blue, green.

5.3 Every colour is derived by a reproducible DuckDB query over the Parquet, tied to declared evidence: manifest presence, readme presence, data-contract presence for data repos, workflow presence, freshness, last event severity. No colour is ever typed by hand into a readme.

5.4 Unknown is legal. A repo with no evidence is grey and visible, never hidden, never guessed green.

## 6. Identity

6.1 Primary key is repoId, owner slash name. Stable, cheap, the join key everywhere.

6.2 Carry a logical identifier repoLid for the federation, and a content-derived SWHID column, headRevSwhid from the default-branch head SHA, populated cheaply without cloning. SnapshotSwhid is optional and manual initially.

6.3 Identity is dual and forward-compatible: the operational key now, the intrinsic content identifier ready for any future decentralised transport, with no rework required.

## 7. The build order, non-negotiable

7.1 Prove before consolidate. First run the existing weekly workflow once by manual dispatch and produce the first nodes and edges Parquet and report over the live repos. Do not begin the consolidation on an unrun pipeline.

7.2 Independent verification. The auditor clones read-only and confirms the section 4 laws on the first run before anything is built on top.

7.3 Consolidate only after the first run is proven, and only in separate verified commits, landed and proven one at a time: first doctrine and schema, then harvester and event log and verifier, then dashboard and dual identity. No bulk push.

7.4 Each commit lands, the section 4 proofs run, the auditor verifies from a clean clone, then the next commit proceeds. Data before display. One true drop before ocean-scale claims.

## 8. The control-plane safety law

8.1 The ledger observes first. It does not trigger any workflow in any repo until the workflow target, the accepted inputs, the output expectations, and the audit logging are all declared. Until then, triggering is forbidden and that rule is red.

8.2 When central triggering is later built, every dispatch is written to the append-only event log with actor, target, workflow, inputs, and the approval reference. No silent dispatch.

8.3 Central cross-repo triggering requires a GitHub App, not the default token. This is a later stage, behind the section 9 thresholds, not now.

## 9. Scale thresholds, deferral made explicit

9.1 Stage 0 now: scheduled and manual, GitHub-native, the existing token pattern, observe-only. Correct for the current handful of repos.

9.2 Move to a GitHub App the moment the ledger triggers any other repo, or when the API cost of scanning approaches the hourly budget.

9.3 Move to webhook-first ingestion only when freshness needs drop below the scheduled cadence or repo count grows past a few hundred with frequent probing.

9.4 Heavy decentralisation, gossip, CRDTs, peer-to-peer Git, is deferred and triggered only by independent self-hosting or sovereignty need, never by repo count alone. Do not adopt it prematurely. Write these thresholds into the repo README so no future session reaches for the heavy machinery early.

## 10. The governing discipline, the ledger holds itself to its own law

10.1 The ledger is itself a federated node, control-plane class, blue. It obeys every rule it enforces.

10.2 Append-only event log is the source of truth. Current-state tables are derived views, regenerated from scratch. Derive once, never re-source.

10.3 Fail loud. set minus e u o pipefail. Any breach of a section 4 law turns the run red and commits nothing.

10.4 Green CI is not proof. File count is not proof. Size is not proof. A dashboard rendering is not proof. The proof is the declared data law tested on the declared key, confirmed independently from a clean clone.

10.5 Every change to this ledger passes the seven-step gate: audit reads current state, data log as evidence, draft scope, human approval, audit against scope, exec summary, final surgical commit, reports committed separately from code, DEPENDENCIES updated at final commit.

10.6 No assistant marks its own homework. The builder builds, the independent auditor verifies from outside, the human decides.

## 11. What is explicitly out of scope

11.1 No homepage repo edits. No homepage seed import.
11.2 No triggering of any workflow before section 8.1 is satisfied.
11.3 No GitHub App, webhooks, gossip, CRDT, or P2P in this scope. Deferred per section 9.
11.4 No copying of leaf-repo source trees into the ledger.
11.5 No colour, status, or claim that is not the output of a reproducible query over verified Parquet.

## 12. Definition of done for this scope

12.1 The existing weekly workflow has run once, produced the first nodes and edges Parquet and a report, and passed the section 4 laws confirmed by independent clone.

12.2 The consolidation has landed in separate verified commits, each proven before the next, with no homepage edits.

12.3 The ledger renders every known repo with a query-derived colour and drill-down reason, grey where unknown, and is self-sufficient with its doctrine, manual, and architecture note local to this repo.

12.4 The append-only event log exists, is keyed and verified, and records the build runs.

12.5 DEPENDENCIES, README, CHANGELOG updated. The ledger describes itself first and truthfully.

One true drop before ocean-scale claims. Build to this, prove each step, and let the map stay as true as the drops it is made of.

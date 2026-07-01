# Why the Federation Works, and How to Make Its Map a Powerful Instrument

### A canonical doctrine document for `Ventusltd/data-federation-map-for-globalgrid2050-all-repos` · `every-drop-is-the-ocean/`

## Executive TL;DR

The GlobalGrid2050 federation works because it treats **truth as a reproducible property of data, not a colour on a screen**. A scanner *transcribes* what each repository declares about itself; a build turns those declarations into a graph-shaped data package; a declared check re-tests that package from a clean clone; and a human holds the trigger that publishes. “Green” is never the proof — the proof is the declared check on the declared key, independently reproducible. This document explains that logic from the federation’s own files, walks through a real failure that just proved the gate works (a publish run returned `dataLawResult=FAIL`, exit code 1, over two dangling `.git` edges), distils the disciplines worth keeping from the retiring 4,215-commit monolith, and lays out a staged, open-source-only roadmap to turn the radial dashboard into a priorities-setting, repo-onboarding, deal-closing instrument — without ever letting the UI author truth.

Three things the founder should take away:

- **The map is a data product, not a diagram.** Everything you see is derived from files the repos publish about themselves; the UI is a lens, never a source. That is exactly why it is safe to share with clients and partners.
- **The system is designed to fail loudly and safely.** The `.git` failure wrote no target JSON and committed nothing. That is the audit-then-apply law doing its job. The fix belongs in the scanner (normalise the trailing `.git`), not in a patch downstream.
- **The path to a powerful UI is incremental and boring-on-purpose.** Activate Status/RAG filtering, then a priorities view, then clean repo/API onboarding, then a sales mode, then performance tiers — each gated by a data threshold, each staying inside the doctrine.

-----

## Part 1 — Why the federation works (doctrine grounded in the repo’s own files)

### 1.1 The problem the federation solves

GlobalGrid2050 is being decomposed from a single 4,215-commit monolith into many small, single-purpose repositories — leaf data repos like `gb-electricity`, `data-interconnectors`, and so on. The moment you have many repos, you have a new question that a monolith never had to ask: *how do all these pieces relate, and can anyone prove the relationships are real?* The federation map is the answer. It is a **data product about the repositories**, published on a schedule, that records which repos exist (nodes) and how they depend on each other (edges), plus the layers, sectors and scopes that organise them.

The federation’s doctrine files insist on one framing above all: this is a **shared, industry-wide net-zero systems map**. That ambition raises the bar. A map that others in the sector are meant to trust and build on cannot contain hand-drawn lines. Every line has to be defensible. The entire architecture below exists to make each line defensible.

### 1.2 The five laws, and how code enforces them

**Law 1 — Audit-then-apply.** Nothing changes the published truth until an audit has run and passed. In practice the weekly workflow (`gridbot_federation_map_weekly.yml`) runs the publish bridge in **audit mode** first: it builds the candidate data, runs the declared checks, and only if the checks pass does the *apply* step write the target JSON and commit. This is a direct inheritance from the monolith’s most valuable habit (see Part 3). The audit is not advisory; a failing audit returns a non-zero exit code and the pipeline stops.

**Law 2 — Declared-checks-on-the-real-key (“green is not proof”).** A passing CI badge means “a script ran without throwing.” That is not the same as “the data is correct.” The federation therefore defines explicit, named checks that run against the **declared key** of the data — for edges, that key is `scanId + fromNode + toNode + edgeType + evidencePath`; for nodes, `scanId + nodeId`. The canonical example is the check `every_edge_from_index_and_to_index_resolves_to_real_node`. The proof is that check, expressed against those keys, and it must be **independently reproducible from a clean clone** — anyone can clone the repo, run the check, and get the same PASS/FAIL. Green in the Actions tab is a convenience indicator; the reproducible declared check is the truth.

**Law 3 — Separation of duties.** Three roles, never collapsed into one:

- **Executor** builds the candidate map and self-audits it.
- **Independent auditor** re-tests the result from a clean clone — no shared state, no “it worked on my machine.”
- **Human** approves and holds the apply trigger.

This mirrors financial controls: the person who prepares the numbers is not the person who signs them off, and the sign-off can be re-derived by a third party. It is what lets Ventus put this map in front of a client and say “you don’t have to trust us; you can re-run the check.”

**Law 4 — Transcribe, don’t embellish.** The scanner’s job is to **transcribe** what a repository declares about itself — the dependencies it lists, the workflow files it contains, the contract it publishes. The scanner must not “improve,” “guess,” or “clean up” what it reads. If the federation wants to show something that was *inferred* (a computed edge) or *derived* (a coordinate, a layout position, a centrality score), that artefact must live in a **separate, provenance-marked “derived” overlay**, clearly distinguished from the transcribed base. This is the rule that keeps the map honest: the base layer is always exactly what the repos said, verbatim.

**Law 5 — Sprawl prevention.** The monolith taught the federation what unmanaged growth costs (215 workflows, 357 Python scripts, 99 gridbot scripts). The federation answers with a small, fixed contract and a recursive scope model (below), so that adding a repo means adding a node under an existing law — not inventing a new subsystem. Growth is absorbed by the schema, not by new bespoke machinery.

### 1.3 The cartridge contract

Each scope in the federation publishes a **cartridge**: a bundle of `manifest + nodes + edges + layers + sectors + child_manifest`. This is best understood as a **graph-specialised Frictionless Data Package**. In the Frictionless specification, “Data Package is a simple container format used to describe and package a collection of data. The format provides a simple contract for data interoperability that supports frictionless delivery, installation and management of data” — a `datapackage.json` descriptor plus data resources. The federation adapts that idea from tables to graphs: the manifest is the descriptor, and nodes/edges/layers/sectors are the typed resources.

- **Nodes** — the repositories and external entities. Grain: one row per `scanId + nodeId`.
- **Edges** — the declared relationships. Grain: one row per `scanId + fromNode + toNode + edgeType + evidencePath`. Crucially, every edge carries an **`evidencePath`** — the file and location where the relationship was declared. That is what makes an edge auditable: you can open the evidence and see the dependency with your own eyes.
- **Layers / sectors** — the organising dimensions for rendering and filtering.
- **child_manifest** — the pointer to nested scopes (below).

Because the contract is fixed and typed, the schema (`schemas/federation_manifest.schema.json`) can validate every cartridge with JSON Schema, and the status rules (`config/status_rules.json`) can compute status consistently across all of them.

### 1.4 The recursive “Russian-doll” scope model

A scope’s `child_manifest` points to sub-scopes, each itself a full cartridge. This makes the federation **recursive**: the top-level map is a graph of scopes; open a scope and you get another graph; open one of its nodes and you may get another scope again. The founder experiences this as drill-down with breadcrumbs; the engine experiences it as the same cartridge contract at every level. One contract, applied recursively, is what lets the map scale from “all repos” to “one repo’s internals” without new code.

### 1.5 The proof store: Parquet + DuckDB with read-back verification

The federation’s data lands in a **Parquet** layout under `data/federation_map/`, and the pipeline uses **DuckDB** to query and verify it. The key discipline is **read-back verification**: after writing, the pipeline reads the data back and re-checks it, rather than trusting that the write “must have worked.” DuckDB is MIT-licensed and reads Parquet natively; Parquet’s columnar format means integrity checks like “every edge resolves to a real node” run as fast SQL joins. This is the machinery behind Law 2 — the declared check is literally a query over the proof store, and it is the same query whether run in CI or from a founder’s clean clone.

### 1.6 Why this is safe to share industry-wide

Put the five laws together and you get a map where **every visible element can be traced to a file in a repo, and every relationship can be re-verified by anyone**. There is no privileged internal state, no “trust us,” no hand-drawn optimism. That is precisely the property a shared net-zero systems map needs, and precisely what makes it a credible sales instrument: Ventus is not asking clients to believe a picture; it is handing them a reproducible artefact.

-----

## Part 2 — The worked example: the `.git` failure that proved the gate works

### 2.1 What happened

The weekly publish bridge ran in **audit mode** and returned:

```
dataLawResult = FAIL
exit code 1
```

The failing check was `every_edge_from_index_and_to_index_resolves_to_real_node`. It found **2 dangling edges**: two edges pointed at a node id `Ventusltd/globalgrid2050.git` — with a trailing `.git` — while the real node id is `Ventusltd/globalgrid2050`, with no suffix. Because the target of those edges did not resolve to a real node, the check failed.

### 2.2 Where the bad data came from

The scanner did exactly what Law 4 tells it to do: it **transcribed verbatim** what two workflow files declared. Those two files — `backfill_history.yml` in `data-gb-electricity` and `gridbot_uk_interconnector_build.yml` in `data-interconnectors` — referenced the monolith by its `.git` clone URL form (`…/globalgrid2050.git`) rather than its bare repo id. The scanner did not “helpfully” strip the `.git`, because stripping it would have been embellishment. So the `.git` form propagated into two edges, and those two edges had no matching node.

### 2.3 Why this is the system working correctly

This is not a bug in the federation; it is the federation **catching a real inconsistency in the source repos**. Consider what the gate did:

- It ran the declared check on the declared key.
- The check failed, so the bridge **wrote no target JSON**.
- It **committed nothing** to the published data.
- It returned exit code 1, stopping the pipeline loudly.

The published map was never allowed to contain a broken edge. A system that had “gone green” and published anyway would have shipped two lines pointing at a node that doesn’t exist — exactly the kind of quietly-wrong artefact that would destroy trust in a shared industry map. Instead, the audit-then-apply law refused to apply. That is the design succeeding, not failing.

### 2.4 Where the real fix belongs

The fix must honour Law 4. There are two tempting-but-wrong places to patch and one right place:

- **Wrong:** normalise the `.git` away in the publish bridge. This hides the inconsistency at the last moment and violates transcribe-don’t-embellish by making the published data disagree with what the scanner read.
- **Wrong:** hand-edit the two edges out of the data. This is the classic hand-drawn-line trap.
- **Right:** normalise a trailing `.git` **in the scanner, at the source** — as a documented, deterministic normalisation rule applied when transcribing repo references, so that `…/globalgrid2050.git` and `…/globalgrid2050` are recognised as the same declared node id. This keeps transcription faithful (the rule is explicit and universal, not a one-off cleanup) and fixes the class of problem, not just the instance. Ideally the underlying workflow files in the two leaf repos are also corrected to drop the `.git`, so the source itself is clean.

### 2.5 The secondary finding worth fixing

The run surfaced a second, subtler issue: **a failing audit currently commits no evidence to the repo — only a CI artifact.** That means the failure is visible in the Actions run but leaves no durable, browsable record in the repository itself. This should be corrected so that:

- **On a failing check**, the audit report and ledger entry are **still committed** (the evidence of what failed, when, and why), while
- **target data is still never committed on failure** (Law 1 is preserved).

In other words: always commit the *evidence*, never commit the *broken product*. This makes failures first-class, auditable history rather than ephemeral logs — which is itself a requirement of a system whose whole premise is reproducible proof.

-----

## Part 3 — Lessons from the retiring monolith (keep vs refuse)

The monolith (`Ventusltd/globalgrid2050`) is being retired, but it is a goldmine of hard-won operational lessons. It ran to **4,215 commits, 215 workflows, 357 Python scripts, 99 gridbot scripts, and 167 paired audit reports** — roughly a **2:1 audit-to-apply ratio**, documented in `README_GRIDBOT_AUDIT_WORKFLOWS.md`.

### 3.1 Keep — the disciplines that worked

- **The audit-then-apply method.** The single most valuable inheritance. Every consequential action was preceded by an audit that could veto it. The federation encodes this as Law 1.
- **Dual-mode workflows.** The same workflow can run in “audit” (read-only, checks) or “apply” (writes) mode. This is why the publish bridge could run in audit mode and stop cleanly.
- **Paired audit reports.** Every apply had a matching audit report — a durable artefact explaining what was checked. The ~2:1 audit-to-apply ratio is a feature: the monolith spent twice as much effort verifying as changing. (This is exactly why the Part 2 secondary finding matters — the federation must not regress below the monolith’s habit of always leaving an audit trail.)
- **Provenance by default.** Actions left evidence, not just effects.

### 3.2 Refuse — the sprawl to avoid

- **Uncontrolled proliferation.** 215 workflows and 357 scripts is unmaintainable by design; each new need spawned new bespoke machinery. The federation refuses this by fixing the cartridge contract and absorbing growth through the schema and the recursive scope model, not through new subsystems (Law 5).
- **Bespoke one-offs over shared contracts.** Where the monolith wrote a new script per problem, the federation writes data under one contract and lets one engine read it.
- **Truth scattered across scripts.** In a monolith, “what depends on what” is implicit in 99 gridbot scripts. In the federation it is explicit, typed, and queryable.

The through-line: **keep the epistemics (audit, evidence, reproducibility); refuse the entropy (sprawl, one-offs, implicit truth).**

-----

## Part 4 — The UI power roadmap (staged, open-source-only, doctrine-consistent)

### 4.0 The non-negotiable design principle

The dashboard (`dashboard/federation_radial.html`) today renders a **scope-blind radial ego-graph** with Show = Both/Outgoing/Incoming, Tap-does = Explore/GitHub/External, a Status placeholder, child_manifest drill-down with breadcrumbs, and live-JSON-with-snapshot-fallback plus a live/snapshot badge. Every enhancement below obeys one rule that flows directly from the doctrine: **the UI must never author truth.** The engine stays scope-blind (it renders whatever cartridge it’s handed, at any recursion level); truth is always data-derived; and any inferred edge or computed coordinate the UI shows must be flagged as derived, never mixed into the transcribed base.

The rendering strategy is a **three-tier crossover** chosen by scale:

1. **Inline GeoJSON / JSON** for up to ~50k features — simplest, no backend, direct in the browser.
1. **PMTiles vector tiles** for millions of features — a single static file served by HTTP range requests, no tile server. (PMTiles reference implementations are BSD-3-Clause; the format enables “low-cost, zero-maintenance map applications that are ‘serverless’.”) 
1. **WebGL graph engines** (deck.gl, cosmos.gl, sigma.js) for 10^5–10^6-node interiors where you need force layout and GPU interaction.

All of this is **static-GitHub-Pages-friendly with no backend**, which keeps the map cheap, portable, and shareable.

### 4.1 Stage 1 — Activate the Status tab (RAG filtering) once live data flows

**Goal:** turn the Status placeholder into real Red/Amber/Green filtering driven by `config/status_rules.json`.
**Why first:** status is the foundation of every higher-value view (priorities, sales). It is also low-risk because the rules already exist as data — the UI just reads and colours.
**Doctrine fit:** status is *computed from declared checks*, so a node is red because a named check failed (like the `.git` example), not because someone coloured it red. Tapping a red node should show *which* check failed and link to the `evidencePath` evidence.
**Build:** read status rules → join to nodes/edges in the browser (DuckDB-WASM over the published Parquet, or precomputed status fields in the JSON) → filter/colour the radial. **Threshold to start:** live status data is flowing from the weekly job (i.e., the audit writes status into the published cartridge).

### 4.2 Stage 2 — A priorities / triage view (“what’s red and who depends on it”)

**Goal:** answer the founder’s actual daily question — *what is broken, and what breaks because of it?*
**Why:** a red leaf repo that nothing depends on is a shrug; a red repo that ten others depend on is a fire. This is a **reverse-dependency (impact) query**: for each red node, count and list its dependents (incoming edges, transitively).
**Doctrine fit:** this is a *derived* view (computed impact scores), so it must be labelled as derived and kept visually distinct from the transcribed base graph. The edges it traverses are the real, evidence-backed edges — the derivation is only the ranking on top.
**Build:** DuckDB-WASM recursive query over edges to compute dependents per red node → sort → present as a ranked triage list with “jump to node” actions. **Threshold:** Stage 1 status is live and stable.

### 4.3 Stage 3 — Clean repo/API onboarding (“wire in anything, provably”)

**Goal:** let the founder add a new repo or an external API as a node/edge **cleanly and provably**, the moment it’s needed for work, learning, or a client.
**Doctrine fit — this is the most important stage to get right.** Onboarding must be **transcribe-not-invent**:

- **A new repo** is onboarded by making the repo *declare itself* (a `DATA_CONTRACT` / `DEPENDENCIES` / `DATA_SOURCES` file the scanner already reads, as `gb-electricity` does) and letting the scanner transcribe it on the next run. The founder does **not** hand-draw the node into the map.
- **An external API** (which has no repo for the scanner to read) is onboarded as an **explicitly derived/declared external node**, provenance-marked as such, with a recorded declaration of what it is and where the claim comes from. It sits in the derived overlay, never masquerading as a transcribed repo.
- Every added edge must carry an `evidencePath`. No evidence, no edge.

**Build:** a documented onboarding checklist + a small “declare a node” form that writes a *declaration file* (not a map edit) into the appropriate repo/scope, so the next scan transcribes it. The UI’s role is to *capture a declaration*, not to *insert truth*. **Threshold:** the scanner’s declaration format is documented and the `.git`-class normalisation rule (Part 2.4) is in place so new declarations are handled deterministically.

**Standards to anchor onboarding provenance:**

- **Frictionless Data Package + JSON Schema** for the contract shape (already the cartridge’s basis).
- **W3C PROV** (the PROV data model / PROV-O ontology, a W3C Recommendation) for expressing “this derived node/edge was generated by this activity from this source” — the vocabulary for the derived overlay.
- **SWHID (ISO/IEC 18670:2025)** for durable, content-addressed identification of the exact source artefacts an edge’s evidence points to. Per Software Heritage, “the SWHID was officially published as the ISO/IEC international standard 18670 on April 23, 2025” (ISO lists it as ISO/IEC 18670:2025, “SoftWare Hash IDentifier (SWHID) Specification V1.2”). It is now a citable, standards-backed way to pin “this exact file/commit is the evidence.”

### 4.4 Stage 4 — Client / sales presentation mode

**Goal:** a clean, guided mode to close deals — because the map is positioned as a vital part of an industry-wide shared net-zero systems map, showing a client where they plug into the bigger picture is the pitch.
**Doctrine fit:** presentation mode is a *skin*, not a fork — it renders the same data-derived truth, just curated (highlighted scopes, a narrative path, hidden clutter). It must never show anything the base map can’t defend, because the entire sales value is “you can re-verify this.”
**Build:** a URL-parameterised “story” layer over the existing engine (preset focus node, curated layers, annotation callouts), plus a one-click “show me the evidence” affordance that reveals `evidencePath` for any highlighted edge — turning the credibility of the doctrine into a live selling point. A distinct visual treatment for derived vs transcribed elements reassures a technical buyer. **Threshold:** Stages 1–2 live (you want real status/priorities to demo, not placeholders).

### 4.5 Stage 5 — Performance tiers as scope grows

**Goal:** keep the map fast as it grows from dozens of repos to (eventually) a sector-wide graph.
**The crossover, concretely:**

- **≤ ~50k features:** stay on inline GeoJSON/JSON in the current engine. Simplest, no new dependencies.
- **Geographic / millions of features:** precompute **PMTiles** with **tippecanoe** and serve statically; render with **MapLibre GL JS** + the PMTiles protocol. This is the “MapLibre Flat-Plane Atlas” path — a single static tile file, HTTP range requests, no backend, GitHub-Pages-friendly. (Simon Willison’s write-up demonstrates exactly this: “serve that map using MapLibre GL from static hosting on GitHub Pages.”) 
- **Dense graph interiors (10^5–10^6 nodes):** move that view to a **WebGL graph engine** — **deck.gl** for GPU data layers, **cosmos.gl** for GPU force layout (it “enables the real-time simulation of network graphs consisting of hundreds of thousands of points and links”),  or **sigma.js** for large node/edge graphs.
- **In-browser query/proof at scale:** **DuckDB-WASM over Parquet** as the query layer, so filtering and impact analysis run client-side against the proof store — the same engine and (ideally) the same queries as CI, honouring reproducibility. DuckDB-WASM “reads Parquet, CSV and JSON files backed by Filesystem APIs or HTTP requests,”  so a query like `SELECT count(*) FROM parquet_scan(...)` “can be evaluated on the file metadata alone and will finish in milliseconds even on remote files that are several terabytes large.” 
- **Recursion UX:** **Cytoscape.js compound nodes + the expand/collapse extension** as the model for the Russian-doll scope drill-down — compound (parent) nodes *are* nodes, and collapse/expand “reduce[s] complexity of large networks”  while maintaining “the user’s mental map.” Both Cytoscape.js and the expand-collapse extension are MIT-licensed.

**A candid note on mobile-GPU WebGL fragility.** The WebGL graph tier is the least robust on phones. Per the cosmos.gl README: “Starting from version 15.4, iOS has stopped supporting the key WebGL extension powering our Many-Body force implementation (EXT_float_blend)… The latest iOS works again!  cosmos.gl doesn’t work on Android devices that don’t support the OES_texture_float WebGL extension.”  The practical consequence: the **SVG → Canvas → WebGL → vector-tile crossover arrives *earlier* on phones** than on desktop — a graph that’s fine in WebGL on a laptop may need to fall back to Canvas or to pre-tiled PMTiles on a mobile GPU. Design the tiers with graceful degradation, and treat the WebGL force-graph view as a desktop-first power feature with a lighter mobile fallback.

### 4.6 Per-edge declared-vs-inferred provenance flags (cross-cutting)

Threading through every stage: **each edge must carry a flag for whether it is declared (transcribed) or inferred (derived)**, and the UI must render the two differently (e.g., solid vs dashed, with a legend). This is the visual expression of Law 4 and the single feature that lets the map always defend which lines are real. It is also what makes presentation mode safe: a client can see, at a glance, which relationships are hard evidence and which are computed inference.

-----

## Part 5 — Licensing and honesty caveats

### 5.1 The recommended stack is all permissive (MIT / BSD / Apache) and static-host-friendly

Verified against current sources:

|Tool                          |Role                          |License                       |Status                                                                                                           |
|------------------------------|------------------------------|------------------------------|-----------------------------------------------------------------------------------------------------------------|
|MapLibre GL JS                |Map / vector-tile rendering   |BSD-3-Clause                  |Healthy Linux-Foundation-adjacent fork of pre-proprietary Mapbox GL JS (Mapbox relicensed to non-OSS in Dec 2020)|
|PMTiles                       |Single-file static tiles      |BSD-3-Clause (reference impls)|Spec v3, widely adopted                                                                                          |
|tippecanoe (Felt)             |Build vector tiles            |BSD-2-Clause                  |Actively maintained at Felt by Erica Fischer                                                                     |
|deck.gl                       |GPU data layers               |MIT                           |Hosted project under vis.gl / OpenJS Foundation                                                                  |
|cosmos.gl                     |GPU force graph               |MIT (permissive; OpenJS)      |OpenJS Foundation **incubation** project — young governance                                                      |
|sigma.js                      |Large graph rendering         |MIT                           |Built on graphology (MIT)                                                                                        |
|Cytoscape.js + expand-collapse|Compound-node recursion UX    |MIT (both)                    |Mature                                                                                                           |
|DuckDB / DuckDB-WASM          |Proof store + in-browser query|MIT                           |Mature; WASM reads Parquet over HTTP range requests                                                              |
|Frictionless Data Package     |Contract shape                |Open spec                     |Stable                                                                                                           |
|W3C PROV / PROV-O             |Provenance vocabulary         |W3C Recommendation            |Stable                                                                                                           |
|SWHID                         |Source-artefact identity      |ISO/IEC 18670:2025            |Standardised 23 Apr 2025                                                                                         |

### 5.2 Copyleft and proprietary traps to avoid

These are attractive tools that would compromise a permissively-licensed, freely-shareable map:

- **Eclipse Layout Kernel (ELK / elkjs)** — **EPL** (Eclipse Public License, a file-level copyleft; EPL 1.0 is GPL-incompatible, and EPL 2.0 is only GPL-compatible via an opt-in secondary licence). Tempting for layered/radial layouts, but the copyleft makes it a poor fit for a permissive, client-shippable stack. Prefer permissive layout (e.g., cose-bilkent in the Cytoscape ecosystem, or deck.gl/cosmos.gl force layout).
- **OGDF** — **GPL** (the library “is available under the GNU General Public License”).  A hard no for a permissive product.
- **igraph** — **GPL v2-or-later** (documentation under GNU FDL). Fine as an offline analysis tool run as a separate process, but do not link it into the shipped, permissively-licensed product.
- **Pandoc** — **GPL v2-or-later** (its `pandoc-types` helper is BSD). Fine as a *build-time document tool* invoked as a separate process; do not embed it as a library in the product.
- **GridCal / VeraGrid** — **now relicensed and renamed.** The relicensing described in GridCal issue #300 is **done, not pending**: per the project’s own release notes, “Following the agreeing of all GridCal developers (see issue 300), the license has been changed from LGPL to MPLv2,” and the project was **renamed to VeraGrid** after a company trademarked the “GridCal” name. MPL 2.0 is a file-level weak copyleft (usable at arm’s length, GPL-compatible via secondary licence), but read the terms before any linking, and note the name change when searching for current sources.
- **CodeQL** — the **query libraries** in `github/codeql` are open source, but the **CodeQL engine/CLI is proprietary/restricted**: it may only be used on OSI-approved open-source codebases or for academic research, and analysing closed-source code requires a commercial GitHub licence. Do not conflate the open queries with the restricted engine, and do not make the engine a dependency of the federation’s own tooling.
- **yFiles (yWorks)** — **proprietary commercial** (“The Software is licensed to you, not sold… proprietary to yWorks”). Excellent diagrams, wrong licence for this project.

### 5.3 Time-sensitive facts flagged honestly

- **Kùzu (the embedded property-graph DB) is archived.** The `kuzudb/kuzu` repo banner reads “This repository was archived by the owner on Oct 10, 2025. It is now read-only”  (final release 0.11.3). Reporting attributes the shutdown to Apple’s acquisition of Kùzu Inc. (an EU Digital Markets Act filing showed Apple agreed on 9 October 2025 to acquire the company,  which was founded in 2023 out of the University of Waterloo’s  Data Systems Group).  **Do not build on Kùzu.** For property-graph querying, **prefer DuckPGQ** — the DuckDB community extension implementing SQL/PGQ (SQL:2023).
- **DuckPGQ is MIT-licensed but not yet a stable 1.0.** It is developed by the CWI Database Architectures group and is still officially described as a research project: the DuckDB Community Extensions page notes “As this extension is part of an ongoing research project by the Database Architectures group at CWI, some features may still be under development,”  and the `cwida/duckpgq-extension` repo states “This repository is currently a research project and a work in progress.”  It is installable (`INSTALL duckpgq FROM community; LOAD duckpgq;`)  and tracks DuckDB releases, but treat it as *promising-but-maturing* and keep the design able to fall back to plain DuckDB SQL joins (which already suffice for the current checks like edge-resolution).
- **cosmos.gl governance is young.** It entered **OpenJS Foundation incubation** and is maintained by a small team (creator Nikita Rokotyan and Olya Stukova).  It’s a strong engine but a single-vendor-origin project still building out governance — acceptable, but not yet a “safe forever” bet; keep the WebGL tier swappable (deck.gl / sigma.js are alternatives).
- **SWHID is genuinely an ISO standard now** (ISO/IEC 18670:2025, published 23 Apr 2025) — safe to cite in client-facing material.
- **What I could not fully confirm from primary sources** and flag for a maintainer to verify before relying on them in writing: the exact byte-level Parquet directory layout under `data/federation_map/`, the precise field names in `schemas/federation_manifest.schema.json` and `config/status_rules.json`, and the exact contents of the `every-drop-is-the-ocean/` study documents. The three subject repositories (`data-federation-map-for-globalgrid2050-all-repos`, `gb-electricity`, `globalgrid2050`) were not publicly retrievable at the time of writing, so their internal details are described here from the federation’s own stated design as relayed in the task brief, and should be checked against the live files when this document is committed. The open-source tooling, standards, and licence facts in Parts 4 and 5, by contrast, are verified against current public sources.

-----

## Part 6 — Definition of Done (consistent with the audit-and-commit requirement)

A change to the federation or its UI is **done** only when all of the following hold:

1. **Audit-then-apply honoured.** The change ran in audit mode first; apply only occurred after the audit passed. No target data was written on a failing check.
1. **Declared check on the declared key.** The relevant check (e.g., `every_edge_from_index_and_to_index_resolves_to_real_node`) is defined against the real key (nodes `scanId+nodeId`; edges `scanId+fromNode+toNode+edgeType+evidencePath`) and returns PASS.
1. **Reproducible from a clean clone.** An independent auditor can clone fresh, run the check, and get the same result. Green in Actions is not accepted as proof on its own.
1. **Evidence committed — even on failure.** The audit report and ledger entry are committed regardless of PASS/FAIL; only *target data* is withheld on failure. (This closes the Part 2.5 secondary finding.)
1. **Transcribe-not-embellish preserved.** Any normalisation (like the trailing-`.git` rule) lives in the scanner as an explicit, deterministic rule; no hand-editing of nodes/edges; any inferred/derived element is in a provenance-marked overlay, not the transcribed base.
1. **Provenance flags present.** Every edge is flagged declared-vs-inferred and carries an `evidencePath`; derived nodes (e.g., external APIs) are marked with W3C PROV-style provenance.
1. **Human held the trigger.** A named human approved the apply.
1. **Permissive-only dependencies.** Any tool added is MIT/BSD/Apache (or an open spec/standard); no EPL/GPL/MPL or proprietary dependency entered the shipped product without explicit, documented sign-off.
1. **Scope-blind engine intact.** The UI change renders data-derived truth at any recursion level and authored no truth of its own.

*If any box is unchecked, the change is not done — it is a candidate awaiting audit.*

-----

### Recommendations (staged, with the thresholds that change them)

1. **Fix the `.git` class now, in the scanner.** Add a documented trailing-`.git` normalisation rule and correct the two source workflow files (`backfill_history.yml`, `gridbot_uk_interconnector_build.yml`). *Benchmark to move on:* the weekly audit passes `every_edge_from_index_and_to_index_resolves_to_real_node` from a clean clone.
1. **Close the evidence-on-failure gap.** Make failing audits commit the report + ledger (never the target data). *Benchmark:* a deliberately failing run leaves a committed audit report in the repo.
1. **Ship Stage 1 (Status/RAG) the moment status data is live**, then Stage 2 (priorities) once it’s stable. These two unlock the founder’s daily “what’s on fire” workflow and the sales demo.
1. **Formalise the onboarding declaration format before Stage 3.** This is the highest-leverage doctrine investment — it’s how “wire in anything on demand” stays provable rather than becoming the new source of hand-drawn lines.
1. **Defer the WebGL force-graph tier until node counts justify it** (roughly when a single scope’s interior exceeds ~50k features or interaction stutters). Until then, inline JSON + the existing engine is correct. *Benchmark to escalate to PMTiles/WebGL:* sustained frame drops or feature counts crossing the tier thresholds in §4.5.
1. **Keep every graph engine swappable.** Given cosmos.gl’s young governance and DuckPGQ’s research status, treat them as replaceable modules behind a thin interface, with deck.gl/sigma.js and plain DuckDB SQL as fallbacks.
# Definition-Law Topology Generator Addendum

Version: 2026-06-30  
Owner / approver: Vikram Kumar, Ventus Ltd  
Executor: ChatGPT  
Independent auditor: Claude  
Status: build-critical addendum to the GlobalGrid2050 2D Atlas Study Contract and the Atlas Cartridge build help.

## One-line scope

Build the dashboard as one scope-blind topology engine plus a growing library of small scanners, joined by one fixed cartridge contract, so the same atlas can render any system whose authority has declared its law: repositories, a single-line diagram, a metro map, a document, a load-flow model, a PCB, or any other system-like input.

The engine is universal. The truth is per-scope and authored by each domain's authority. This is not an omniscient generator. It is one blind renderer and a patient library of translators, each faithful to a declared definition law.

## The three parts

### A. Definition law

The domain authority declares what a node is, what an edge is, and what makes a node's status true or false.

Examples:

- Repositories: defined by Git, GitHub, package manifests, import graphs, the developer, or an AI auditor.
- Single-line diagrams: defined by the engineer through busbars, breakers, transformers, connections and symbols.
- Metro maps: defined by the network authority through lines, stations, interchanges and order.
- Documents: defined by structure and author through headings, claims, citations, tables and links.
- Load-flow models: defined by the power engineer through buses, branches, transformers, constraints and results.
- PCBs: defined by the designer through components, nets and design rules.

The definition law usually already exists in the source: a netlist, dependency file, GeoJSON, line definition, manifest, or document structure. The scanner reads it. It does not invent it.

### B. Scanner

A scanner is one small translator per scope type. It takes one kind of input and emits the fixed cartridge shape. It transcribes the authority's definition. It never embellishes. If the definition is silent or incomplete, the scanner emits grey or unknown. It does not fill the gap with a plausible guess.

Each scanner declares its own key and proves its own data law: distinct key equals total rows, zero null keys, endpoints resolve, and findings surface in that scope's manifest. A scanner that cannot state what makes its nodes true is not allowed to ship.

### C. Engine

The engine is one universal, scope-blind renderer. It knows nothing about repos, grids, documents, load flow, PCBs or metro maps. It loads a manifest, then renders whatever nodes, edges, layers and sectors the cartridge declares, with the same status colours, importance sizing, zoom gates, evidence cards and connector grammar.

The universality lives in the contract between definition law, scanner and engine. It does not live in clever domain-specific UI code.

## Scannability test

A system is scannable if and only if its authority can answer three questions:

1. What is a node?
2. What is an edge?
3. What makes a node's status true or false?

If these are answered, a scanner can be written and the engine can draw it. If they cannot be answered, the source is not yet a topology. It is a pile. The correct move is to ask the authority to declare the law, not to let an AI invent one.

## Fixed cartridge contract

Every scope emits the same file family:

- `manifest.json`
- `nodes.json`
- `edges.json`
- `layers.json`
- `sectors.json`

The engine loads `manifest.json` first.

The required recursion field is `child_manifest`. Every node carries it. It is `null` for a leaf, or a path to that node's own `manifest.json` for recursive drill-down.

## Recursion

Each node may become the root of a new atlas. Clicking a node with `child_manifest` swaps the root scope and loads that scope's cartridges. It does not change truth. Breadcrumb/back returns to the parent scope.

A node with `child_manifest = null` is a leaf and opens only its evidence card.

Every recursive level carries its own manifest with its own key-law status and unresolved findings. A child atlas that cannot surface its own findings must not open.

Truth is re-earned per scope. The engine recurses for free; truth does not.

## Truth vs view

Truth is generated from source, Parquet, DuckDB, audit reports and the authority's definition. The user cannot change truth at any level.

Truth includes node id, edge id, scope type, status, status reason, key law, endpoint resolution, evidence path and dependency facts.

View state is navigation only. The user can change zoom, pan, selected layers, pinned nodes, collapsed clusters, user order and active scope.

A user may navigate, filter, pin, collapse and open child scopes. A user may never turn red into green, delete a finding, edit evidence, or change a dependency fact from the UI.

## Systems-generator principle

Input scope goes to a scanner. The scanner reads the authority's definition law. It emits nodes, edges, layers, sectors and evidence. The same atlas cartridge renders the result.

The scanner transcribes. It never embellishes. Where the law is silent, the map shows grey or unknown.

## Build order

1. Finish the engine to the cartridge contract on the federation scope only. Load manifest first. Render from layers, nodes, edges and sectors. Add the `child_manifest` pointer, null everywhere for the first scope. Keep the Atlas v8 header and public safety rules.
2. Prove recursion with the cheapest second scanner: repository internals. Node equals file or folder, edge equals import/reference, status equals cited/orphaned/unknown, and findings surface in the child manifest.
3. After that, every new domain is just another scanner written to the three scannability questions. The engine is not touched again.

## Acceptance tests

- Engine loads `manifest.json` first at every scope.
- A node with `child_manifest` opens the child scope.
- A leaf opens only its evidence card.
- Breadcrumb/back returns to the parent scope without changing truth.
- Adding a new layer object or scope cartridge needs no engine code change.
- Every manifest exposes key-law status and unresolved findings.
- A child atlas that cannot surface its own findings does not open.
- Status colours reproduce when the documented query is re-run over that scope source.
- The scanner adds no node or edge absent from the authority's definition.
- Gaps render grey/unknown, never guessed.
- No public internal codename, no 3D primary view, no command triggers, no truth-authoring.

## Rule in one sentence

Once a system's authority has declared its definition law, drawing it is just a layer: build one blind engine that renders any conforming cartridge and follows a child pointer, then grow a library of scanners that each transcribe one authority's law without embellishment, prove their own key, and carry their own findings down every level of recursion.

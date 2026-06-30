# Startship placeholder for Jean Luc

Status: placeholder UI architecture. Hold for Claude deep study before implementation.

## Intent

Jean Luc is not a bracket, a game, a sport page, or a tournament. It is an ever expanding federation universe.

The old fluid card engine is only the layout inspiration:

```text
canvas
columns
cards
connectors
navigation
fullscreen focus
search
expandable detail
```

All names, teams, winners, rounds, finals, picks and football concepts are removed.

There is no final. There is only an expanding graph of repos, sources, services, data products and control plane objects.

## Core UI model

```text
universe -> federation
sector -> repo class or layer
node -> repo, source, service, report or evidence object
edge -> verified dependency or evidence link
card -> visible node summary
expansion -> open repo study panel
status -> query derived colour from verified Parquet
```

## Minimal placeholder shell

```html
<main class="jean-luc-shell">
  <header class="topbar">
    <p class="eyebrow">GlobalGrid2050 Federation Control Ledger</p>
    <h1>Jean Luc</h1>
    <div class="actions">
      <button id="searchButton">Search</button>
      <button id="focusButton">Fullscreen</button>
    </div>
  </header>

  <nav class="universe-nav" aria-label="Federation navigation">
    <button data-sector="control-plane">Control Plane</button>
    <button data-sector="data-products">Data Products</button>
    <button data-sector="apps-ui">Apps and UI</button>
    <button data-sector="source-archives">Source Archives</button>
    <button data-sector="external-services">External Services</button>
    <button data-sector="unknown-grey">Unknown Grey</button>
  </nav>

  <section class="scoreboard">
    <div><span>Repos observed</span><strong id="repoCount">0</strong></div>
    <div><span>Edges verified</span><strong id="edgeCount">0</strong></div>
    <div><span>Open questions</span><strong id="unknownCount">0</strong></div>
  </section>

  <section class="universe-wrap" aria-label="Jean Luc federation universe">
    <svg id="edgeLayer" class="connector-layer"></svg>
    <div id="nodeUniverse" class="node-universe"></div>
  </section>

  <aside id="studyPanel" class="study-panel" hidden>
    <h2 id="studyTitle">Repo study</h2>
    <div id="studyBody"></div>
  </aside>
</main>
```

## Placeholder data contract

```json
{
  "generatedUTC": "pending",
  "harvestRunId": "pending",
  "nodes": [],
  "edges": [],
  "statusSummary": {
    "green": 0,
    "amber": 0,
    "red": 0,
    "grey": 0,
    "blue": 0
  }
}
```

## Expansion rule

Every repo card can expand into a study panel.

The panel must show:

```text
repoId
repoLid
headRevSwhid
status reason
canonical files
missing evidence
incoming edges
outgoing edges
latest events
links to reports
```

## Addressing rule

Do not give repos literal IP addresses.

Give each repo a stable federation address:

```text
repoId        = owner/name
repoLid       = logical federation identifier
repoAddress   = gg2050://repo/{repoLid}
nodeAddress   = gg2050://node/{harvestRunId}/{repoId}
headRevSwhid  = content derived identity for the observed head revision
```

This gives the dashboard IP like routing without pretending GitHub repos are network hosts.

## Database implication

Jean Luc needs stable addresses because search, edges, drill down and future replication need deterministic keys.

Use these as columns later:

```text
harvestRunId
repoId
repoLid
repoAddress
nodeAddress
headRevSwhid
snapshotSwhid
statusColour
statusReason
```

## Hold point

No implementation beyond placeholder until Claude deep study returns.

One true drop before ocean scale claims.

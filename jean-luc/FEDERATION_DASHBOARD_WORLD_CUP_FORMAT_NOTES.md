# Federation Dashboard Format Notes from World Cup Knockout

Status: design meditation, pending first landed federation-map Parquet and independent audit.
Owner and approver: Vikram Kumar, Ventus Ltd.
Source inspiration: `Ventusltd/youengineer-code-review/world-cup-knockout/`.

## 1. What is strong about the format

The World Cup knockout page is powerful because it is visually simple but structurally rich.

It has a top bar, action buttons, a horizontal navigation strip, a compact scoreboard, a scrollable bracket canvas, SVG connector lines, and small cards laid out by deterministic geometry. The page is static HTML, CSS and JavaScript, with no backend dependency. It feels like a command surface rather than a report.

For the federation dashboard, this is the right emotional format: not a spreadsheet, not a heavy admin panel, not a public marketing page, but an internal control-room map.

## 2. Direct mapping into the federation ledger

The tournament bracket becomes the federation control graph.

```text
rounds             -> federation layers
teams              -> repositories or external sources
match cards        -> repo cards
connector lines    -> dependency edges
champion summary   -> federation health headline
selection count    -> observed repos / known repos / unknown repos
fullscreen mode    -> control-room mode
team tools         -> GitHub, report, dependency, changelog, latest status links
```

The federation must not use the football predictor's editable local-state idea as truth. The dashboard can use local focus state and UI preferences, but all authoritative data comes from pre-rendered JSON produced from verified Parquet.

## 3. Proposed dashboard layout

Top bar:

```text
GlobalGrid2050 Federation Control Ledger
Generated UTC
Harvest run ID
Method version
```

Action buttons:

```text
Reset view
Fullscreen
Open latest report
Open GitHub repo
```

Navigation strip:

```text
Control Plane
Data Repos
Apps and UI
Source Archives
External Services
Unknown / Grey
```

Scoreboard:

```text
Repos observed
Edges verified
Red / Amber / Grey / Blue / Green counts
Last successful run
```

Main canvas:

```text
query-derived cards arranged in columns
SVG edge lines between cards
scrollable horizontally and vertically
safe on mobile
focus mode for projector / meeting use
```

## 4. Repo card contract

Each card should represent one node from the ledger.

Minimum card fields:

```text
repo name
repo type
status colour
last pushed or observed timestamp
canonical files present
latest event severity
edge count in / edge count out
```

Each card should expose links:

```text
GitHub
latest report evidence
dependency evidence
manifest or README evidence
```

No card colour is hand-authored. The status colour is always query-derived from the Parquet according to the status colour law.

## 5. Visual law

The World Cup page uses CSS variables for a disciplined visual system: background, panel, line, text, muted text, accent, danger, card width, card height, round gap and column gap.

The federation dashboard should keep the same principle and change the vocabulary:

```text
--status-green
--status-amber
--status-red
--status-grey
--status-blue
--panel
--line
--text
--muted
--card-w
--card-h
--col-gap
```

The current dark, compact, scrollable canvas suits the federation map. It makes dense structure feel navigable rather than overwhelming.

## 6. Data flow

The renderer should be static and downstream-only.

```text
DuckDB reads verified Parquet
DuckDB emits pre-rendered JSON
static JS reads JSON
static JS lays out cards and SVG connector paths
HTML displays the control surface
```

The browser must not infer truth. It may lay out, filter and drill down. It may not decide status.

## 7. Geometry idea

The World Cup page computes card positions from deterministic columns and gaps. The federation dashboard can do the same.

Possible columns:

```text
control-plane
source-archive
data-product
application-ui
external-service
unknown
```

Within each column, sort by:

```text
worst status first
repo type
repo name
```

Edges then draw as SVG paths between card centres. This preserves the readable bracket feeling while becoming a true dependency map.

## 8. Drill-down idea

Clicking a repo card should open a side panel or expanded card with:

```text
node key
repoId
repoLid
headRevSwhid
status reason query
canonical files found
missing evidence
incoming edges
outgoing edges
latest status events
rollback / audit notes if relevant
```

This is the difference between a pretty graph and a ledger dashboard: every visual object must explain its evidence.

## 9. What not to copy

Do not copy the predictor logic where users select winners. The federation dashboard is not a manual selection game.

Do not store authoritative state in localStorage.

Do not hand-colour cards.

Do not hide grey unknown repos.

Do not build a backend.

Do not start dashboard implementation before the first Parquet outputs are landed and independently verified.

## 10. Why this format fits

The format fits because it turns a large system into a navigable field of small verified objects.

Each repo is a card.
Each card is a drop.
Each edge is evidence.
Each colour is a query.
Each drill-down is an audit trail.

The federation dashboard should feel like the World Cup knockout page translated from prediction into proof: same clarity, same scrollable command-surface feel, but every visible state derived from verified ledger data.

One true drop before ocean-scale claims.

# Jean Luc Federation Dashboard

Status: federation dashboard concept, pending first landed federation-map Parquet and independent audit.
Owner and approver: Vikram Kumar, Ventus Ltd.

Jean Luc is the internal GlobalGrid2050 Federation Dashboard.

It is not a sports page, not a prediction tool, not a generic visual experiment, and not a public homepage. It is the control-room view of the permanent federation ledger.

## Purpose

Jean Luc renders the federation ledger as a static, navigable dashboard:

```text
verified Parquet -> DuckDB queries -> pre-rendered JSON -> static HTML, CSS and JS
```

The browser may lay out, filter, focus, scroll, and drill down. It must not invent truth.

## Dashboard shape

```text
top bar
action buttons
horizontal navigation strip
compact health scoreboard
scrollable repo-card canvas
SVG dependency connectors
fullscreen focus mode
repo evidence drill-down
```

## Federation mapping

```text
federation layers -> dashboard columns
repositories -> cards
external services -> cards
repo dependencies -> SVG connector paths
status events -> card state and drill-down evidence
latest report -> dashboard evidence link
status colour -> query result, never manual judgement
```

## Name

The dashboard is called Jean Luc.

The folder is `jean-luc`.

The product name is `Jean Luc Federation Dashboard`.

One true drop before ocean-scale claims.

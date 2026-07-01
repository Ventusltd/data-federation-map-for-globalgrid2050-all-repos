# The Spider

Commit location: `every-drop-is-the-ocean/the-spider/README.md`

Status: canonical home for the reusable GlobalGrid2050 scanning-and-mapping engine.

## Purpose

The Spider is the canonical home of the reusable uniform-layout plus optional-spider-view engine.

The engine is greater than any single app. The GlobalGrid2050 federation dashboard is its first instance, not its limit.

Any future process that reuses The Spider inherits the behaviour defined here unless a later approved requirement changes this file.

## Defining behaviour

The default view is always the uniform column.

The uniform column is a centred tablet-format layout that works at phone, tablet, laptop and large desktop sizes. Screen width must never force the spider view. The column must stay readable, centred, and free of horizontal overflow.

The spider view is optional only. It is reached through an explicit spider-glyph control. The user chooses to enter the web and can return to the column.

When the spider view has more nodes than fit comfortably, cards do not shrink and do not crowd. The canvas grows. Cards are blown out into space with generous gaps, and the user scrolls or pans across the map.

The Spider is therefore not a cram-everything-into-one-screen diagram. It is a scanner-and-map engine that lets the user glide through scoped relationships.

## First instance

The first instance is the federation dependency viewer in this repository.

Its required two modes are:

1. Uniform column default.
2. Optional spider view.

The live federation dashboard must not be replaced by a spider view by screen width alone.

## Reuse rule

A future app may reuse The Spider for another process only if it preserves these rules:

- default to the uniform column
- make the spider opt-in
- keep cards readable
- grow the canvas instead of crowding the diagram
- keep the source data read-only in the browser
- treat the UI as a viewer, not a truth-authoring system

One true drop before ocean-scale claims.

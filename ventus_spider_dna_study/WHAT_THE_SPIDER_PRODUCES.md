# Spider Sandbox Control-Room Viewport

see https://ventusltd.github.io/data-federation-map-for-globalgrid2050-all-repos/dashboard/federation_radial.html

## Status

This is the Spider Sandbox, the exploratory twin of the live Spider.

It is best described as a control-room viewport onto the GlobalGrid2050 federation.

## What The Spider Sandbox Is

The Spider Sandbox is a single self-contained HTML page.

One file carries its own styling and logic with no external libraries at all.

It lives in the dashboard area of the `data-federation-map-for-globalgrid2050-all-repos` repository and is served publicly through GitHub Pages at `ventusltd.github.io`.

It is currently served through `federation_radial.html`, which acts as the public Spider Sandbox while interface ideas are still being proven.

## What It Does

The Spider Sandbox renders the federation web one focus at a time.

A dropdown selects any node in the federation.

The current federation members span twelve repositories and four external services:

DuckDB

Parquet

GitHub Actions

Elexon BMRS

The page immediately shows the selected node's outgoing threads, meaning the things it depends on, and its incoming threads, meaning the things that depend on it.

A counter summarises both.

## Relationship Direction Controls

A segmented control filters the view to:

Both directions

Outgoing only

Incoming only

This lets the user move from a full relationship picture to a focused dependency or dependent view.

## Relationship Types And Colours

Each relationship is typed and colour-coded.

Cyan represents data.

Violet represents governance.

Slate represents archive.

Muted blue represents external.

Pale blue represents repo references.

Each card also carries a status lamp in RAG colours.

Green means healthy.

Amber means findings.

Red means contract findings.

Blue marks stable externals and archives.

Grey marks unclassified nodes.

This makes the board read like a supervisory panel rather than a decorative diagram.

## Tap Behaviour

The tap-does control changes what a touch means.

Explore re-centres the web on the tapped node.

GitHub opens the node's repository.

External opens the node's live system.

Status mode sits deliberately greyed out, waiting until the page reads live scanner data rather than a snapshot.

## Federation Repo Drill-Down

The federation repo's own card offers a Contents drill-down into a child scope of fourteen internal parts.

That child scope includes:

the dashboard page

the index file

the app file

the style file

the data cartridge

the manifest

nodes

edges

the reports folder

the doctrine folder

A breadcrumb trail lets the user climb back out.

## Column View

There are two ways of seeing.

The default column view stacks the focus card above tidy branched lists.

Each twig is coloured by its relationship type.

This view suits a phone because it keeps the web readable in a narrow screen.

## Spider View

The optional spider view is toggled by the spider button.

It throws the same truth onto a large draggable canvas.

The focus card sits at the centre.

Dependencies fan to the right.

Dependents fan to the left.

Each relationship is connected by an arrowed spoke in its relationship colour over a faint engineering grid.

A sticky legend and hint pill explain that cards keep their size while the canvas grows.

The screenshots show this clearly: the centred federation card with five spokes running out to DuckDB, Parquet, the homepage, GitHub Actions and Elexon, and the child scope doing the same in miniature.

## Truth And Snapshot Behaviour

The Spider Sandbox follows the doctrine precisely.

It renders committed state and invents nothing.

On load, it attempts to fetch the live nodes and edges JSON from the federation control ledger's data cartridge.

A small source tag in the header flips to live in cyan if that succeeds.

If it fails, the page falls back to a baked-in snapshot of the sixteen nodes and their edges and says so honestly in the tag.

That one detail is the whole philosophy in miniature.

The interface always declares whether the user is looking at live truth or a snapshot.

It never blends the two.

## Purpose

The purpose of the Spider Sandbox is trust at a glance.

It lets anyone stand at any point in the federation and see exactly what that point stands on and what stands on it.

It can show the relationship either as a calm column or as a full spun web.

The interface itself cannot lie about where the picture came from.

## Visual Register

Visually, the Spider Sandbox reads as a dark operations console.

It uses a near-black blue background with a faint cyan radial glow.

It uses thin grid lines.

It uses glassy cards with soft shadows.

It uses monospace uppercase micro-labels for controls.

It uses cyan as the accent of truth and focus.

The glowing status dots give it the feel of a quiet control room at night.

That is exactly the register the project aims for: a place where state is watched, not decorated.

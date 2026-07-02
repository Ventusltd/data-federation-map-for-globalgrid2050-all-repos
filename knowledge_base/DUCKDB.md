# DuckDB in the GlobalGrid2050 Federation

## Provenance

Provenance: declared documentation. Written 2 July 2026 against main HEAD `dbfd4452c50d01dbbc976e0a193a0cdd94d260f5`. Status: knowledge-base reference, closes no purchase order, applies no data, alters no code, workflow, UI, Parquet or ledger. Author seat: auditor. This file is documentation only; if committed it carries this stamp and is stamped again by the documentation-hygiene pass like any other doc.

## What DuckDB Is

DuckDB is a small, fast analytical database that runs inside a program rather than as a separate server you have to install, start and connect to. The closest familiar comparison is SQLite: both are embedded, both are a single dependency with no background service, and both let you run ordinary SQL. The difference is what each is tuned for. SQLite is built for transactional, row-by-row work, the kind of thing an application does when it saves one record at a time. DuckDB is built for analytics, reading whole columns in bulk and answering aggregate questions over large tables very quickly. For a project whose core artifact is a map of nodes and edges that we constantly count, filter and cross-check, that analytical bias is exactly what is needed, and it runs comfortably on a laptop with no infrastructure behind it.

## Direct Parquet Reading

The single most important thing DuckDB does for us is read Parquet files directly. Parquet is a compact, columnar file format for tabular data, and our federation map is stored as committed Parquet: `nodes.parquet` and `edges.parquet` under `data/federation_map/current`, with snapshots alongside. DuckDB can point plain SQL straight at those files as they sit in the repository, with no import step, no loading into a database, and no separate copy that could fall out of step with the files. You open a query, name the Parquet file, and ask your question. That property is quiet but decisive, because it means the files in the commit are the data, and DuckDB is simply the lens we read them through.

## Building and Checking

In day-to-day terms DuckDB shows up in two opposite roles, building and checking, and the same engine serves both. On the building side, the PO 1 work uses DuckDB to slice the base set of declared edges into one Parquet cartridge per repository. The build script runs a SQL `COPY` that filters the base edges for each repo node and writes a small `edges.parquet` plus a manifest into a declared-only partition, then writes a paired report. It even builds the whole set twice into two temporary directories and compares the file hashes to prove the output is deterministic, meaning the same input always yields byte-identical files.

On the checking side, DuckDB is how every acceptance check is recomputed. When a purchase order is received, the auditor clones the exact commit fresh and runs DuckDB against the raw committed Parquet to reproduce the numbers independently: that the map holds sixteen nodes, twelve repositories and four external services, and three hundred and three edges; that every edge is stamped provenance declared with none derived, none null and none invalid; that there are no dangling endpoints, no self-edges and no duplicate identifiers; and that the base store is untouched. None of those figures are taken on trust from whoever built the work. They are recomputed from the files.

## Audit Discipline

This is where DuckDB connects directly to the discipline that governs the whole federation. The rule is that the executor never grades its own bar, and that a piece of work is only done once an independent auditor reproduces the checks from a fresh clone of the exact commit. DuckDB is what makes that reproduction cheap, fast and honest. Because it reads the committed Parquet with nothing in between, there is no server that could hold a stale copy, no export or import where a number might silently change, and no hidden state carried over from a previous run. Two people, on two machines, cloning the same commit and running the same SQL, get the same answer or the work does not pass. That is the mechanical core of what lets a stranger trust the map without having to trust us personally.

## Declared Facts and Derived Inferences

DuckDB also underpins the project's central distinction between declared facts and derived inferences. A declared edge is one a source openly states; a derived one would be inferred by parsing or calculation. Because both live in the same Parquet with a provenance column, DuckDB can enforce and report the separation with a single query, counting how many rows are declared versus derived and confirming, in the current base, that everything is declared and nothing derived has crept in. Keeping that line visible and queryable is the difference between something you could hand a lender and something only a chartered engineer should sign, and DuckDB is the instrument that keeps it measurable rather than merely asserted.

## Reflexive Dependency

There is a neat reflexive detail worth recording. DuckDB is not only the tool we use on the map; it is itself one of the four external services catalogued as nodes within the map, alongside Parquet, the Elexon balancing data feed and GitHub Actions. In other words the federation openly declares its own dependency on DuckDB as part of the structure it describes, which is consistent with the project's habit of being honest about itself and not just about the world it models.

## Operational Constraint

It is also useful to understand DuckDB's limits, because they explain a real operational constraint. DuckDB has to run somewhere: a laptop, a server, or a hosted development environment such as a Codespace. It cannot be executed through a plain file editor on a hosting site. That is precisely why generating fresh binary Parquet, such as regenerating the per-repo cartridges directly on the main branch, has to be done in a genuine environment where DuckDB can run, and then committed, rather than typed in through a web page. Reading and editing text is one thing; producing new binary data is another, and it needs the engine actually running.

## Portability and Future Direction

Looking further out, the choice of DuckDB and Parquet keeps the project portable and standards-friendly. The same files can be read by common data tools and analytical libraries, which matters as the work grows toward standard grid vocabularies and toward the open power-systems engines used for real load-flow and fault calculation. Nothing here is locked inside a proprietary database. The data stays as open files, DuckDB stays as a light, swappable lens over them, and the federation remains something anyone can clone, open and verify for themselves.

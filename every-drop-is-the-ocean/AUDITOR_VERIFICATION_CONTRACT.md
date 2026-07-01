# Auditor Clean-Clone Verification Contract

Commit location: `every-drop-is-the-ocean/AUDITOR_VERIFICATION_CONTRACT.md`

Status: reusable verification contract for independent audit. This document gates PO 0 apply and every later data-producing apply. It does not change scanner or data behaviour.

## 1. Purpose

An auditor proves a change by re-deriving the result from a fresh clone with independently-written checks. The executor's own PASS report is never accepted as proof.

A green CI run is not proof. A committed report is not proof. The proof is the declared check on the real key, independently reproduced from a clean clone against the committed artefacts.

## 2. Preconditions the auditor records before checking

Before running any check, the auditor records:

```text
repository:
commit SHA under audit:
branch or PR under audit:
clone directory:
clone was created into an empty directory: yes/no
auditor tool versions:
```

The commit SHA must be the exact SHA being audited from the tip of the branch, pull request, or landed apply commit.

The audit must run on a clean clone into an empty directory. The auditor must not reuse the executor's workspace, generated files, cached artefacts, or shell history as evidence.

The auditor records their own tool versions, for example DuckDB, Python, Git, or any SQL runner used, so a third party can reproduce the check.

## 3. Universal procedure for every PO

1. Clone fresh.

```bash
git clone https://github.com/Ventusltd/data-federation-map-for-globalgrid2050-all-repos.git audit-clone
cd audit-clone
git checkout <COMMIT_SHA_UNDER_AUDIT>
```

2. Do not run the executor's scripts to prove the result.

The auditor writes and runs their own query or check against the committed artefacts in the repository. The auditor does not rely on the executor's code, generated report, GitHub Actions colour, or local workspace.

3. Run the declared check on the real key.

The current federation root keys are:

```text
nodes: scanId + nodeId
edges: scanId + fromNode + toNode + edgeType + evidencePath
```

Where a PO declares a different child-scope key, the auditor records and checks that declared key directly.

4. Record numbers, not just words.

Each audit record states:

```text
check name:
committed artefact checked:
key checked:
actual result:
expected result:
match: yes/no
```

5. Confirm the committed artefact is the artefact checked.

The check must run against what is committed at the audited SHA. It must not run against a workspace-only regenerated copy, an Actions artifact, or an executor-provided file outside the clean clone. This is the committed-truth-store guard introduced for PO 0.

6. Confirm reproducibility.

The auditor states that any third party running the same steps on the same SHA should get the same numeric results. If a check depends on network state, credentials, mutable APIs, or local cache, it is not accepted as proof of the committed artefact.

7. Give a verdict.

PASS is allowed only if every declared check reproduces from the clean clone. Any check that cannot be reproduced independently is a FAIL, regardless of CI colour, workflow success, or the executor's own report.

## 4. Declared-check library

This library is extended as POs land. Each entry states the check name, key, method, and passing result.

### 4.1 `edge_endpoints_resolve` — PO 0

Purpose: every edge `fromNode` and `toNode` resolves to a committed node.

Key tested:

```text
edges: scanId + fromNode + toNode + edgeType + evidencePath
nodes: scanId + nodeId
```

Method:

```sql
SELECT count(*)
FROM read_parquet('data/federation_map/current/edges.parquet') e
WHERE e.fromNode NOT IN (SELECT nodeId FROM read_parquet('data/federation_map/current/nodes.parquet'))
   OR e.toNode   NOT IN (SELECT nodeId FROM read_parquet('data/federation_map/current/nodes.parquet'));
```

Passing result:

```text
0
```

### 4.2 `committed_store_is_verified` — PO 0

Purpose: the committed Parquet is the artefact that passed the scanner's own endpoint check in the same run; there is no stale-store gap.

Method:

Run `edge_endpoints_resolve` against the committed store on the audited SHA. It must return `0`.

Passing result:

```text
0
```

### 4.3 `provenance_field_present_and_valid` — PO 2a

Purpose: every base federation edge row has an additive provenance discriminator, and the base edge Parquet contains declared rows only.

Key tested:

```text
edges: scanId + fromNode + toNode + edgeType + evidencePath
provenance enum: declared | derived
base-layer rule: zero derived rows in base edge Parquet
```

Column present method:

```sql
SELECT count(*) FROM (
  DESCRIBE SELECT * FROM read_parquet('data/federation_map/current/edges.parquet')
) WHERE column_name = 'provenance';
```

Passing result:

```text
1
```

Null or blank provenance method:

```sql
SELECT count(*) FROM read_parquet('data/federation_map/current/edges.parquet')
WHERE provenance IS NULL OR trim(CAST(provenance AS VARCHAR)) = '';
```

Passing result:

```text
0
```

Invalid enum method:

```sql
SELECT count(*) FROM read_parquet('data/federation_map/current/edges.parquet')
WHERE provenance NOT IN ('declared', 'derived');
```

Passing result:

```text
0
```

Derived rows in base method:

```sql
SELECT count(*) FROM read_parquet('data/federation_map/current/edges.parquet')
WHERE provenance = 'derived';
```

Passing result:

```text
0
```

All base rows declared method:

```sql
SELECT count(*) FROM read_parquet('data/federation_map/current/edges.parquet')
WHERE provenance = 'declared';
```

Passing result:

```text
same as total edge row count
```

The auditor also runs `edge_endpoints_resolve` as the PO 0 regression guard. Its passing result remains `0`.

### 4.4 `declared_repo_cartridges_present_and_exact` — PO 1

Purpose: the declared base edge store is partitioned into one edge-only cartridge per eligible repository node without creating, dropping, inferring, or rewriting truth.

Key tested:

```text
eligible repo node: nodeKind = github_repo and archived = false
cartridge path: data/federation_map/cartridges/provenance=declared/repo=<owner>__<repo>/edges.parquet
edge key: edgeId, preserving the base declared edge row
manifest key: exact nodeId plus parentScope
```

Union completeness method:

```sql
SELECT count(*) AS total, count(DISTINCT edgeId) AS distinct_ids
FROM 'data/federation_map/cartridges/provenance=declared/repo=*/edges.parquet';
```

Passing result for the PO 1 base:

```text
total = 303
distinct_ids = 303
```

Exact set equality versus base method:

```sql
WITH cart AS (
  SELECT edgeId
  FROM 'data/federation_map/cartridges/provenance=declared/repo=*/edges.parquet'
),
base AS (
  SELECT edgeId
  FROM read_parquet('data/federation_map/current/edges.parquet')
  WHERE provenance = 'declared'
)
SELECT
  (SELECT count(*) FROM cart WHERE edgeId NOT IN (SELECT edgeId FROM base)) AS extra,
  (SELECT count(*) FROM base WHERE edgeId NOT IN (SELECT edgeId FROM cart)) AS missing;
```

Passing result:

```text
extra = 0
missing = 0
```

Endpoint resolution method:

```sql
SELECT count(*)
FROM 'data/federation_map/cartridges/provenance=declared/repo=*/edges.parquet' e
WHERE e.toNode NOT IN (SELECT nodeId FROM read_parquet('data/federation_map/current/nodes.parquet'));
```

Passing result:

```text
0
```

Declared-only method:

```sql
SELECT count(*)
FROM 'data/federation_map/cartridges/provenance=declared/repo=*/edges.parquet'
WHERE provenance <> 'declared' OR provenance IS NULL;
```

Passing result:

```text
0
```

Zero derived rows method:

```sql
SELECT count(*)
FROM 'data/federation_map/cartridges/provenance=declared/repo=*/edges.parquet'
WHERE provenance = 'derived';
```

Passing result:

```text
0
```

Cartridge count method:

```sql
SELECT count(DISTINCT regexp_extract(filename, 'repo=([^/]+)', 1))
FROM read_parquet('data/federation_map/cartridges/provenance=declared/repo=*/edges.parquet', filename = true);
```

Passing result for the PO 1 base:

```text
12
```

The auditor also checks that the five known zero-edge repositories have directories, schema-valid zero-row `edges.parquet` files, and manifests with `edgeCount` equal to `0`:

```text
Ventusltd/Podcast-transcripts
Ventusltd/Solar-PV-Hybrid-and-off-grid
Ventusltd/pv-arc-protection-circuit
Ventusltd/solar-repowering-whitepaper
Ventusltd/youengineer-code-review
```

The auditor also checks `base_store_unchanged` by recording the md5 of `data/federation_map/current/nodes.parquet` and `data/federation_map/current/edges.parquet` before and after the cartridge apply. Both must match, and `edge_endpoints_resolve` must still return `0`.

### 4.5 Reserved checks to be filled as POs land

```text
node_key_unique
no_null_keys
base_has_no_derived_edges
derived_overlay_separate
every_derived_edge_has_provenance_and_evidence
```

Expected future scope:

```text
node_key_unique and no_null_keys: root and child cartridges
base_has_no_derived_edges and derived_overlay_separate: PO 2b and PO 3
every_derived_edge_has_provenance_and_evidence: PO 6 and PO 3
```

## 5. Worked first instance — auditing PO 0

On the PO 0 apply SHA, an independent auditor clones fresh and runs `edge_endpoints_resolve` against the committed store.

The audit passes only if the query returns:

```text
0
```

Expected movement for PO 0:

```text
before: 2 dangling endpoints
 after: 0 dangling endpoints
```

If the query returns a non-zero value, PO 0 has not landed cleanly. It fails regardless of a green workflow run or a passing executor report.

## 6. Separation-of-duties note

The executor writes and self-audits. A different party re-runs this contract from a clean clone. The human holds the apply trigger and applies only if independent reproduction passes.

The auditor does not use the executor's scripts to prove the executor's work. The auditor may inspect those scripts for context, but proof comes only from independently-written checks against committed artefacts.

## 7. Audit record template

```text
AUDITOR VERIFICATION RECORD

repository:
commit SHA under audit:
branch or PR under audit:
clone directory:
clone created into empty directory: yes/no
auditor:
auditor tool versions:

checks:
- name:
  committed artefact:
  key:
  method:
  expected:
  actual:
  match: yes/no

verdict: PASS/FAIL
reason:
reproducibility statement:
```

One true drop before ocean-scale claims.

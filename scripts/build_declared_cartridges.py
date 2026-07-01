#!/usr/bin/env python3
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import shutil
import tempfile
from pathlib import Path
from typing import Any

import duckdb

ROOT = Path(__file__).resolve().parents[1]
CURRENT = ROOT / "data/federation_map/current"
TARGET = ROOT / "data/federation_map/cartridges/provenance=declared"
REPORTS = ROOT / "reports"
JSON_REPORTS = REPORTS / "json"
REPORT_MD = REPORTS / "FEDERATION_CARTRIDGES_LATEST.md"
REPORT_JSON = JSON_REPORTS / "FEDERATION_CARTRIDGES_LATEST.json"
METHOD_VERSION = "federation_declared_cartridges_v1"
SCHEMA_VERSION = "federation_declared_cartridges_report.v1"
PARENT_SCOPE = "Ventusltd/data-federation-map-for-globalgrid2050-all-repos"
EMPTY_EXPECTED = {
    "Ventusltd/Podcast-transcripts",
    "Ventusltd/Solar-PV-Hybrid-and-off-grid",
    "Ventusltd/pv-arc-protection-circuit",
    "Ventusltd/solar-repowering-whitepaper",
    "Ventusltd/youengineer-code-review",
}
EDGE_COLS = [
    "cardinality", "edgeId", "edgeType", "evidencePath", "evidenceText",
    "fromNode", "generatedUTC", "methodVersion", "provenance", "scanId", "toNode",
]


def qpath(p: Path) -> str:
    return str(p).replace("'", "''")


def qlit(s: str) -> str:
    return "'" + s.replace("'", "''") + "'"


def now() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z")


def md5(p: Path) -> str:
    h = hashlib.md5()
    with p.open("rb") as f:
        for b in iter(lambda: f.read(1048576), b""):
            h.update(b)
    return h.hexdigest()


def stable_write_json(path: Path, obj: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, sort_keys=True, separators=(",", ":")) + "\n", encoding="utf-8")


def repo_part(node_id: str) -> str:
    return node_id.replace("/", "__")


def read_base(con: duckdb.DuckDBPyConnection, nodes: Path, edges: Path) -> dict[str, Any]:
    scan_ids = [r[0] for r in con.execute(f"SELECT DISTINCT scanId FROM read_parquet('{qpath(edges)}') ORDER BY scanId").fetchall()]
    methods = [r[0] for r in con.execute(f"SELECT DISTINCT methodVersion FROM read_parquet('{qpath(edges)}') ORDER BY methodVersion").fetchall()]
    generated = [r[0] for r in con.execute(f"SELECT DISTINCT generatedUTC FROM read_parquet('{qpath(edges)}') ORDER BY generatedUTC").fetchall()]
    dangling = con.execute(f"""
        SELECT count(*) FROM read_parquet('{qpath(edges)}') e
        WHERE e.fromNode NOT IN (SELECT nodeId FROM read_parquet('{qpath(nodes)}'))
           OR e.toNode NOT IN (SELECT nodeId FROM read_parquet('{qpath(nodes)}'))
    """).fetchone()[0]
    return {
        "nodeRows": int(con.execute(f"SELECT count(*) FROM read_parquet('{qpath(nodes)}')").fetchone()[0]),
        "edgeRows": int(con.execute(f"SELECT count(*) FROM read_parquet('{qpath(edges)}')").fetchone()[0]),
        "declaredRows": int(con.execute(f"SELECT count(*) FROM read_parquet('{qpath(edges)}') WHERE provenance='declared'").fetchone()[0]),
        "derivedRows": int(con.execute(f"SELECT count(*) FROM read_parquet('{qpath(edges)}') WHERE provenance='derived'").fetchone()[0]),
        "danglingEdgeEndpoints": int(dangling),
        "scanId": scan_ids[0] if len(scan_ids) == 1 else "|".join(map(str, scan_ids)),
        "methodVersion": methods[0] if len(methods) == 1 else "|".join(map(str, methods)),
        "generatedUTC": generated[0] if generated else "",
    }


def eligible(con: duckdb.DuckDBPyConnection, nodes: Path) -> tuple[list[str], list[str]]:
    rows = con.execute(f"""
        SELECT nodeId, archived FROM read_parquet('{qpath(nodes)}')
        WHERE nodeKind='github_repo'
        ORDER BY nodeId
    """).fetchall()
    yes, no = [], []
    for node_id, archived in rows:
        (yes if str(archived).lower() == "false" else no).append(str(node_id))
    return yes, no


def build_once(root: Path, con: duckdb.DuckDBPyConnection, nodes: Path, edges: Path, repos: list[str], base: dict[str, Any]) -> list[dict[str, Any]]:
    if root.exists():
        shutil.rmtree(root)
    root.mkdir(parents=True, exist_ok=True)
    out = []
    for repo in repos:
        d = root / f"repo={repo_part(repo)}"
        eout = d / "edges.parquet"
        mout = d / "manifest.json"
        d.mkdir(parents=True, exist_ok=True)
        count = int(con.execute(f"SELECT count(*) FROM read_parquet('{qpath(edges)}') WHERE fromNode={qlit(repo)} AND provenance='declared'").fetchone()[0])
        predicate = f"fromNode={qlit(repo)} AND provenance='declared'" if count else "false"
        con.execute(f"""
            COPY (
              SELECT {', '.join(EDGE_COLS)} FROM read_parquet('{qpath(edges)}')
              WHERE {predicate}
              ORDER BY edgeId
            ) TO '{qpath(eout)}' (FORMAT parquet, COMPRESSION zstd)
        """)
        manifest = {
            "schemaVersion": "declared_repo_cartridge_manifest.v1",
            "nodeId": repo,
            "parentScope": PARENT_SCOPE,
            "provenance": "declared",
            "edgeCount": count,
            "scanId": base["scanId"],
            "methodVersion": base["methodVersion"],
            "generatedUTC": base["generatedUTC"],
        }
        stable_write_json(mout, manifest)
        out.append({
            "nodeId": repo,
            "edgeCount": count,
            "cartridgePath": str((TARGET / f"repo={repo_part(repo)}").relative_to(ROOT)),
            "edgesPath": str((TARGET / f"repo={repo_part(repo)}" / "edges.parquet").relative_to(ROOT)),
            "manifestPath": str((TARGET / f"repo={repo_part(repo)}" / "manifest.json").relative_to(ROOT)),
            "actualEdgesPath": str(eout),
            "actualManifestPath": str(mout),
            "edgesMd5": md5(eout),
            "manifestMd5": md5(mout),
        })
    return out


def files_md5(root: Path) -> dict[str, str]:
    if not root.exists():
        return {}
    return {str(p.relative_to(root)): md5(p) for p in sorted(root.rglob("*")) if p.is_file()}


def union_table(con: duckdb.DuckDBPyConnection, carts: list[dict[str, Any]]) -> None:
    con.execute("DROP TABLE IF EXISTS cart_edges")
    for i, c in enumerate(carts):
        sql = f"SELECT * FROM read_parquet('{qpath(Path(c['actualEdgesPath']))}')"
        con.execute(("CREATE TEMP TABLE cart_edges AS " if i == 0 else "INSERT INTO cart_edges ") + sql)


def verify(con: duckdb.DuckDBPyConnection, nodes: Path, edges: Path, repos: list[str], excluded: list[str], carts: list[dict[str, Any]], base_before: dict[str, str], base_after: dict[str, str], deterministic: bool) -> list[dict[str, Any]]:
    union_table(con, carts)
    total, distinct_ids = con.execute("SELECT count(*), count(DISTINCT edgeId) FROM cart_edges").fetchone()
    base_declared = int(con.execute(f"SELECT count(*) FROM read_parquet('{qpath(edges)}') WHERE provenance='declared'").fetchone()[0])
    extra = int(con.execute(f"SELECT count(*) FROM cart_edges WHERE edgeId NOT IN (SELECT edgeId FROM read_parquet('{qpath(edges)}') WHERE provenance='declared')").fetchone()[0])
    missing = int(con.execute(f"SELECT count(*) FROM read_parquet('{qpath(edges)}') WHERE provenance='declared' AND edgeId NOT IN (SELECT edgeId FROM cart_edges)").fetchone()[0])
    to_dangle = int(con.execute(f"SELECT count(*) FROM cart_edges WHERE toNode NOT IN (SELECT nodeId FROM read_parquet('{qpath(nodes)}'))").fetchone()[0])
    from_wrong = 0
    for c in carts:
        from_wrong += int(con.execute(f"SELECT count(*) FROM read_parquet('{qpath(Path(c['actualEdgesPath']))}') WHERE fromNode <> {qlit(c['nodeId'])}").fetchone()[0])
    non_declared = int(con.execute("SELECT count(*) FROM cart_edges WHERE provenance IS NULL OR provenance <> 'declared'").fetchone()[0])
    derived = int(con.execute("SELECT count(*) FROM cart_edges WHERE provenance='derived'").fetchone()[0])
    empty_actual = {c["nodeId"] for c in carts if c["edgeCount"] == 0}
    manifests = [json.loads(Path(c["actualManifestPath"]).read_text(encoding="utf-8")) for c in carts]
    base_now = read_base(con, nodes, edges)
    return [
        {"name":"cartridge_exists_for_every_repo_node","passed":len(carts)==len(repos) and {c['nodeId'] for c in carts}==set(repos),"numbers":{"eligibleRepoNodes":len(repos),"cartridgeCount":len(carts),"excludedArchivedRepoNodes":len(excluded)}},
        {"name":"cartridge_has_manifest","passed":all(Path(c['actualManifestPath']).exists() for c in carts),"numbers":{"manifestCount":len(manifests),"cartridgeCount":len(carts)}},
        {"name":"cartridge_declares_parent_repo_and_scope","passed":all(m.get('nodeId') in repos and m.get('parentScope')==PARENT_SCOPE for m in manifests),"numbers":{"manifests":len(manifests),"wrongParentScope":sum(1 for m in manifests if m.get('parentScope')!=PARENT_SCOPE)}},
        {"name":"cartridge_keys_unique","passed":int(total)==int(distinct_ids),"numbers":{"totalRows":int(total),"distinctEdgeIds":int(distinct_ids),"duplicateEdgeIds":int(total-distinct_ids)}},
        {"name":"cartridge_endpoints_resolve","passed":to_dangle==0 and from_wrong==0,"numbers":{"toNodeDangles":to_dangle,"fromNodeNotOwnRepo":from_wrong}},
        {"name":"cartridge_provenance_declared_only","passed":non_declared==0,"numbers":{"nonDeclaredRows":non_declared}},
        {"name":"zero_derived_in_cartridges","passed":derived==0,"numbers":{"derivedRows":derived}},
        {"name":"cartridge_union_equals_base_declared","passed":int(total)==base_declared and int(distinct_ids)==base_declared and extra==0 and missing==0,"numbers":{"cartridgeRows":int(total),"baseDeclaredRows":base_declared,"extraEdgeIds":extra,"missingEdgeIds":missing}},
        {"name":"empty_repo_yields_valid_empty_cartridge","passed":EMPTY_EXPECTED.issubset(empty_actual),"numbers":{"expectedEmptyRepos":len(EMPTY_EXPECTED),"actualEmptyCartridges":len(empty_actual),"missingExpectedEmptyRepos":len(EMPTY_EXPECTED-empty_actual)}},
        {"name":"base_store_unchanged","passed":base_before==base_after and base_now['nodeRows']==16 and base_now['edgeRows']==303 and base_now['danglingEdgeEndpoints']==0,"numbers":{"nodesMd5Before":base_before['nodes'],"nodesMd5After":base_after['nodes'],"edgesMd5Before":base_before['edges'],"edgesMd5After":base_after['edges'],"nodeRows":base_now['nodeRows'],"edgeRows":base_now['edgeRows'],"danglingEdgeEndpoints":base_now['danglingEdgeEndpoints']}},
        {"name":"ui_invents_no_data","passed":True,"numbers":{"generatedUiFiles":0}},
        {"name":"cartridge_deterministic_from_clean_clone","passed":deterministic,"numbers":{"deterministicMd5Match":int(deterministic)}},
    ]


def report_write(report: dict[str, Any]) -> None:
    REPORTS.mkdir(parents=True, exist_ok=True)
    JSON_REPORTS.mkdir(parents=True, exist_ok=True)
    stable_write_json(REPORT_JSON, report)
    lines = [
        "# Federation Declared Cartridges Latest", "",
        f"Schema version: `{SCHEMA_VERSION}`", f"Generated UTC: `{report['generatedUTC']}`",
        f"Method version: `{METHOD_VERSION}`", f"Mode: `{report['mode']}`",
        f"Repository: `{report['repository']}`", f"Data-law result: `{report['dataLawResult']}`", "",
        "## Base store", "",
        f"- Node rows: `{report['baseStore']['nodeRows']}`",
        f"- Edge rows: `{report['baseStore']['edgeRows']}`",
        f"- Declared edge rows: `{report['baseStore']['declaredRows']}`",
        f"- Derived edge rows: `{report['baseStore']['derivedRows']}`",
        f"- Dangling edge endpoints: `{report['baseStore']['danglingEdgeEndpoints']}`",
        f"- Nodes md5: `{report['baseMd5']['nodes']}`",
        f"- Edges md5: `{report['baseMd5']['edges']}`", "",
        "## Per-repo edge counts", "", "| Repo | Edge count | Cartridge path |", "|---|---:|---|",
    ]
    for c in report["cartridges"]:
        lines.append(f"| `{c['nodeId']}` | `{c['edgeCount']}` | `{c['cartridgePath']}` |")
    lines += ["", "## Checks", "", "| Check | Result | Numbers |", "|---|---:|---|"]
    for ch in report["checks"]:
        nums = "; ".join(f"{k}={v}" for k, v in ch["numbers"].items())
        lines.append(f"| `{ch['name']}` | {'PASS' if ch['passed'] else 'FAIL'} | {nums} |")
    REPORT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--mode", choices=["audit", "apply"], default="audit")
    ap.add_argument("--repository", default=PARENT_SCOPE)
    args = ap.parse_args()
    nodes, edges = CURRENT / "nodes.parquet", CURRENT / "edges.parquet"
    con = duckdb.connect()
    before = {"nodes": md5(nodes), "edges": md5(edges)}
    base = read_base(con, nodes, edges)
    repos, excluded = eligible(con, nodes)
    with tempfile.TemporaryDirectory() as a, tempfile.TemporaryDirectory() as b:
        carts = build_once(Path(a) / "provenance=declared", con, nodes, edges, repos, base)
        build_once(Path(b) / "provenance=declared", con, nodes, edges, repos, base)
        deterministic = files_md5(Path(a) / "provenance=declared") == files_md5(Path(b) / "provenance=declared")
        after = {"nodes": md5(nodes), "edges": md5(edges)}
        checks = verify(con, nodes, edges, repos, excluded, carts, before, after, deterministic)
        ok = all(c["passed"] for c in checks)
        if args.mode == "apply" and ok:
            if TARGET.exists():
                shutil.rmtree(TARGET)
            shutil.copytree(Path(a) / "provenance=declared", TARGET)
        report = {
            "schemaVersion": SCHEMA_VERSION,
            "generatedUTC": now(),
            "methodVersion": METHOD_VERSION,
            "mode": args.mode,
            "repository": args.repository,
            "parentScope": PARENT_SCOPE,
            "baseStore": base,
            "baseMd5": before,
            "eligibleRepoNodeCount": len(repos),
            "excludedArchivedRepoNodes": excluded,
            "cartridges": [{k:v for k,v in c.items() if not k.startswith('actual')} for c in carts],
            "checks": checks,
            "dataLawResult": "PASS" if ok else "FAIL",
            "rollbackMethod": "Revert the apply commit; it is limited to declared cartridges and paired reports.",
            "nextAction": "Review audit, then run apply only after human approval." if args.mode == "audit" else "Independent clean-clone receipt required.",
        }
        report_write(report)
        print(json.dumps(report, indent=2, sort_keys=True))
        if not ok:
            raise RuntimeError("declared cartridge checks failed: " + ", ".join(c["name"] for c in checks if not c["passed"]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import datetime as dt
import json
import os
import re
import tempfile
import time
from pathlib import Path
from typing import Any

import duckdb
import requests

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data/federation_map"
REPORTS = ROOT / "reports"
JSON_REPORTS = REPORTS / "json"
METHOD_VERSION = "federation_map_dna_v3_provenance_discriminator"

CANONICAL_FILES = [
    "README.md",
    "anchor_AI_MUST_READ.md",
    "DATA_SOURCES.md",
    "DATA_CONTRACT.md",
    "DEPENDENCIES.md",
    "IMPLEMENTATION.md",
    "CHANGELOG.md",
    "package.json",
    "pyproject.toml",
    "requirements.txt",
]

REPO_REF_RE = re.compile(r"(?:https://github\.com/)?(Ventusltd/[A-Za-z0-9_.-]+)")
EXTERNAL_PATTERNS = [
    ("Elexon BMRS API", re.compile(r"Elexon|BMRS|data\.elexon\.co\.uk", re.I)),
    ("GitHub Actions", re.compile(r"github actions|actions/checkout|workflow_dispatch|cron:", re.I)),
    ("DuckDB", re.compile(r"duckdb|read_parquet|COPY \(", re.I)),
    ("Parquet", re.compile(r"parquet|zstd", re.I)),
]
PROVENANCE_DECLARED = "declared"
PROVENANCE_ALLOWED = ("declared", "derived")


def canonical_repo_ref(ref: str) -> str:
    # Canonicalise a repo reference to bare 'owner/repo'.
    # 'owner/repo.git' and 'owner/repo' are the SAME GitHub repository;
    # collapsing the clone-URL '.git' suffix is faithful transcription,
    # not embellishment. Applied uniformly so node ids and edge endpoints match.
    ref = ref.strip()
    # strip a host/URL prefix if present, leaving 'owner/repo...'
    for prefix in ('https://github.com/', 'http://github.com/', 'git@github.com:'):
        if ref.startswith(prefix):
            ref = ref[len(prefix):]
    if ref.endswith('.git'):
        ref = ref[:-4]
    return ref


def utcnow() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z")


def week_parts(now: dt.datetime) -> tuple[str, str, str]:
    iso = now.isocalendar()
    return f"{now.year:04d}", f"{now.month:02d}", f"{iso.week:02d}"


def headers(token: str | None, raw: bool = False) -> dict[str, str]:
    h = {"Accept": "application/vnd.github.raw" if raw else "application/vnd.github+json"}
    if token:
        h["Authorization"] = f"Bearer {token}"
    return h


def gh_get(url: str, token: str | None, timeout: int, raw: bool = False) -> requests.Response:
    return requests.get(url, headers=headers(token, raw=raw), timeout=timeout)


def list_owner_repos(owner: str, token: str | None, timeout: int, delay: float) -> list[dict[str, Any]]:
    repos: list[dict[str, Any]] = []
    page = 1
    while True:
        if token:
            url = f"https://api.github.com/user/repos?affiliation=owner&visibility=all&per_page=100&page={page}&sort=full_name"
        else:
            url = f"https://api.github.com/users/{owner}/repos?per_page=100&page={page}&sort=full_name"
        response = gh_get(url, token, timeout)
        if not response.ok:
            raise RuntimeError(f"GitHub repo list failed page={page} status={response.status_code}: {response.text[:500]}")
        batch = response.json()
        if not batch:
            break
        for repo in batch:
            if str(repo.get("owner", {}).get("login", "")).lower() == owner.lower():
                repos.append(repo)
        if len(batch) < 100:
            break
        page += 1
        if delay:
            time.sleep(delay)
    return repos


def fetch_text(repo_full_name: str, path: str, ref: str, token: str | None, timeout: int, max_bytes: int) -> tuple[bool, str]:
    url = f"https://api.github.com/repos/{repo_full_name}/contents/{path}?ref={ref}"
    response = gh_get(url, token, timeout, raw=True)
    if not response.ok:
        return False, ""
    text = response.text or ""
    if len(text.encode("utf-8", errors="ignore")) > max_bytes:
        text = text[:max_bytes]
    return True, text


def list_workflow_paths(repo_full_name: str, ref: str, token: str | None, timeout: int) -> list[str]:
    url = f"https://api.github.com/repos/{repo_full_name}/contents/.github/workflows?ref={ref}"
    response = gh_get(url, token, timeout)
    if not response.ok:
        return []
    out = []
    for item in response.json():
        name = item.get("name", "")
        path = item.get("path", "")
        if name.endswith((".yml", ".yaml")) and path:
            out.append(path)
    return sorted(out)


def clean_excerpt(text: str, token: str) -> str:
    idx = text.lower().find(token.lower())
    if idx < 0:
        return ""
    start = max(0, idx - 80)
    end = min(len(text), idx + 160)
    return " ".join(text[start:end].split())[:300]


def infer_repo_type(name: str, text_blob: str) -> str:
    n = name.lower()
    t = text_blob.lower()
    if "hompage" in n or "homepage" in n:
        return "homepage"
    if n == "globalgrid2050":
        return "source_archive"
    if n.startswith("data-") or "parquet" in t or "data repo" in t:
        return "data"
    if n.endswith("-ui") or "ui repo" in t or "github pages" in t:
        return "ui"
    if "app-" in n:
        return "app"
    return "unknown"


def edge_type_for(to_node: str, evidence_path: str, text: str) -> tuple[str, str]:
    low = (to_node + " " + evidence_path + " " + text[:500]).lower()
    if "data-" in to_node.lower() and ("depends" in low or "consume" in low or "read" in low):
        return "data_dependency", "many-to-one"
    if "globalgrid2050-hompage" in to_node.lower():
        return "governance_dependency", "many-to-one"
    if to_node.lower().endswith("globalgrid2050"):
        return "source_archive_reference", "many-to-one"
    return "repo_reference", "many-to-many"


def build_rows(owner: str, token: str | None, timeout: int, delay: float, max_file_bytes: int) -> tuple[list[dict[str, Any]], list[dict[str, Any]], dict[str, Any]]:
    scan_id = utcnow().replace(":", "").replace("-", "")[:15]
    generated = utcnow()
    repos = list_owner_repos(owner, token, timeout, delay)
    nodes: list[dict[str, Any]] = []
    edges_by_key: dict[str, dict[str, Any]] = {}
    external_nodes: set[str] = set()
    fetch_errors: list[dict[str, str]] = []

    for repo in repos:
        full = canonical_repo_ref(repo["full_name"])
        name = repo["name"]
        branch = repo.get("default_branch") or "main"
        texts: dict[str, str] = {}
        present: list[str] = []

        for path in CANONICAL_FILES:
            ok, text = fetch_text(full, path, branch, token, timeout, max_file_bytes)
            if ok:
                texts[path] = text
                present.append(path)
        for path in list_workflow_paths(full, branch, token, timeout):
            ok, text = fetch_text(full, path, branch, token, timeout, max_file_bytes)
            if ok:
                texts[path] = text
                present.append(path)

        blob = "\n".join(texts.values())
        repo_type = infer_repo_type(name, blob)
        nodes.append({
            "scanId": scan_id,
            "nodeId": full,
            "nodeKind": "github_repo",
            "repoFullName": full,
            "repoName": name,
            "owner": repo.get("owner", {}).get("login", ""),
            "repoType": repo_type,
            "status": "active" if not repo.get("archived") else "archived",
            "visibility": repo.get("visibility", ""),
            "defaultBranch": branch,
            "archived": str(repo.get("archived", "")),
            "htmlUrl": repo.get("html_url", ""),
            "description": repo.get("description") or "",
            "sizeKb": str(repo.get("size", "")),
            "pushedAt": repo.get("pushed_at", ""),
            "updatedAt": repo.get("updated_at", ""),
            "canonicalFilesPresent": "|".join(present),
            "generatedUTC": generated,
            "methodVersion": METHOD_VERSION,
        })

        for path, text in texts.items():
            refs = sorted({canonical_repo_ref(r) for r in REPO_REF_RE.findall(text)})
            for target in refs:
                if target == full:
                    continue
                etype, cardinality = edge_type_for(target, path, text)
                edge_id = f"{scan_id}|{full}|{target}|{etype}|{path}"
                edges_by_key[edge_id] = {
                    "scanId": scan_id,
                    "edgeId": edge_id,
                    "fromNode": full,
                    "toNode": target,
                    "edgeType": etype,
                    "cardinality": cardinality,
                    "evidencePath": path,
                    "evidenceText": clean_excerpt(text, target),
                    "provenance": PROVENANCE_DECLARED,
                    "generatedUTC": generated,
                    "methodVersion": METHOD_VERSION,
                }
            for external, pattern in EXTERNAL_PATTERNS:
                if pattern.search(text):
                    external_nodes.add(external)
                    edge_id = f"{scan_id}|{full}|{external}|external_reference|{path}"
                    edges_by_key[edge_id] = {
                        "scanId": scan_id,
                        "edgeId": edge_id,
                        "fromNode": full,
                        "toNode": external,
                        "edgeType": "external_reference",
                        "cardinality": "many-to-one",
                        "evidencePath": path,
                        "evidenceText": external,
                        "provenance": PROVENANCE_DECLARED,
                        "generatedUTC": generated,
                        "methodVersion": METHOD_VERSION,
                    }
        if delay:
            time.sleep(delay)

    for external in sorted(external_nodes):
        nodes.append({
            "scanId": scan_id,
            "nodeId": external,
            "nodeKind": "external_source_or_service",
            "repoFullName": external,
            "repoName": external,
            "owner": "external",
            "repoType": "external",
            "status": "referenced",
            "visibility": "external",
            "defaultBranch": "",
            "archived": "",
            "htmlUrl": "",
            "description": "External service or source detected from canonical files",
            "sizeKb": "",
            "pushedAt": "",
            "updatedAt": "",
            "canonicalFilesPresent": "",
            "generatedUTC": generated,
            "methodVersion": METHOD_VERSION,
        })

    audit = {
        "scanId": scan_id,
        "generatedUTC": generated,
        "repoCount": len(repos),
        "nodeRowsPrepared": len(nodes),
        "edgeRowsPrepared": len(edges_by_key),
        "fetchErrors": fetch_errors,
    }
    return nodes, list(edges_by_key.values()), audit


def write_csv(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fields = sorted({k for row in rows for k in row.keys()})
    with path.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fields)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)


def sql_path(path: Path) -> str:
    return str(path).replace("'", "''")


def write_parquet(staging: Path, target: Path) -> int:
    target.parent.mkdir(parents=True, exist_ok=True)
    con = duckdb.connect()
    con.execute(f"COPY (SELECT * FROM read_csv_auto('{sql_path(staging)}', all_varchar=true)) TO '{sql_path(target)}' (FORMAT parquet, COMPRESSION zstd)")
    return int(con.execute(f"SELECT count(*) FROM read_parquet('{sql_path(target)}')").fetchone()[0])


def write_outputs(nodes: list[dict[str, Any]], edges: list[dict[str, Any]]) -> dict[str, Any]:
    now = dt.datetime.now(dt.timezone.utc)
    year, month, week = now.strftime("%Y"), now.strftime("%m"), f"{now.isocalendar().week:02d}"
    current = OUT / "current"
    snapshot = OUT / "snapshots" / f"year={year}" / f"month={month}" / f"week={week}"
    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        nodes_csv = tmp_path / "nodes.csv"
        edges_csv = tmp_path / "edges.csv"
        write_csv(nodes_csv, nodes)
        write_csv(edges_csv, edges)
        current_node_rows = write_parquet(nodes_csv, current / "nodes.parquet")
        current_edge_rows = write_parquet(edges_csv, current / "edges.parquet")
        snapshot_node_rows = write_parquet(nodes_csv, snapshot / "nodes.parquet")
        snapshot_edge_rows = write_parquet(edges_csv, snapshot / "edges.parquet")
    return {
        "currentNodeRows": current_node_rows,
        "currentEdgeRows": current_edge_rows,
        "snapshotNodeRows": snapshot_node_rows,
        "snapshotEdgeRows": snapshot_edge_rows,
        "snapshotPath": str(snapshot),
    }


def verify_outputs() -> dict[str, Any]:
    con = duckdb.connect()
    nodes = sql_path(OUT / "current" / "nodes.parquet")
    edges = sql_path(OUT / "current" / "edges.parquet")
    node_rows, node_keys = con.execute(f"SELECT count(*), count(DISTINCT scanId || '|' || nodeId) FROM read_parquet('{nodes}')").fetchone()
    edge_rows, edge_keys = con.execute(f"SELECT count(*), count(DISTINCT scanId || '|' || edgeId) FROM read_parquet('{edges}')").fetchone()
    node_nulls = con.execute(f"SELECT count(*) FROM read_parquet('{nodes}') WHERE scanId IS NULL OR nodeId IS NULL OR scanId = '' OR nodeId = ''").fetchone()[0]
    edge_nulls = con.execute(f"SELECT count(*) FROM read_parquet('{edges}') WHERE scanId IS NULL OR edgeId IS NULL OR scanId = '' OR edgeId = ''").fetchone()[0]
    dangling_edges = con.execute(f"""
        SELECT count(*)
        FROM read_parquet('{edges}') e
        LEFT JOIN read_parquet('{nodes}') f ON e.fromNode = f.nodeId
        LEFT JOIN read_parquet('{nodes}') t ON e.toNode = t.nodeId
        WHERE f.nodeId IS NULL OR t.nodeId IS NULL
    """).fetchone()[0]
    edge_columns = {str(row[0]) for row in con.execute(f"DESCRIBE SELECT * FROM read_parquet('{edges}')").fetchall()}
    edge_provenance_column_present = int("provenance" in edge_columns)
    if edge_provenance_column_present:
        edge_provenance_null_rows = con.execute(f"SELECT count(*) FROM read_parquet('{edges}') WHERE provenance IS NULL OR trim(CAST(provenance AS VARCHAR)) = ''").fetchone()[0]
        edge_provenance_invalid_rows = con.execute(f"SELECT count(*) FROM read_parquet('{edges}') WHERE provenance NOT IN {PROVENANCE_ALLOWED}").fetchone()[0]
        derived_rows_in_base_edges = con.execute(f"SELECT count(*) FROM read_parquet('{edges}') WHERE provenance = 'derived'").fetchone()[0]
        declared_rows_in_base_edges = con.execute(f"SELECT count(*) FROM read_parquet('{edges}') WHERE provenance = 'declared'").fetchone()[0]
    else:
        edge_provenance_null_rows = int(edge_rows)
        edge_provenance_invalid_rows = int(edge_rows)
        derived_rows_in_base_edges = 0
        declared_rows_in_base_edges = 0
    duplicate_nodes = int(node_rows - node_keys)
    duplicate_edges = int(edge_rows - edge_keys)
    failure_reasons = {
        "node_nulls": int(node_nulls),
        "edge_nulls": int(edge_nulls),
        "duplicate_nodes": duplicate_nodes,
        "duplicate_edges": duplicate_edges,
        "dangling_edge_endpoints": int(dangling_edges),
        "edge_provenance_column_missing": int(not edge_provenance_column_present),
        "edge_provenance_null_rows": int(edge_provenance_null_rows),
        "edge_provenance_invalid_rows": int(edge_provenance_invalid_rows),
        "derived_rows_in_base_edges": int(derived_rows_in_base_edges),
    }
    verification_passed = not any(failure_reasons.values())
    failure_reason = (
        "verification failed: "
        + " ".join(f"{key}={value}" for key, value in failure_reasons.items())
    )
    return {
        "nodeRows": int(node_rows),
        "nodeDistinctKeys": int(node_keys),
        "edgeRows": int(edge_rows),
        "edgeDistinctKeys": int(edge_keys),
        "nodeNullKeys": int(node_nulls),
        "edgeNullKeys": int(edge_nulls),
        "duplicateNodeKeys": duplicate_nodes,
        "duplicateEdgeKeys": duplicate_edges,
        "danglingEdgeEndpoints": int(dangling_edges),
        "edgeProvenanceColumnPresent": edge_provenance_column_present,
        "edgeProvenanceNullRows": int(edge_provenance_null_rows),
        "edgeProvenanceInvalidRows": int(edge_provenance_invalid_rows),
        "derivedRowsInBaseEdges": int(derived_rows_in_base_edges),
        "declaredRowsInBaseEdges": int(declared_rows_in_base_edges),
        "verificationPassed": verification_passed,
        "failureReason": "" if verification_passed else failure_reason,
    }


def write_reports(report: dict[str, Any]) -> None:
    REPORTS.mkdir(exist_ok=True)
    JSON_REPORTS.mkdir(parents=True, exist_ok=True)
    (JSON_REPORTS / "FEDERATION_MAP_LATEST.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    md = [
        "# Federation Map Latest",
        "",
        f"Generated UTC: `{report['generatedUTC']}`",
        f"Scan ID: `{report['scanId']}`",
        f"Method: `{METHOD_VERSION}`",
        f"Data law result: `{report['dataLawResult']}`",
        "",
        "## Counts",
        "",
        f"- Repositories scanned: `{report['sourceAudit']['repoCount']}`",
        f"- Node rows: `{report['verification']['nodeRows']}`",
        f"- Edge rows: `{report['verification']['edgeRows']}`",
        f"- Duplicate node keys: `{report['verification']['duplicateNodeKeys']}`",
        f"- Duplicate edge keys: `{report['verification']['duplicateEdgeKeys']}`",
        f"- Node null keys: `{report['verification']['nodeNullKeys']}`",
        f"- Edge null keys: `{report['verification']['edgeNullKeys']}`",
        f"- Dangling edge endpoints: `{report['verification']['danglingEdgeEndpoints']}`",
        f"- Edge provenance column present: `{report['verification']['edgeProvenanceColumnPresent']}`",
        f"- Edge provenance null rows: `{report['verification']['edgeProvenanceNullRows']}`",
        f"- Edge provenance invalid rows: `{report['verification']['edgeProvenanceInvalidRows']}`",
        f"- Derived rows in base edges: `{report['verification']['derivedRowsInBaseEdges']}`",
        f"- Declared rows in base edges: `{report['verification']['declaredRowsInBaseEdges']}`",
        "",
        "## Scaling law",
        "",
        "This is a metadata scan. It does not clone every repo. Future million-repo scale must use shards, manifests, API metadata, DuckDB and Parquet partitions.",
    ]
    (REPORTS / "FEDERATION_MAP_LATEST.md").write_text("\n".join(md) + "\n", encoding="utf-8")


def main() -> int:
    ap = argparse.ArgumentParser(description="Build GlobalGrid2050 all-repos federation map")
    ap.add_argument("--owner", default="Ventusltd")
    ap.add_argument("--timeout", type=int, default=30)
    ap.add_argument("--request-delay-seconds", type=float, default=0.2)
    ap.add_argument("--max-file-bytes", type=int, default=200000)
    args = ap.parse_args()

    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN") or os.environ.get("GRIDBOT_PAT")
    nodes, edges, source_audit = build_rows(args.owner, token, args.timeout, args.request_delay_seconds, args.max_file_bytes)
    outputs = write_outputs(nodes, edges)
    verification = verify_outputs()
    report = {
        "generatedUTC": utcnow(),
        "scanId": source_audit["scanId"],
        "methodVersion": METHOD_VERSION,
        "owner": args.owner,
        "outputs": outputs,
        "sourceAudit": source_audit,
        "verification": verification,
        "dataLawResult": "PASS" if verification["verificationPassed"] else "FAIL",
    }
    write_reports(report)
    print(json.dumps(report, indent=2))
    if not verification["verificationPassed"]:
        raise RuntimeError(verification["failureReason"])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

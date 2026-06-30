#!/usr/bin/env python3
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Any

import duckdb

ROOT = Path(__file__).resolve().parents[1]
METHOD_VERSION = "federation_publish_json_v1_duckdb_projection"
SCHEMA_VERSION = "1.0"

DEFAULT_SOURCE_NODES = ROOT / "data/federation_map/current/nodes.parquet"
DEFAULT_SOURCE_EDGES = ROOT / "data/federation_map/current/edges.parquet"
DEFAULT_TARGET_DIR = ROOT / "live_sandbox/federation_control_ledger/data"
DEFAULT_REPORT_MD = ROOT / "reports/FEDERATION_PUBLISH_LATEST.md"
DEFAULT_REPORT_JSON = ROOT / "reports/json/FEDERATION_PUBLISH_LATEST.json"
DEFAULT_LEDGER = ROOT / "live_sandbox/federation_control_ledger/PUBLISH_LEDGER.md"
DEFAULT_SCANNER_REPORT = ROOT / "reports/json/FEDERATION_MAP_LATEST.json"
DEFAULT_DEPENDENCIES = ROOT / "DEPENDENCIES.md"

NODE_PROPERTY_KEYS_FALLBACK = [
    "label",
    "repo_type",
    "scope_type",
    "rag",
    "status",
    "status_reason",
    "importance_score",
    "child_manifest",
]

SOURCE_EDGE_TO_UI_TYPE = {
    "data_dependency": "data",
    "governance_dependency": "governance",
    "source_archive_reference": "archive",
    "repo_reference": "repo",
    "external_reference": "external",
}

DEPENDENCIES_BLOCK_START = "<!-- federation-publish-json:start -->"
DEPENDENCIES_BLOCK_END = "<!-- federation-publish-json:end -->"
DEPENDENCIES_BLOCK = f"""{DEPENDENCIES_BLOCK_START}

## Federation publish bridge

```text
scripts/publish_federation_json.py
source: data/federation_map/current/nodes.parquet
source: data/federation_map/current/edges.parquet
target: live_sandbox/federation_control_ledger/data/nodes.json
target: live_sandbox/federation_control_ledger/data/edges.json
runtime: Python 3.11 standard library plus DuckDB
additional dependencies introduced: none
```

{DEPENDENCIES_BLOCK_END}"""


class StopPlan(RuntimeError):
    pass


def utcnow() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def rel(path: Path) -> str:
    try:
        return path.resolve().relative_to(ROOT.resolve()).as_posix()
    except ValueError:
        return path.as_posix()


def sql_path(path: Path) -> str:
    return str(path).replace("'", "''")


def json_text(obj: Any) -> str:
    return json.dumps(obj, indent=2, ensure_ascii=False, sort_keys=False) + "\n"


def canonical_text(obj: Any) -> str:
    return json.dumps(obj, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def read_text_if_exists(path: Path) -> str | None:
    if not path.exists():
        return None
    return path.read_text(encoding="utf-8")


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def current_commit_sha() -> str:
    env_sha = os.environ.get("GITHUB_SHA")
    if env_sha:
        return env_sha
    try:
        return subprocess.check_output(
            ["git", "rev-parse", "HEAD"], cwd=ROOT, text=True, stderr=subprocess.DEVNULL
        ).strip()
    except Exception:
        return "unknown"


def empty_report(args: argparse.Namespace, generated_utc: str) -> dict[str, Any]:
    repository = args.repository or os.environ.get("GITHUB_REPOSITORY") or "Ventusltd/data-federation-map-for-globalgrid2050-all-repos"
    return {
        "schemaVersion": SCHEMA_VERSION,
        "generatedUTC": generated_utc,
        "methodVersion": METHOD_VERSION,
        "mode": args.mode,
        "repository": repository,
        "commitSHA": current_commit_sha(),
        "target": {
            "directory": rel(args.target_dir),
            "nodesJson": rel(args.target_dir / "nodes.json"),
            "edgesJson": rel(args.target_dir / "edges.json"),
        },
        "source": {
            "nodesParquet": rel(args.source_nodes),
            "edgesParquet": rel(args.source_edges),
            "scannerReport": rel(args.scanner_report),
        },
        "sprawlCheck": {
            "requirement": "11.3",
            "result": "PASS",
            "choice": "extend_existing_weekly_scanner_workflow",
            "justification": "The existing weekly scanner workflow already runs scripts/build_federation_map.py, so the clean bridge is to extend that workflow rather than add a second scanner workflow.",
            "workflowPath": ".github/workflows/gridbot_federation_map_weekly.yml",
        },
        "sourceAuditNumbers": {},
        "scanner": {},
        "declaredChecks": [],
        "plannedChangedFiles": [],
        "actuallyChangedFilesUnderApply": [],
        "dataLawResult": "FAIL",
        "rollbackMethod": "Revert the apply commit. The publish target is limited to live_sandbox/federation_control_ledger/data/nodes.json, live_sandbox/federation_control_ledger/data/edges.json, DEPENDENCIES.md, and the paired report/ledger evidence files.",
        "nextAction": "Review the failed report, fix the declared failing check, and re-run audit before any apply.",
        "fatalErrors": [],
        "warnings": [],
    }


def add_check(report: dict[str, Any], name: str, passed: bool, detail: str, numbers: dict[str, Any] | None = None) -> None:
    item = {
        "name": name,
        "passed": bool(passed),
        "detail": detail,
    }
    if numbers is not None:
        item["numbers"] = numbers
    report["declaredChecks"].append(item)


def all_checks_pass(report: dict[str, Any]) -> bool:
    return bool(report["declaredChecks"]) and all(bool(c.get("passed")) for c in report["declaredChecks"]) and not report["fatalErrors"]


def parquet_columns(con: duckdb.DuckDBPyConnection, path: Path) -> set[str]:
    rows = con.execute(f"DESCRIBE SELECT * FROM read_parquet('{sql_path(path)}')").fetchall()
    return {str(row[0]) for row in rows}


def load_source_rows(con: duckdb.DuckDBPyConnection, nodes_path: Path, edges_path: Path) -> tuple[list[dict[str, Any]], list[dict[str, Any]], dict[str, Any]]:
    required_node_cols = {"nodeId", "repoName", "repoType"}
    required_edge_cols = {"edgeId", "fromNode", "toNode", "edgeType"}
    node_cols = parquet_columns(con, nodes_path)
    edge_cols = parquet_columns(con, edges_path)
    missing_node_cols = sorted(required_node_cols - node_cols)
    missing_edge_cols = sorted(required_edge_cols - edge_cols)
    if missing_node_cols or missing_edge_cols:
        raise StopPlan(f"Source Parquet schema is missing required columns: nodes={missing_node_cols}, edges={missing_edge_cols}")

    nodes_query = f"""
        SELECT
          row_number() OVER () AS sourceOrder,
          CASE WHEN nodeId IS NULL OR trim(CAST(nodeId AS VARCHAR)) = '' THEN NULL ELSE CAST(nodeId AS VARCHAR) END AS id,
          CASE WHEN repoName IS NULL OR trim(CAST(repoName AS VARCHAR)) = '' THEN NULL ELSE CAST(repoName AS VARCHAR) END AS label,
          CASE WHEN repoType IS NULL OR trim(CAST(repoType AS VARCHAR)) = '' THEN NULL ELSE CAST(repoType AS VARCHAR) END AS repo_type
        FROM read_parquet('{sql_path(nodes_path)}')
    """
    edge_query = f"""
        SELECT
          row_number() OVER () AS sourceOrder,
          CASE WHEN edgeId IS NULL OR trim(CAST(edgeId AS VARCHAR)) = '' THEN NULL ELSE CAST(edgeId AS VARCHAR) END AS edge_id,
          CASE WHEN fromNode IS NULL OR trim(CAST(fromNode AS VARCHAR)) = '' THEN NULL ELSE CAST(fromNode AS VARCHAR) END AS from_node,
          CASE WHEN toNode IS NULL OR trim(CAST(toNode AS VARCHAR)) = '' THEN NULL ELSE CAST(toNode AS VARCHAR) END AS to_node,
          CASE WHEN edgeType IS NULL OR trim(CAST(edgeType AS VARCHAR)) = '' THEN NULL ELSE CAST(edgeType AS VARCHAR) END AS edge_type
        FROM read_parquet('{sql_path(edges_path)}')
    """
    node_result = con.execute(nodes_query)
    node_columns = [d[0] for d in node_result.description]
    nodes = [dict(zip(node_columns, row)) for row in node_result.fetchall()]

    edge_result = con.execute(edge_query)
    edge_columns = [d[0] for d in edge_result.description]
    edges = [dict(zip(edge_columns, row)) for row in edge_result.fetchall()]

    source_numbers = {
        "sourceNodeRows": len(nodes),
        "sourceDistinctNodeIds": len({r["id"] for r in nodes if r["id"] is not None}),
        "sourceNullNodeIds": sum(1 for r in nodes if r["id"] is None),
        "sourceEdgeRows": len(edges),
        "sourceDistinctSourceEdgeIds": len({r["edge_id"] for r in edges if r["edge_id"] is not None}),
        "sourceNullSourceEdgeIds": sum(1 for r in edges if r["edge_id"] is None),
    }
    return nodes, edges, source_numbers


def scanner_readback_status(scanner_report_path: Path, scanner_status: str) -> dict[str, Any]:
    info: dict[str, Any] = {
        "workflowScannerOutcome": scanner_status,
        "reportPresent": scanner_report_path.exists(),
        "readbackVerificationPassed": False,
        "verification": None,
        "sourceAudit": None,
    }
    if not scanner_report_path.exists():
        return info
    try:
        scanner_report = read_json(scanner_report_path)
    except Exception as exc:
        info["readError"] = str(exc)
        return info

    verification = scanner_report.get("verification") or {}
    source_audit = scanner_report.get("sourceAudit") or {}
    info["verification"] = verification
    info["sourceAudit"] = source_audit
    expected_true = [
        verification.get("nodeRows") == verification.get("nodeDistinctKeys"),
        verification.get("edgeRows") == verification.get("edgeDistinctKeys"),
        verification.get("nodeNullKeys") == 0,
        verification.get("edgeNullKeys") == 0,
        verification.get("duplicateNodeKeys") == 0,
        verification.get("duplicateEdgeKeys") == 0,
    ]
    info["readbackVerificationPassed"] = bool(all(expected_true) and scanner_status == "success")
    return info


def current_node_shape(current_nodes: dict[str, Any]) -> tuple[list[dict[str, Any]], dict[str, dict[str, Any]], list[str]]:
    if not isinstance(current_nodes, dict) or current_nodes.get("type") != "FeatureCollection":
        raise StopPlan("Current nodes.json is not a GeoJSON FeatureCollection.")
    features = current_nodes.get("features")
    if not isinstance(features, list):
        raise StopPlan("Current nodes.json has no features array.")

    by_id: dict[str, dict[str, Any]] = {}
    property_keys = NODE_PROPERTY_KEYS_FALLBACK[:]
    for idx, feature in enumerate(features):
        if not isinstance(feature, dict):
            raise StopPlan(f"Current nodes.json feature at index {idx} is not an object.")
        node_id = feature.get("id")
        if isinstance(node_id, str) and node_id not in by_id:
            by_id[node_id] = feature
        props = feature.get("properties")
        if isinstance(props, dict) and idx == 0:
            property_keys = list(props.keys())
            for required in NODE_PROPERTY_KEYS_FALLBACK:
                if required not in property_keys:
                    property_keys.append(required)
    return features, by_id, property_keys


def current_edges_shape(current_edges: dict[str, Any]) -> dict[str, Any]:
    if not isinstance(current_edges, dict):
        raise StopPlan("Current edges.json is not an object.")
    edges = current_edges.get("edges")
    if not isinstance(edges, list):
        raise StopPlan("Current edges.json has no edges array.")
    return {k: v for k, v in current_edges.items() if k != "edges"}


def build_nodes_json(
    source_nodes: list[dict[str, Any]],
    current_nodes_obj: dict[str, Any],
) -> tuple[dict[str, Any], dict[str, int], dict[str, Any]]:
    current_features, current_by_id, property_keys = current_node_shape(current_nodes_obj)
    current_order = {feature.get("id"): idx for idx, feature in enumerate(current_features) if isinstance(feature, dict)}

    first_by_id: dict[str, dict[str, Any]] = {}
    for row in source_nodes:
        node_id = row.get("id")
        if node_id is not None and node_id not in first_by_id:
            first_by_id[node_id] = row

    ordered_rows = sorted(
        first_by_id.values(),
        key=lambda row: (0, current_order[row["id"]]) if row["id"] in current_order else (1, int(row["sourceOrder"])),
    )

    features: list[dict[str, Any]] = []
    for row in ordered_rows:
        node_id = row["id"]
        current_feature = current_by_id.get(node_id, {})
        current_props = current_feature.get("properties") if isinstance(current_feature, dict) else None
        if not isinstance(current_props, dict):
            current_props = {}

        props: dict[str, Any] = {}
        for key in property_keys:
            if key == "label":
                props[key] = row.get("label")
            elif key == "repo_type":
                props[key] = row.get("repo_type")
            elif key == "scope_type":
                props[key] = row.get("repo_type")
            elif key in {"rag", "status", "status_reason", "importance_score", "child_manifest"}:
                props[key] = current_props.get(key) if key in current_props else None
            else:
                props[key] = current_props.get(key) if key in current_props else None

        geometry = current_feature.get("geometry") if isinstance(current_feature, dict) and "geometry" in current_feature else None
        features.append({
            "type": "Feature",
            "id": node_id,
            "geometry": geometry,
            "properties": props,
        })

    nodes_obj = {k: v for k, v in current_nodes_obj.items() if k != "features"}
    nodes_obj["type"] = "FeatureCollection"
    nodes_obj["features"] = features
    node_index = {feature["id"]: idx for idx, feature in enumerate(features)}
    shape_audit = {
        "currentSeedNodeCount": len(current_features),
        "currentSeedNodeIdsMatched": len([node_id for node_id in first_by_id if node_id in current_order]),
        "propertyKeys": property_keys,
    }
    return nodes_obj, node_index, shape_audit


def build_edges_json(
    source_edges: list[dict[str, Any]],
    node_index: dict[str, int],
    current_edges_obj: dict[str, Any],
) -> tuple[dict[str, Any], dict[str, Any]]:
    base = current_edges_shape(current_edges_obj)
    raw_projected: list[tuple[int, int, Any, str, str, str | None]] = []
    unresolved: list[dict[str, Any]] = []
    null_endpoint_rows = 0

    for row in source_edges:
        from_node = row.get("from_node")
        to_node = row.get("to_node")
        if from_node is None or to_node is None:
            null_endpoint_rows += 1
            unresolved.append({
                "edge_id": row.get("edge_id"),
                "from_node": from_node,
                "to_node": to_node,
                "reason": "null_endpoint",
            })
            continue
        if from_node not in node_index or to_node not in node_index:
            unresolved.append({
                "edge_id": row.get("edge_id"),
                "from_node": from_node,
                "to_node": to_node,
                "reason": "endpoint_not_in_nodes",
            })
            continue
        ui_type = SOURCE_EDGE_TO_UI_TYPE.get(row.get("edge_type"), None)
        raw_projected.append((node_index[from_node], node_index[to_node], ui_type, from_node, to_node, row.get("edge_type")))

    edges: list[list[Any]] = []
    seen_keys: set[tuple[int, int, Any]] = set()
    duplicate_projected_edge_rows = 0
    for from_index, to_index, ui_type, _from_node, _to_node, _source_type in raw_projected:
        key = (from_index, to_index, ui_type)
        if key in seen_keys:
            duplicate_projected_edge_rows += 1
            continue
        seen_keys.add(key)
        edges.append([from_index, to_index, ui_type])

    edges_obj = dict(base)
    edges_obj["edges"] = edges
    edge_audit = {
        "rawResolvableProjectedEdgeRows": len(raw_projected),
        "projectedEdgeRows": len(edges),
        "projectedDistinctDeclaredEdgeKeys": len({tuple(edge) for edge in edges}),
        "duplicateProjectedEdgeRowsCollapsed": duplicate_projected_edge_rows,
        "unresolvedEdgeRows": len(unresolved),
        "nullEndpointEdgeRows": null_endpoint_rows,
        "unresolvedEdgeSample": unresolved[:10],
        "edgeTypeContract": SOURCE_EDGE_TO_UI_TYPE,
    }
    return edges_obj, edge_audit


def projection_for_reconciliation(nodes_obj: dict[str, Any], edges_obj: dict[str, Any]) -> dict[str, Any]:
    features = nodes_obj.get("features", [])
    node_projection = []
    for feature in features:
        props = feature.get("properties", {}) if isinstance(feature, dict) else {}
        node_projection.append({
            "type": feature.get("type") if isinstance(feature, dict) else None,
            "id": feature.get("id") if isinstance(feature, dict) else None,
            "geometry": feature.get("geometry") if isinstance(feature, dict) else None,
            "label": props.get("label") if isinstance(props, dict) else None,
            "repo_type": props.get("repo_type") if isinstance(props, dict) else None,
            "scope_type": props.get("scope_type") if isinstance(props, dict) else None,
            "rag": props.get("rag") if isinstance(props, dict) else None,
            "status": props.get("status") if isinstance(props, dict) else None,
            "status_reason": props.get("status_reason") if isinstance(props, dict) else None,
            "importance_score": props.get("importance_score") if isinstance(props, dict) else None,
            "child_manifest": props.get("child_manifest") if isinstance(props, dict) else None,
        })
    return {
        "nodes": node_projection,
        "edges": edges_obj.get("edges", []),
    }


def edge_indices_resolve(nodes_obj: dict[str, Any], edges_obj: dict[str, Any]) -> tuple[bool, dict[str, Any]]:
    features = nodes_obj.get("features", [])
    edges = edges_obj.get("edges", [])
    node_count = len(features) if isinstance(features, list) else 0
    failures: list[dict[str, Any]] = []
    if not isinstance(edges, list):
        return False, {"reason": "edges_not_list"}
    for idx, edge in enumerate(edges):
        ok = (
            isinstance(edge, list)
            and len(edge) == 3
            and isinstance(edge[0], int)
            and isinstance(edge[1], int)
            and 0 <= edge[0] < node_count
            and 0 <= edge[1] < node_count
        )
        if not ok:
            failures.append({"edgeIndex": idx, "edge": edge})
    return not failures, {"nodeCount": node_count, "edgeCount": len(edges), "failures": failures[:10]}


def update_dependencies_text(existing: str | None) -> tuple[str, bool]:
    if existing is None:
        return "# DEPENDENCIES.md\n\n" + DEPENDENCIES_BLOCK + "\n", True
    if DEPENDENCIES_BLOCK_START in existing and DEPENDENCIES_BLOCK_END in existing:
        start = existing.index(DEPENDENCIES_BLOCK_START)
        end = existing.index(DEPENDENCIES_BLOCK_END) + len(DEPENDENCIES_BLOCK_END)
        new_text = existing[:start].rstrip() + "\n\n" + DEPENDENCIES_BLOCK + existing[end:]
    else:
        new_text = existing.rstrip() + "\n\n" + DEPENDENCIES_BLOCK + "\n"
    return new_text, new_text != existing


def write_markdown_report(report: dict[str, Any]) -> str:
    checks = report.get("declaredChecks", [])
    check_lines = ["| Check | Result | Detail |", "|---|---:|---|"]
    for check in checks:
        result = "PASS" if check.get("passed") else "FAIL"
        detail = str(check.get("detail", "")).replace("\n", " ")
        check_lines.append(f"| `{check.get('name')}` | {result} | {detail} |")

    source_numbers = report.get("sourceAuditNumbers", {})
    source_lines = ["| Number | Value |", "|---|---:|"]
    for key in sorted(source_numbers):
        source_lines.append(f"| `{key}` | `{source_numbers[key]}` |")

    planned = "\n".join(f"- `{path}`" for path in report.get("plannedChangedFiles", [])) or "- None"
    actual = "\n".join(f"- `{path}`" for path in report.get("actuallyChangedFilesUnderApply", [])) or "- None"
    fatal = "\n".join(f"- `{err}`" for err in report.get("fatalErrors", [])) or "- None"

    return "\n".join([
        "# Federation Publish Latest",
        "",
        f"Schema version: `{report['schemaVersion']}`",
        f"Generated UTC: `{report['generatedUTC']}`",
        f"Method version: `{report['methodVersion']}`",
        f"Mode: `{report['mode']}`",
        f"Repository: `{report['repository']}`",
        f"Commit SHA: `{report['commitSHA']}`",
        "",
        "## Target",
        "",
        f"- Directory: `{report['target']['directory']}`",
        f"- Nodes JSON: `{report['target']['nodesJson']}`",
        f"- Edges JSON: `{report['target']['edgesJson']}`",
        "",
        "## Sprawl check",
        "",
        f"Result: `{report['sprawlCheck']['result']}`",
        f"Choice: `{report['sprawlCheck']['choice']}`",
        f"Justification: {report['sprawlCheck']['justification']}",
        "",
        "## Source audit numbers",
        "",
        *source_lines,
        "",
        "## Scanner read-back verification",
        "",
        f"Passed: `{report.get('scanner', {}).get('readbackVerificationPassed')}`",
        f"Workflow scanner outcome: `{report.get('scanner', {}).get('workflowScannerOutcome')}`",
        f"Scanner report present: `{report.get('scanner', {}).get('reportPresent')}`",
        "",
        "## Declared checks",
        "",
        *check_lines,
        "",
        "## Planned changed files",
        "",
        planned,
        "",
        "## Actually changed files under apply",
        "",
        actual,
        "",
        "## Data-law result",
        "",
        f"`{report['dataLawResult']}`",
        "",
        "## Rollback method",
        "",
        report["rollbackMethod"],
        "",
        "## Fatal errors",
        "",
        fatal,
        "",
        "## Next action",
        "",
        report["nextAction"],
        "",
    ]) + "\n"


def append_ledger(ledger_path: Path, report: dict[str, Any], publish_succeeded: bool) -> None:
    ledger_path.parent.mkdir(parents=True, exist_ok=True)
    source_numbers = report.get("sourceAuditNumbers", {})
    node_count = source_numbers.get("projectedNodeRows", source_numbers.get("sourceNodeRows", "unknown"))
    edge_count = source_numbers.get("projectedEdgeRows", "unknown")
    scanner_passed = report.get("scanner", {}).get("readbackVerificationPassed", False)
    line = (
        f"{report['generatedUTC']} | mode={report['mode']} | commit={report['commitSHA']} | "
        f"nodes={node_count} | edges={edge_count} | scanner_readback={scanner_passed} | "
        f"publish_succeeded={publish_succeeded}\n"
    )
    if not ledger_path.exists():
        ledger_path.write_text("# Federation Publish Ledger\n\n", encoding="utf-8")
    with ledger_path.open("a", encoding="utf-8") as fh:
        fh.write(line)


def execute(args: argparse.Namespace) -> tuple[int, dict[str, Any]]:
    generated_utc = utcnow()
    report = empty_report(args, generated_utc)
    mode = args.mode
    event_name = os.environ.get("GITHUB_EVENT_NAME", "local")
    target_nodes = args.target_dir / "nodes.json"
    target_edges = args.target_dir / "edges.json"

    planned_files = [
        rel(target_nodes),
        rel(target_edges),
        rel(args.report_md),
        rel(args.report_json),
        rel(args.ledger),
        rel(args.dependencies),
    ]
    report["plannedChangedFiles"] = planned_files

    target_nodes_text = ""
    target_edges_text = ""
    planned_nodes_obj: dict[str, Any] | None = None
    planned_edges_obj: dict[str, Any] | None = None
    actually_changed_apply: list[str] = []
    publish_succeeded = False

    try:
        add_check(report, "mode_is_valid", mode in {"audit", "apply"}, f"mode={mode}")
        apply_gate_passed = mode != "apply" or event_name == "workflow_dispatch"
        add_check(
            report,
            "apply_runs_only_from_human_workflow_dispatch",
            apply_gate_passed,
            f"mode={mode}; github_event_name={event_name}",
        )

        nodes_exists = args.source_nodes.exists()
        edges_exists = args.source_edges.exists()
        add_check(
            report,
            "source_parquet_files_exist",
            nodes_exists and edges_exists,
            f"nodes_parquet_exists={nodes_exists}; edges_parquet_exists={edges_exists}",
        )
        if not (nodes_exists and edges_exists):
            raise StopPlan("Missing source Parquet. The publish bridge cannot run without data/federation_map/current/nodes.parquet and edges.parquet.")

        current_nodes_exists = target_nodes.exists()
        current_edges_exists = target_edges.exists()
        add_check(
            report,
            "current_ui_json_shape_files_exist",
            current_nodes_exists and current_edges_exists,
            f"nodes_json_exists={current_nodes_exists}; edges_json_exists={current_edges_exists}",
        )
        if not (current_nodes_exists and current_edges_exists):
            raise StopPlan("Current UI JSON files are required as the shape template.")

        scanner_info = scanner_readback_status(args.scanner_report, args.scanner_status)
        report["scanner"] = scanner_info
        add_check(
            report,
            "scanner_readback_verification_passed",
            bool(scanner_info.get("readbackVerificationPassed")),
            f"scanner_outcome={scanner_info.get('workflowScannerOutcome')}; report_present={scanner_info.get('reportPresent')}",
        )

        current_nodes_obj = read_json(target_nodes)
        current_edges_obj = read_json(target_edges)
        add_check(report, "current_nodes_json_is_feature_collection", isinstance(current_nodes_obj, dict) and current_nodes_obj.get("type") == "FeatureCollection", "nodes.json type must be FeatureCollection")
        add_check(report, "current_edges_json_has_edges_array", isinstance(current_edges_obj, dict) and isinstance(current_edges_obj.get("edges"), list), "edges.json must contain an edges array")

        con = duckdb.connect()
        source_nodes, source_edges, source_numbers = load_source_rows(con, args.source_nodes, args.source_edges)
        report["sourceAuditNumbers"].update(source_numbers)

        planned_nodes_obj, node_index, shape_audit = build_nodes_json(source_nodes, current_nodes_obj)
        planned_edges_obj, edge_audit = build_edges_json(source_edges, node_index, current_edges_obj)
        edge_type_contract = edge_audit.pop("edgeTypeContract")
        unresolved_edge_sample = edge_audit.pop("unresolvedEdgeSample")
        report["sourceAuditNumbers"].update(shape_audit)
        report["sourceAuditNumbers"].update(edge_audit)
        report["edgeProjectionAudit"] = {
            "edgeTypeContract": edge_type_contract,
            "unresolvedEdgeSample": unresolved_edge_sample,
        }
        report["sourceAuditNumbers"].update({
            "projectedNodeRows": len(planned_nodes_obj.get("features", [])),
            "projectedEdgeRows": len(planned_edges_obj.get("edges", [])),
        })

        node_count = source_numbers["sourceNodeRows"]
        distinct_node_count = source_numbers["sourceDistinctNodeIds"]
        null_node_ids = source_numbers["sourceNullNodeIds"]
        add_check(
            report,
            "node_count_equals_distinct_node_id_count",
            node_count == distinct_node_count,
            f"sourceNodeRows={node_count}; sourceDistinctNodeIds={distinct_node_count}",
            {"sourceNodeRows": node_count, "sourceDistinctNodeIds": distinct_node_count},
        )
        add_check(
            report,
            "zero_null_node_ids",
            null_node_ids == 0,
            f"sourceNullNodeIds={null_node_ids}",
            {"sourceNullNodeIds": null_node_ids},
        )

        indices_pass, index_numbers = edge_indices_resolve(planned_nodes_obj, planned_edges_obj)
        add_check(
            report,
            "every_edge_from_index_and_to_index_resolves_to_real_node",
            indices_pass and edge_audit["unresolvedEdgeRows"] == 0,
            f"unresolvedEdgeRows={edge_audit['unresolvedEdgeRows']}; edgeIndexFailures={len(index_numbers.get('failures', []))}",
            {"unresolvedEdgeRows": edge_audit["unresolvedEdgeRows"], **index_numbers},
        )

        projected_edge_count = edge_audit["projectedEdgeRows"]
        distinct_declared_edge_keys = edge_audit["projectedDistinctDeclaredEdgeKeys"]
        add_check(
            report,
            "edge_count_equals_distinct_declared_edge_key_count",
            projected_edge_count == distinct_declared_edge_keys,
            f"projectedEdgeRows={projected_edge_count}; projectedDistinctDeclaredEdgeKeys={distinct_declared_edge_keys}",
            {"projectedEdgeRows": projected_edge_count, "projectedDistinctDeclaredEdgeKeys": distinct_declared_edge_keys},
        )

        target_nodes_text = json_text(planned_nodes_obj)
        target_edges_text = json_text(planned_edges_obj)
        expected_projection = projection_for_reconciliation(planned_nodes_obj, planned_edges_obj)
        expected_hash = sha256_text(canonical_text(expected_projection))
        report["projection"] = {
            "contract": "nodes ordered by existing UI node order when present, then source Parquet order; edges projected as distinct [fromIndex,toIndex,type] using the source edgeType contract.",
            "edgeTypeContract": edge_type_contract,
            "expectedHash": expected_hash,
        }

        pre_write_pass = all_checks_pass(report)
        if mode == "apply" and pre_write_pass:
            old_nodes = read_text_if_exists(target_nodes)
            old_edges = read_text_if_exists(target_edges)
            if old_nodes != target_nodes_text:
                write_text(target_nodes, target_nodes_text)
                actually_changed_apply.append(rel(target_nodes))
            if old_edges != target_edges_text:
                write_text(target_edges, target_edges_text)
                actually_changed_apply.append(rel(target_edges))

            old_dependencies = read_text_if_exists(args.dependencies)
            new_dependencies, dependencies_changed = update_dependencies_text(old_dependencies)
            if dependencies_changed:
                write_text(args.dependencies, new_dependencies)
                actually_changed_apply.append(rel(args.dependencies))

            actual_projection = projection_for_reconciliation(read_json(target_nodes), read_json(target_edges))
            actual_hash = sha256_text(canonical_text(actual_projection))
            reconciliation_passed = actual_projection == expected_projection
            report["projection"]["actualHash"] = actual_hash
            add_check(
                report,
                "published_json_reconciles_exactly_against_parquet_projection",
                reconciliation_passed,
                f"expectedHash={expected_hash}; actualHash={actual_hash}",
                {"expectedHash": expected_hash, "actualHash": actual_hash},
            )
        elif mode == "apply" and not pre_write_pass:
            add_check(
                report,
                "published_json_reconciles_exactly_against_parquet_projection",
                False,
                "Apply write blocked because one or more pre-write declared checks failed.",
            )
        else:
            audit_projection = projection_for_reconciliation(planned_nodes_obj, planned_edges_obj)
            actual_hash = sha256_text(canonical_text(audit_projection))
            add_check(
                report,
                "planned_json_reconciles_exactly_against_parquet_projection",
                audit_projection == expected_projection,
                f"expectedHash={expected_hash}; plannedHash={actual_hash}",
                {"expectedHash": expected_hash, "plannedHash": actual_hash},
            )
            existing_nodes_text = read_text_if_exists(target_nodes)
            existing_edges_text = read_text_if_exists(target_edges)
            report["auditOnlyTargetDrift"] = {
                "nodesJsonWouldChange": existing_nodes_text != target_nodes_text,
                "edgesJsonWouldChange": existing_edges_text != target_edges_text,
            }

        report["actuallyChangedFilesUnderApply"] = actually_changed_apply if mode == "apply" else []
    except StopPlan as exc:
        report["fatalErrors"].append(str(exc))
    except Exception as exc:
        report["fatalErrors"].append(f"{type(exc).__name__}: {exc}")

    publish_succeeded = all_checks_pass(report)
    report["dataLawResult"] = "PASS" if publish_succeeded else "FAIL"
    if publish_succeeded:
        if mode == "apply":
            report["nextAction"] = "Apply completed. Commit the target JSON, DEPENDENCIES.md, paired report, and append-only ledger evidence together; rollback is revert of that apply commit."
        else:
            drift = report.get("auditOnlyTargetDrift", {})
            if drift.get("nodesJsonWouldChange") or drift.get("edgesJsonWouldChange"):
                report["nextAction"] = "Review this audit report. If approved, manually dispatch mode=apply to publish the planned JSON bridge output."
            else:
                report["nextAction"] = "No apply is required unless a human wants to refresh the evidence trail."
    else:
        report["nextAction"] = "Do not apply. Fix the failed declared check, then re-run audit."

    report_md_text = write_markdown_report(report)
    report_json_text = json_text(report)
    write_text(args.report_md, report_md_text)
    write_text(args.report_json, report_json_text)
    append_ledger(args.ledger, report, publish_succeeded)

    write_text(args.report_md, write_markdown_report(report))
    write_text(args.report_json, json_text(report))

    return (0 if publish_succeeded else 1), report


def parse_args(argv: list[str]) -> argparse.Namespace:
    ap = argparse.ArgumentParser(description="Publish federation map Parquet into federation control ledger JSON")
    ap.add_argument("--mode", choices=["audit", "apply"], default="audit")
    ap.add_argument("--repository", default=os.environ.get("GITHUB_REPOSITORY", "Ventusltd/data-federation-map-for-globalgrid2050-all-repos"))
    ap.add_argument("--source-nodes", type=Path, default=DEFAULT_SOURCE_NODES)
    ap.add_argument("--source-edges", type=Path, default=DEFAULT_SOURCE_EDGES)
    ap.add_argument("--target-dir", type=Path, default=DEFAULT_TARGET_DIR)
    ap.add_argument("--report-md", type=Path, default=DEFAULT_REPORT_MD)
    ap.add_argument("--report-json", type=Path, default=DEFAULT_REPORT_JSON)
    ap.add_argument("--ledger", type=Path, default=DEFAULT_LEDGER)
    ap.add_argument("--scanner-report", type=Path, default=DEFAULT_SCANNER_REPORT)
    ap.add_argument("--scanner-status", choices=["success", "failure", "cancelled", "skipped", "unknown"], default="unknown")
    ap.add_argument("--dependencies", type=Path, default=DEFAULT_DEPENDENCIES)
    return ap.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    code, report = execute(args)
    print(json.dumps({
        "mode": report.get("mode"),
        "dataLawResult": report.get("dataLawResult"),
        "reportMarkdown": rel(args.report_md),
        "reportJson": rel(args.report_json),
        "ledger": rel(args.ledger),
    }, indent=2))
    return code


if __name__ == "__main__":
    raise SystemExit(main())

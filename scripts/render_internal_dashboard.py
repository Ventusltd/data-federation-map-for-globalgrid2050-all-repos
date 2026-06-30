#!/usr/bin/env python3
from __future__ import annotations

import datetime as dt
import html
import json
from pathlib import Path

import duckdb

ROOT = Path(__file__).resolve().parents[1]
MAP = ROOT / "data/federation_map/current"
REPORT_JSON = ROOT / "reports/json/FEDERATION_MAP_LATEST.json"
OUT = ROOT / "internal_dashboard"
METHOD_VERSION = "internal_dashboard_v1_static_duckdb"


def utcnow() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z")


def sql_path(path: Path) -> str:
    return str(path).replace("'", "''")


def load_latest_report() -> dict:
    if REPORT_JSON.exists():
        return json.loads(REPORT_JSON.read_text(encoding="utf-8"))
    return {}


def colour_for_repo(repo_type: str, status: str, files: str) -> tuple[str, list[str]]:
    reasons: list[str] = []
    colour = "green"
    if "README.md" not in files:
        colour = "red"
        reasons.append("README missing")
    if repo_type == "data" and "DATA_CONTRACT.md" not in files:
        colour = "red"
        reasons.append("data contract missing")
    if ".github/workflows/" not in files:
        if colour != "red":
            colour = "amber"
        reasons.append("workflow missing")
    if "federation.yaml" not in files and "federation.yml" not in files:
        if colour == "green":
            colour = "amber"
        reasons.append("federation manifest missing")
    if status == "archived":
        colour = "blue"
        reasons.append("archived")
    if not reasons:
        reasons.append("v1 evidence complete")
    return colour, reasons


def build_payload() -> dict:
    nodes_path = MAP / "nodes.parquet"
    edges_path = MAP / "edges.parquet"
    if not nodes_path.exists():
        raise FileNotFoundError(nodes_path)
    if not edges_path.exists():
        raise FileNotFoundError(edges_path)

    con = duckdb.connect()
    nodes = sql_path(nodes_path)
    edges = sql_path(edges_path)
    node_rows = con.execute(f"SELECT count(*) FROM read_parquet('{nodes}')").fetchone()[0]
    edge_rows = con.execute(f"SELECT count(*) FROM read_parquet('{edges}')").fetchone()[0]
    type_rows = con.execute(f"SELECT coalesce(repoType,'unknown'), count(*) FROM read_parquet('{nodes}') GROUP BY 1 ORDER BY 2 DESC, 1").fetchall()
    edge_type_rows = con.execute(f"SELECT coalesce(edgeType,'unknown'), count(*) FROM read_parquet('{edges}') GROUP BY 1 ORDER BY 2 DESC, 1").fetchall()
    repo_rows = con.execute(f"""
        SELECT nodeId, repoName, repoType, status, visibility, defaultBranch, canonicalFilesPresent, description, htmlUrl
        FROM read_parquet('{nodes}')
        WHERE nodeKind='github_repo'
        ORDER BY repoType, repoName
    """).fetchall()

    repos = []
    colour_counts: dict[str, int] = {}
    for row in repo_rows:
        node_id, repo_name, repo_type, status, visibility, default_branch, files, description, url = row
        files = files or ""
        colour, reasons = colour_for_repo(repo_type or "unknown", status or "unknown", files)
        colour_counts[colour] = colour_counts.get(colour, 0) + 1
        repos.append({
            "nodeId": node_id,
            "repoName": repo_name,
            "repoType": repo_type or "unknown",
            "status": status or "unknown",
            "visibility": visibility or "unknown",
            "defaultBranch": default_branch or "",
            "colour": colour,
            "reasons": reasons,
            "description": description or "",
            "htmlUrl": url or "",
        })

    return {
        "schemaVersion": "globalgrid2050.internal_dashboard.v1",
        "generatedUTC": utcnow(),
        "methodVersion": METHOD_VERSION,
        "summary": {
            "nodeRows": int(node_rows),
            "edgeRows": int(edge_rows),
            "repoCount": len(repos),
            "colourCounts": colour_counts,
            "repoTypes": [{"repoType": a, "count": int(b)} for a, b in type_rows],
            "edgeTypes": [{"edgeType": a, "count": int(b)} for a, b in edge_type_rows],
        },
        "repos": repos,
        "latestReport": load_latest_report(),
    }


def render_html(payload: dict) -> str:
    colour_order = ["red", "amber", "grey", "blue", "green"]
    cards = []
    cards.append(("Repos", payload["summary"]["repoCount"]))
    cards.append(("Nodes", payload["summary"]["nodeRows"]))
    cards.append(("Edges", payload["summary"]["edgeRows"]))
    for colour in colour_order:
        cards.append((colour.upper(), payload["summary"]["colourCounts"].get(colour, 0)))

    rows = []
    for repo in payload["repos"]:
        rows.append(
            "<tr>"
            f"<td class='{html.escape(repo['colour'])}'>{html.escape(repo['colour'].upper())}</td>"
            f"<td><a href='{html.escape(repo['htmlUrl'])}'>{html.escape(repo['nodeId'])}</a></td>"
            f"<td>{html.escape(repo['repoType'])}</td>"
            f"<td>{html.escape('; '.join(repo['reasons']))}</td>"
            f"<td>{html.escape(repo['description'])}</td>"
            "</tr>"
        )

    card_html = "\n".join(f"<div class='card'><div class='value'>{value}</div><div class='label'>{html.escape(label)}</div></div>" for label, value in cards)
    table_html = "\n".join(rows)
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>GlobalGrid2050 Federation Control Ledger</title>
<style>
body {{ margin:0; font-family:system-ui, sans-serif; background:#071019; color:#eef6ff; }}
header {{ padding:24px; background:#0b1724; border-bottom:1px solid #20354b; }}
main {{ padding:20px; }}
h1 {{ margin:0 0 8px; font-size:24px; }}
.small {{ color:#aab9c8; font-size:13px; }}
.cards {{ display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:12px; margin-bottom:22px; }}
.card {{ background:#0c1825; border:1px solid #263d55; border-radius:10px; padding:14px; }}
.value {{ font-size:26px; font-weight:800; }}
.label {{ color:#aab9c8; font-size:12px; letter-spacing:.08em; }}
table {{ width:100%; border-collapse:collapse; font-size:13px; }}
th, td {{ padding:8px; border-bottom:1px solid #20354b; vertical-align:top; }}
th {{ text-align:left; color:#b9cadb; }}
a {{ color:#8ac5ff; }}
.green {{ color:#45d483; font-weight:800; }}
.amber {{ color:#ffcc4d; font-weight:800; }}
.red {{ color:#ff6b6b; font-weight:800; }}
.grey {{ color:#9aa7b4; font-weight:800; }}
.blue {{ color:#65a9ff; font-weight:800; }}
</style>
</head>
<body>
<header>
<h1>GlobalGrid2050 Federation Control Ledger</h1>
<div class="small">Internal static visibility surface generated from DuckDB-verified Parquet.</div>
<div class="small">Generated UTC: {html.escape(payload['generatedUTC'])}</div>
</header>
<main>
<section class="cards">{card_html}</section>
<table>
<thead><tr><th>Status</th><th>Repo</th><th>Type</th><th>Reasons</th><th>Description</th></tr></thead>
<tbody>{table_html}</tbody>
</table>
</main>
</body>
</html>
"""


def main() -> int:
    payload = build_payload()
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "federation_dashboard.json").write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    (OUT / "index.html").write_text(render_html(payload), encoding="utf-8")
    print(json.dumps({"generatedUTC": payload["generatedUTC"], "repoCount": payload["summary"]["repoCount"]}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

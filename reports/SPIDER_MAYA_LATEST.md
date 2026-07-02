# Spider Maya Latest

Schema version: `1.0`
Generated UTC: `2026-07-02T11:55:47Z`
Method version: `spider_maya_audit_process_v2`
Mode: `audit`
Commit SHA: `e7f36063f2d84dfb88ffc0d0543560d3e4aee6df`

## Purpose

Audit whether the Spider Maya solar-gold illumination layer exists, is declared in Spider DNA, and is wired into the Spider Sandbox without changing target UI files.

## Declared checks

| Check | Result | Detail |
|---|---:|---|
| `mode_is_audit_or_process` | PASS | mode=audit |
| `spider_html_exists` | PASS | dashboard/federation_radial.html |
| `spider_css_exists` | PASS | dashboard/federation_radial.css |
| `solar_glint_dna_exists` | PASS | ventus_spider_dna_study/spider_solar_glint.md |
| `html_links_spider_maya_stylesheet` | PASS | dashboard/federation_radial.html should load dashboard/federation_radial.css |
| `solar_gold_tokens_present` | PASS | missing=[] |
| `tiny_glint_beam_present` | PASS | CSS should include a tiny solar-gold glint beam on the Spider control |
| `snapshot_truth_tag_still_present` | PASS | Spider must still declare snapshot/live state |
| `solar_glint_dna_row_declared` | PASS | missing=[] |

## Warnings

- Inline base style still exists in federation_radial.html. This workflow only checks the new Spider Maya stylesheet and link path; full CSS extraction can be a later cleanup.

## Data-law result

`PASS`

## Rollback method

Revert the commit that changes dashboard/federation_radial.html, dashboard/federation_radial.css, or ventus_spider_dna_study/spider_solar_glint.md.

## Next action

If FAIL, read the failed checks and correct only the Spider Maya visual wiring before re-running audit.

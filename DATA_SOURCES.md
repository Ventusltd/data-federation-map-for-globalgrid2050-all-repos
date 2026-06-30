# DATA_SOURCES.md

Status: active source register.

## GitHub metadata

Primary source: GitHub REST API for `Ventusltd` repositories.

The scanner lists repositories, records metadata, and probes only small canonical files.

## Canonical files probed

```text
README.md
anchor_AI_MUST_READ.md
DATA_SOURCES.md
DATA_CONTRACT.md
DEPENDENCIES.md
IMPLEMENTATION.md
CHANGELOG.md
package.json
pyproject.toml
requirements.txt
.github/workflows/*.yml
.github/workflows/*.yaml
```

These files are used as evidence for repo role and dependency edges.

## Doctrine source

The governing doctrine is in:

```text
Ventusltd/globalgrid2050-hompage
```

Key files:

```text
anchor_AI_MUST_READ.md
docs/DATA_DISCIPLINE_MANUAL.md
docs/FEDERATION_INSTRUCTION_MANUAL.md
```

## Non-source rule

The scanner does not clone every repo and does not scan every file. It uses metadata, canonical file probes and future manifests.

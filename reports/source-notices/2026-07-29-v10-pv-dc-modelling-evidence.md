# Source Notice — V10 PV DC Modelling Evidence Update

Status: declared source notice only. This notice does not mutate the federation Parquet truth store, infer a dependency edge, or alter the Spider UI.

Date: 29 July 2026

Source repository: `Ventusltd/solar-electrical-topology-analysis-engine-text-based`

Source commit: `58759fb7b2b9f15ab31f8d2adbaee3e3a4a7fa43`

Source path: `v10-development/research/2026_PV_DC_MODELLING_FACT_CHECK.md`

## Declared change

The V10 workstream now contains a fact-checked evidence note covering the most important 2026 and 2026-relevant PV DC modelling developments. The note distinguishes verified primary-source findings, corrections to overstated claims, unresolved standards questions and required V10 implementation consequences.

The principal corrections are:

- IEC 62548-1:2023+AMD1:2025 is the current consolidated Edition 1.1, but public IEC evidence does not establish that bifacial K_I, anti-PID and arc-flash content were first introduced by AMD1; the original 2023 product page already lists those topics.
- PV conductor-loop geometry and capacitance-to-earth estimation have direct standards-facing relevance, but the engine must not invent a universal loop-area limit or an unsupported wet-capacitance multiplier.
- Common-mode leakage, PID RC modelling, wet insulation degradation, hybrid PEEC–MTL lightning research, DC arc research and PV fire statistics have been classified by applicability and evidence strength.
- The accessible primary fire-statistics abstract confirms DC cables/connectors as the most frequently identified Swedish ignition source but does not establish an exact universal 25% share.

## Federation handling

This notice declares that the source repository gained a material technical evidence document. It is not itself permission to create or modify a federation edge. The next authorised federation scanner audit should discover the new source commit and determine whether an existing repository node, evidence path or declared dependency record requires refresh. Apply remains human-gated under the federation audit/apply discipline.

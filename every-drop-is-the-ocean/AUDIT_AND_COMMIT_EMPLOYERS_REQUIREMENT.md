# Audit and Commit Employer's Requirement

Derived from a deep study of Ventusltd/globalgrid2050, the retiring monolith: 4,215 commits, 215 workflows, 357 Python scripts, 99 gridbot scripts, 167 paired audit reports.
Commit location: every-drop-is-the-ocean/AUDIT_AND_COMMIT_EMPLOYERS_REQUIREMENT.md
Status: binding employer's requirement. Every federated repo and every workflow obeys this. Owner and approver: Vikram Kumar, Ventus Ltd. Executor: ChatGPT. Independent auditor: Claude.

## 0. What the monolith proved

The monolith was not undisciplined. It contained a real, working audit-then-apply method, proven across 41 dual-mode workflows, with 65 audit commits against only 33 apply commits, a roughly two-to-one ratio, meaning most things were audited and found to need no change, which is the discipline working. It even documented its own law in README_GRIDBOT_AUDIT_WORKFLOWS.md. What made the monolith unreasonable was not the audit method but the sprawl around it: 215 workflows and thousands of unattended auto-commits firing many times an hour. The federation keeps the proven method and refuses the sprawl. This requirement is that proven method extracted, hardened, and made law.

## 1. The audit-then-apply law

1.1 Every workflow that changes code, data, UI, or structure must support two modes, audit and apply, where practical. Audit is the default. Apply never runs by accident.

1.2 Audit mode reads and computes and writes a report only. It changes no target files. It never silently applies.

1.3 Apply mode makes the target change, and only after an audit has been run and reviewed.

1.4 The script, not just the workflow, must enforce this. The script builds its full plan in both modes, but only writes target files when the apply flag is set. Proven monolith pattern: build the plan always, write target files only under apply, always write the report, return success only if all checks pass.

## 2. Required workflow inputs

2.1 mode, a choice input, allowed values audit and apply, default audit.

2.2 commit_reports, a choice input, allowed values true and false.

2.3 Any operational bounds the job needs, for example a maximum output size, as explicit inputs with safe defaults.

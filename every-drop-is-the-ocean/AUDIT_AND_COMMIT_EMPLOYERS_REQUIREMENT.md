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

## 3. Required trigger and permissions

3.1 workflow_dispatch. Manual or scheduled dispatch only. No on-push automation. No unattended hourly auto-commit. The monolith's 215 workflows are now all manual dispatch and only one retains a schedule. The federation keeps that restraint.

3.2 The narrowest permissions that work. Patch and documentation workflows normally need contents write and nothing more.

3.3 A concurrency group per workflow, cancel-in-progress false, so two runs never collide.

3.4 Checkout with fetch-depth zero where commit evidence is needed. Sync latest before processing. Use the build token where follow-on workflows or pages must be triggered.

## 4. Required behaviour, the report and the gate

4.1 Every run writes a report in two forms, a human-readable markdown and a machine-readable json, as a matched pair, to a fixed reports location with a stable LATEST name.

4.2 The report records: the mode, the repository, the route or target, the source audit numbers, the declared checks and their pass or fail, the planned changed files, the actually changed files in apply, the data law result, and the next action.

4.3 Reports are uploaded as artifacts on every run, success or failure, with if always.

4.4 Reports commit separately from code. In audit mode the commit contains the script, the workflow, and the report only, never target changes. In apply mode the commit contains the target changes and the report. The evidence trail and the change trail are deliberately separate. This separation is the single most important discipline the monolith proved.

4.5 The commit step checks for staged changes first and does nothing if there are none. No empty commits.

## 5. The declared-checks law, proof not appearance

5.1 Every workflow declares its checks as explicit pass-or-fail tests, and the run returns success only if all checks pass. Build the report, set pass to all-checks-true, exit non-zero if any check fails.

5.2 The checks test the real data law on the real key. For data products: total rows equal distinct declared-key rows, zero null keys, declared invariants hold, reconciliation against the oracle within tolerance. For structure: endpoints resolve, schemas validate.

5.3 Exact-equality assertions only on true invariants, the key, the schema, a settled canary. Floors and bands on growing quantities, row counts, file counts, megabytes. The monolith's hardcoded count tripwires that broke on legitimate growth are the proof of why. Never assert exact equality on a living quantity.

5.4 Green is not proof. A passing workflow is not proof. A committed report is not proof. The proof is the declared check on the declared key, and it must be independently reproducible from a clean clone.

## 6. Required naming and provenance

6.1 The workflow name matches the feature and the report title.

6.2 The workflow file name matches the script name.

6.3 The commit message includes the feature name and the mode, for example feature-name audit, feature-name apply. The monolith commit taxonomy proves this: gridbot commits carried the feature and the mode, audit and apply distinguished in the message.

6.4 Reports carry a schema version, a generated timestamp, the method version, and the direction or sign or label contract where the data has one. Provenance travels with the artifact.

6.5 Use conventional commit prefixes consistently, docs, build, data, fix, as the monolith's 571 docs and 355 gridbot commits show. One prefix vocabulary across the federation.

## 7. The rollback law

7.1 Every apply must be reversible. The report states the rollback method explicitly, normally revert the apply commit.

7.2 An apply that touches a target must not destroy the evidence needed to undo it. Existing files that are not the target are not edited. The monolith reference method states it plainly: revert the apply commit, existing aggregate files are not edited.

## 8. The separation-of-duties law

8.1 No assistant marks its own homework. The executor builds and runs audit and apply. The independent auditor clones read-only and re-tests the declared checks on the landed result. The human approves the scope and holds the apply trigger.

8.2 The audit a workflow runs on itself is the first line. The independent clone re-test is the second line. The monolith proved the first line alone lets shared-assumption bugs through. Both lines are required.

8.3 The independent auditor verifies from a clean clone, with independently written checks, never sharing the executor's validation code.

## 9. The seven-step change-control gate

9.1 Every change follows: one, audit reads current state, read only. Two, produce a data log of current state as the evidence baseline, committed as a report. Three, the executor writes the proposal as a draft scope. Four, the human reads and approves the scope, the gate. Five, the audit runs against the approved scope. Six, the executor checks the audit against the agreed scope and gives an executive summary. Seven, the final surgical commit, limited to the agreed files.

9.2 No direct commit that skips the gate. The monolith's thousands of unattended auto-commits are the anti-pattern this gate exists to prevent.

9.3 Reports commit separately from code at every step. Every repo keeps a DEPENDENCIES file updated at the final commit.

## 10. The data-acquisition exception, still audited

10.1 Where a data-science process acquires data, the parquet and DuckDB key-law governs the acquisition. But the decision to acquire and the proof of what landed both still pass through audit.

10.2 First audit whether the data already exists. If it does, wire to it, acquire nothing. If it does not, declare where the raw data comes from, which API, compare to how the monolith sourced it, and design the acquisition around the current discipline before fetching. Audit governs whether, the pipeline governs how.

## 11. The sprawl-prevention law

11.1 Keep a minimal workflow set per repo. The federation does not carry 215 workflows. Ideally a small number per repo, each proven, each audited, each independently verifiable.

11.2 No unattended commit without passing the same gate a human change would. No scheduled auto-commit that writes data without the declared checks turning the run red on breach.

11.3 Workflow proliferation is itself a violation. Before adding a workflow, ask whether an existing one should be extended. The monolith became unreasonable by accretion, not by any single bad workflow.

## 12. Definition of done for any workflow under this requirement

12.1 It has mode audit default and apply, and commit_reports.
12.2 It is workflow_dispatch, narrow permissions, a concurrency group.
12.3 It writes a paired md and json report to the fixed reports location, uploaded as an artifact on every run.
12.4 It commits reports separately from code, audit-mode commit carries no target changes, apply-mode commit carries target plus report.
12.5 Its script builds the plan in both modes and writes targets only under apply.
12.6 Its checks test the real law on the real key, exact-equality only on invariants, floors on growing quantities, and the run returns success only if all checks pass.
12.7 Its names match, feature to workflow to script, and its commit message carries feature and mode.
12.8 Its report states the rollback method.
12.9 The independent auditor can re-test its declared checks from a clean clone and reach the same pass or fail.

This requirement is the monolith's hard-won discipline, distilled. The method it proved is kept. The sprawl it suffered is refused. Audit before apply, report always, prove on the key, commit reports apart from code, no homework marked by its own author, and a minimal set of workflows each independently verifiable. One true drop before ocean-scale claims.

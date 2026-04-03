---
name: code-review-expert
description: "Senior engineer code review for git diffs, staged changes, pull requests, branches, commits, and modified files. Use when the user asks to review code, inspect a PR, audit a diff, check a patch, find bugs, spot regressions, assess security, evaluate architecture, judge merge readiness, or look for missing tests. Triggers include 'code review', 'review this PR', 'review current changes', 'check this diff', 'audit these commits', 'review my changes', 'check this commit', and 'look for bugs before merge'."
---

# Code Review Expert

Perform a structured, findings-first review of the requested change set. Default to review-only output. Do not implement fixes unless the user explicitly asks.

## Iron Laws

- Resolve the review scope before reading deeply.
- Ground every finding in evidence from the diff, surrounding code, or a concrete failure mode.
- Prioritize correctness, security, data integrity, concurrency, and missing tests over style.
- Keep summaries brief. Findings come first.
- If a concern is plausible but unproven, label it as an open question instead of a bug.

## Review Scope

Determine the target before starting the review:

1. Review the exact files or directories the user named, if any.
2. Review the exact commit, commit range, branch diff, or PR range if the user supplied one.
3. Review staged changes if the user explicitly says staged, index, or cached.
4. Otherwise, review the current working tree changes against `HEAD`.

If the repository has no diff in the requested scope, say exactly what was checked and ask whether to review staged changes, another branch, or a commit range.

Always load `references/review-flow.md` first. Load other references only when the change set needs them:

- Load `references/security-checklist.md` for auth, secrets, network, persistence, untrusted input, or concurrency risk.
- Load `references/code-quality-checklist.md` for correctness, error handling, performance, compatibility, or boundary conditions.
- Load `references/testing-checklist.md` whenever behavior changed, bugs were fixed, or public contracts moved.
- Load `references/solid-checklist.md` when abstractions, responsibilities, or module boundaries changed.
- Load `references/removal-plan.md` when you find dead code, stale flags, or safe-delete candidates.

## Workflow

Use this checklist while reviewing:

```text
Code Review Progress:

- [ ] Step 1: Resolve scope and diff shape
- [ ] Step 2: Build context around changed code
- [ ] Step 3: Triage high-risk paths first
- [ ] Step 4: Inspect for findings and missing tests
- [ ] Step 5: Write findings-first output
- [ ] Step 6: Confirm whether to implement fixes
```

## Step 1: Resolve Scope and Diff Shape

- Run the minimum git commands needed to confirm the review target, changed files, and diff size.
- Capture both `git status -sb` and a diff summary before diving into details.
- If the diff is large, group by feature or module, then review the highest-risk slice first.
- If unrelated changes are mixed together, separate findings by logical concern instead of file order.

## Step 2: Build Context Around Changed Code

- Identify the changed entry points, downstream calls, invariants, and shared state.
- Open nearby code when the diff alone is not enough to judge behavior.
- Check how the changed path is called, what assumptions it makes, and which contracts it exposes.
- Prefer targeted code search over broad file dumping.

## Step 3: Triage High-Risk Paths First

Start with code that can break production or violate trust:

- Authentication, authorization, tenancy, secrets, or externally reachable handlers
- Money movement, data writes, state machines, queues, retries, or idempotency
- Concurrency, caching, locking, background jobs, and distributed coordination
- Schema, API, validation, serialization, migrations, and backward compatibility

Only then spend time on lower-risk maintainability concerns.

## Step 4: Inspect for Findings and Missing Tests

For each risky area, ask:

- Can this produce an incorrect result, leak data, corrupt state, or fail under concurrency?
- Does the change preserve existing contracts and edge-case behavior?
- Is there enough validation, error handling, timeout logic, and cleanup?
- Are tests present for the changed behavior, and do they cover the important failure modes?

Flag missing tests when:

- A bug fix changes behavior but no regression test was added.
- A public API, schema, parser, validation rule, or conditional branch changed without coverage.
- A high-risk path changed but tests cover only the happy path.

## Severity Guide

| Level | Meaning | Typical outcome |
|---|---|---|
| `P0` | Security vulnerability, data loss, corrupt state, or correctness failure with immediate impact | Block merge |
| `P1` | Likely bug, serious regression, high-risk contract break, or exploitable weakness | Fix before merge |
| `P2` | Maintainability issue, missing coverage, weaker abstraction, or medium-risk edge case | Fix in this change or track immediately |
| `P3` | Small improvement, clarity issue, or non-blocking suggestion | Optional |

Do not inflate severity. If impact depends on an assumption you could not verify, use an open question instead of a `P0` or `P1`.

## Output Format

Present findings before any summary or change overview. Use this structure:

```markdown
## Findings

### P0
1. `[path/to/file.ext:line]` Short title
   Why it matters: concrete impact
   Evidence: behavior, scenario, or contract mismatch
   Suggested fix: smallest safe change

### P1
2. `[path/to/file.ext:line]` Short title

### P2
3. `[path/to/file.ext:line]` Short title

### P3
(optional)

## Open Questions
- Anything plausible but not proven

## What I Checked
- Brief scope summary, modules reviewed, and references used

## Residual Risks
- Anything not fully validated, such as migrations, runtime behavior, or missing benchmarks
```

If there are no findings, say so explicitly and still include:

- What scope was reviewed
- What categories were checked
- What was not verified
- Recommended follow-up tests, if any

## Next Step

After the review, stop and ask how to proceed:

1. Fix all findings
2. Fix only `P0` and `P1`
3. Fix selected items
4. Keep this as review-only

Do not start implementation until the user confirms.

## Anti-Patterns

- Do not lead with praise, high-level recap, or style comments.
- Do not invent line numbers, runtime behavior, or exploit paths you cannot support.
- Do not rewrite the user's code during the review unless they asked for fixes.
- Do not flood the user with low-value nits when higher-risk issues exist.
- Do not say "looks good" without naming what was actually checked.

## Resources

- `references/review-flow.md`: scope resolution, diff sizing, review order, and hotspot triage
- `references/security-checklist.md`: security, reliability, concurrency, and integrity review prompts
- `references/code-quality-checklist.md`: correctness, boundaries, performance, and compatibility prompts
- `references/testing-checklist.md`: test gap detection and regression coverage prompts
- `references/solid-checklist.md`: design, abstraction, and coupling prompts
- `references/removal-plan.md`: safe-delete and deprecation planning template

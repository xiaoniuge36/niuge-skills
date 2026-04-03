# Review Flow

Load this file first to decide what to inspect and in what order.

## 1. Resolve Scope

Pick the narrowest scope that matches the request:

| Request shape | Suggested commands |
|---|---|
| Current working tree | `git status -sb`, `git diff --stat`, `git diff` |
| Staged changes | `git status -sb`, `git diff --cached --stat`, `git diff --cached` |
| Specific commit | `git show --stat <commit>`, `git show <commit>` |
| Commit range | `git diff --stat <base>..<head>`, `git diff <base>..<head>` |
| Branch diff / PR-style review | `git diff --stat <base>...<head>`, `git diff <base>...<head>` |
| Specific files | add `-- <path>` to the diff command |

If the user did not specify a target, default to the current working tree diff against `HEAD`.

## 2. Size the Diff

Use the diff summary to choose the review strategy:

- Small diff: read all changed files directly.
- Medium diff: skim changed files, then read neighboring code for high-risk changes.
- Large diff: review by feature area or module, starting with the highest-risk files.

Large diff warning signs:

- More than ~500 changed lines
- Generated files mixed with source changes
- Infrastructure, schema, and application logic bundled together
- Refactor and behavior changes mixed in the same patch

## 3. Build Context

Before raising findings, confirm:

- Entry points into the changed path
- Shared state and side effects
- Existing contracts, validators, and error boundaries
- Callers, tests, and data ownership

Useful supporting commands:

- `rg "<symbol-or-endpoint>"`
- `git blame <file>`
- `git log -- <file>`
- `rg --files tests spec __tests__`

## 4. Review Order

Review in this order unless the user asks otherwise:

1. Security, auth, tenancy, secrets, untrusted input
2. Correctness, state transitions, money/data writes, race conditions
3. Public contracts, migrations, compatibility, validation
4. Missing tests and regression coverage
5. Architecture, coupling, and maintainability
6. Small suggestions

## 5. Risk Hotspots

Spend extra time on:

- Request handlers, controllers, RPC methods, jobs, queue consumers
- Payment, billing, credits, quotas, inventory, or counters
- Retries, background workers, distributed locks, caches, and webhooks
- Schema changes, serializers, DTOs, migrations, config defaults
- File uploads, template rendering, markdown/html rendering, shell execution
- Cleanup paths, rollback logic, and partial-failure handling

## 6. When to Downgrade to an Open Question

Use an open question instead of a bug when:

- The impact depends on hidden runtime configuration
- The diff suggests a risk, but the surrounding code likely handles it
- The line number is clear but the failure mode is not reproducible from code
- You need product intent to judge whether behavior is actually wrong

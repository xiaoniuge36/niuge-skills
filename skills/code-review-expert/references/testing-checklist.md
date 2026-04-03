# Testing Checklist

Use this file whenever code behavior changed, a bug was fixed, or an important path became more complex.

## Regression Coverage

- Bug fix landed without a test that fails before the fix and passes after it
- Changed branch logic has no targeted test for the new branch
- Edge case was mentioned in code comments or review notes but not encoded in tests
- Tests assert implementation details instead of the user-visible outcome

## Risk-Based Coverage

Prioritize tests for:

- Auth, permission, tenancy, or rate-limit decisions
- Data writes, retries, idempotency, queues, and background jobs
- Parsing, validation, serialization, migrations, and compatibility
- Time-based, locale-based, and concurrency-sensitive behavior
- Public APIs, CLI behavior, and contract-level outputs

## Coverage Smells

- Only happy-path tests on a high-risk change
- Snapshot update with no assertion on the new behavior
- Mock-heavy tests that no longer match production flow
- Integration behavior changed but only unit tests were updated
- Added fallback logic with no test for the primary failure path

## Useful Questions

- What test would have caught this issue before merge?
- If this code regresses in two months, which test will fail?
- Is the most important contract covered at the right level: unit, integration, or end-to-end?
- Are there missing tests for empty input, duplicate requests, retries, or partial failure?

## Suggested Follow-Up Language

Use wording like:

- "Add a regression test that reproduces the old failure mode."
- "The happy path is covered, but the invalid-input branch is still untested."
- "Because this changes a public contract, add at least one integration test at the boundary."

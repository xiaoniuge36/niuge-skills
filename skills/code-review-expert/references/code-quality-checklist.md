# Code Quality Checklist

Use this file for correctness, reliability, performance, and compatibility review.

## Correctness

- Conditional logic changed but one branch no longer enforces the old invariant
- Default values changed in a way that alters existing behavior silently
- Validation moved later, allowing bad state to enter the system first
- Error or result objects changed shape without updating callers
- Serialization, parsing, or formatting behavior changed without migration handling

## Error Handling

- Exceptions swallowed or only logged without caller-visible failure
- Broad catches masking the real source of failure
- Async work launched without awaiting, cancellation, or error propagation
- Retries added without idempotency or duplicate-work protection
- Cleanup, rollback, or finally logic missing on partial failure paths

## Boundary Conditions

- Null, undefined, empty string, empty collection, or zero-value handling changed
- Off-by-one behavior in loops, slicing, pagination, or date windows
- Unsafe assumptions about sort order, uniqueness, or presence of first/last items
- Unicode, locale, timezone, and whitespace behavior not preserved
- Numeric overflow, division by zero, rounding drift, or negative values not guarded

## Performance and Resource Use

- N+1 queries, per-item network calls, or repeated expensive parsing
- Sync I/O or CPU-heavy work added to hot request paths
- New caches without invalidation, scoping, or TTL rules
- Unbounded buffers, arrays, maps, or batch sizes
- Missing pagination, streaming, or backpressure for large result sets

## Compatibility

- API shape, config schema, event payload, or storage format changed
- Migration path missing for persisted data or cached values
- Feature flags or defaults changed without considering existing callers
- Logging, metrics, or alert names changed without updating dashboards/runbooks

## Observability

- New failure paths without logs, metrics, or enough debug context
- Noise added to logs without structure or actionability
- Important state changes happening without telemetry

## Questions to Ask

- What user-visible behavior changed here?
- What happens when dependencies fail or return unexpected data?
- How does this behave with empty, duplicate, or very large inputs?
- Does this change preserve existing contracts for current callers?

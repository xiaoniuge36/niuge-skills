# Removal Plan Template

Use this template when the review uncovers dead code, stale flags, unused abstractions, or deprecated paths.

## Safe Delete Now

Document:

- Location
- Evidence that the code is unused or fully replaced
- Risk of removal
- Minimal verification steps

Suggested wording:

- "Safe to remove now because no references remain and behavior is covered elsewhere."
- "Delete together with its tests, config, docs, and feature flag wiring."

## Defer With a Plan

Use this path when removal depends on rollout or coordination.

Document:

- Location
- Why removal is not yet safe
- Preconditions for deletion
- Consumer migration steps
- Validation and rollback plan

## Checklist Before Suggesting Removal

- Search the codebase for static references
- Consider reflection, configuration, or dynamic usage
- Check for API, SDK, or external consumer impact
- Verify telemetry, flags, or rollout state if relevant
- Mention tests and docs that should be updated together

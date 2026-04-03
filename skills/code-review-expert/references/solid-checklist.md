# SOLID and Design Checklist

Use this file when responsibilities, abstractions, interfaces, or module boundaries changed.

## Single Responsibility

- One module now owns unrelated concerns such as HTTP, persistence, and domain rules
- A function orchestrates too many unrelated steps to reason about safely
- A class changes for multiple reasons or coordinates multiple external systems directly

Ask:

- What is the single reason this module should change?
- Could one risky behavior be isolated without moving everything?

## Open/Closed

- A new variant requires editing the same branching logic in multiple places
- Core logic changed only to support one more case that should be pluggable
- Branch growth suggests a strategy, mapper, or policy object is missing

Ask:

- How would the next variant be added?
- Is this change making future changes cheaper or harder?

## Liskov and Contract Safety

- A subtype, implementation, or adapter weakens guarantees expected by callers
- Optional return values or silent no-ops replace a previously reliable contract
- Error behavior changed in one implementation but not others

Ask:

- Can callers treat all implementations the same way?
- Did this change weaken an established invariant?

## Interface Segregation

- A broad interface forces callers or implementations to depend on unrelated methods
- New optional parameters suggest multiple responsibilities are being bundled together
- A large DTO or request object contains many fields unused in most flows

Ask:

- Do all consumers need all of these inputs?
- Would a narrower boundary make misuse harder?

## Dependency Inversion

- Domain logic now depends directly on storage, framework, or transport details
- High-level rules are harder to test because concrete dependencies leak everywhere
- Shared business logic moved into controller or repository code

Ask:

- Can the policy be tested without real infrastructure?
- Is the dependency direction still pointing inward toward domain rules?

## Practical Refactor Heuristics

- Prefer smaller, evidence-backed refactors over sweeping rewrites
- Split by responsibility, not file length
- Preserve behavior first, then improve structure
- Mention a minimal next step when a full refactor is too large for the current change

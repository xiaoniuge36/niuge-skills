# Security Checklist

Use this checklist for code that handles untrusted input, secrets, privileges, persistence, external calls, or shared state.

## Input and Output Safety

- Unsafe HTML rendering, template injection, or direct DOM HTML assignment
- SQL, NoSQL, shell, GraphQL, or search-query injection through string interpolation
- User-controlled URLs or callbacks reaching internal systems without allowlists
- Path traversal through file names, archive extraction, or storage keys
- Unsafe object merging, prototype pollution, or unvalidated JSON structure

## Authentication and Authorization

- Missing auth guards on new routes, jobs, actions, or admin tools
- Trusting client-supplied user IDs, tenant IDs, roles, or permission flags
- Missing ownership or tenancy checks on read and write paths
- Privilege escalation through fallback logic, optional params, or debug modes
- Session, token, or API key handling that bypasses intended identity boundaries

## Secrets and Sensitive Data

- Secrets committed to code, tests, fixtures, config, logs, or examples
- Error messages or telemetry leaking PII, credentials, or internal topology
- Token material stored in plaintext where a reference or hash is expected
- Excessive request/response logging for sensitive endpoints

## External Calls and Dependency Risk

- Missing timeout, retry, cancellation, or circuit-breaker behavior
- SSRF risk through webhook targets, import URLs, or image fetchers
- Insecure defaults in third-party SDK configuration
- Unpinned or suspicious dependency additions

## Data Integrity and Concurrency

- Check-then-act races on balances, quotas, counters, or inventory
- Read-modify-write without transaction protection or optimistic locking
- Duplicate processing because idempotency keys or de-duplication are missing
- Shared mutable state without locking, atomic operations, or isolation
- Cache invalidation races, stale reads after writes, or missing version checks

## File, Archive, and Command Execution

- Shell commands built from user input
- Archive extraction without path sanitization
- Unsafe file type trust based only on extension
- Image/document processing pipelines that accept unbounded or malformed files

## Questions to Ask

- What happens if two requests hit this path at the same time?
- Can a low-privilege actor influence this code path?
- Does failure leave the system partially updated?
- Is any untrusted string reaching HTML, SQL, file paths, or shell commands?

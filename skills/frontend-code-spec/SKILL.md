---
name: frontend-code-spec
description: Frontend code spec / 前端代码规范 skill for writing, reviewing, refactoring, migrating, or tooling front-end projects against Alibaba f2e-spec conventions in JavaScript, TypeScript, React, Node.js, CSS, HTML, Git, changelog, Markdown, HTTP JSON API, ESLint, Stylelint, Prettier, Commitlint, Markdownlint, f2elint, or ali config compliance tasks. Triggers include 前端代码规范, 前端规范, 代码规约, 工程规约, 统一 lint, 阿里巴巴前端代码规范, 阿里前端规约, f2e-spec, f2elint.
---

# Frontend Code Spec (Alibaba f2e-spec)

## Overview

Use Alibaba's `alibaba/f2e-spec` as a practical front-end code standard, not as style trivia. Prefer automated tooling first, then use the human-readable spec to guide code generation, review, refactoring, and exceptions.

Source snapshot: `alibaba/f2e-spec` commit `beb1ac899ea6dab206331263bbcdcad8f8fe336e` from 2026-05-06. Upstream: https://github.com/alibaba/f2e-spec

This skill also incorporates useful trigger wording and concise checklist framing from `danchaofan869527/f2e-spec-skill`: https://github.com/danchaofan869527/f2e-spec-skill

## Source and Freshness

- Use the bundled `references/` files as the active execution source.
- Do not clone, pull, or import `alibaba/f2e-spec` or `danchaofan869527/f2e-spec-skill` during normal skill execution.
- Treat upstream `alibaba/f2e-spec` and https://alibaba.github.io/f2e-spec/ as the canonical source when the user asks for the latest/current rule text.
- Running `npx f2elint@latest` or equivalent package-manager commands may use newer npm packages than this snapshot; report that difference when recommending tooling.

## Workflow

1. Resolve the project shape before changing anything:
   - package manager and workspace layout
   - React / Vue / Node / library / docs-only scope
   - existing `eslint`, `stylelint`, `prettier`, `commitlint`, `markdownlint`, `lint-staged`, and Husky setup
   - **the project's own convention baseline**: read `.editorconfig`, existing lint/format configs, and the dominant naming/indentation/quote style already in the code. Treat that baseline as authoritative and layer f2e-spec on top — never overwrite a stricter or deliberate local rule.
2. Load only the narrowest reference for the task — do not read all three references on every run:
   - Pick relevant spec areas → [references/spec-index.md](references/spec-index.md)
   - Install or standardize tooling → [references/tool-adoption.md](references/tool-adoption.md)
   - Generate or review code → [references/review-checklist.md](references/review-checklist.md)
3. Prefer the repo's existing conventions when they are stricter or project-specific. Do not replace established local rules unless the user asked for Alibaba f2e-spec alignment.
4. Run the smallest relevant verification command available in the project. If tooling is not installed, report the exact missing tool and the recommended next command.

> **Vue scope caveat:** Upstream f2e-spec has no dedicated Vue coding spec, and `eslint-config-ali` ships only `base` and `react` presets — there is no official Vue preset. For Vue projects, apply the Common + JavaScript/TypeScript rules and extend `base` with the project's own Vue plugin, and call this out as an upstream gap rather than implying an official Vue ruleset exists.

## Decision Guide

| Task | Action |
|---|---|
| "接入阿里前端规约" / "统一 lint" | Inspect existing config, then recommend `f2elint` or manual config from `tool-adoption.md` |
| Generate JS/TS/React/Node/CSS/HTML | Apply `mandatory` rules from `spec-index.md`, then run lint/format/typecheck when available |
| Vue project (`.vue`) | No upstream Vue spec exists; apply Common + JS/TS rules, extend `eslint-config-ali` `base` with the project's Vue plugin, and flag the gap |
| Review current code for f2e-spec | Use `review-checklist.md`; report violations by file and severity |
| Refactor code to match f2e-spec | Preserve behavior, apply `mandatory` rules first, then clean `recommended` issues that reduce maintainability |
| Commit message / branch / changelog | Apply Git and changelog rules from `spec-index.md` |
| Markdown or docs polish | Apply writing and markdownlint rules; preserve project terminology |
| HTTP JSON API design | Apply success/error/pagination response conventions from `spec-index.md` |

## Tooling Policy

- Use `f2elint` for new adoption when the user wants the full Alibaba convention suite.
- Use individual packages when the repo already has custom lint wiring or the user wants a narrow change:
  - `eslint-config-ali`
  - `stylelint-config-ali`
  - `prettier-config-ali`
  - `commitlint-config-ali`
  - `markdownlint-config-ali`
- Do not add or upgrade dependencies without normal project-change approval. If dependency edits are out of scope, provide an adoption plan instead.
- For monorepos, configure the root with a base template and each app/package with its own matching template.

## Working With fe-codegen-workbench

This skill is the spec/compliance counterpart to the code-generation skill `fe-codegen-workbench`. When the user has generated front-end code with that workbench and asks for Alibaba-spec compliance — or the project already uses `*-config-ali` configs — run this skill as a post-generation compliance pass: apply `review-checklist.md`, then run the project's lint/format commands when available. Do not duplicate the workbench's generation work; only check and correct against f2e-spec.

## Compliance Priorities

Treat upstream `mandatory` rules as must-fix unless the project has an explicit documented exception. Treat `recommended` rules as strong guidance; flag them as P2/P3 unless they create correctness, security, accessibility, or maintainability risk.

Always watch for these high-impact violations:

- unsafe JavaScript: `eval`, `debugger`, accidental globals, unused variables, shadowing, broken `switch`, unsafe `for-in`
- TypeScript type safety gaps: `tslint` comments, invalid `void`, namespace/module misuse, optional-chain non-null assertions, missing interface/type member types
- React correctness: invalid Hook calls, missing Hook dependencies, undeclared components, deprecated lifecycle APIs, string refs, unsafe `target="_blank"`
- Node security: leaking error details, SQL injection, trusting user ID from query/cookie for sensitive data
- CSS/HTML correctness: invalid hex, duplicate selectors/properties, unknown units/properties, missing charset/title/lang/viewport, unescaped template input
- Engineering hygiene: non-conventional commits, malformed changelog, markdown spacing and punctuation issues

## Code Comments

When generating or refactoring code, add comments that explain non-obvious intent — the "why", not a restatement of the "what". This is a deliberate preference: prefer slightly more explanatory comments over bare code, especially around business rules, edge cases, and workarounds. Stay within f2e-spec comment rules: keep `TODO`/`FIXME` actionable, write comments in the project's dominant comment language, leave a space after `//`, and never ship commented-out code as a substitute for deletion or version control.

## Compliance Gate

Do not report the task as done until this gate passes. If any item cannot be satisfied, say so explicitly instead of implying full compliance:

- [ ] Every available checker was actually run (`f2elint` / `eslint` / `stylelint` / `prettier --check` / typecheck), with real output — not assumed.
- [ ] All `mandatory` violations are fixed, or each remaining one is listed as a documented, justified exception.
- [ ] Findings are classified `P0/P1/P2/P3`; no P0 is left open without an explicit decision.
- [ ] Project-local stricter rules were preserved (no local convention was silently overwritten by f2e-spec defaults).
- [ ] Missing tooling is named exactly, with the precise next command — never silently skipped.

## Output

When reporting compliance work, include:

- scope checked
- specs or tools applied
- exact commands run and results
- findings grouped as `P0/P1/P2/P3` when reviewing
- config files changed or recommended
- known exceptions and unverified areas

# Alibaba F2E Spec Index

Use this file to choose the narrowest relevant part of `alibaba/f2e-spec`. Do not load every upstream document unless the task explicitly asks for a full audit.

## Source

- Upstream: https://github.com/alibaba/f2e-spec
- Official docs: https://alibaba.github.io/f2e-spec/
- Community skill reference used for this project update: https://github.com/danchaofan869527/f2e-spec-skill
- Snapshot used for this skill: `beb1ac899ea6dab206331263bbcdcad8f8fe336e`
- Snapshot date: 2026-05-06
- License: MPL-2.0
- Freshness model: this file is a local snapshot. It does not update itself from either GitHub repository during skill execution.

## Spec Levels

| Level | Meaning in this skill |
|---|---|
| `mandatory` | Must follow unless the repo has an explicit stronger or conflicting documented rule |
| `recommended` | Strong guidance; flag in reviews when the cost/risk justifies it |
| `referenced` | Background guidance; use for judgment, not automatic blockers |

## Coding Specs

> **No Vue spec upstream:** f2e-spec covers JavaScript, TypeScript, React, Node, CSS, and HTML — there is no dedicated Vue coding spec. For `.vue` files, apply the Common + JavaScript/TypeScript rules below and rely on the project's own Vue lint plugin for template-level rules.

### Common

Use for every front-end code file:

- 2-space indentation
- 100-character preferred line width
- UTF-8 charset
- Keep a final newline at end of file.
- Do not start or end a code block with a blank line; use blank lines only to separate logical groups.

### JavaScript

Use for `.js`, `.jsx`, `.mjs`, `.cjs`, and JS embedded in templates:

- Use semicolons, single quotes, trailing commas in multiline ES6+ structures, and Egyptian braces.
- Use `const` by default, `let` only for reassignment, and do not use `var` or accidental globals.
- One variable per declaration; remove unused variables; avoid use before declaration, shadowing, and redeclaration.
- Prefer clear control flow: no nested ternaries, group mixed operators, `switch` cases must not fall through silently.
- Use strict equality (`===` / `!==`), template strings for interpolation, and object/array literals instead of constructors.
- Prefer destructuring, spread syntax, and object property/method shorthand when they improve readability.
- Keep imports at the top, do not duplicate imports from the same module, and prefer ES module syntax.
- Do not ship `eval`, `debugger`, unguarded `console`, `alert`, or assignments to readonly globals.
- Comments: prefer adding short comments that explain non-obvious intent (the "why"), especially for business rules, edge cases, and workarounds; keep `TODO`/`FIXME` actionable; leave a space after `//`; delete commented-out code instead of leaving it.
- File names use lowercase/kebab-case; variables/functions use camelCase; classes use PascalCase.

### TypeScript

Use for `.ts`, `.tsx`, declaration files, and typed config:

- TypeScript also follows the JavaScript spec.
- Keep function overloads adjacent.
- Use `as Type` assertions; avoid object-literal assertions unless `any`/`unknown` is intentional.
- Prefer `interface` for object shapes; use `;` member delimiters in `interface`/`type`.
- Avoid `tslint` comments, triple-slash imports, invalid `void`, namespace/module declarations, and non-null assertions after optional chaining.
- Avoid obvious type noise such as `const count: number = 1`.
- Use ES module `import` instead of `require` in TypeScript.
- Add descriptions to TypeScript directive comments such as `@ts-expect-error`.

### React

Use for `.jsx`, `.tsx`, React components, and Hook code:

- JSX uses 2-space indentation; JSX attributes use double quotes; JS strings still use single quotes.
- Multiline JSX is wrapped in parentheses; empty tags are self-closing; multiline props go one per line.
- Do not use undeclared components, duplicate props, invalid prop names, string refs, `findDOMNode`, mixins, deprecated lifecycle APIs, or `React.createElement` when JSX is available.
- Prefer function components when no class lifecycle/state is needed.
- Hooks must be called only at the top level of React functions or custom Hooks; custom Hook names start with `use`; declare Hook dependencies.
- Avoid `.bind()` in JSX props; avoid `this.state` inside `setState`.
- Use stable and unique keys for lists; avoid array index keys for dynamic lists.
- Avoid `dangerouslySetInnerHTML` unless the content is trusted or sanitized and the exception is documented.
- Use `memo`, `useMemo`, and `useCallback` only for real render or referential-stability needs.
- Add accessibility basics: `alt` for meaningful images, valid ARIA, non-empty links, `rel="noopener noreferrer"` with external `target="_blank"`.

### Node.js

Use for Node services, CLIs, middleware, and server-side rendering code:

- Follow JavaScript/TypeScript spec plus Node-specific runtime constraints.
- Do not expose detailed internal errors to clients.
- Hide or remove framework and technology stack identifiers where security-sensitive.
- Strictly validate JSONP origins if JSONP is unavoidable.
- Do not query or output sensitive data based only on user identifiers from query params or plaintext cookies.
- Prevent SQL injection with parameterized queries or trusted query builders.
- Prefer async error handling and predictable process shutdown behavior.

### CSS / Sass / Less

Use for `.css`, `.less`, `.scss`, `.sass`, miniapp styles, and style resources:

- End declarations with semicolons.
- Avoid invalid colors, duplicate selectors, duplicate properties, unknown properties, unknown units, empty comments, and empty sources.
- Keep selectors simple; avoid IDs for styling.
- Prefer short hex when equivalent.
- Use spaces inside comments.
- One declaration per single-line declaration block.
- Omit units for zero values unless required for custom properties.
- Less must not duplicate variable declarations.

### HTML

Use for HTML files, templates, and generated static pages:

- Start with lowercase HTML5 doctype.
- Have a single root `<html>` with `lang`, a single `<head>`, and a single `<body>`.
- Declare UTF-8 charset and viewport for responsive pages.
- Include exactly one meaningful `<title>`.
- Use lowercase tag names and double-quoted attributes.
- Do not include secrets in HTML comments.
- Prefer semantic elements and accessible markup.
- Escape untrusted user input in templates.

## Engineering Specs

### Git

Use when naming commits, branches, tags, or documenting workflow:

- Commit format: `<type>[scope]: <description>`.
- Preferred types: `feat`, `fix`, `docs`, `style`, `test`, `refactor`, `chore`, `revert`.
- Description uses present tense, imperative mood, no initial capitalization requirement, and no trailing punctuation.
- Branch examples: `feat/shopping-cart`, `fix/3012-crash-on-search`.
- Tags follow SemVer, usually with `v` prefix, e.g. `v1.2.3`.

### Changelog

Use when creating or reviewing release notes:

- File is `CHANGELOG.md` in the project root.
- Latest version appears first.
- Versions follow SemVer.
- Dates use `yyyy-MM-dd`.
- Sections group changes by type.

### Writing / Markdown

Use for README, docs, comments intended as docs, and changelog text:

- Add spaces between Chinese and English or numbers.
- Do not add spaces between full-width punctuation and surrounding characters.
- Use full-width punctuation in Chinese sentences.
- Use half-width punctuation in full English sentences and special names.
- Spell technical names consistently.
- Use `markdownlint-config-ali` when tool-based checks are required.

### HTTP JSON API

Use when designing or reviewing REST-like JSON APIs:

- API endpoint uses a dedicated subdomain or path; no `.json` suffix.
- Success body includes `success: true` and `data` as a JSON object.
- Failure body includes `success: false`, `code`, and `message`; optional `errors[]` can include `message` and `field`.
- Pagination requests include `currentPage` starting at 1 and `pageSize` greater than 0.
- Pagination responses include `data.data[]` and `data.total`; `currentPage` and `pageSize` are optional response echoes.

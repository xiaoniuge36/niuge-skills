# Review Checklist

Use this checklist for f2e-spec code generation, review, or migration verification.

## Scope

Record:

- files or diff reviewed
- project type: React / Vue / Node / library / docs
- tools detected: ESLint, Stylelint, Prettier, Commitlint, Markdownlint, f2elint
- commands run

## P0: Must Fix

- [ ] Code does not contain `eval`, `debugger`, accidental global writes, or assignments to readonly globals.
- [ ] Generated or changed TypeScript has no invalid `void`, namespace/module misuse, triple-slash imports, or optional-chain non-null assertions.
- [ ] React Hook calls are top-level and only inside React functions or custom Hooks.
- [ ] React code does not use undeclared components, string refs, deprecated lifecycle APIs, `findDOMNode`, or mixins.
- [ ] Node/API code does not expose sensitive error details, trust plaintext user IDs for sensitive data, or build SQL from untrusted input.
- [ ] HTML/templates escape untrusted user input and do not put secrets in comments.
- [ ] JSON API responses follow success/error shape when API contract is in scope.

## P1: Should Fix

- [ ] Semicolons, quotes, spacing, 2-space indentation, trailing commas, and import style match configured formatter/linter.
- [ ] `const`/`let` usage is correct; `var`, unused variables, and unused imports are removed.
- [ ] No variable shadowing, redeclaration, broken `switch` fallthrough, nested ternaries, or ambiguous mixed operators.
- [ ] Equality checks use `===` / `!==` unless loose equality is explicitly justified.
- [ ] Imports are top-level, deduplicated by module, and use ES module syntax where the project supports it.
- [ ] Type assertions use `as Type`; object shapes are typed with `interface` when appropriate.
- [ ] TypeScript directive comments include a reason; no stale `tslint` comments.
- [ ] JSX prop formatting, self-closing tags, double-quoted JSX attributes, and multiline JSX wrapping are correct.
- [ ] React `target="_blank"` external links include `rel="noopener noreferrer"`.
- [ ] React list keys are stable and unique; array index keys are used only for truly static lists.
- [ ] CSS has no invalid hex, duplicate selectors/properties, unknown units/properties, empty comments, or ID-heavy styling.
- [ ] HTML has doctype, `lang`, UTF-8 charset, viewport when responsive, and one meaningful title.

## P2: Strong Recommendation

- [ ] Lines are readable around the 100-character guideline.
- [ ] Functions, files, and components are split before they become hard to maintain.
- [ ] React function components are preferred where class components add no value.
- [ ] Hook dependencies are complete, or exceptions are documented.
- [ ] Plain JavaScript React components have useful `propTypes` or an equivalent documented validation strategy; TypeScript components use explicit props types.
- [ ] Accessibility basics are present: meaningful `alt`, valid ARIA, accessible anchors, iframe title.
- [ ] Commit messages and branch names follow f2e-spec Git guidance.
- [ ] Changelog entries are reverse-chronological, SemVer-based, and dated as `yyyy-MM-dd`.
- [ ] Chinese/English/number spacing and punctuation follow writing spec.

## P3: Optional / Contextual

- [ ] Naming conventions are consistent: kebab-case files, camelCase values/functions, PascalCase classes/components/types.
- [ ] Comments explain intent and remove dead code instead of preserving commented blocks.
- [ ] Project-specific stricter rules are documented where they intentionally differ from f2e-spec.

## Report Template

```markdown
## Alibaba F2E Spec Review

### Scope
- ...

### Commands
- `...` -> ...

### Findings
#### P0
- ...

#### P1
- ...

#### P2
- ...

#### P3
- ...

### Exceptions
- ...

### Next Step
- ...
```

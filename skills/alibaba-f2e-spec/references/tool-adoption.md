# Tool Adoption

Use this file when the task is to install, migrate, or recommend tooling for Alibaba f2e-spec compliance.

## Default Path: f2elint

Use `f2elint` when the user wants a broad, standard Alibaba F2E setup.

```bash
npx f2elint@latest
```

Equivalent package-manager variants:

```bash
pnpm dlx f2elint@latest
tnpx f2elint@latest
```

Before running it in a real repo:

1. Inspect existing lint/format configs and scripts.
2. Check whether the user allowed dependency/config changes.
3. Confirm monorepo root vs package/app directory.
4. Run in the narrowest correct directory.

## Monorepo Strategy

For a repo with multiple apps/packages:

1. Run `f2elint` at the repository root and choose a base template.
2. Run `f2elint` in each app/package and choose its matching template, such as React or Base.
3. Avoid duplicating root-level `lint-staged` and `commitlint` inside every child package unless the repo already does that deliberately.

## Manual ESLint Setup

Use manual setup when the repo already has custom ESLint wiring or the user wants a narrow patch.

Install:

```bash
npm install --save-dev eslint@^9 eslint-config-ali
```

Base JavaScript/TypeScript `eslint.config.mjs`:

```js
import { base } from 'eslint-config-ali';

export default [...base];
```

React JavaScript/TypeScript `eslint.config.mjs`:

```js
import { react } from 'eslint-config-ali';

export default [...react];
```

Prefer merging with existing project overrides instead of deleting local rules.

## Manual Stylelint Setup

Install:

```bash
npm install --save-dev stylelint stylelint-config-ali
```

`stylelint.config.mjs`:

```js
/** @type {import('stylelint').Config} */
export default {
  extends: 'stylelint-config-ali',
};
```

The config supports CSS, Less, and SCSS. It ignores CSS-in-JS files by default.

## Manual Prettier Setup

Install:

```bash
npm install --save-dev prettier prettier-config-ali
```

`package.json`:

```json
{
  "prettier": "prettier-config-ali"
}
```

If the repo already has a Prettier config, compare before replacing it.

## Commitlint Setup

Prefer `f2elint` for commitlint installation. If manual setup is required, use `commitlint-config-ali` with the repo's existing Husky or git hook strategy.

Commit format:

```text
<type>[scope]: <description>
```

Common types: `feat`, `fix`, `docs`, `style`, `test`, `refactor`, `chore`, `revert`.

## Markdownlint Setup

Install:

```bash
npm install --save-dev markdownlint markdownlint-config-ali
```

`.markdownlint.json`:

```json
{
  "extends": "markdownlint-config-ali"
}
```

## Useful Scripts

Adapt names to the project:

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "stylelint": "stylelint \"**/*.{css,less,scss}\"",
    "stylelint:fix": "stylelint \"**/*.{css,less,scss}\" --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

Do not add scripts that duplicate existing names with different behavior without explaining the change.

## Version Notes

The upstream snapshot used for this skill includes:

| Package | Snapshot version |
|---|---:|
| `f2elint` | `7.0.0` |
| `eslint-config-ali` | `16.6.0` |
| `stylelint-config-ali` | `3.0.0` |
| `prettier-config-ali` | `1.5.0` |
| `commitlint-config-ali` | `1.4.0` |
| `markdownlint-config-ali` | `0.1.2` |

Before pinning exact versions in user projects, check the package manager lockfile and project policy. Use `@latest` only when the user accepts moving to current upstream.

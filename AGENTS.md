# AI Agent Guidelines

This repository ships package code, browser adapters, and a generated static documentation site. Work from the canonical sources and treat generated artifacts as build output.

## Source of truth

- Package code lives in `src/` and `resources/js/`.
- Static documentation source lives in `docs/md/`.
- Generated documentation output lives in `docs/*.html`, `docs/search-index.json`, `docs/sitemap.xml`, and `docs/.nojekyll`, and those files must never be edited manually.
- The documentation builder is `docs/build.php`, with layout and UI in `docs/template.php` and `docs/assets/`.
- All contributor and AI-agent guidance lives in this root `AGENTS.md`. Do not create or rely on nested `AGENTS.md` files for `docs/`.

## Required workflow

### Package code changes

1. Change the canonical PHP or JavaScript source.
2. Run the narrowest relevant tests first.
3. Run `composer test` before finishing a meaningful code change.
4. Rebuild docs when public behavior, configuration, or examples changed.

### Repository workflow changes

1. Update this root `AGENTS.md` when changing project structure, supported integrations, build or test commands, generated artifact locations, or documentation workflow.
2. Keep commands, paths, and workflow notes in sync with `composer.json`, `package.json`, and the current repository layout.

### Documentation changes

1. Edit Markdown files in `docs/md/`.
2. Run `php docs/build.php` or `composer docs:build`.
3. Verify the generated HTML, search index, and sitemap in `docs/`.
4. Commit the Markdown source and the regenerated output together.

### Documentation standards

1. Every page in `docs/md/` should include YAML frontmatter with at least `title`, `description`, `order`, and `slug`.
2. Use `##` and `###` headings so the builder can generate the table of contents.
3. Include at least one practical example and explain expected behavior, not just syntax.
4. Use fenced code blocks with a language whenever possible.
5. Do not add a top-level Markdown `# H1`; the template renders the page title from frontmatter.

### Internal documentation links

1. Use relative Markdown links such as `./installation.md` and `./usage.md#hooks`.
2. Only add heading fragments when the target heading is stable.
3. If you rename a heading, slug, or anchor, update every dependent link in the same change.

## Project overview

Laravel Client Validation converts Laravel validation rules into client-side behavior and supports Alpine.js, Livewire, Filament, vanilla JavaScript, React, and Vue flows. The repository also ships a generated static documentation site and an NPM package surface for browser adapters and core validators.

## Architecture

### PHP

- `src/Core/` contains rule parsing, validation context, and directive generation.
- `src/Contracts/` defines the service-layer interfaces.
- `src/Http/Controllers/` handles AJAX validation endpoints.
- `src/Livewire/` contains Livewire integration.
- `src/Filament/` contains Filament integration.

### JavaScript

- `resources/js/core/` contains `LaravelValidator`, `RuleRegistry`, `RemoteValidator`, and the individual rule implementations.
- `resources/js/adapters/` contains Alpine, vanilla, Livewire, React, and Vue adapters.
- `resources/js/index.js` and `resources/js/index.d.ts` are the main browser entry points.
- `package.json` exposes subpath exports such as `./core`, `./alpine`, `./vanilla`, `./livewire`, `./react`, and `./vue`.
- `resources/js/dist/` is generated output. Do not hand-edit it.

### Documentation system

- `docs/md/*.md` files are canonical and use YAML frontmatter.
- `docs/build.php` scans markdown, parses frontmatter, converts Markdown to HTML with `league/commonmark`, builds navigation and search metadata, and writes generated HTML, `.nojekyll`, `search-index.json`, and `sitemap.xml` into `docs/`.
- `.github/workflows/build-docs.yml` rebuilds and deploys the generated docs on pushes to `main`.

## Code style

### PHP

- Follow PSR-12.
- Target PHP 8.2+.
- Prefer straightforward typed code and small, readable changes.
- Run `composer pint` after PHP edits when formatting is needed.
- Run `composer analyse` when touching static-analysis-sensitive surfaces.

### JavaScript

- Use ES modules only.
- Keep the code in plain JavaScript with JSDoc where it adds clarity.
- Keep comments sparse and useful.
- Place each rule in its own file under `resources/js/core/rules/`.

### Rule function signature

All client-side validation rules must keep this signature:

```javascript
export default function ruleName(value, params, field, context = {}) {
    return boolean;
}
```

## Testing and validation commands

### PHP

```bash
composer test
composer test-coverage
composer analyse
composer format
```

### JavaScript

```bash
npm test
npm run test:coverage
npm run build
```

### Documentation

```bash
php docs/build.php
composer docs:build
```

## Common tasks

### Adding a new validation rule

1. Add the rule implementation in `resources/js/core/rules/`.
2. Export it from `resources/js/core/rules/index.js`.
3. Register the default message in `resources/js/core/RuleRegistry.js`.
4. Update the PHP parser or server-side rule lists when needed.
5. Add or update tests.
6. Document the new behavior in `docs/md/validation-rules.md` or a new markdown page.
7. Rebuild the generated docs.

### Extending validation behavior

- Use `LaravelClientValidation.extend()` or `RuleRegistry.extend()` for browser-side rules.
- Use `ClientValidation::extend()` when the rule must be registered with Laravel and treated as server-side by default.
- Document whether the rule is client-side, server-side, or shared.

## Files to avoid modifying directly

- `vendor/`
- `node_modules/`
- `resources/js/dist/`
- `build/`
- `docs/*.html`
- `docs/search-index.json`
- `docs/sitemap.xml`
- `docs/.nojekyll`

## Documentation guardrails

- Keep Markdown files in `docs/md/` as the canonical docs source.
- Use relative markdown links such as `./installation.md` or `./usage.md#hooks`.
- Avoid adding an `# H1` to docs pages. The template renders the page title from frontmatter.
- Keep frontmatter `title`, `description`, `order`, and `slug` accurate.
- `sidebar_label` is optional and should only be used when the sidebar text should differ from the page title.
- Do not rename slugs or anchors casually, because internal links, search results, and bookmarks depend on them.
- Never patch generated HTML to “fix” a docs issue. Change the Markdown, template, assets, or builder instead.
- Never edit generated docs files in `docs/` by hand. Rebuild them from `docs/md/` with `php docs/build.php` instead.
- Keep Markdown compatible with `league/commonmark` and GitHub-flavored Markdown.
- Remember that `.md` links are rewritten to `.html` during generation.
- Keep template, asset, and builder changes small and coordinated. If you change one, rebuild immediately.

## AI editing rules

- Do not rewrite unrelated sections while updating docs or examples.
- Do not remove practical examples to save space.
- Do not rename anchors or headings unless the change is intentional and linked references are updated.
- Do not break relative markdown links.
- Do not edit generated files by hand.
- Do not create a nested `docs/AGENTS.md`; keep agent guidance centralized in the root file.
- Prefer small, explainable changes over broad rewrites.

## Documentation style guide

- Use Laravel terminology where it matches the package API.
- Prefer practical examples over abstract descriptions.
- Keep tone direct, specific, and contributor-friendly.
- Match package reality. If an API is not implemented, do not document it as finished.
- Prefer stable wording that will not force unnecessary anchor churn.

## Validation documentation standards

When adding or expanding validation-rule documentation, include:

- purpose
- usage example
- supported data types
- edge cases
- example validation messages

If the rule is remote or depends on sibling fields, say so explicitly.

## Documentation review checklist

Before finishing a docs change, confirm:

1. Frontmatter is complete and accurate.
2. Links resolve correctly in Markdown form.
3. Code blocks use the correct language.
4. `php docs/build.php` completes successfully.
5. The generated output matches the Markdown source.

## Important patterns

### Client vs. server rules

- Client-side rules run entirely in the browser.
- Server-side rules use AJAX and depend on backend state or services.

### Error handling

- Validation rules should return `false` rather than throwing.
- Use meaningful default messages in `RuleRegistry`.
- Keep debugging output intentional and temporary.

### Event hooks

Validators emit the following hooks:

- `field:validating`
- `field:validated`
- `form:validating`
- `form:validated`

## Workground testing

The `/workground/` folder is gitignored and intended for real-application testing with a local Laravel app.

1. Build or refresh the local workbench app when needed.
2. Publish config and assets into the local app.
3. Exercise realistic forms, adapter behavior, and remote validation flows.

## Pull request guidance

1. Keep commits focused and atomic.
2. Run the relevant tests for the touched surface.
3. Rebuild docs whenever public behavior or docs Markdown changed.
4. Update `CHANGELOG.md` when the change is notable for users.
5. Update `AGENTS.md` when the change affects repository structure, commands, workflows, or contributor guidance.

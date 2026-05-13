---
title: Testing
description: Validate package changes with Pest, JavaScript tests, and the documentation builder before merging changes.
order: 14
slug: testing
---

Package changes are safest when you validate both the runtime behavior and the generated documentation in the same branch.

## PHP test suite

Run the Pest suite from the repository root:

```bash
composer test
```

Use coverage when you are working on package internals or parser behavior.

```bash
composer test-coverage
```

## JavaScript test suite

The frontend rules and adapters live in `resources/js`, so use the JavaScript suite when you change the browser runtime.

```bash
npm test
```

## Documentation build

The documentation site is generated from Markdown and committed as HTML output.

```bash
composer docs:build
```

That command runs `php docs/build.php`, regenerates the committed HTML files in `docs/`, refreshes the search index, and rewrites the sitemap.

## Recommended contributor loop

1. Update the package code or the Markdown source in `docs/md`.
2. Run the narrowest tests that can falsify the change.
3. Rebuild the documentation site with `composer docs:build`.
4. Inspect the generated HTML locally before opening a pull request.

## Practical verification examples

### Rule or parser change

```bash
composer test
npm test
composer docs:build
```

### Documentation-only change

```bash
composer docs:build
```

If the generated HTML or search index changes unexpectedly, compare the affected Markdown source rather than editing files in `docs/` by hand.

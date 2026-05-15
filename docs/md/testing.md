---
title: Testing
description: Validate package changes with Pest and JavaScript tests before merging updates.
order: 14
slug: testing
---

Package changes are safest when you validate both the PHP and browser runtime behavior in the same branch.

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

## Documentation changes

If you change Markdown pages, the docs template, or shared docs assets, follow the separate [documentation workflow](./documentation-workflow.md) so the generated site stays in sync.

## Recommended contributor loop

1. Update the package code or the relevant documentation.
2. Run the narrowest tests that can falsify the change.
3. Run any affected browser checks when a rule or adapter changes.
4. Inspect the changed behavior before opening a pull request.

## Practical verification examples

### Rule or parser change

```bash
composer test
npm test
```

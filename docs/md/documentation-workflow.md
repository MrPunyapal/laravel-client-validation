---
title: Documentation Workflow
description: Build and verify the generated documentation site from the Markdown source, template, and shared docs assets.
order: 15
slug: documentation-workflow
---

Use this page when you are changing the documentation source, the docs template, or the docs build process itself.

## What the builder reads

The docs builder assembles the site from three canonical inputs:

- Markdown pages in `docs/md`.
- The layout and navigation shell in `docs/template.php`.
- Shared frontend assets in `docs/assets`.

Each Markdown page should keep its frontmatter accurate so the builder can generate the correct title, description, sidebar label, and navigation order.

## How to rebuild the site

Run the Composer script from the repository root:

```bash
composer docs:build
```

You can also run the builder directly:

```bash
php docs/build.php
```

Both commands rebuild the checked-in documentation site.

## What the builder writes

After a successful build, the generated output is refreshed in `docs/`.

- Each Markdown page becomes a matching HTML page such as `docs/usage.html`.
- The search index is rewritten in `docs/search-index.json`.
- The sitemap is rewritten in `docs/sitemap.xml`.
- The GitHub Pages marker file is rewritten in `docs/.nojekyll`.

The builder also rewrites internal Markdown links like `./usage.md` to their generated `.html` targets and rebuilds the sidebar plus previous or next page navigation from frontmatter order.

## Practical example

### Updating a docs page

If you change `docs/md/usage.md`, rebuild the site before you finish the change:

```bash
composer docs:build
```

Expected result:

- `docs/usage.html` reflects the Markdown changes.
- Navigation and search metadata stay in sync with the updated page.

## Editing guidelines

- Edit the Markdown source, template, or assets rather than patching generated HTML by hand.
- Keep relative Markdown links in the `.md` form so the builder can rewrite them.
- Rebuild immediately after changing page order, slugs, headings, or internal links.

## Build failures

If the builder fails before rendering pages, install the repository dependencies first:

```bash
composer install
```

Then rerun the docs build command. For broader package validation after documentation changes, continue with the checks in [testing](./testing.md).
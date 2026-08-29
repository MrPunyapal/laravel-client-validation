---
title: Documentation Workflow
description: Build and verify the generated documentation site from the Markdown source using Docsmith.
order: 15
slug: documentation-workflow
---

Use this page when you are changing the documentation source, the docs template, or the docs build process itself.

## What the builder reads

The docs builder assembles the site from the canonical Markdown source:

- Markdown pages in `docs/md/`.
- Docsmith configuration in `build-docs.php` (site title, description, repository URL, sidebar, etc.).

Each Markdown page must keep its frontmatter accurate so the builder can generate the correct title, description, sidebar label, and navigation order.

## How to rebuild the site

Run the Composer script from the repository root:

```bash
composer docs:build
```

You can also run the builder directly:

```bash
php build-docs.php
```

Both commands rebuild the checked-in documentation site using Docsmith.

## What the builder writes

After a successful build, the generated output is refreshed in `docs/`:

- Each Markdown page becomes a matching HTML page under `docs/<slug>/index.html` (pretty URLs).
- The search index is rewritten in `docs/search-index.json`.
- The sitemap is rewritten in `docs/sitemap.xml`.
- The LLM export files are rewritten: `docs/llms.txt`, `docs/llms-full.txt`, `docs/export/docs.md`.
- The GitHub Pages marker file is rewritten in `docs/.nojekyll`.

The builder also rewrites internal Markdown links like `./usage.md` to their generated pretty URL targets and rebuilds the sidebar plus previous/next page navigation from frontmatter `order`.

## Practical example

### Updating a docs page

If you change `docs/md/usage.md`, rebuild the site before you finish the change:

```bash
composer docs:build
```

Expected result:

- `docs/usage/index.html` reflects the Markdown changes.
- Navigation and search metadata stay in sync with the updated page.

## Editing guidelines

- Edit the Markdown source in `docs/md/` rather than patching generated HTML by hand.
- Keep relative Markdown links in the `.md` form so the builder can rewrite them.
- Rebuild immediately after changing page order, slugs, headings, or internal links.
- Never edit files in `docs/` directly. They are generated output.

## Build failures

If the builder fails before rendering pages, install the repository dependencies first:

```bash
composer install
```

Then rerun the docs build command. For broader package validation after documentation changes, continue with the checks in [testing](./testing.md).

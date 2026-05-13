# Documentation Agent Guidelines

This file applies to the documentation system under `docs/`.

## Source of truth

- Markdown files in `docs/md/` are canonical.
- Generated HTML in `docs/generated/` is build output.
- Never edit generated HTML, `search-index.json`, `sitemap.xml`, or `.nojekyll` by hand.

## Required workflow

After updating documentation:

1. Update the Markdown source in `docs/md/`.
2. Run `php docs/build.php` or `composer docs:build`.
3. Verify the generated HTML in `docs/generated/`.
4. Commit the Markdown source and generated output together.

## Documentation standards

Every page in `docs/md/` should:

- include YAML frontmatter with at least `title`, `description`, `order`, and `slug`
- use `##` and `###` headings so the TOC can be generated
- include at least one practical example
- use fenced code blocks with a language whenever possible
- explain expected behavior, not just syntax
- prefer concise paragraphs over filler text

## Frontmatter conventions

- `title` becomes the page heading and sidebar label fallback
- `description` feeds search, SEO, and page intro text
- `order` controls sidebar ordering
- `slug` controls the generated HTML filename
- `sidebar_label` is optional when the sidebar title should differ from the page title

Do not add a top-level Markdown `# Heading` to documentation pages. The template renders the page title from frontmatter.

## Internal linking rules

- Use relative Markdown links between pages, for example `./installation.md`.
- Include heading fragments only when the target heading is stable.
- If you rename a heading that is linked elsewhere, update every dependent link in the same change.

## AI editing rules

AI agents must not:

- rewrite unrelated sections while fixing a local documentation issue
- remove examples unless the example is wrong and replaced with a correct one
- rename anchors or headings unnecessarily
- break internal links between markdown pages
- manually edit files in `docs/generated/`

## Style guide

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

## Builder-aware editing rules

- Keep content compatible with `league/commonmark` and GitHub-flavored Markdown.
- Remember that the builder extracts TOC entries from `##` and `###` headings.
- Remember that `.md` links are rewritten to `.html` during generation.
- Keep asset, template, and builder changes small and coordinated. If you change one, rebuild immediately.

## Review checklist

Before finishing a docs change, confirm:

1. Frontmatter is complete and accurate.
2. Links resolve correctly in Markdown form.
3. Code blocks use the correct language.
4. `php docs/build.php` completes successfully.
5. The generated output matches the Markdown source.

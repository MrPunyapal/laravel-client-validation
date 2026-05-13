<?php

declare(strict_types=1);

$escape = static fn (string $value): string => htmlspecialchars($value, ENT_QUOTES, 'UTF-8');

$metaDescription = $page['description'] !== '' ? $page['description'] : $page['excerpt'];
$documentTitle = $page['title'] === $site['name']
    ? $site['name'] . ' Docs'
    : $page['title'] . ' | ' . $site['name'];
$canonicalUrl = $page['canonical_url'];
$docsConfig = [
    'currentPage' => $page['url'],
    'rootPrefix' => $paths['root_prefix'],
    'searchIndexUrl' => $paths['search_index'],
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= $escape($documentTitle) ?></title>
    <meta name="description" content="<?= $escape($metaDescription) ?>">
    <?php if ($canonicalUrl !== ''): ?>
    <link rel="canonical" href="<?= $escape($canonicalUrl) ?>">
    <meta property="og:url" content="<?= $escape($canonicalUrl) ?>">
    <?php endif; ?>
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="<?= $escape($site['name']) ?>">
    <meta property="og:title" content="<?= $escape($documentTitle) ?>">
    <meta property="og:description" content="<?= $escape($metaDescription) ?>">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="theme-color" content="#f53003">
    <script>
        (() => {
            try {
                const savedTheme = window.localStorage.getItem('docs-theme');
                const preferredTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.dataset.theme = preferredTheme;
            } catch (error) {
                document.documentElement.dataset.theme = 'light';
            }
        })();
    </script>
    <link rel="stylesheet" href="<?= $escape($paths['styles']) ?>">
</head>
<body>
    <a class="docs-skip-link" href="#docs-content">Skip to content</a>
    <div class="docs-background" aria-hidden="true"></div>
    <header class="docs-header">
        <div class="docs-header__inner">
            <button class="docs-header__menu" type="button" data-sidebar-toggle aria-label="Toggle navigation">
                <span></span>
                <span></span>
                <span></span>
            </button>
            <a class="docs-brand" href="<?= $escape($paths['home']) ?>">
                <span class="docs-brand__copy">
                    <span class="docs-brand__eyebrow">Package for Laravel</span>
                    <span class="docs-brand__title"><?= $escape($site['name']) ?></span>
                </span>
            </a>
            <div class="docs-search">
                <label class="sr-only" for="docs-search-input">Search the documentation</label>
                <input id="docs-search-input" class="docs-search__input" type="search" placeholder="Search the docs" autocomplete="off" data-search-input>
                <div class="docs-search__results" data-search-results hidden></div>
            </div>
            <div class="docs-header__actions">
                <?php if ($site['repository_url'] !== ''): ?>
                <a class="docs-action-link" href="<?= $escape($site['repository_url']) ?>">GitHub</a>
                <?php endif; ?>
                <a class="docs-action-link" href="<?= $escape($site['packagist_url']) ?>">Packagist</a>
                <button class="docs-theme-toggle" type="button" data-theme-toggle aria-label="Toggle theme">
                    <span data-theme-label>Theme</span>
                </button>
            </div>
        </div>
    </header>

    <div class="docs-overlay" data-sidebar-overlay hidden></div>

    <div class="docs-shell">
        <aside class="docs-sidebar" data-sidebar>
            <div class="docs-sidebar__hero">
                <div>
                    <p class="docs-sidebar__label">Package for Laravel</p>
                    <h2><?= $escape($site['name']) ?></h2>
                    <p><?= $escape($site['tagline']) ?></p>
                </div>
                <div class="docs-badges">
                    <span class="docs-badge"><?= $escape($site['php_badge']) ?></span>
                    <span class="docs-badge"><?= $escape($site['laravel_badge']) ?></span>
                </div>
            </div>

            <p class="docs-nav__eyebrow">Browse</p>
            <nav class="docs-nav" aria-label="Documentation navigation">
                <?php foreach ($sidebarLinks as $item): ?>
                <a class="docs-nav__link<?= $item['active'] ? ' is-active' : '' ?>" href="<?= $escape($item['href']) ?>"<?= $item['active'] ? ' aria-current="page"' : '' ?>>
                    <?= $escape($item['title']) ?>
                </a>
                <?php endforeach; ?>
            </nav>
        </aside>

        <main class="docs-main">
            <?php if ($page['slug'] !== 'index'): ?>
            <nav class="docs-breadcrumbs" aria-label="Breadcrumbs">
                <?php foreach ($breadcrumbs as $index => $breadcrumb): ?>
                <?php if ($index > 0): ?>
                <span class="docs-breadcrumbs__separator">/</span>
                <?php endif; ?>
                <a href="<?= $escape($breadcrumb['href']) ?>"><?= $escape($breadcrumb['title']) ?></a>
                <?php endforeach; ?>
            </nav>
            <?php endif; ?>

            <article class="docs-content" id="docs-content" tabindex="-1">
                <header class="docs-content__header">
                    <?php if ($page['slug'] !== 'index'): ?>
                    <p class="docs-content__eyebrow">Documentation</p>
                    <?php endif; ?>
                    <h1><?= $escape($page['title']) ?></h1>
                    <p class="docs-content__lead"><?= $escape($metaDescription) ?></p>
                </header>

                <?php if ($page['toc'] !== []): ?>
                <details class="docs-mobile-toc">
                    <summary>On this page</summary>
                    <nav class="docs-mobile-toc__links" aria-label="On this page">
                        <?php foreach ($page['toc'] as $item): ?>
                        <a class="docs-toc__link docs-toc__link--level-<?= $item['level'] ?>" href="<?= $escape($item['href']) ?>"><?= $escape($item['title']) ?></a>
                        <?php endforeach; ?>
                    </nav>
                </details>
                <?php endif; ?>

                <?= $page['html'] ?>
            </article>

            <footer class="docs-footer">
                <div>
                    <p>Last updated <time datetime="<?= $escape($page['last_updated_iso']) ?>"><?= $escape($page['last_updated_human']) ?></time></p>
                    <p>Built <?= $escape($site['build_timestamp']) ?></p>
                </div>
                <div class="docs-footer__actions">
                    <?php if ($page['edit_url'] !== null): ?>
                    <a class="docs-action-link" href="<?= $escape($page['edit_url']) ?>">Edit this page</a>
                    <?php endif; ?>
                </div>
            </footer>

            <?php if ($neighbors['previous'] !== null || $neighbors['next'] !== null): ?>
            <nav class="docs-pager" aria-label="Page navigation">
                <?php if ($neighbors['previous'] !== null): ?>
                <a class="docs-pager__link" href="<?= $escape($neighbors['previous']['href']) ?>">
                    <span class="docs-pager__label">Previous</span>
                    <strong><?= $escape($neighbors['previous']['title']) ?></strong>
                </a>
                <?php else: ?>
                <span></span>
                <?php endif; ?>

                <?php if ($neighbors['next'] !== null): ?>
                <a class="docs-pager__link docs-pager__link--next" href="<?= $escape($neighbors['next']['href']) ?>">
                    <span class="docs-pager__label">Next</span>
                    <strong><?= $escape($neighbors['next']['title']) ?></strong>
                </a>
                <?php endif; ?>
            </nav>
            <?php endif; ?>
        </main>

        <?php if ($page['toc'] !== []): ?>
        <aside class="docs-toc" aria-label="On this page">
            <div class="docs-panel">
                <p class="docs-panel__eyebrow">On this page</p>
                <nav class="docs-toc__links">
                    <?php foreach ($page['toc'] as $item): ?>
                    <a class="docs-toc__link docs-toc__link--level-<?= $item['level'] ?>" href="<?= $escape($item['href']) ?>" data-toc-link>
                        <?= $escape($item['title']) ?>
                    </a>
                    <?php endforeach; ?>
                </nav>
            </div>
        </aside>
        <?php endif; ?>
    </div>

    <script>
        window.__DOCS_CONFIG__ = <?= json_encode($docsConfig, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_SLASHES) ?>;
    </script>
    <script defer src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-core.min.js"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-markup.min.js"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-markup-templating.min.js"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-clike.min.js"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-javascript.min.js"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-json.min.js"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-bash.min.js"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-php.min.js"></script>
    <script defer src="<?= $escape($paths['app']) ?>"></script>
</body>
</html>

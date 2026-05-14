<?php

declare(strict_types=1);

use League\CommonMark\Environment\Environment;
use League\CommonMark\Extension\CommonMark\CommonMarkCoreExtension;
use League\CommonMark\Extension\GithubFlavoredMarkdownExtension;
use League\CommonMark\Extension\HeadingPermalink\HeadingPermalinkExtension;
use League\CommonMark\MarkdownConverter;
use Symfony\Component\Yaml\Yaml;

$autoloadPath = __DIR__ . '/../vendor/autoload.php';

if (! is_file($autoloadPath)) {
    fwrite(STDERR, "Composer dependencies are missing. Run composer install before building docs.\n");
    exit(1);
}

require $autoloadPath;

final class DocsBuilder
{
    private const SOURCE_DIRECTORY = __DIR__ . '/md';

    private const OUTPUT_DIRECTORY = __DIR__;

    private const LEGACY_OUTPUT_DIRECTORY = __DIR__ . '/generated';

    private readonly MarkdownConverter $markdown;

    /** @var array<string, mixed> */
    private readonly array $composer;

    private readonly string $buildTimestamp;

    private readonly string $editBranch;

    private readonly string $repositoryUrl;

    private readonly string $siteName;

    private readonly string $siteUrl;

    private readonly string $tagline;

    public function __construct()
    {
        $this->composer = $this->loadComposerConfig();
        $this->repositoryUrl = rtrim((string) ($this->composer['support']['source'] ?? $this->composer['homepage'] ?? ''), '/');
        $this->siteUrl = $this->resolveSiteUrl();
        $this->siteName = 'Laravel Client Validation';
        $this->tagline = 'Client-side Laravel validation rules for Alpine, Livewire, Filament, and vanilla JavaScript.';
        $this->editBranch = getenv('DOCS_EDIT_BRANCH') ?: 'main';
        $this->buildTimestamp = (new DateTimeImmutable('now', new DateTimeZone('UTC')))->format(DATE_ATOM);
        $this->markdown = $this->makeMarkdownConverter();
    }

    public function build(): void
    {
        $pages = $this->loadPages();

        if ($pages === []) {
            throw new RuntimeException('No markdown pages were found in docs/md.');
        }

        usort($pages, [$this, 'sortPages']);

        $neighbors = $this->buildNeighbors($pages);

        $this->prepareOutputDirectory($pages);

        foreach ($pages as $page) {
            $this->writePage(
                $page,
                $pages,
                $neighbors[$page['slug']] ?? ['previous' => null, 'next' => null],
            );
        }

        $this->writeSearchIndex($pages);
        $this->writeSitemap($pages);
        $this->writeNoJekyll();

        fwrite(STDOUT, sprintf("Built %d documentation pages in %s\n", count($pages), self::OUTPUT_DIRECTORY));
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function loadPages(): array
    {
        $pages = [];
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator(self::SOURCE_DIRECTORY, FilesystemIterator::SKIP_DOTS),
        );

        foreach ($iterator as $file) {
            if (! $file instanceof SplFileInfo || strtolower($file->getExtension()) !== 'md') {
                continue;
            }

            $pages[] = $this->loadPage($file);
        }

        return $pages;
    }

    /**
     * @return array<string, mixed>
     */
    private function loadPage(SplFileInfo $file): array
    {
        $sourcePath = $file->getPathname();
        $rawMarkdown = file_get_contents($sourcePath);

        if ($rawMarkdown === false) {
            throw new RuntimeException(sprintf('Unable to read markdown file [%s].', $sourcePath));
        }

        [$frontMatter, $bodyMarkdown] = $this->extractFrontMatter($rawMarkdown);

        $title = $this->stringValue($frontMatter['title'] ?? null);
        if ($title === '') {
            $title = $this->titleFromFilename($file->getBasename('.md'));
        }

        $slug = trim($this->stringValue($frontMatter['slug'] ?? null), '/');
        if ($slug === '') {
            $slug = $file->getBasename('.md') === 'index'
                ? 'index'
                : $this->slugify($title);
        }

        $html = (string) $this->markdown->convert($bodyMarkdown);
        $processed = $this->processHtml($html);
        $description = $this->stringValue($frontMatter['description'] ?? null);

        return [
            'description' => $description,
            'excerpt' => $description !== '' ? $description : $this->excerptFromHtml($processed['html']),
            'headings' => $processed['headings'],
            'html' => $processed['html'],
            'order' => (int) ($frontMatter['order'] ?? 999),
            'sidebar_label' => $this->stringValue($frontMatter['sidebar_label'] ?? null) ?: $title,
            'slug' => $slug,
            'source_path' => $sourcePath,
            'source_relative_path' => $this->sourceRelativePath($sourcePath),
            'title' => $title,
            'updated_at' => (new DateTimeImmutable('@' . $file->getMTime()))->setTimezone(new DateTimeZone('UTC')),
            'url' => $slug === 'index' ? 'index.html' : $slug . '.html',
        ];
    }

    /**
     * @return array{0: array<string, mixed>, 1: string}
     */
    private function extractFrontMatter(string $markdown): array
    {
        $markdown = preg_replace('/^\xEF\xBB\xBF/', '', $markdown) ?? $markdown;

        if (! str_starts_with($markdown, "---\n") && ! str_starts_with($markdown, "---\r\n")) {
            return [[], $markdown];
        }

        if (! preg_match('/\A---\R(?P<yaml>.*?)(?:\R-{3,}[ \t]*\R)(?P<body>.*)\z/s', $markdown, $matches)) {
            return [[], $markdown];
        }

        $frontMatter = Yaml::parse($matches['yaml']) ?? [];

        if (! is_array($frontMatter)) {
            throw new RuntimeException('Frontmatter must parse to an associative array.');
        }

        return [$frontMatter, ltrim($matches['body'], "\r\n")];
    }

    private function makeMarkdownConverter(): MarkdownConverter
    {
        $environment = new Environment([
            'allow_unsafe_links' => false,
            'html_input' => 'strip',
            'max_nesting_level' => 20,
            'heading_permalink' => [
                'fragment_prefix' => '',
                'html_class' => 'heading-anchor',
                'id_prefix' => '',
                'insert' => 'after',
                'max_heading_level' => 3,
                'min_heading_level' => 2,
                'symbol' => '#',
            ],
        ]);

        $environment->addExtension(new CommonMarkCoreExtension());
        $environment->addExtension(new GithubFlavoredMarkdownExtension());
        $environment->addExtension(new HeadingPermalinkExtension());

        return new MarkdownConverter($environment);
    }

    /**
     * @return array{headings: array<int, array{id: string, level: int, title: string}>, html: string}
     */
    private function processHtml(string $html): array
    {
        $document = new DOMDocument('1.0', 'UTF-8');
        $previousErrors = libxml_use_internal_errors(true);

        try {
            $document->loadHTML(
                '<?xml encoding="utf-8" ?><div id="docs-fragment">' . $html . '</div>',
                LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD,
            );
        } finally {
            libxml_clear_errors();
            libxml_use_internal_errors($previousErrors);
        }

        $xpath = new DOMXPath($document);
        $this->rewriteMarkdownLinks($xpath);
        $headings = $this->extractHeadings($xpath);

        $root = $xpath->query('//*[@id="docs-fragment"]')->item(0);

        if (! $root instanceof DOMElement) {
            throw new RuntimeException('Unable to render the documentation fragment.');
        }

        $renderedHtml = '';

        foreach ($root->childNodes as $child) {
            $renderedHtml .= $document->saveHTML($child) ?: '';
        }

        return [
            'headings' => $headings,
            'html' => $renderedHtml,
        ];
    }

    private function rewriteMarkdownLinks(DOMXPath $xpath): void
    {
        foreach ($xpath->query('//*[@id="docs-fragment"]//a[@href]') as $link) {
            if (! $link instanceof DOMElement) {
                continue;
            }

            $href = trim($link->getAttribute('href'));

            if ($href === '' || preg_match('/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i', $href) === 1) {
                continue;
            }

            $rewritten = preg_replace('/\.md(?=($|[?#]))/i', '.html', $href, 1);

            if ($rewritten !== null && $rewritten !== $href) {
                $link->setAttribute('href', $rewritten);
            }
        }
    }

    /**
     * @return array<int, array{id: string, level: int, title: string}>
     */
    private function extractHeadings(DOMXPath $xpath): array
    {
        $headings = [];

        foreach ($xpath->query('//*[@id="docs-fragment"]//*[self::h2 or self::h3]') as $heading) {
            if (! $heading instanceof DOMElement) {
                continue;
            }

            $id = trim($heading->getAttribute('id'));

            if ($id === '') {
                $anchor = $xpath->query('.//a[contains(concat(" ", normalize-space(@class), " "), " heading-anchor ")][@id][1]', $heading)?->item(0);

                if ($anchor instanceof DOMElement) {
                    $id = trim($anchor->getAttribute('id'));
                }
            }

            if ($id === '') {
                continue;
            }

            $title = $this->extractHeadingText($heading);

            if ($title === '') {
                continue;
            }

            $headings[] = [
                'id' => $id,
                'level' => (int) substr($heading->tagName, 1),
                'title' => $title,
            ];
        }

        return $headings;
    }

    private function extractHeadingText(DOMElement $heading): string
    {
        $text = '';

        foreach ($heading->childNodes as $child) {
            if ($child instanceof DOMElement && $this->hasCssClass($child, 'heading-anchor')) {
                continue;
            }

            $text .= $child->textContent;
        }

        return trim(preg_replace('/\s+/', ' ', $text) ?? $text);
    }

    private function hasCssClass(DOMElement $element, string $className): bool
    {
        $classes = preg_split('/\s+/', trim($element->getAttribute('class')));

        if (! is_array($classes)) {
            return false;
        }

        return in_array($className, array_filter($classes), true);
    }

    /**
     * @param array<int, array<string, mixed>> $pages
     */
    private function prepareOutputDirectory(array $pages): void
    {
        if (! is_dir(self::OUTPUT_DIRECTORY)) {
            throw new RuntimeException('The docs output directory does not exist.');
        }

        if (is_dir(self::LEGACY_OUTPUT_DIRECTORY)) {
            $this->deleteDirectoryContents(self::LEGACY_OUTPUT_DIRECTORY);

            if (! rmdir(self::LEGACY_OUTPUT_DIRECTORY)) {
                throw new RuntimeException('Unable to remove the legacy documentation output directory.');
            }
        }

        $this->deleteStaleGeneratedArtifacts($pages);
    }

    private function deleteDirectoryContents(string $directory): void
    {
        $items = scandir($directory);

        if ($items === false) {
            throw new RuntimeException(sprintf('Unable to read directory [%s].', $directory));
        }

        foreach ($items as $item) {
            if ($item === '.' || $item === '..') {
                continue;
            }

            $path = $directory . '/' . $item;

            if (is_dir($path)) {
                $this->deleteDirectoryContents($path);

                if (! rmdir($path)) {
                    throw new RuntimeException(sprintf('Unable to remove directory [%s].', $path));
                }

                continue;
            }

            if (! unlink($path)) {
                throw new RuntimeException(sprintf('Unable to delete file [%s].', $path));
            }
        }
    }

    /**
     * @param array<int, array<string, mixed>> $pages
     */
    private function deleteStaleGeneratedArtifacts(array $pages): void
    {
        $expectedFiles = ['.nojekyll', 'search-index.json', 'sitemap.xml'];

        foreach ($pages as $page) {
            $expectedFiles[] = str_replace('\\', '/', ltrim((string) $page['url'], '/'));
        }

        $expectedMap = array_fill_keys($expectedFiles, true);
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator(self::OUTPUT_DIRECTORY, FilesystemIterator::SKIP_DOTS),
            RecursiveIteratorIterator::CHILD_FIRST,
        );

        foreach ($iterator as $item) {
            if (! $item instanceof SplFileInfo) {
                continue;
            }

            $path = $item->getPathname();
            $relativePath = str_replace('\\', '/', substr($path, strlen(self::OUTPUT_DIRECTORY) + 1));

            if ($this->isProtectedOutputPath($relativePath)) {
                continue;
            }

            if ($item->isDir()) {
                $contents = scandir($path);

                if ($contents === false) {
                    throw new RuntimeException(sprintf('Unable to read output directory [%s].', $path));
                }

                if ($contents === ['.', '..']) {
                    if (! rmdir($path)) {
                        throw new RuntimeException(sprintf('Unable to remove stale output directory [%s].', $path));
                    }
                }

                continue;
            }

            if ($this->isGeneratedArtifact($relativePath) && ! isset($expectedMap[$relativePath])) {
                if (! unlink($path)) {
                    throw new RuntimeException(sprintf('Unable to remove stale generated file [%s].', $path));
                }
            }
        }
    }

    private function isProtectedOutputPath(string $relativePath): bool
    {
        $segments = array_values(array_filter(explode('/', trim($relativePath, '/')), static fn (string $segment): bool => $segment !== ''));

        if ($segments === []) {
            return false;
        }

        if (in_array($segments[0], ['assets', 'md'], true)) {
            return true;
        }

        return count($segments) === 1 && in_array($segments[0], ['RULES.md', 'build.php', 'template.php'], true);
    }

    private function isGeneratedArtifact(string $relativePath): bool
    {
        $filename = basename($relativePath);

        if ($filename === '.nojekyll') {
            return true;
        }

        return in_array(strtolower(pathinfo($filename, PATHINFO_EXTENSION)), ['html', 'json', 'xml'], true);
    }

    /**
     * @param array<string, mixed> $page
     * @param array<int, array<string, mixed>> $pages
     * @param array{next: array<string, mixed>|null, previous: array<string, mixed>|null} $neighbors
     */
    private function writePage(array $page, array $pages, array $neighbors): void
    {
        $outputPath = self::OUTPUT_DIRECTORY . '/' . $page['url'];
        $outputDirectory = dirname($outputPath);

        if (! is_dir($outputDirectory) && ! mkdir($outputDirectory, 0777, true) && ! is_dir($outputDirectory)) {
            throw new RuntimeException(sprintf('Unable to create output directory [%s].', $outputDirectory));
        }

        $sidebarLinks = array_map(function (array $navigationPage) use ($page): array {
            return [
                'active' => $navigationPage['slug'] === $page['slug'],
                'href' => $this->relativeUrl($page['url'], $navigationPage['url']),
                'title' => $navigationPage['sidebar_label'],
            ];
        }, $pages);

        $tableOfContents = array_map(function (array $heading): array {
            return [
                'href' => '#' . $heading['id'],
                'level' => $heading['level'],
                'title' => $heading['title'],
            ];
        }, $page['headings']);

        $breadcrumbs = [
            [
                'href' => $this->relativeUrl($page['url'], 'index.html'),
                'title' => 'Documentation',
            ],
        ];

        if ($page['slug'] !== 'index') {
            $breadcrumbs[] = [
                'href' => $this->relativeUrl($page['url'], $page['url']),
                'title' => $page['title'],
            ];
        }

        $templateVariables = [
            'breadcrumbs' => $breadcrumbs,
            'sidebarLinks' => $sidebarLinks,
            'neighbors' => [
                'next' => $neighbors['next'] === null ? null : [
                    'href' => $this->relativeUrl($page['url'], $neighbors['next']['url']),
                    'title' => $neighbors['next']['title'],
                ],
                'previous' => $neighbors['previous'] === null ? null : [
                    'href' => $this->relativeUrl($page['url'], $neighbors['previous']['url']),
                    'title' => $neighbors['previous']['title'],
                ],
            ],
            'page' => [
                'canonical_url' => $this->canonicalUrlFor($page),
                'description' => $page['description'],
                'edit_url' => $this->repositoryUrl === '' ? null : $this->repositoryUrl . '/edit/' . $this->editBranch . '/' . $page['source_relative_path'],
                'excerpt' => $page['excerpt'],
                'html' => $page['html'],
                'last_updated_human' => $page['updated_at']->format('M j, Y'),
                'last_updated_iso' => $page['updated_at']->format(DATE_ATOM),
                'slug' => $page['slug'],
                'title' => $page['title'],
                'toc' => $tableOfContents,
                'url' => $page['url'],
            ],
            'paths' => [
                'app' => $this->relativeUrl($page['url'], 'assets/app.js'),
                'home' => $this->relativeUrl($page['url'], 'index.html'),
                'root_prefix' => $this->rootPrefix($page['url']),
                'search_index' => $this->relativeUrl($page['url'], 'search-index.json'),
                'styles' => $this->relativeUrl($page['url'], 'assets/style.css'),
            ],
            'site' => [
                'build_timestamp' => $this->buildTimestamp,
                'name' => $this->siteName,
                'packagist_badge_url' => 'https://img.shields.io/packagist/v/mrpunyapal/laravel-client-validation?style=flat-square&label=packagist',
                'packagist_url' => 'https://packagist.org/packages/mrpunyapal/laravel-client-validation',
                'php_badge' => 'PHP 8.2+',
                'laravel_badge' => 'Laravel 12+',
                'repository_url' => $this->repositoryUrl,
                'tagline' => $this->tagline,
            ],
        ];

        $rendered = $this->renderTemplate($templateVariables);

        if (file_put_contents($outputPath, $rendered) === false) {
            throw new RuntimeException(sprintf('Unable to write generated page [%s].', $outputPath));
        }
    }

    /**
     * @param array<string, mixed> $templateVariables
     */
    private function renderTemplate(array $templateVariables): string
    {
        extract($templateVariables, EXTR_SKIP);

        ob_start();
        require __DIR__ . '/template.php';

        return (string) ob_get_clean();
    }

    /**
     * @param array<int, array<string, mixed>> $pages
     */
    private function writeSearchIndex(array $pages): void
    {
        $index = array_map(function (array $page): array {
            return [
                'content' => $this->searchableContent($page['html']),
                'description' => $page['description'],
                'headings' => implode(' ', array_column($page['headings'], 'title')),
                'title' => $page['title'],
                'url' => $page['url'],
            ];
        }, $pages);

        $json = json_encode($index, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);

        if (file_put_contents(self::OUTPUT_DIRECTORY . '/search-index.json', $json) === false) {
            throw new RuntimeException('Unable to write docs/search-index.json.');
        }
    }

    /**
     * @param array<int, array<string, mixed>> $pages
     */
    private function writeSitemap(array $pages): void
    {
        $entries = array_map(function (array $page): string {
            $canonical = htmlspecialchars($this->canonicalUrlFor($page), ENT_XML1 | ENT_QUOTES, 'UTF-8');
            $lastModified = htmlspecialchars($page['updated_at']->format(DATE_ATOM), ENT_XML1 | ENT_QUOTES, 'UTF-8');

            return <<<XML
    <url>
        <loc>{$canonical}</loc>
        <lastmod>{$lastModified}</lastmod>
    </url>
XML;
        }, $pages);

        $sitemap = <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
%s
</urlset>
XML;

        if (file_put_contents(self::OUTPUT_DIRECTORY . '/sitemap.xml', sprintf($sitemap, implode("\n", $entries))) === false) {
            throw new RuntimeException('Unable to write docs/sitemap.xml.');
        }
    }

    private function writeNoJekyll(): void
    {
        if (file_put_contents(self::OUTPUT_DIRECTORY . '/.nojekyll', '') === false) {
            throw new RuntimeException('Unable to write docs/.nojekyll.');
        }
    }

    /**
     * @param array<int, array<string, mixed>> $pages
     * @return array<string, array{next: array<string, mixed>|null, previous: array<string, mixed>|null}>
     */
    private function buildNeighbors(array $pages): array
    {
        $neighbors = [];

        foreach ($pages as $index => $page) {
            $neighbors[$page['slug']] = [
                'next' => $pages[$index + 1] ?? null,
                'previous' => $pages[$index - 1] ?? null,
            ];
        }

        return $neighbors;
    }

    private function sortPages(array $left, array $right): int
    {
        $orderComparison = $left['order'] <=> $right['order'];

        if ($orderComparison !== 0) {
            return $orderComparison;
        }

        return strcmp((string) $left['title'], (string) $right['title']);
    }

    private function relativeUrl(string $fromPath, string $toPath): string
    {
        $fromDirectory = trim(str_replace('\\', '/', dirname($fromPath)), './');
        $fromSegments = $fromDirectory === '' ? [] : explode('/', $fromDirectory);
        $toSegments = $toPath === '' ? [] : explode('/', ltrim(str_replace('\\', '/', $toPath), '/'));

        while ($fromSegments !== [] && $toSegments !== [] && $fromSegments[0] === $toSegments[0]) {
            array_shift($fromSegments);
            array_shift($toSegments);
        }

        return str_repeat('../', count($fromSegments)) . implode('/', $toSegments);
    }

    private function rootPrefix(string $fromPath): string
    {
        $directory = trim(str_replace('\\', '/', dirname($fromPath)), './');

        if ($directory === '') {
            return '';
        }

        return str_repeat('../', count(explode('/', $directory)));
    }

    /**
     * @param array<string, mixed> $page
     */
    private function canonicalUrlFor(array $page): string
    {
        if ($this->siteUrl === '') {
            return '';
        }

        if ($page['slug'] === 'index') {
            return $this->siteUrl . '/';
        }

        return $this->siteUrl . '/' . ltrim((string) $page['url'], '/');
    }

    private function sourceRelativePath(string $sourcePath): string
    {
        return 'docs/md/' . str_replace('\\', '/', substr($sourcePath, strlen(self::SOURCE_DIRECTORY) + 1));
    }

    private function searchableContent(string $html): string
    {
        $content = trim(strip_tags($html));

        return preg_replace('/\s+/', ' ', $content) ?? $content;
    }

    private function excerptFromHtml(string $html, int $limit = 180): string
    {
        $content = $this->searchableContent($html);

        if (mb_strlen($content) <= $limit) {
            return $content;
        }

        return rtrim(mb_substr($content, 0, $limit - 1)) . '…';
    }

    private function titleFromFilename(string $filename): string
    {
        return ucwords(str_replace(['-', '_'], ' ', $filename));
    }

    private function slugify(string $value): string
    {
        $value = strtolower(trim($value));
        $transliterated = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value);

        if ($transliterated !== false) {
            $value = $transliterated;
        }

        $value = preg_replace('/[^a-z0-9]+/', '-', $value) ?? $value;

        return trim($value, '-') ?: 'page';
    }

    private function stringValue(mixed $value): string
    {
        if (is_string($value)) {
            return trim($value);
        }

        if (is_numeric($value)) {
            return (string) $value;
        }

        return '';
    }

    /**
     * @return array<string, mixed>
     */
    private function loadComposerConfig(): array
    {
        $composerPath = __DIR__ . '/../composer.json';
        $json = file_get_contents($composerPath);

        if ($json === false) {
            throw new RuntimeException('Unable to read composer.json.');
        }

        try {
            $composer = json_decode($json, true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException $exception) {
            throw new RuntimeException('Unable to decode composer.json.', 0, $exception);
        }

        if (! is_array($composer)) {
            throw new RuntimeException('composer.json did not decode into an array.');
        }

        return $composer;
    }

    private function resolveSiteUrl(): string
    {
        $environmentUrl = trim((string) getenv('DOCS_SITE_URL'));

        if ($environmentUrl !== '') {
            return rtrim($environmentUrl, '/');
        }

        $candidate = trim((string) ($this->composer['extra']['docs']['site_url'] ?? $this->composer['homepage'] ?? $this->composer['support']['source'] ?? ''));

        if ($candidate === '') {
            return '';
        }

        if (preg_match('#^https://github\.com/([^/]+)/([^/]+?)(?:\.git)?$#i', $candidate, $matches) === 1) {
            return sprintf('https://%s.github.io/%s', $matches[1], $matches[2]);
        }

        return rtrim($candidate, '/');
    }
}

try {
    (new DocsBuilder())->build();
} catch (Throwable $throwable) {
    fwrite(STDERR, $throwable->getMessage() . PHP_EOL);
    exit(1);
}

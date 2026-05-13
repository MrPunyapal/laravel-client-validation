const docsConfig = window.__DOCS_CONFIG__ || {
    currentPage: '',
    rootPrefix: '',
    searchIndexUrl: 'search-index.json',
};

const escapeHtml = (value) => value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const root = document.documentElement;
const body = document.body;

function setTheme(theme) {
    root.dataset.theme = theme;
    try {
        window.localStorage.setItem('docs-theme', theme);
    } catch (error) {
        // Ignore storage failures.
    }
}

function currentTheme() {
    return root.dataset.theme === 'dark' ? 'dark' : 'light';
}

function initThemeToggle() {
    const button = document.querySelector('[data-theme-toggle]');
    const label = document.querySelector('[data-theme-label]');

    if (!button || !label) {
        return;
    }

    const syncLabel = () => {
        label.textContent = currentTheme() === 'dark' ? 'Light mode' : 'Dark mode';
    };

    syncLabel();

    button.addEventListener('click', () => {
        setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
        syncLabel();
    });
}

function initSidebar() {
    const toggle = document.querySelector('[data-sidebar-toggle]');
    const overlay = document.querySelector('[data-sidebar-overlay]');
    const sidebar = document.querySelector('[data-sidebar]');

    if (!toggle || !overlay || !sidebar) {
        return;
    }

    const close = () => {
        body.classList.remove('docs-sidebar-open');
        overlay.hidden = true;
    };

    const open = () => {
        body.classList.add('docs-sidebar-open');
        overlay.hidden = false;
    };

    toggle.addEventListener('click', () => {
        if (body.classList.contains('docs-sidebar-open')) {
            close();
            return;
        }

        open();
    });

    overlay.addEventListener('click', close);

    sidebar.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            if (window.matchMedia('(max-width: 920px)').matches) {
                close();
            }
        });
    });
}

let searchIndexPromise;

async function loadSearchIndex() {
    if (!searchIndexPromise) {
        searchIndexPromise = fetch(docsConfig.searchIndexUrl, { headers: { Accept: 'application/json' } })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to load search index: ${response.status}`);
                }

                return response.json();
            })
            .catch(() => []);
    }

    return searchIndexPromise;
}

function normalize(value) {
    return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function resultHref(path) {
    return `${docsConfig.rootPrefix}${path}`;
}

function scoreEntry(entry, terms) {
    const title = normalize(entry.title || '');
    const description = normalize(entry.description || '');
    const headings = normalize(entry.headings || '');
    const content = normalize(entry.content || '');

    let score = 0;

    for (const term of terms) {
        if (!term) {
            continue;
        }

        if (title.includes(term)) {
            score += 14;
        }

        if (description.includes(term)) {
            score += 8;
        }

        if (headings.includes(term)) {
            score += 6;
        }

        if (content.includes(term)) {
            score += 2;
        }
    }

    if (entry.url === docsConfig.currentPage) {
        score -= 4;
    }

    return score;
}

function renderSearchResults(container, query, results) {
    container.hidden = false;

    if (!query) {
        container.hidden = true;
        container.innerHTML = '';
        return;
    }

    if (results.length === 0) {
        container.innerHTML = '<p class="docs-search__empty">No matching pages.</p>';
        return;
    }

    container.innerHTML = results.map((result) => {
        const excerpt = result.description || result.content.slice(0, 140);

        return `
            <a class="docs-search__result" href="${escapeHtml(resultHref(result.url))}">
                <strong>${escapeHtml(result.title)}</strong>
                <p>${escapeHtml(excerpt)}</p>
            </a>
        `;
    }).join('');
}

function initSearch() {
    const input = document.querySelector('[data-search-input]');
    const results = document.querySelector('[data-search-results]');

    if (!input || !results) {
        return;
    }

    const closeResults = () => {
        results.hidden = true;
        results.innerHTML = '';
    };

    input.addEventListener('focus', () => {
        void loadSearchIndex();
    });

    input.addEventListener('input', async (event) => {
        const query = normalize(event.target.value || '');

        if (!query) {
            closeResults();
            return;
        }

        const entries = await loadSearchIndex();
        const terms = query.split(' ');

        const matches = entries
            .map((entry) => ({
                ...entry,
                score: scoreEntry(entry, terms),
            }))
            .filter((entry) => entry.score > 0)
            .sort((left, right) => right.score - left.score)
            .slice(0, 8);

        renderSearchResults(results, query, matches);
    });

    document.addEventListener('click', (event) => {
        if (results.hidden) {
            return;
        }

        if (!results.contains(event.target) && event.target !== input) {
            closeResults();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeResults();
        }
    });
}

function initCopyButtons() {
    document.querySelectorAll('.docs-content pre').forEach((pre) => {
        if (pre.querySelector('.docs-code-copy')) {
            return;
        }

        const code = pre.querySelector('code');

        if (!code) {
            return;
        }

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'docs-code-copy';
        button.textContent = 'Copy';

        button.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(code.innerText);
                button.textContent = 'Copied';
                window.setTimeout(() => {
                    button.textContent = 'Copy';
                }, 1500);
            } catch (error) {
                button.textContent = 'Press Ctrl+C';
                window.setTimeout(() => {
                    button.textContent = 'Copy';
                }, 1500);
            }
        });

        pre.appendChild(button);
    });
}

function initTocHighlight() {
    const tocLinks = Array.from(document.querySelectorAll('[data-toc-link]'));

    if (tocLinks.length === 0) {
        return;
    }

    const entries = tocLinks
        .map((link) => {
            const id = link.getAttribute('href')?.replace('#', '');

            if (!id) {
                return null;
            }

            const heading = document.getElementById(id);

            if (!heading) {
                return null;
            }

            return { heading, link };
        })
        .filter(Boolean);

    if (entries.length === 0) {
        return;
    }

    let scheduled = false;

    const update = () => {
        scheduled = false;
        let active = entries[0];

        for (const entry of entries) {
            if (entry.heading.getBoundingClientRect().top - 140 <= 0) {
                active = entry;
            }
        }

        entries.forEach((entry) => {
            entry.link.classList.toggle('is-current', entry === active);
        });
    };

    const requestUpdate = () => {
        if (scheduled) {
            return;
        }

        scheduled = true;
        window.requestAnimationFrame(update);
    };

    update();
    document.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.Prism && typeof window.Prism.highlightAll === 'function') {
        window.Prism.highlightAll();
    }

    initThemeToggle();
    initSidebar();
    initSearch();
    initCopyButtons();
    initTocHighlight();
});

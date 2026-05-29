<?php

declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

use Docsmith\Docsmith;

$siteUrl = getenv('DOCS_SITE_URL') ?: 'https://mrpunyapal.github.io/laravel-client-validation';
$editBranch = getenv('DOCS_EDIT_BRANCH') ?: 'main';

Docsmith::make()
    ->source(__DIR__ . '/docs/md')
    ->output(__DIR__ . '/docs')
    ->title('Laravel Client Validation')
    ->description('Client-side Laravel validation rules for Alpine, Livewire, Filament, and vanilla JavaScript.')
    ->repositoryUrl('https://github.com/mrpunyapal/laravel-client-validation')
    ->siteUrl($siteUrl)
    ->editBranch($editBranch)
    ->rightSidebar()
    ->build();

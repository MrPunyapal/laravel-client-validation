---
title: Laravel Client Validation
description: Build responsive Laravel-fluent forms with markdown-authored documentation, generated HTML pages, and GitHub Pages deployment.
order: 1
slug: index
sidebar_label: Overview
---

Laravel Client Validation brings familiar Laravel validation rules into the browser so forms can respond immediately without maintaining a second rule set by hand.

## Why this package exists

- Keep Laravel-style validation rules close to the UI.
- Reuse the same package across Alpine.js, Livewire, Filament, or plain JavaScript.
- Fall back to AJAX when a rule depends on the server, such as `unique` or `exists`.
- Ship contributor-friendly documentation from plain Markdown files in `docs/md`.

## Quick start

Install the package and publish the configuration and browser assets:

```bash
composer require mrpunyapal/laravel-client-validation
php artisan client-validation:install
```

Then render the package assets in a Blade layout:

```php
<!doctype html>
<html lang="en">
<head>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @clientValidationAssets
</head>
<body>
    {{ $slot }}
</body>
</html>
```

## Documentation map

- Start with [installation](./installation.md) if you are onboarding the package into a Laravel app.
- Review [configuration](./configuration.md) before changing default validation modes, messages, AJAX, or styling.
- Use [usage](./usage.md) for Blade directives, Alpine integration, and remote-validation flow.
- Keep [validation rules](./validation-rules.md) nearby when auditing client-side parity.
- Reach for [custom rules](./custom-rules.md) when the default rule set is not enough.
- Run the checks in [testing](./testing.md) before publishing a package release.
- Check [troubleshooting](./troubleshooting.md) when a directive, rule, or AJAX request does not behave as expected.
- Browse [examples](./examples.md) for practical Laravel snippets you can adapt directly.

## Supported integration styles

### Blade and Alpine.js

The package exposes Blade directives like `@rules`, `@validateBlur`, and `@validateLive`, alongside Alpine helpers and `x-validate` directives.

```html
<form data-validate>
    <input name="email" @rules('email', 'required|email')>
    <input name="username" @validateLive('username', 'required|alpha_dash|min:3')>
</form>
```

### Livewire and Filament

Livewire components can use `WithClientValidation`, while Filament panels can install `ClientValidationPlugin` and field traits for form-level feedback.

```php
use MrPunyapal\ClientValidation\Filament\ClientValidationPlugin;

$panel->plugins([
    ClientValidationPlugin::make()->validationMode('live'),
]);
```

### Vanilla JavaScript

If you only need client-side validation in a custom frontend, the core validator and adapters are available from the browser bundle or ES module entrypoints.

```javascript
import { LaravelValidator } from 'laravel-client-validation/core';

const validator = new LaravelValidator({
    rules: {
        email: 'required|email',
    },
});
```

## How the docs site is generated

This repository keeps Markdown as the source of truth. The generated site in `docs/generated` is rebuilt from the following command:

```bash
php docs/build.php
```

The builder reads frontmatter from every file in `docs/md`, generates the sidebar and previous or next navigation automatically, writes a JSON search index, and copies the assets used by the generated pages.

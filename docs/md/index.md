---
title: Laravel Client Validation
description: Bring Laravel-style validation rules into the browser for Alpine, Livewire, Filament, and JavaScript forms.
order: 1
slug: index
sidebar_label: Overview
---

Laravel Client Validation brings familiar Laravel validation rules into the browser so forms can respond immediately without maintaining a second rule set by hand.

## Why this package exists

- Keep Laravel-style validation rules close to the UI.
- Reuse the same package across Alpine.js, Livewire, Filament, or plain JavaScript.
- Fall back to AJAX when a rule depends on the server, such as `unique` or `exists`.

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
- Use [usage](./usage.md) for the shared validation model and the integration map.
- Reach for [alpine](./alpine.md) when you want `x-validate` directives or the `validation()` Alpine helper.
- Use [livewire](./livewire.md) for `WithClientValidation`, `x-wire-validate`, and client-side pre-validation in Livewire components.
- Open [filament](./filament.md) when your forms run inside a Filament panel or custom field.
- Pick [vanilla](./vanilla.md), [react](./react.md), or [vue](./vue.md) for browser-adapter usage outside Blade-first forms.
- Keep [inertia](./inertia.md) nearby when your Laravel app uses Inertia with React or Vue.
- Keep [validation rules](./validation-rules.md) nearby when auditing client-side parity.
- Reach for [custom rules](./custom-rules.md) when the default rule set is not enough.
- Run the checks in [testing](./testing.md) before publishing a package release.
- Open [documentation workflow](./documentation-workflow.md) when you are changing Markdown pages, the docs template, or generated site output.
- Check [troubleshooting](./troubleshooting.md) when a directive, rule, or AJAX request does not behave as expected.
- Browse [examples](./examples.md) for practical Laravel snippets you can adapt directly.

## Supported integration styles

### Blade and Alpine.js

The package exposes Blade directives like `@rules`, `@validateBlur`, and `@validateLive`, alongside Alpine helpers and `x-validate` directives. Use the dedicated [alpine](./alpine.md) page for the directive modes, `validation()` helper, and field-state patterns.

```html
<form data-validate>
    <input name="email" @rules('email', 'required|email')>
    <input name="username" @validateLive('username', 'required|alpha_dash|min:3')>
</form>
```

### Livewire and Filament

Livewire components can use `WithClientValidation`, while Filament panels can install `ClientValidationPlugin` and field traits for form-level feedback. The dedicated [livewire](./livewire.md) and [filament](./filament.md) pages cover those package-specific integration surfaces.

```php
use MrPunyapal\ClientValidation\Filament\ClientValidationPlugin;

$panel->plugins([
    ClientValidationPlugin::make()->validationMode('live'),
]);
```

### Vanilla JavaScript

If you only need client-side validation in a custom frontend, the core validator and adapters are available from the browser bundle or ES module entrypoints. Use the adapter-specific guides for [vanilla JavaScript](./vanilla.md), [React](./react.md), [Vue](./vue.md), and [Inertia](./inertia.md).

```javascript
import { LaravelValidator } from 'laravel-client-validation/core';

const validator = new LaravelValidator({
    rules: {
        email: 'required|email',
    },
});
```

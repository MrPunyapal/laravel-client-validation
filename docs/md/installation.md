---
title: Installation
description: Install Laravel Client Validation in a Laravel application and verify the client bundle is available in Blade views.
order: 2
slug: installation
---

Install Laravel Client Validation with Composer, publish the package assets, and verify the generated browser bundle is loaded before you start attaching rules to inputs.

## Requirements

- PHP 8.2 or newer.
- A Laravel application that can load package service providers.
- A frontend layout where Blade can render the package assets or your own script tags.

## Install the package

```bash
composer require mrpunyapal/laravel-client-validation
php artisan client-validation:install
```

The install command publishes the package configuration and the browser bundle into `public/vendor/client-validation`.

## Include the assets

The package ships the `@clientValidationAssets` Blade directive. It injects configuration, prefers the published local bundle, and falls back to the CDN bundle when the asset files are missing.

```php
<head>
    @clientValidationAssets
</head>
```

If you prefer to control configuration separately, render the configuration object and load the bundle yourself:

```php
<head>
    @clientValidationConfig
    <script src="{{ asset('vendor/client-validation/client-validation.iife.js') }}"></script>
</head>
```

## First validation field

Use Blade directives immediately after the script is present on the page.

```html
<form data-validate>
    <input name="email" @validateBlur('email', 'required|email')>
    <input name="password" @validateSubmit('password', 'required|min:8')>
    <button type="submit">Create account</button>
</form>
```

## Verify the installation

### Browser smoke test

Open the form, tab out of the `email` field, and confirm that invalid values show client-side feedback before the form submits.

### Remote validation smoke test

Remote rules such as `unique` should send requests to the validation endpoint generated from the `route_prefix` configuration.

```html
<input name="email" @validateLive('email', 'required|email|unique:users,email')>
```

When AJAX validation is enabled, the request targets `/client-validation/validate` by default.

## Next steps

- Review [configuration](./configuration.md) to tune debounce, AJAX, styling, and message defaults.
- Use [usage](./usage.md) as the integration map, then jump to [alpine](./alpine.md), [livewire](./livewire.md), [filament](./filament.md), [vanilla](./vanilla.md), or [inertia](./inertia.md).
- Keep [troubleshooting](./troubleshooting.md) nearby if the bundle is missing or remote rules do not fire.

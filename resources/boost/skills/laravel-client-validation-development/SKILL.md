---
name: laravel-client-validation-development
description: Build Laravel forms with laravel-client-validation using Blade directives, Alpine.js, Livewire, Filament, and remote validation.
---

# Laravel Client Validation Development

## When to use this skill

Use this skill when a Laravel application uses `mrpunyapal/laravel-client-validation` and you need to add, debug, or refactor browser-side validation with the package.

Typical cases:

- Adding `x-validate` or Blade validation directives to Blade or Alpine forms.
- Reusing Laravel `FormRequest` rules in the browser.
- Wiring `x-wire-validate` or `WithClientValidation` in Livewire components.
- Enabling client validation in Filament panels or custom fields.
- Debugging remote rules such as `unique` or `exists`.

## Install and bootstrap

Install the package in the Laravel app and publish its assets:

```bash
composer require mrpunyapal/laravel-client-validation
php artisan client-validation:install
```

Render the assets once in the main Blade layout before using any directives:

```blade
<head>
    @clientValidationAssets
</head>
```

If the Laravel app already uses Boost, run one of these commands so Boost can discover or refresh third-party skills from installed packages:

```bash
php artisan boost:install
php artisan boost:update --discover
```

## Core conventions

- Keep Laravel validation rules as the source of truth. Reuse existing `FormRequest`, controller, or Livewire rules instead of hand-maintaining a second JavaScript rule set.
- Use `@rules`, `@validateBlur`, `@validateLive`, or `@validateSubmit` for Blade forms that rely on data attributes.
- Use `x-validate` for Alpine or Blade-first forms.
- Use `x-wire-validate` alongside `wire:model` in Livewire components.
- Use `WithClientValidation` when a Livewire component already defines `rules`, `messages`, or `validationAttributes` and those should be exposed to the browser.
- Use `ClientValidationPlugin`, `ClientValidatedField`, or `HasClientValidation` for Filament integration.
- Remote rules such as `unique`, `exists`, `password`, `current_password`, and `encoding` still rely on Laravel over AJAX and are not purely client-side.
- Prefer changes in `config/client-validation.php` over scattered inline overrides for debounce, styling, or route behavior.
- Render the package asset bundle once. Avoid duplicating `@clientValidationAssets` or manual script tags on the same page.

## Common patterns

### Reuse a FormRequest in Blade

```php
use MrPunyapal\ClientValidation\Facades\ClientValidation;

public function create()
{
    $validation = ClientValidation::fromRequest(CreateUserRequest::class);

    return view('users.create', compact('validation'));
}
```

```blade
<div x-data="validation(@js($validation))">
    <input x-model="form.email" @blur="validate('email')">
    <span x-text="error('email')" x-show="hasError('email')"></span>
</div>
```

### Add field directives directly in Blade

```blade
<form data-validate>
    <input name="email" @validateBlur('email', 'required|email')>
    <input name="username" @validateLive('username', 'required|alpha_dash|min:3')>
    <input name="password" @validateSubmit('password', 'required|min:8|confirmed')>
</form>
```

### Livewire component integration

```php
use Livewire\Component;
use MrPunyapal\ClientValidation\Livewire\WithClientValidation;

class CreateUser extends Component
{
    use WithClientValidation;

    protected $rules = [
        'email' => 'required|email',
        'password' => 'required|min:8|confirmed',
    ];
}
```

```blade
<div x-data="{ clientRules: @json($this->getClientRules()) }">
    <input wire:model="email" x-wire-validate="clientRules.email" name="email">
</div>
```

### Filament panel setup

```php
use MrPunyapal\ClientValidation\Filament\ClientValidationPlugin;

public function panel(Panel $panel): Panel
{
    return $panel->plugins([
        ClientValidationPlugin::make()->validationMode('live'),
    ]);
}
```

## Remote validation notes

- The default AJAX endpoint is `/client-validation/validate`.
- Remote validation depends on `enable_ajax_validation` being enabled.
- Prefer `.live` or input mode when users need earlier feedback for `unique` or `exists` rules.
- If remote validation fails, debug the Laravel route, middleware, CSRF, and published assets before rewriting the validation rules.

## What to avoid

- Do not replace authoritative server-side Laravel validation with client-only validation.
- Do not assume every Laravel rule runs entirely in the browser.
- Do not hardcode asset paths when `@clientValidationAssets` already handles the normal bootstrap path.
- Do not duplicate the same rules in Blade, JavaScript, controllers, and Livewire unless there is a clear reason.

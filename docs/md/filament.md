---
title: Filament
description: Attach client-side Laravel rules to native Filament fields on the fly, or opt fields in explicitly through the plugin macros.
order: 7
slug: filament
---

Filament support builds on the same browser runtime as the other adapters. The panel plugin wires everything up so **standard Filament fields** (`TextInput`, `Select`, `Textarea`, ...) can validate in the browser before Livewire ever round-trips.

## Install

```bash
composer require mrpunyapal/client-validation-filament
```

The Filament integration ships as a dedicated package (`mrpunyapal/client-validation-filament`), split from the core so the core package stays framework-agnostic. It depends on `mrpunyapal/laravel-client-validation`, which is installed automatically.

## Register the panel plugin

```php
use Filament\Panel;
use Filament\PanelProvider;
use MrPunyapal\ClientValidation\Filament\ClientValidationPlugin;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel->plugins([
            ClientValidationPlugin::make()
                ->enableRemoteValidation()
                ->validationMode('live'),
        ]);
    }
}
```

`validationMode('live')` sets the default validation trigger (`live`, `blur`, or `submit`) for every field handled by the plugin.

## Validate native fields on the fly

Once the plugin is registered, every field has a `clientValidation()` method:

```php
use Filament\Forms\Components\TextInput;

TextInput::make('email')
    ->email()
    ->clientValidation('required|email');

Select::make('country')
    ->options(Countries::list())
    ->clientValidation(['required', 'exists:countries,code']);
```

Rules may also be a closure, evaluated when the field renders:

```php
TextInput::make('username')
    ->clientValidation(fn () => $this->isReserved ? 'required|min:3' : 'required|min:3|not_reserved');
```

### Call it with no rules to reuse the field's own configuration

Passing nothing tells the plugin to derive the client-side rules from the field itself instead of restating them:

```php
TextInput::make('email')
    ->required()
    ->minLength(3)
    ->email()
    ->clientValidation();
```

The resolver first builds the rule string from the field's required state and its own validation rules, filters out server-only and unsupported rules (`unique`, `exists`, ...), and then emits the same `x-validate` attribute. A field with no meaningful rules (for example, only the implicit `nullable` Filament adds) is left alone — no `x-validate` is attached.

> **Tip:** Use `->clientValidation()` (no rules) when the field already declares real rules. Use explicit rules when the client-side rules should differ from what Filament validates server-side.

To remove client validation again, call `withoutClientValidation()`.

The plugin injects `x-validate` attributes onto the real input element, so there is no wrapper field and no custom view to maintain. Because Filament v5 inputs render without an HTML `name` attribute, the plugin also emits a `name` attribute (the field's state path, matching its `wire:model` binding) so the browser runtime can address the field — including sibling-field rules such as `confirmed` or `same:`.

### Saving validates every field in the form

The browser runtime disables native browser constraint popups and installs a form-level guard as soon as at least one validated field lives inside a `<form>`: when you hit the submit button, every bound field in that form is re-validated, and the submission is blocked until all of them pass. This means fields the plugin validates on blur or live still participate when the form is saved — you do not need to mark every field `.submit`.

Custom Filament validation metadata is forwarded to the browser too. `validationMessages()` supplies rule-specific client messages, and `validationAttribute()` supplies the `:attribute` value used in those messages:

```php
TextInput::make('email')
    ->required()
    ->email()
    ->validationAttribute('email address')
    ->validationMessages([
        'required' => 'Please provide your :attribute.',
        'email' => 'Please provide a valid :attribute.',
    ])
    ->clientValidation();
```

The same evaluated messages and attribute are still used by Filament during server-side validation.

### Automatic inference

Enable auto mode and fields derive their client-side rules from what they already declare:

```php
ClientValidationPlugin::make()
    ->enableAutoValidation();
```

```php
TextInput::make('email')          // no client-specific code at all
    ->required()
    ->rules(['max:255'])
    ->email();
```

Inference is conservative:

- Only rules the browser can execute are attached; server-only rules such as `unique` or `exists` are filtered out through the same parser that powers the Blade directives.
- Fields whose primary element carries no name attribute (file uploads, rich/markdown editors) are skipped.
- A field configured with an explicit `clientValidation()` call always wins over inference.

If you also pass your own `extraInputAttributes()`, call `clientValidation()` after it — Filament replaces attribute arrays by default unless you pass `merge: true`.

## Use the built-in field wrapper (optional)

```php
use MrPunyapal\ClientValidation\Filament\ClientValidatedField;

ClientValidatedField::make('email')
    ->clientValidation('required|email|unique:users,email')
    ->clientValidationMode('live');
```

`ClientValidatedField` renders a package view around its child input. It predates the macro support above and still works, but for most forms a native field plus the macro is simpler.

## Add client validation to a custom Filament field

For fully custom field classes, use the trait and render the attributes yourself:

```php
use Filament\Forms\Components\Field;
use MrPunyapal\ClientValidation\Filament\HasClientValidation;

class PhoneField extends Field
{
    use HasClientValidation;
}
```

In the Blade view for that field, render the generated attributes on the element that owns the input:

```blade
<div
    @if ($hasClientValidation())
        x-validate{{ $getClientValidationModifier() }}="{{ $getClientValidationRules() }}"
    @endif
>
    {{ $getChildComponentContainer() }}
</div>
```

Calling `withClientValidation()` instead of `clientValidation('...')` falls back to the field's existing required state and validation rules where possible.

## Related pages

- Use [livewire](./livewire.md) when your Filament form also needs component-level Livewire guidance.
- Review [configuration](./configuration.md) for remote-validation and class defaults.
- Keep [examples](./examples.md) nearby for quick copyable snippets.

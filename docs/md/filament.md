---
title: Filament
description: Register the Filament plugin and attach client-side Laravel rules to panel fields or custom field components.
order: 7
slug: filament
---

Filament support builds on the same browser runtime, but gives you a package-specific plugin and field helpers so panel forms can emit client feedback before submit.

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

`validationMode('live')` makes generated `x-validate.live` bindings the default for fields handled through the package helper.

## Use the built-in field wrapper

```php
use MrPunyapal\ClientValidation\Filament\ClientValidatedField;

ClientValidatedField::make('email')
    ->clientValidation('required|email|unique:users,email')
    ->clientValidationMode('live');
```

Use `ClientValidatedField` when you want a drop-in field that already renders the validation wrapper view shipped with the package.

## Add client validation to a custom Filament field

```php
use Filament\Forms\Components\Field;
use MrPunyapal\ClientValidation\Filament\HasClientValidation;

class PhoneField extends Field
{
    use HasClientValidation;
}
```

In the Blade view for that field, render the generated attributes on the wrapper that owns the input:

```blade
<div
    @if ($hasClientValidation())
        x-validate{{ $getClientValidationModifier() }}="{{ $getClientValidationRules() }}"
    @endif
>
    {{ $getChildComponentContainer() }}
</div>
```

## Let Filament infer rules from the field

If you call `withClientValidation()` instead of `clientValidation('...')`, the trait falls back to the field's existing required state and validation rules where possible.

## Related pages

- Use [livewire](./livewire.md) when your Filament form also needs component-level Livewire guidance.
- Review [configuration](./configuration.md) for remote-validation and class defaults.
- Keep [examples](./examples.md) nearby for quick copyable snippets.

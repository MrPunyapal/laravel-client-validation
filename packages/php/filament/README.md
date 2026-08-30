# Client Validation — Filament

Filament integration for [Laravel Client Validation](https://github.com/mrpunyapal/laravel-client-validation). It ships the `ClientValidationPlugin` for Filament panels, the `clientValidation()` / `withoutClientValidation()` macros on native fields (`TextInput`, `Select`, ...), and the `HasClientValidation` trait / `ClientValidatedField` wrapper for custom components.

The plugin resolves validation rules at render time, injects `x-validate` attributes (plus a `name` attribute with the field's state path, which Filament v5 inputs otherwise render without), and forwards evaluated `validationMessages()` / `validationAttribute()` values so the browser shows the same messages Laravel would.

## Installation

```bash
composer require mrpunyapal/client-validation-filament
```

## Usage

Register the plugin on any Filament panel:

```php
use MrPunyapal\ClientValidation\Filament\ClientValidationPlugin;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->plugins([
                ClientValidationPlugin::make(),
            ]);
    }
}
```

Then attach client-side rules to any native field:

```php
TextInput::make('email')
    ->required()
    ->email()
    ->clientValidation();
```

`clientValidation()` with no rules derives the client-side rules from the field's own required state and validation rules (server-only rules such as `unique` or `exists` are filtered out). Custom messages and attributes are shared with the server:

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

## Testing

```bash
composer install
composer test
```
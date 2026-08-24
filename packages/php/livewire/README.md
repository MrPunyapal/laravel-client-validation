# Client Validation — Livewire

Livewire integration for [Laravel Client Validation](https://github.com/mrpunyapal/laravel-client-validation). It ships the `WithClientValidation` trait, the `ClientValidationHook` that embeds client-safe rules into the Livewire snapshot memo, and magic-mode browser binding so `wire:model` fields validate live without any Blade changes.

## Installation

```bash
composer require mrpunyapal/client-validation-livewire
```

The `ClientValidationHook` is auto-registered by the core package's `ClientValidationServiceProvider` when this package is installed — no manual registration needed.

## Usage

Add the `WithClientValidation` trait to any Livewire component:

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use MrPunyapal\ClientValidation\Livewire\WithClientValidation;

class ContactForm extends Component
{
    use WithClientValidation;

    public string $name = '';
    public string $email = '';

    protected $rules = [
        'name' => 'required|string|max:100',
        'email' => 'required|email|unique:users,email',
    ];

    public function render()
    {
        return view('livewire.contact-form');
    }
}
```

On component init in the browser, the hook reads `snapshot.memo.clientValidation`, parses only client-safe rules, and binds live validation to all `wire:model` fields. Server-side rules such as `unique` or `exists` are prefixed with `ajax:` and validated remotely through the core package's validation endpoint.

You can also access the generated rules directly from Blade:

```blade
<div x-data="{{ $this->alpineValidation }}">
    <input type="text" wire:model="name" name="name">
    <x-client-validation:error field="name" />
</div>
```

## Testing

```bash
composer install
composer test
```

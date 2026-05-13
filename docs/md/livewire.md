---
title: Livewire
description: Combine WithClientValidation, x-wire-validate, and the Livewire browser adapter for fast client-side feedback before a server round-trip.
order: 6
slug: livewire
---

Livewire integration has two layers: the PHP trait keeps the server rules central, and the browser adapter lets fields fail fast before a Livewire request leaves the page. The JavaScript adapter supports both Livewire 3 and Livewire 4.

## Add the Livewire trait

```php
use Livewire\Component;
use MrPunyapal\ClientValidation\Livewire\WithClientValidation;

class CreateUser extends Component
{
    use WithClientValidation;

    public string $email = '';
    public string $password = '';
    public string $password_confirmation = '';

    protected array $rules = [
        'email' => 'required|email|unique:users,email',
        'password' => 'required|min:8|confirmed',
    ];
}
```

`WithClientValidation` exposes computed properties such as `$this->clientRules`, `$this->clientMessages`, and `$this->clientValidationData` so the same component rules can be reused in the browser.

## Validate fields in the Blade view

```blade
@php($clientRules = json_decode($this->clientRules, true))

<div x-data="{ clientRules: @js($clientRules) }">
    <input
        wire:model.live="email"
        name="email"
        x-wire-validate.live="clientRules.email"
    >

    <span class="validation-error" data-error="email"></span>
</div>
```

`x-wire-validate` uses the same trigger model as `x-validate`: blur by default, `.live` for debounced typing feedback. The field still keeps its normal `wire:model` binding.

## Use explicit rules when you only need one field

```html
<input
    wire:model.blur="email"
    name="email"
    x-wire-validate="'required|email|unique:users,email'"
>
```

This is useful when the rules are small or when you are incrementally adopting the package inside an existing component.

## Listen for client-validation events

The Livewire adapter dispatches `client-validation-error` and `client-validation-cleared` events back to the component. Use them when you need to sync custom UI or logging around client-side failures.

## Related pages

- Open [filament](./filament.md) for the panel-specific helper layer.
- Use [troubleshooting](./troubleshooting.md) when Livewire requests and client validation drift apart.
- Check [examples](./examples.md) for compact component snippets.

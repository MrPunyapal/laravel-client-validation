---
title: Livewire
description: Add client-side validation to Livewire components automatically with WithClientValidation magic mode, or bind fields manually with x-wire-validate.
order: 6
slug: livewire
---

Livewire integration has two layers: the PHP trait keeps the server rules central, and the browser adapter lets fields fail fast before a Livewire request leaves the page. The JavaScript adapter supports both Livewire 3 and Livewire 4.

There are two ways to bind validation:

- **Magic mode (default):** add the `WithClientValidation` trait and define your rules. The payload travels inside the Livewire snapshot, and every `wire:model` field is validated without any Blade changes.
- **Manual mode:** opt out of magic mode and attach rules per field with the `x-wire-validate` Alpine directive.

The PHP side of the Livewire integration ships as its own Composer package:

```bash
composer require mrpunyapal/client-validation-livewire
```

It requires the core package, which Composer installs automatically. Everything still lives under the unchanged `MrPunyapal\ClientValidation\Livewire` namespace, so existing components need no edits.

## Magic mode: trait only, no Blade changes

### Component

```php
use Livewire\Component;
use MrPunyapal\ClientValidation\Livewire\WithClientValidation;

class CreateUser extends Component
{
    use WithClientValidation;

    public string $email = '';
    public string $password = '';
    public string $password_confirmation = '';
    public string $role = 'user';
    public string $admin_code = '';

    protected function rules(): array
    {
        return [
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
            'role' => 'required|in:user,admin',
            'admin_code' => 'required_if:role,admin|string|min:4',
        ];
    }

    protected function messages(): array
    {
        return [
            'email.unique' => 'That email address is already registered.',
        ];
    }

    protected function validationAttributes(): array
    {
        return [
            'admin_code' => 'administrator code',
        ];
    }
}
```

Rules may be defined as a `$rules` property or a `rules()` method; the same choice applies to `$messages`/`messages()` and `$validationAttributes`/`validationAttributes()`.

### Blade view

```blade
<form wire:submit="save">
    <input type="email" wire:model.blur="email">

    <input type="password" wire:model.blur="password">
    <input type="password" wire:model.blur="password_confirmation">

    <select wire:model.change="role">
        <option value="user">User</option>
        <option value="admin">Administrator</option>
    </select>

    @if ($role === 'admin')
        <input type="text" wire:model.blur="admin_code">
    @endif

    <button type="submit">Create user</button>
</form>
```

No directives, no JSON decoding, and no error placeholders are required. That is the entire setup.

## Expected behavior

When a component uses the trait and `auto_bind_livewire` is enabled (the default):

- A component hook serializes a client-safe payload into the snapshot memo under the `clientValidation` key on every dehydrate. Components without the trait are skipped. The payload contains `{rules, ajax_rules, messages, attributes, config}` built from your `rules()`, `messages()`, and `validationAttributes()`.
- On component init, the browser adapter reads that memo, builds a validator, and binds listeners to every `[wire:model]` field. Fields validate on blur; fields with `.live` modifiers (or components using a `live`/`input` validation mode) also validate while typing, debounced.
- Error containers (`data-error="field"`) are injected next to failing fields and marked `wire:ignore`, so no markup changes are needed in your view.
- Forms with `wire:submit` are intercepted in the capture phase before Livewire sees them. Submitting first runs full client-side validation and shows the first error for each failing field. If everything passes, the form's Livewire action is invoked through `$wire`, so your action runs exactly as a native submit would.
- Conditional rules such as `required_if` ship in the payload because sibling values are available in the browser, so they evaluate client-side like any other rule. Dependent fields re-validate automatically: editing a confirmation field clears a stale `confirmed` error on its sibling, and changing a field referenced by `required_if` re-evaluates that rule without waiting for a submit.
- Server-side rules arrive prefixed with `ajax:` (for example `ajax:unique:users,email`). The browser routes them to the Laravel endpoint while the remaining rules still apply instantly. See [remote rules](./validation-rules.md#remote-rules) for details.

## Events dispatched

Both events go through `$wire.dispatch`, so you can listen from Alpine inside the component or from PHP listeners:

| Event | When it fires | Payload |
| --- | --- | --- |
| `client-validation` | After each field validation | `{ field, valid, errors }` |
| `client-validation-form` | After submit-time validation of all fields | `{ valid, errors }` |

```php
use Livewire\Attributes\On;

#[On('client-validation-form')]
public function onClientValidationForm(bool $valid): void
{
    // Log analytics, toggle UI state, etc.
}
```

The manual directive flow below additionally dispatches per-field `client-validation-error` and `client-validation-cleared` events.

## Configuration

Magic mode is controlled by one config option:

| Option | Environment variable | Default | Effect |
| --- | --- | --- | --- |
| `auto_bind_livewire` | `CLIENT_VALIDATION_AUTO_BIND_LIVEWIRE` | `true` | Registers the component hook and auto-binds fields when Livewire boots |

```php
// config/client-validation.php
'auto_bind_livewire' => env('CLIENT_VALIDATION_AUTO_BIND_LIVEWIRE', true),
```

Set it to `false` to disable magic mode entirely: no hook registration, no snapshot injection, no automatic binding. You can also opt out per page by setting the flag before the package script loads:

```html
<script>window.clientValidationConfig = { autoBindLivewire: false };</script>
```

Manual mode keeps working either way.

## Manual mode: x-wire-validate escape hatch

If you prefer explicit control over which fields validate in the browser, use the `x-wire-validate` Alpine directive instead of relying on automatic binding.

### Validate fields in the Blade view

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

### Use explicit rules when you only need one field

```html
<input
    wire:model.blur="email"
    name="email"
    x-wire-validate="'required|email|unique:users,email'"
>
```

This is useful when the rules are small or when you are incrementally adopting the package inside an existing component.

## How Livewire morphs are handled

Livewire morphs the DOM after every request, which would normally wipe injected error containers or replace input nodes entirely. The adapter handles this in two ways:

- Injected error containers are marked `wire:ignore`, so morphs leave them in place between renders.
- A `morphed` hook re-binds any replaced inputs and forms after each request and re-applies the current error state from the validator. Messages disappear once a field becomes valid and survive round-trips while an error persists.

## Related pages

- See [configuration](./configuration.md) for `validation_mode`, debounce, AJAX, and styling defaults.
- Open [filament](./filament.md) for the panel-specific helper layer.
- Use [troubleshooting](./troubleshooting.md) when Livewire requests and client validation drift apart.
- Check [examples](./examples.md) for compact component snippets.

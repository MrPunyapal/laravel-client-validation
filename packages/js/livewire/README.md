# @laravel-client-validation/livewire

Livewire adapter for Laravel Client Validation. Validates `wire:model` fields in the browser before a Livewire request leaves the page. Supports both Livewire v3 and v4.

Requires `@laravel-client-validation/core` (installed automatically as a dependency).

## Install

```bash
npm install @laravel-client-validation/livewire
```

The recommended setup uses the `mrpunyapal/client-validation-livewire` composer package for the PHP side (`WithClientValidation` trait and snapshot hook); this npm package provides the browser behavior.

## Magic mode

Add the `WithClientValidation` trait and define your rules — no Blade changes required:

```php
use Livewire\Component;
use MrPunyapal\ClientValidation\Livewire\WithClientValidation;

class CreateUser extends Component
{
    use WithClientValidation;

    public string $email = '';
    public string $password = '';

    protected function rules(): array
    {
        return [
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
        ];
    }
}
```

```blade
<form wire:submit="save">
    <input type="email" wire:model.blur="email">
    <input type="password" wire:model.blur="password">
    <button type="submit">Create user</button>
</form>
```

The trait serializes a client-safe `{rules, messages, attributes, config}` payload into the Livewire snapshot. On component init the adapter reads it, binds blur/input listeners to every `[wire:model]` field with rules, injects `data-error="field"` containers (marked `wire:ignore` so morphs keep them), and intercepts `wire:submit` forms until validation passes. Server-only rules arrive as `ajax:` prefixed rules and are checked against the Laravel endpoint.

When you use the Laravel package's published assets, auto-binding runs automatically (`auto_bind_livewire` config option, default `true`). In a custom build, call it yourself once Livewire is available:

```javascript
import { autoBindLivewireComponents } from '@laravel-client-validation/livewire';

autoBindLivewireComponents({ mode: 'blur', debounce: 300 });
```

## Manual mode: x-wire-validate

For explicit per-field control, register the Alpine directive before `Alpine.start()`:

```javascript
import Alpine from 'alpinejs';
import { registerLivewireDirective } from '@laravel-client-validation/livewire';

registerLivewireDirective(Alpine);
Alpine.start();
```

```html
<input
    type="email"
    wire:model.blur="email"
    name="email"
    x-wire-validate="'required|email|unique:users,email'"
>
<span class="validation-error" data-error="email"></span>

<!-- .live validates on debounced input instead of blur only -->
<input name="username" wire:model.live="username" x-wire-validate.live="'required|min:3'">
```

Field names resolve from `name` first, falling back to the `wire:model` property.

## Events

Both modes dispatch through `$wire.dispatch`: `client-validation` after each field validation and `client-validation-form` after submit-time validation, each carrying `{ field?, valid, errors }`.

## Documentation

https://mrpunyapal.github.io/laravel-client-validation/livewire/

---
title: Examples
description: Start from realistic Laravel examples for Blade, Alpine.js, Livewire, Filament, and programmatic validation.
order: 16
slug: examples
---

Use these examples as starting points when you need a practical integration rather than a conceptual overview.

If you want framework-specific guidance before lifting a snippet, start with [alpine](./alpine.md), [livewire](./livewire.md), [filament](./filament.md), [vanilla](./vanilla.md), [react](./react.md), [vue](./vue.md), or [inertia](./inertia.md).

## Blade data-attribute form

```html
<form data-validate>
    <label>
        Email
        <input name="email" @validateBlur('email', 'required|email')>
    </label>

    <label>
        Username
        <input name="username" @validateLive('username', 'required|alpha_dash|min:3|max:20')>
    </label>

    <label>
        Password
        <input type="password" name="password" @validateSubmit('password', 'required|min:8|confirmed')>
    </label>

    <button type="submit">Create account</button>
</form>
```

## Alpine.js registration form

```html
<div x-data="validation({
    rules: {
        email: 'required|email|unique:users,email',
        password: 'required|min:8|confirmed',
        password_confirmation: 'required',
    },
})">
    <form @submit.prevent="submit(async (payload) => fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    }))">
        <input x-model="form.email" @blur="validate('email')" name="email">
        <p x-show="hasError('email')" x-text="error('email')"></p>

        <input type="password" x-model="form.password" @blur="validate('password')" name="password">
        <p x-show="hasError('password')" x-text="error('password')"></p>
    </form>
</div>
```

## Livewire component

```php
use Livewire\Component;
use MrPunyapal\ClientValidation\Livewire\WithClientValidation;

class CreateUser extends Component
{
    use WithClientValidation;

    public string $email = '';
    public string $password = '';
    public string $password_confirmation = '';

    protected $rules = [
        'email' => 'required|email',
        'password' => 'required|min:8|confirmed',
    ];
}
```

## Filament panel plugin

```php
use MrPunyapal\ClientValidation\Filament\ClientValidationPlugin;

ClientValidationPlugin::make()
    ->enableRemoteValidation()
    ->validationMode('live');
```

## Programmatic validator for a custom frontend

```javascript
import { LaravelValidator } from 'laravel-client-validation/core';

const validator = new LaravelValidator({
    rules: {
        email: 'required|email',
        age: 'nullable|integer|min:18',
    },
});

const result = await validator.validateAll({
    email: 'demo@example.com',
    age: '21',
});

console.log(result.valid, result.errors);
```

## Example file locations in this repository

The package already ships demonstration files under the `examples/` directory.

- `examples/alpine-demo.blade.php`
- `examples/vanilla-demo.blade.php`
- `examples/livewire-demo.blade.php`
- `examples/demo.blade.php`

Use those files when you need a larger end-to-end reference while updating [usage](./usage.md) or [validation rules](./validation-rules.md).

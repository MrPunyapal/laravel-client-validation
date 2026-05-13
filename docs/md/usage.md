---
title: Usage
description: Apply Laravel Client Validation through Blade directives, Alpine.js helpers, remote validation, and programmatic validators.
order: 4
slug: usage
---

Laravel Client Validation supports multiple integration styles, but the core idea is always the same: define rules once, choose a validation trigger, and let the package run client-side checks before falling back to the server when needed.

## Blade directives

For server-rendered Laravel applications, the Blade directives are the fastest way to attach metadata to a field.

```html
<form data-validate>
    <input name="email" @rules('email', 'required|email', ['mode' => 'blur'])>
    <input name="username" @validateLive('username', 'required|alpha_dash|min:3')>
    <input name="password" @validateSubmit('password', 'required|min:8|confirmed')>
</form>
```

Use the explicit shorthand that matches the interaction you want. That keeps your templates readable when scanning large forms.

## Alpine.js forms

The package exposes Alpine-friendly helpers for form state and field-level feedback.

```html
<div x-data="validation({
    rules: {
        email: 'required|email',
        password: 'required|min:8',
        password_confirmation: 'required|same:password',
    },
    messages: {
        'password.min': 'Use at least eight characters.',
    },
})">
    <form @submit.prevent="submit(async (data) => console.log(data))">
        <input x-model="form.email" @blur="validate('email')" name="email">
        <p x-show="hasError('email')" x-text="error('email')"></p>

        <input type="password" x-model="form.password" @blur="validate('password')" name="password">
        <p x-show="hasError('password')" x-text="error('password')"></p>
    </form>
</div>
```

## Remote validation flow

Rules such as `unique` and `exists` stay server-backed. The browser bundle sends them to the package route when `enable_ajax_validation` is enabled.

```html
<input name="email" @validateLive('email', 'required|email|unique:users,email')>
```

With the default configuration, the request is posted to `client-validation/validate`.

## Programmatic validation

You can also work with the validator directly in JavaScript.

```javascript
import { LaravelValidator } from 'laravel-client-validation/core';

const validator = new LaravelValidator({
    rules: {
        email: 'required|email',
        password: 'required|min:8',
    },
    messages: {
        'email.required': 'Email is required.',
    },
});

const fieldResult = await validator.validateField('email', 'name@example.com');
const formResult = await validator.validateAll({
    email: 'name@example.com',
    password: 'secret123',
});
```

## Validation hooks

Hook into form lifecycle events when you need analytics, UI transitions, or custom logging.

```javascript
const validator = new LaravelClientValidation.Validator({ rules });

validator
    .beforeValidate(({ data }) => console.log('Validating', data))
    .afterValidate(({ valid, errors }) => console.log('Done', valid, errors));
```

## Livewire and Filament

The package includes dedicated integration layers for Livewire and Filament, but the rule grammar stays the same.

```php
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

## Related pages

- Use [examples](./examples.md) for larger snippets.
- Review [custom rules](./custom-rules.md) when built-in rules are not sufficient.
- Keep [troubleshooting](./troubleshooting.md) close when remote validation and CSRF interact unexpectedly.

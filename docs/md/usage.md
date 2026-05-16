---
title: Usage
description: Choose the right Laravel Client Validation integration and reuse the same rule grammar across Blade, Alpine, Livewire, Filament, vanilla JavaScript, React, Vue, and Inertia-driven apps.
order: 4
slug: usage
---

Laravel Client Validation supports multiple integration styles, but the core idea stays the same: keep Laravel-style rule strings as the source of truth, pick when validation should run, and let remote rules fall through to Laravel when the browser needs backend context.

## Shared building blocks

- The rule grammar matches Laravel validation strings.
- Trigger modes map cleanly across integrations: `blur` by default, `live` or `input` for immediate feedback, and `submit` or `form` when validation should block submission.
- Remote rules such as `unique` and `exists` still travel through the Laravel endpoint when `enable_ajax_validation` is enabled.
- Existing Laravel `FormRequest` classes can be turned into an Alpine-ready payload with `ClientValidation::payloadFromRequest()`.

## Choose an integration page

- Use [alpine](./alpine.md) for Blade directives, `x-validate`, and the `validation()` helper.
- Use [livewire](./livewire.md) for `WithClientValidation`, `x-wire-validate`, and client-side pre-validation in Livewire components.
- Use [filament](./filament.md) for panel plugin setup, `ClientValidatedField`, and custom Filament field traits.
- Use [vanilla](./vanilla.md) when you want data attributes or imperative browser validation without a framework.
- Use [react](./react.md) and [vue](./vue.md) for the shipped SPA adapters.
- Use [inertia](./inertia.md) when your Laravel app uses Inertia with React or Vue. There is no dedicated Inertia adapter yet, so that page shows the supported composition pattern.

## Shared remote-validation flow

```html
<input name="email" @validateLive('email', 'required|email|unique:users,email')>
```

With the default configuration, the request is posted to `client-validation/validate`.

## Reuse a FormRequest

If your form already uses a Laravel `FormRequest`, keep that request as the source of truth instead of rewriting the same rules in Blade or JavaScript.

```php
use App\Http\Requests\CreateUserRequest;
use MrPunyapal\ClientValidation\Facades\ClientValidation;

public function create()
{
    $validation = ClientValidation::fromRequest(CreateUserRequest::class);

    return view('users.create', compact('validation'));
}
```

```blade
<div x-data="validation(@js($validation))">
    <form @submit.prevent="submit(async (payload) => await saveUser(payload))">
        <input x-model="form.email" @blur="validate('email')" name="email">
        <p x-show="hasError('email')" x-text="error('email')"></p>

        <input type="password" x-model="form.password" @blur="validate('password')" name="password">
        <p x-show="hasError('password')" x-text="error('password')"></p>
    </form>
</div>
```

The payload includes parsed client rules, AJAX-backed rules, custom messages, attribute names, and browser config derived from the request's `rules()`, `messages()`, and `attributes()` methods. Rules such as `unique` and `exists` still validate through the remote endpoint when the browser needs Laravel context.

## Programmatic validator

Every adapter ultimately wraps the same core validator.

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

## Related pages

- Use [examples](./examples.md) for larger snippets.
- Review [custom rules](./custom-rules.md) when built-in rules are not sufficient.
- Keep [troubleshooting](./troubleshooting.md) close when remote validation and CSRF interact unexpectedly.

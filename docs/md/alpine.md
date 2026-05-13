---
title: Alpine.js
description: Use x-validate directives and the validation() Alpine helper to run Laravel-style validation in reactive Blade forms.
order: 5
slug: alpine
---

Alpine.js is the shortest path from Laravel rule strings to interactive browser feedback. The package supports both field-level directives and a form-scoped `validation()` helper.

## Register the adapter

```javascript
import Alpine from 'alpinejs';
import registerAlpine from 'laravel-client-validation/alpine';

window.Alpine = Alpine;
registerAlpine(Alpine);
Alpine.start();
```

If you load the browser bundle through `@clientValidationAssets`, the package auto-registers Alpine integration when Alpine boots.

## Validate individual fields

```html
<input name="email" x-validate="'required|email'">
<input name="username" x-validate.live="'required|alpha_dash|min:3'">
<input type="password" name="password" x-validate.submit="'required|min:8|confirmed'">
```

`x-validate` validates on blur by default. `.live` adds debounced input validation and `.submit` blocks form submission until the field passes.

## Manage a full Alpine form

```html
<div x-data="validation({
    rules: {
        email: 'required|email|unique:users,email',
        password: 'required|min:8',
        password_confirmation: 'required|same:password',
    },
    messages: {
        'password.min': 'Use at least eight characters.',
    },
})">
    <form @submit.prevent="submit(async (payload) => await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    }))">
        <input x-model="form.email" @input="validateLive('email')" @blur="validate('email')" name="email">
        <p x-show="hasError('email')" x-text="error('email')"></p>

        <input type="password" x-model="form.password" @blur="validate('password')" name="password">
        <p x-show="hasError('password')" x-text="error('password')"></p>
    </form>
</div>
```

The helper keeps touched state, per-field errors, and debounced remote validation in one Alpine object. Use `stateClass(field)` when you want to map the package validity state into your own utility classes.

## Cross-field and remote rules

Rules such as `same`, `different`, `required_if`, and `unique` work best when every sibling value lives in the same `form` object so Alpine always passes the latest state into the validator.

## Related pages

- Use [installation](./installation.md) to bootstrap the bundle in Blade layouts.
- Keep [usage](./usage.md) nearby for the cross-framework model.
- Open [examples](./examples.md) when you need larger Blade snippets.

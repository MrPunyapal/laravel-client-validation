---
title: Vanilla JavaScript
description: Attach Laravel-style rules to plain HTML forms with data attributes or the vanilla form validator factory.
order: 8
slug: vanilla
---

Use the vanilla adapter when you want client validation in a Laravel Blade page or custom frontend without Alpine, React, Vue, or Livewire.

## Let the browser bundle auto-init forms

```html
<form data-validate>
    <input name="email" data-rules="required|email" data-validate-on="blur">
    <input name="username" data-rules="required|alpha_dash|min:3" data-validate-on="input">
    <button type="submit">Create account</button>
</form>
```

When the browser bundle is loaded, forms matching `form[data-validate]` are initialized automatically on `DOMContentLoaded`.

## Create a validator programmatically

```javascript
import { createFormValidator } from 'laravel-client-validation/vanilla';

const form = document.querySelector('#registration-form');

const validator = createFormValidator(form, {
    onSubmit(data) {
        console.log('Validated payload', data);
    },
});
```

Use the factory when you want to control initialization order or intercept successful submit events yourself.

## Customize messages and field names

```html
<input
    name="email"
    data-rules="required|email"
    data-message="Use a valid work email address."
    data-attribute="work email"
>
```

`data-message` overrides the first rule message for that field, and `data-attribute` controls the human-readable attribute name in generated messages.

## Cross-field rules

Cross-field rules such as `confirmed`, `same`, and `required_if` compare against sibling values. The vanilla adapter collects every named `input`, `select`, or `textarea` inside the form — including fields without `data-rules` — so a confirmation input does not need its own rules:

```html
<form data-validate>
    <input type="password" name="password" data-rules="required|min:8|confirmed">
    <input type="password" name="password_confirmation">

    <button type="submit">Sign up</button>
</form>
```

Here `confirmed` reads `password_confirmation` from the form even though that input carries no `data-rules`. When validation fails, the adapter injects an error element with a `data-error-for` attribute next to the invalid field; when it passes again, that element is removed.

## Related pages

- Use [installation](./installation.md) when the bundle itself is not loading.
- Open [react](./react.md) or [vue](./vue.md) when you need a framework-owned UI layer instead of DOM-managed errors.
- Keep [examples](./examples.md) nearby for larger snippets.

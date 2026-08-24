# @laravel-client-validation/vanilla

Vanilla JS adapter for Laravel Client Validation. Attach Laravel rule strings to plain HTML forms with data attributes — no framework required.

Requires `@laravel-client-validation/core` (installed automatically as a dependency).

## Install

```bash
npm install @laravel-client-validation/vanilla
```

## Usage

Mark a form with `data-validate` and declare rules per field with `data-rules`:

```html
<form data-validate method="POST" action="/register">
    <input type="email" name="email" data-rules="required|email">
    <span class="validation-error" data-error="email"></span>

    <input type="password" name="password" data-rules="required|min:8" data-validate-on="blur">
    <input type="password" name="password_confirmation"
           data-rules="required|confirmed" data-attribute="password confirmation">

    <button type="submit">Sign up</button>
</form>
```

```javascript
import { autoInit } from '@laravel-client-validation/vanilla';

autoInit();
```

On submit, every field is validated first; if anything fails the submit is blocked and the first error per field is shown. When all rules pass, your `onSubmit` callback runs or the form submits natively.

## Auto-init

`autoInit()` binds every `form[data-validate]` on the page — it waits for `DOMContentLoaded` if the document is still loading. Repeated calls skip forms that already have a validator, so it is safe to call again after dynamic content loads. Alternatives:

```javascript
import { initForms, createFormValidator } from '@laravel-client-validation/vanilla';

// Custom selector.
initForms('form[data-validate].signup');

// Manual, single form with options.
createFormValidator(form, {
    debounce: 200,
    onSubmit: (data, form) => fetch('/register', { method: 'POST', body: JSON.stringify(data) }),
});
```

Each `VanillaFormValidator` instance also exposes `validateField(name)`, `validateAll()`, `clearErrors(field?)`, `getErrors()`, and `destroy()`. Sibling inputs without `data-rules` are still collected as context so cross-field rules (`confirmed`, `same`, `required_if`) work. Individual fields get an `el.validate()` function, and each validation dispatches a bubbling `validated` CustomEvent with the result in `event.detail`.

## Configuration

Defaults can be overridden globally before init via `window.LaravelClientValidation.config`, or per form through `createFormValidator(form, options)`:

```javascript
createFormValidator(form, {
    remoteUrl: '/client-validation/validate',
    debounce: 300,
    errorClass: 'validation-error text-red-500 text-sm mt-1',
    validClass: 'is-valid border-green-500',
    invalidClass: 'is-invalid border-red-500',
    showErrors: true,
});
```

## Data attributes

| Attribute | Description |
|-----------|-------------|
| `data-validate` | Add to `<form>` to enable validation |
| `data-rules` | Laravel-style rule string, e.g. `required\|email` |
| `data-validate-on` | Trigger: `blur` (default), `input`/`live`, or `submit` |
| `data-message` | Custom error message for the field's first rule |
| `data-attribute` | Display name used in messages |

## Documentation

https://mrpunyapal.github.io/laravel-client-validation/vanilla/

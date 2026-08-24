# @laravel-client-validation/alpine

Alpine.js adapter for Laravel Client Validation. It registers the `x-validate` directive, the `validation()` data component, and a `$validation` magic helper so Blade forms can validate against Laravel rule strings in the browser.

Requires `@laravel-client-validation/core` (installed automatically as a dependency).

## Install

```bash
npm install @laravel-client-validation/alpine
```

Register the plugin **before** `Alpine.start()` so directives exist on first render:

```javascript
import Alpine from 'alpinejs';
import registerAlpine from '@laravel-client-validation/alpine';

window.Alpine = Alpine;
registerAlpine(Alpine);
Alpine.start();
```

## x-validate directive

Attach rules to any named field. Validation runs on blur by default:

```html
<input type="email" name="email" x-validate="'required|email'">
<input name="username" x-validate.live="'required|min:3'">
```

Modifiers control the trigger: `x-validate` (blur, default), `x-validate.live` (debounced input + blur), `x-validate.submit` (validated when the surrounding form submits). On failure the field gets the configured invalid class and an error element is inserted next to it; on success it gets the valid class.

Fields without an enclosing `validation()` component still support cross-field rules (`confirmed`, `same:x`, `required_if:y`) — sibling input values are collected from the enclosing form or `x-data` root automatically.

## validation() data component

For full-form handling with reactive state:

```html
<div x-data="validation({
    rules: { email: 'required|email', password: 'required|min:8' }
})">
    <input type="email" x-model="form.email" @blur="validate('email')">
    <span x-text="error('email')"></span>

    <input type="password" x-model="form.password" @blur="validateLive('password')">
    <span x-text="error('password')"></span>

    <button type="button" @click="submit(sendToServer)" :disabled="validating">Sign up</button>
</div>
```

The component accepts `rules`, `messages`, `attributes`, `initialData`, and `config` options:

```html
<div x-data="validation({
    rules: { email: 'required|email' },
    messages: { 'email.required': 'We need your email to continue.' },
    attributes: { email: 'email address' },
    initialData: { email: '' }
})">
    ...
</div>
```

It exposes `form`, `errors`, `touched`, and `validating` state, plus helpers such as `validate(field)`, `validateLive(field)`, `validateAll()`, `submit(callback)`, `error(field)`, `errorList(field)`, `hasError(field)`, `hasErrors()`, `clearError(field?)`, `stateClass(field)`, `isValid(field?)`, and `reset()`.

Inside any Alpine expression, `$validation` resolves to the nearest enclosing `validation()` component.

## Configuration

Global behavior can be overridden via `window.LaravelClientValidation.config` before registration, or per-component through the `config` option:

```javascript
window.LaravelClientValidation = {
    config: {
        remoteUrl: '/client-validation/validate',
        debounce: 300,
        errorClass: 'text-red-500 text-sm mt-1',
        validClass: 'border-green-500',
        invalidClass: 'border-red-500',
    },
};
```

## Documentation

https://mrpunyapal.github.io/laravel-client-validation/alpine/

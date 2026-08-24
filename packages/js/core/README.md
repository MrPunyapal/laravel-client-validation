# @laravel-client-validation/core

Framework-agnostic validation core for Laravel Client Validation. It reimplements 100+ Laravel validation rules in JavaScript and ships the shared building blocks every adapter uses:

- **`LaravelValidator`** – rule parsing, field/form validation, error state, event hooks
- **`RuleRegistry`** – shared registry of rule implementations, messages, and remote-rule flags
- **`RemoteValidator`** – AJAX validation against a Laravel endpoint (`unique`, `exists`, …)
- **`EventEmitter`** – small promise-aware event bus

> Most users want an adapter package instead — `@laravel-client-validation/alpine`, `/vanilla`, `/livewire`, `/react`, or `/vue`. Every adapter depends on this core and handles DOM/framework wiring for you. Use core directly when you are writing your own adapter or integrating a framework we do not cover yet.

## Install

```bash
npm install @laravel-client-validation/core
```

## Quick start

```javascript
import LaravelValidator from '@laravel-client-validation/core';

const validator = new LaravelValidator({
    rules: {
        email: 'required|email',
        password: 'required|min:8|confirmed',
    },
});

// Validate one field; pass sibling values for cross-field rules like confirmed.
const result = await validator.validateField('password', 'short', {
    email: 'jane@example.com',
    password: 'short',
    password_confirmation: 'short',
});
// result => { valid: false, errors: ['The password must be at least 8 characters.'] }

// Validate everything at once.
const form = await validator.validateAll({
    email: 'jane@example.com',
    password: 'secret123',
    password_confirmation: 'secret123',
});
// form => { valid: true, errors: {}, results: { ... } }
```

Server-side rules (`unique`, `exists`, and other rules flagged as remote) are routed to the configured endpoint (`remoteUrl`, default `/client-validation/validate`) through `RemoteValidator`. The Laravel side of that endpoint ships with the `laravel-client-validation` composer package.

## Custom rules

Rules have the signature `(value, params, field, context) => boolean | Promise<boolean>`:

```javascript
import LaravelValidator from '@laravel-client-validation/core';

const validator = new LaravelValidator({ rules: { phone: 'required|phone' } });

// Per-instance rule.
validator.extend(
    'phone',
    (value) => /^\+?[0-9]{7,15}$/.test(String(value)),
    'The :attribute must be a valid phone number.'
);

// Or register globally so every validator can use it.
import { RuleRegistry } from '@laravel-client-validation/core';

RuleRegistry.extend('slug', (value) => /^[a-z0-9-]+$/.test(String(value)), 'The :attribute format is invalid.');
```

## Events

Validators emit `field:validating`, `field:validated`, `form:validating`, and `form:validated`:

```javascript
validator.afterFieldValidate(({ field, valid, errors }) => {
    console.log(field, valid ? 'ok' : errors[0]);
});
```

## Documentation

https://mrpunyapal.github.io/laravel-client-validation/validation-rules/

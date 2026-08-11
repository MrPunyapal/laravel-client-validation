# Laravel Client Validation

> Bring Laravel-style validation rules into the browser for Alpine, Livewire, Filament, and JavaScript forms.

Laravel Client Validation brings familiar Laravel validation rules into the browser so forms can respond immediately without maintaining a second rule set by hand.

## Why this package exists

- Keep Laravel-style validation rules close to the UI.
- Reuse the same package across Alpine.js, Livewire, Filament, or plain JavaScript.
- Fall back to AJAX when a rule depends on the server, such as `unique` or `exists`.

## Quick start

Install the package and publish the configuration and browser assets:

```bash
composer require mrpunyapal/laravel-client-validation
php artisan client-validation:install
```

Then render the package assets in a Blade layout:

```php
<!doctype html>
<html lang="en">
<head>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @clientValidationAssets
</head>
<body>
    {{ $slot }}
</body>
</html>
```

## Documentation map

- Start with [installation](./installation.md) if you are onboarding the package into a Laravel app.
- Review [configuration](./configuration.md) before changing default validation modes, messages, AJAX, or styling.
- Use [usage](./usage.md) for the shared validation model and the integration map.
- Reach for [alpine](./alpine.md) when you want `x-validate` directives or the `validation()` Alpine helper.
- Use [livewire](./livewire.md) for `WithClientValidation`, `x-wire-validate`, and client-side pre-validation in Livewire components.
- Open [filament](./filament.md) when your forms run inside a Filament panel or custom field.
- Pick [vanilla](./vanilla.md), [react](./react.md), or [vue](./vue.md) for browser-adapter usage outside Blade-first forms.
- Keep [inertia](./inertia.md) nearby when your Laravel app uses Inertia with React or Vue.
- Keep [validation rules](./validation-rules.md) nearby when auditing client-side parity.
- Reach for [custom rules](./custom-rules.md) when the default rule set is not enough.
- Run the checks in [testing](./testing.md) before publishing a package release.
- Open [documentation workflow](./documentation-workflow.md) when you are changing Markdown pages, the docs template, or generated site output.
- Check [troubleshooting](./troubleshooting.md) when a directive, rule, or AJAX request does not behave as expected.
- Browse [examples](./examples.md) for practical Laravel snippets you can adapt directly.

## Supported integration styles

### Blade and Alpine.js

The package exposes Blade directives like `@rules`, `@validateBlur`, and `@validateLive`, alongside Alpine helpers and `x-validate` directives. Use the dedicated [alpine](./alpine.md) page for the directive modes, `validation()` helper, and field-state patterns.

```html
<form data-validate>
    <input name="email" @rules('email', 'required|email')>
    <input name="username" @validateLive('username', 'required|alpha_dash|min:3')>
</form>
```

### Livewire and Filament

Livewire components can use `WithClientValidation`, while Filament panels can install `ClientValidationPlugin` and field traits for form-level feedback. The dedicated [livewire](./livewire.md) and [filament](./filament.md) pages cover those package-specific integration surfaces.

```php
use MrPunyapal\ClientValidation\Filament\ClientValidationPlugin;

$panel->plugins([
    ClientValidationPlugin::make()->validationMode('live'),
]);
```

### Vanilla JavaScript

If you only need client-side validation in a custom frontend, the core validator and adapters are available from the browser bundle or ES module entrypoints. Use the adapter-specific guides for [vanilla JavaScript](./vanilla.md), [React](./react.md), [Vue](./vue.md), and [Inertia](./inertia.md).

```javascript
import { LaravelValidator } from 'laravel-client-validation/core';

const validator = new LaravelValidator({
    rules: {
        email: 'required|email',
    },
});
```


---

# Installation

> Install Laravel Client Validation in a Laravel application and verify the client bundle is available in Blade views.

Install Laravel Client Validation with Composer, publish the package assets, and verify the generated browser bundle is loaded before you start attaching rules to inputs.

## Requirements

- PHP 8.2 or newer.
- A Laravel application that can load package service providers.
- A frontend layout where Blade can render the package assets or your own script tags.

## Install the package

```bash
composer require mrpunyapal/laravel-client-validation
php artisan client-validation:install
```

The install command publishes the package configuration and the browser bundle into `public/vendor/client-validation`.

## Laravel Boost

If the Laravel application also uses [Laravel Boost](https://laravel.com/docs/13.x/boost), this package ships a third-party Boost skill.

Use `boost:install` when Boost is being installed for the first time, or refresh third-party skills after package changes with:

```bash
php artisan boost:update --discover
```

When skills are enabled, Boost can install the `laravel-client-validation-development` skill and give AI agents package-aware guidance for Blade directives, Alpine helpers, Livewire integration, Filament setup, and remote validation.

## Include the assets

The package ships the `@clientValidationAssets` Blade directive. It injects configuration, prefers the published local bundle, and falls back to the CDN bundle when the asset files are missing.

```php
<head>
    @clientValidationAssets
</head>
```

If you prefer to control configuration separately, render the configuration object and load the bundle yourself:

```php
<head>
    @clientValidationConfig
    <script src="{{ asset('vendor/client-validation/client-validation.iife.js') }}"></script>
</head>
```

## First validation field

Use Blade directives immediately after the script is present on the page.

```html
<form data-validate>
    <input name="email" @validateBlur('email', 'required|email')>
    <input name="password" @validateSubmit('password', 'required|min:8')>
    <button type="submit">Create account</button>
</form>
```

## Verify the installation

### Browser smoke test

Open the form, tab out of the `email` field, and confirm that invalid values show client-side feedback before the form submits.

### Remote validation smoke test

Remote rules such as `unique` should send requests to the validation endpoint generated from the `route_prefix` configuration.

```html
<input name="email" @validateLive('email', 'required|email|unique:users,email')>
```

When AJAX validation is enabled, the request targets `/client-validation/validate` by default.

## Next steps

- Review [configuration](./configuration.md) to tune debounce, AJAX, styling, and message defaults.
- Use [usage](./usage.md) as the integration map, then jump to [alpine](./alpine.md), [livewire](./livewire.md), [filament](./filament.md), [vanilla](./vanilla.md), or [inertia](./inertia.md).
- Keep [troubleshooting](./troubleshooting.md) nearby if the bundle is missing or remote rules do not fire.


---

# Configuration

> Configure default validation behavior, AJAX, styling, and message handling through config/client-validation.php.

Laravel Client Validation publishes a single configuration file, `config/client-validation.php`, that controls how the browser bundle is loaded and how validation behaves by default.

## Publishing and editing config

If you skipped the installer, publish the configuration manually:

```bash
php artisan vendor:publish --tag=client-validation-config
```

Then edit the generated file in your application.

## Core runtime options

Use these settings to decide when validation runs and whether server-backed rules are allowed.

```php
return [
    'auto_include_assets' => true,
    'enable_ajax_validation' => true,
    'ajax_timeout' => 5000,
    'route_prefix' => 'client-validation',
    'validation_mode' => 'blur',
    'debounce_ms' => 300,
];
```

### Recommended defaults

- Keep `validation_mode` at `blur` for most text fields.
- Switch to `input` or `live` only when feedback needs to be immediate.
- Leave `enable_ajax_validation` enabled if you use `unique`, `exists`, `password`, or other server-side rules.

## Rate limiting and caching

AJAX validation is throttled and cached to avoid spamming the backend while the user types.

```php
'rate_limit' => [
    'max_attempts' => 60,
    'decay_seconds' => 60,
],

'cache' => [
    'enabled' => true,
    'ttl' => 300,
    'max_size' => 1000,
],
```

Use a lower debounce or lower rate limit only when you have confirmed the validation endpoint can tolerate the extra traffic.

## Error templates and field styling

The package can add and remove CSS classes automatically when a field passes or fails validation.

```php
'error_template' => [
    'enabled' => true,
    'container_class' => 'validation-error text-red-500 text-sm mt-1',
    'show_on' => ['fail'],
    'position' => 'after',
],

'field_styling' => [
    'enabled' => true,
    'valid_class' => 'is-valid border-green-500',
    'invalid_class' => 'is-invalid border-red-500',
],
```

This is a good place to align the generated classes with your Tailwind, Bootstrap, or bespoke utility classes.

## Default messages and attributes

Message placeholders are merged with per-form messages, so keep the config file focused on cross-application defaults.

```php
'messages' => [
    'required' => 'The :attribute field is required.',
    'email' => 'The :attribute must be a valid email address.',
],

'attributes' => [
    'password_confirmation' => 'password confirmation',
],
```

## Rule capability lists

The configuration file also keeps track of which rules are treated as fully client-side and which rules should always use the server.

```php
'client_side_rules' => [
    'required', 'email', 'min', 'max', 'between', 'confirmed',
],

'server_side_rules' => [
    'unique', 'exists', 'password', 'current_password', 'encoding',
],
```

Only adjust those lists when you are extending the package itself and you fully understand how the parser and browser runtime treat the rule.

## Example environment overrides

```ini
CLIENT_VALIDATION_AUTO_INCLUDE=true
CLIENT_VALIDATION_ENABLE_AJAX=true
CLIENT_VALIDATION_AJAX_TIMEOUT=7000
CLIENT_VALIDATION_RATE_LIMIT=30
CLIENT_VALIDATION_RATE_DECAY=60
CLIENT_VALIDATION_MODE=blur
CLIENT_VALIDATION_DEBOUNCE=250
```

## Related pages

- See [usage](./usage.md) for directive-level overrides.
- See [validation rules](./validation-rules.md) for rule behavior and remote fallback.
- See [troubleshooting](./troubleshooting.md) when configuration and runtime behavior drift apart.


---

# Usage

> Choose the right Laravel Client Validation integration and reuse the same rule grammar across Blade, Alpine, Livewire, Filament, vanilla JavaScript, React, Vue, and Inertia-driven apps.

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


---

# Alpine.js

> Use x-validate directives and the validation() Alpine helper to run Laravel-style validation in reactive Blade forms.

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


---

# Livewire

> Combine WithClientValidation, x-wire-validate, and the Livewire browser adapter for fast client-side feedback before a server round-trip.

Livewire integration has two layers: the PHP trait keeps the server rules central, and the browser adapter lets fields fail fast before a Livewire request leaves the page. The JavaScript adapter supports both Livewire 3 and Livewire 4.

## Add the Livewire trait

```php
use Livewire\Component;
use MrPunyapal\ClientValidation\Livewire\WithClientValidation;

class CreateUser extends Component
{
    use WithClientValidation;

    public string $email = '';
    public string $password = '';
    public string $password_confirmation = '';

    protected array $rules = [
        'email' => 'required|email|unique:users,email',
        'password' => 'required|min:8|confirmed',
    ];
}
```

`WithClientValidation` exposes computed properties such as `$this->clientRules`, `$this->clientMessages`, and `$this->clientValidationData` so the same component rules can be reused in the browser.

## Validate fields in the Blade view

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

## Use explicit rules when you only need one field

```html
<input
    wire:model.blur="email"
    name="email"
    x-wire-validate="'required|email|unique:users,email'"
>
```

This is useful when the rules are small or when you are incrementally adopting the package inside an existing component.

## Listen for client-validation events

The Livewire adapter dispatches `client-validation-error` and `client-validation-cleared` events back to the component. Use them when you need to sync custom UI or logging around client-side failures.

## Related pages

- Open [filament](./filament.md) for the panel-specific helper layer.
- Use [troubleshooting](./troubleshooting.md) when Livewire requests and client validation drift apart.
- Check [examples](./examples.md) for compact component snippets.


---

# Filament

> Register the Filament plugin and attach client-side Laravel rules to panel fields or custom field components.

Filament support builds on the same browser runtime, but gives you a package-specific plugin and field helpers so panel forms can emit client feedback before submit.

## Register the panel plugin

```php
use Filament\Panel;
use Filament\PanelProvider;
use MrPunyapal\ClientValidation\Filament\ClientValidationPlugin;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel->plugins([
            ClientValidationPlugin::make()
                ->enableRemoteValidation()
                ->validationMode('live'),
        ]);
    }
}
```

`validationMode('live')` makes generated `x-validate.live` bindings the default for fields handled through the package helper.

## Use the built-in field wrapper

```php
use MrPunyapal\ClientValidation\Filament\ClientValidatedField;

ClientValidatedField::make('email')
    ->clientValidation('required|email|unique:users,email')
    ->clientValidationMode('live');
```

Use `ClientValidatedField` when you want a drop-in field that already renders the validation wrapper view shipped with the package.

## Add client validation to a custom Filament field

```php
use Filament\Forms\Components\Field;
use MrPunyapal\ClientValidation\Filament\HasClientValidation;

class PhoneField extends Field
{
    use HasClientValidation;
}
```

In the Blade view for that field, render the generated attributes on the wrapper that owns the input:

```blade
<div
    @if ($hasClientValidation())
        x-validate{{ $getClientValidationModifier() }}="{{ $getClientValidationRules() }}"
    @endif
>
    {{ $getChildComponentContainer() }}
</div>
```

## Let Filament infer rules from the field

If you call `withClientValidation()` instead of `clientValidation('...')`, the trait falls back to the field's existing required state and validation rules where possible.

## Related pages

- Use [livewire](./livewire.md) when your Filament form also needs component-level Livewire guidance.
- Review [configuration](./configuration.md) for remote-validation and class defaults.
- Keep [examples](./examples.md) nearby for quick copyable snippets.


---

# Vanilla JavaScript

> Attach Laravel-style rules to plain HTML forms with data attributes or the vanilla form validator factory.

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

## Related pages

- Use [installation](./installation.md) when the bundle itself is not loading.
- Open [react](./react.md) or [vue](./vue.md) when you need a framework-owned UI layer instead of DOM-managed errors.
- Keep [examples](./examples.md) nearby for larger snippets.


---

# React

> Keep Laravel rule strings in React components with the shipped React validator helpers and field prop generators.

The React adapter exposes helper functions rather than a full React state library. Keep the validator instance stable, subscribe to changes, and drive your own component state from that subscription.

## Create one validator instance per form

```jsx
import { useEffect, useRef, useState } from 'react';
import {
    createFieldProps,
    createReactValidator,
    getErrorProps,
} from 'laravel-client-validation/react';

export default function RegisterForm() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [, forceRender] = useState(0);
    const validatorRef = useRef(null);

    if (validatorRef.current === null) {
        validatorRef.current = createReactValidator({
            rules: {
                email: 'required|email',
                password: 'required|min:8',
            },
        });
    }

    useEffect(() => validatorRef.current.subscribe(() => {
        forceRender((value) => value + 1);
    }), []);

    const validator = validatorRef.current;

    return (
        <form>
            <input
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                {...createFieldProps(validator, 'email', {
                    getData: () => form,
                    mode: 'blur',
                })}
            />

            <p {...getErrorProps(validator, 'email')} />
        </form>
    );
}
```

`createFieldProps()` can generate blur and change handlers, but you still own controlled input values and the React render cycle.

## Validate before submit

```javascript
const result = await validator.validateAll(form);

if (result.valid) {
    // Post the form or call your mutation.
}
```

This is the easiest place to keep client-side feedback and Laravel server validation in the same submit flow.

## Related pages

- Use [inertia](./inertia.md) when the React form lives inside an Inertia page.
- Open [usage](./usage.md) for the shared rule and remote-validation model.
- Keep [examples](./examples.md) nearby for package-level snippets.


---

# Vue

> Use the shipped Vue directive, plugin, or validator helpers to keep Laravel rules close to Vue forms.

The Vue adapter works best when you choose one of two styles: DOM-driven `v-validate` directives for quick forms, or an imperative validator instance that you wrap in your own Vue reactivity.

## Register the plugin

```javascript
import { createApp } from 'vue';
import { VueValidationPlugin } from 'laravel-client-validation/vue';
import App from './App.vue';

const app = createApp(App);

app.use(VueValidationPlugin, {
    debounce: 300,
    validClass: 'border-green-500',
    invalidClass: 'border-red-500',
});

app.mount('#app');
```

## Use the directive in a component

```vue
<template>
    <form @submit.prevent="submit">
        <input v-model="form.email" v-validate.live="'required|email'" name="email">
        <span class="validation-error" data-error="email"></span>

        <input v-model="form.password" v-validate="'required|min:8'" type="password" name="password">
        <span class="validation-error" data-error="password"></span>
    </form>
</template>

<script setup>
import { reactive } from 'vue';

const form = reactive({
    email: '',
    password: '',
});

function submit() {
    // Let the validator update the DOM before posting the form.
}
</script>
```

The directive updates classes and nearby error containers directly, so it is a good fit when you want package-managed DOM feedback with minimal component code.

## Use an imperative validator with your own state

```javascript
import { createVueValidator } from 'laravel-client-validation/vue';

const validator = createVueValidator({
    rules: {
        email: 'required|email',
        password: 'required|min:8',
    },
});

const result = await validator.validateAll({
    email: form.email,
    password: form.password,
});
```

Wrap `getError()`, `hasError()`, and `getAllErrors()` in your own refs or computed properties when you want Vue-controlled error rendering instead of DOM updates.

## Related pages

- Use [inertia](./inertia.md) when the Vue form lives inside an Inertia page.
- Open [vanilla](./vanilla.md) for DOM-first validation outside Vue.
- Keep [examples](./examples.md) nearby for compact snippets.


---

# Inertia

> Use Laravel Client Validation inside Inertia pages by composing the shipped React or Vue adapters; no dedicated Inertia adapter is required.

Laravel Client Validation does not ship a dedicated Inertia adapter yet. Inertia apps already run on React or Vue, so the supported pattern is to use the matching browser adapter inside the page component and post only after client validation passes.

## React-based Inertia pages

```jsx
import { useForm } from '@inertiajs/react';
import { createReactValidator } from 'laravel-client-validation/react';

const validator = createReactValidator({
    rules: {
        email: 'required|email',
        password: 'required|min:8',
    },
});

export default function Register() {
    const form = useForm({
        email: '',
        password: '',
    });

    const submit = async (event) => {
        event.preventDefault();

        const result = await validator.validateAll(form.data);

        if (result.valid) {
            form.post('/register');
        }
    };

    return (
        <form onSubmit={submit}>
            <input name="email" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} />
            <input type="password" name="password" value={form.data.password} onChange={(event) => form.setData('password', event.target.value)} />
        </form>
    );
}
```

## Vue-based Inertia pages

```vue
<script setup>
import { useForm } from '@inertiajs/vue3';
import { createVueValidator } from 'laravel-client-validation/vue';

const form = useForm({
    email: '',
    password: '',
});

const validator = createVueValidator({
    rules: {
        email: 'required|email',
        password: 'required|min:8',
    },
});

const submit = async () => {
    const result = await validator.validateAll({
        email: form.email,
        password: form.password,
    });

    if (result.valid) {
        form.post('/register');
    }
};
</script>

<template>
    <form @submit.prevent="submit">
        <input v-model="form.email" name="email">
        <input v-model="form.password" type="password" name="password">
    </form>
</template>
```

## Remote rules and server validation

Inertia does not change remote rule behavior. `unique`, `exists`, and other server-backed rules still call the configured Laravel endpoint before the Inertia form posts.

## Related pages

- Use [react](./react.md) and [vue](./vue.md) for the adapter-specific APIs.
- Open [troubleshooting](./troubleshooting.md) when remote rules or asset bootstrapping fail.
- Keep [examples](./examples.md) nearby for package-level snippets.


---

# Validation Rules

> Understand which Laravel validation rules run fully in the browser, which rules remain server-backed, and how to document edge cases.

Laravel Client Validation currently ships broad client-side coverage and a smaller set of explicitly remote rules. Use this page as the working overview when deciding whether a rule can stay in the browser or must hit the backend.

## Rule parity at a glance

- Client-side rules: 104
- Remote rules: 5 primary rules handled through AJAX
- Rule source lists: `config/client-validation.php`, `resources/js/core/rules`, and `resources/js/core/RuleRegistry.js`

## Common client-side categories

### Core and string rules

| Rule | Purpose | Data types | Example |
| --- | --- | --- | --- |
| `required` | Reject empty input | string, array, file | `required` |
| `email` | Validate email format | string | `required|email` |
| `alpha_dash` | Allow letters, numbers, dashes, underscores | string | `required|alpha_dash|min:3` |
| `contains:value` | Require a substring | string | `contains:@company.com` |
| `uuid:4` | Validate UUID format and version | string | `required|uuid:4` |

### Numeric and size rules

| Rule | Purpose | Data types | Example |
| --- | --- | --- | --- |
| `numeric` | Accept numeric values | string, number | `required|numeric` |
| `integer:strict` | Enforce integer-only values | number, numeric string | `integer:strict|min:1` |
| `between:min,max` | Constrain range or length | string, array, numeric | `between:3,10` |
| `multiple_of:value` | Enforce divisibility | number | `multiple_of:5` |
| `digits_between:min,max` | Validate exact digit count range | numeric string | `digits_between:6,8` |

### Comparison and conditional rules

| Rule | Purpose | Data types | Example |
| --- | --- | --- | --- |
| `confirmed` | Match a confirmation field | string | `required|confirmed` |
| `same:field` | Match another field value | mixed | `same:billing_email` |
| `required_if:field,value` | Require when another field matches | mixed | `required_if:role,admin` |
| `required_without:field` | Require when another field is missing | mixed | `required_without:phone` |
| `prohibits:field` | Prevent conflicting fields | mixed | `prohibits:coupon_code` |

### Date, network, and file rules

| Rule | Purpose | Data types | Example |
| --- | --- | --- | --- |
| `date_format:format` | Match a Laravel-style date format | string | `date_format:Y-m-d` |
| `after:today` | Compare against a relative date | string | `date|after:today` |
| `ip` / `ipv4` / `ipv6` | Validate network values | string | `required|ipv6` |
| `image` | Restrict uploaded files to images | file | `file|image|mimes:jpg,png` |
| `dimensions:...` | Inspect image width or height | image file | `dimensions:min_width=640,min_height=480` |

## Remote rules

Remote rules are intentionally delegated to the server because they depend on application state or backend facilities.

| Rule | Why it stays remote | Typical example |
| --- | --- | --- |
| `unique` | Needs database access | `unique:users,email` |
| `exists` | Needs database access | `exists:roles,id` |
| `password` | Needs current auth context | `password` |
| `current_password` | Needs current auth context | `current_password` |
| `encoding` | Needs backend encoding checks | `encoding:UTF-8` |

If a remote rule never fires, check [troubleshooting](./troubleshooting.md) for route, CSRF, or timeout issues.

## Usage examples

### Typical account form

```html
<input name="name" @validateBlur('name', 'required|string|min:2|max:50')>
<input name="email" @validateLive('email', 'required|email|unique:users,email')>
<input name="password" @validateSubmit('password', 'required|min:8|confirmed')>
```

### Array, date, and file examples

```html
<input name="timezone" @rules('timezone', 'required|timezone')>
<input name="launch_date" @rules('launch_date', 'required|date|after_or_equal:today')>
<input type="file" name="avatar" @rules('avatar', 'file|image|mimes:jpg,png|dimensions:min_width=256,min_height=256')>
```

## Edge cases and expected behavior

- `nullable` allows empty input but does not skip other rules when the value is non-empty.
- Rules that compare against sibling fields, such as `same`, `different`, `gt`, or `required_if`, depend on the form data already being available to the validator.
- Remote rules still need normal Laravel validation messages and backend authorization to be correct.
- File rules depend on browser-provided `File` objects, so they should be tested in a real browser flow rather than only in isolated unit tests.

## Message placeholders

Default browser messages use the same placeholder vocabulary Laravel developers expect, such as `:attribute`, `:min`, `:max`, `:other`, and `:values`.

```php
'messages' => [
    'required' => 'The :attribute field is required.',
    'min' => 'The :attribute must be at least :min characters.',
    'unique' => 'The :attribute has already been taken.',
],
```

## When documenting a new rule

- Explain the rule purpose in one sentence.
- Include a realistic Laravel rule string.
- Call out the supported value types.
- Document edge cases, especially for remote or cross-field rules.
- Show at least one example validation message.


---

# Custom Rules

> Extend Laravel Client Validation with browser-side JavaScript rules and server-side Laravel validators without losing clarity about where a rule runs.

Custom rules work best when you decide first whether the behavior belongs in the browser, on the server, or both.

## Client-side custom rules

Use the global bundle helper or the core `RuleRegistry` to add a browser-only rule.

```javascript
LaravelClientValidation.extend('phone', (value) => {
    if (!value) {
        return true;
    }

    return /^\+?[\d\s-]{10,}$/.test(value);
}, 'The :attribute must be a valid phone number.');
```

You can then reference the rule anywhere you already use package directives.

```html
<input name="phone" @validateBlur('phone', 'required|phone')>
```

### ES module registration

```javascript
import { RuleRegistry } from 'laravel-client-validation/core';

RuleRegistry.extend('sku', (value) => /^[A-Z]{3}-\d{4}$/.test(value), 'The :attribute must be a valid SKU.');
```

## Server-side custom rules

Use the package facade when the rule depends on backend state or you want the parser to treat it as server-side by default.

```php
use MrPunyapal\ClientValidation\Facades\ClientValidation;

ClientValidation::extend('strong_password', function ($attribute, $value) {
    return preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/', (string) $value) === 1;
}, 'Password must contain uppercase, lowercase, and numbers.');
```

The package registers that rule with Laravel's validator and classifies it as server-side unless you also provide a matching browser implementation.

## Shared rule strategy

If the same rule should behave consistently in both places, keep the rule name identical and maintain one browser implementation and one Laravel implementation.

```php
$rules = [
    'sku' => 'required|sku',
];
```

```javascript
LaravelClientValidation.extend('sku', (value) => /^[A-Z]{3}-\d{4}$/.test(value));
```

## Testing custom rules

- Validate the JavaScript rule in a browser or JavaScript test.
- Validate the PHP rule with Laravel or package tests.

## Documentation checklist for new rules

- Link to the user-facing rule description from [validation rules](./validation-rules.md).
- Show one passing example and one failing example.
- State clearly whether the rule is browser-only, server-only, or shared.
- Avoid renaming an existing rule unless you are prepared to update every internal link and every rule string that references it.


---

# Testing

> Validate package changes with Pest and JavaScript tests before merging updates.

Package changes are safest when you validate both the PHP and browser runtime behavior in the same branch.

## PHP test suite

Run the Pest suite from the repository root:

```bash
composer test
```

Use coverage when you are working on package internals or parser behavior.

```bash
composer test-coverage
```

## JavaScript test suite

The frontend rules and adapters live in `resources/js`, so use the JavaScript suite when you change the browser runtime.

```bash
npm test
```

## Documentation changes

If you change Markdown pages, the docs template, or shared docs assets, follow the separate [documentation workflow](./documentation-workflow.md) so the generated site stays in sync.

## Recommended contributor loop

1. Update the package code or the relevant documentation.
2. Run the narrowest tests that can falsify the change.
3. Run any affected browser checks when a rule or adapter changes.
4. Inspect the changed behavior before opening a pull request.

## Practical verification examples

### Rule or parser change

```bash
composer test
npm test
```


---

# Documentation Workflow

> Build and verify the generated documentation site from the Markdown source, template, and shared docs assets.

Use this page when you are changing the documentation source, the docs template, or the docs build process itself.

## What the builder reads

The docs builder assembles the site from three canonical inputs:

- Markdown pages in `docs/md`.
- The layout and navigation shell in `docs/template.php`.
- Shared frontend assets in `docs/assets`.

Each Markdown page should keep its frontmatter accurate so the builder can generate the correct title, description, sidebar label, and navigation order.

## How to rebuild the site

Run the Composer script from the repository root:

```bash
composer docs:build
```

You can also run the builder directly:

```bash
php docs/build.php
```

Both commands rebuild the checked-in documentation site.

## What the builder writes

After a successful build, the generated output is refreshed in `docs/`.

- Each Markdown page becomes a matching HTML page such as `docs/usage.html`.
- The search index is rewritten in `docs/search-index.json`.
- The sitemap is rewritten in `docs/sitemap.xml`.
- The GitHub Pages marker file is rewritten in `docs/.nojekyll`.

The builder also rewrites internal Markdown links like `./usage.md` to their generated `.html` targets and rebuilds the sidebar plus previous or next page navigation from frontmatter order.

## Practical example

### Updating a docs page

If you change `docs/md/usage.md`, rebuild the site before you finish the change:

```bash
composer docs:build
```

Expected result:

- `docs/usage.html` reflects the Markdown changes.
- Navigation and search metadata stay in sync with the updated page.

## Editing guidelines

- Edit the Markdown source, template, or assets rather than patching generated HTML by hand.
- Keep relative Markdown links in the `.md` form so the builder can rewrite them.
- Rebuild immediately after changing page order, slugs, headings, or internal links.

## Build failures

If the builder fails before rendering pages, install the repository dependencies first:

```bash
composer install
```

Then rerun the docs build command. For broader package validation after documentation changes, continue with the checks in [testing](./testing.md).

---

# Troubleshooting

> Resolve the most common installation, asset loading, and remote validation issues when Laravel Client Validation does not behave as expected.

Most validation failures come down to one of three causes: the browser bundle is not loaded, the field metadata was not rendered, or a remote validation request cannot reach the backend.

## The browser bundle never initializes

### Symptoms

- `x-validate` or `data-validate` fields do nothing.
- `window.LaravelClientValidation` is undefined in the console.

### Checks

```php
@clientValidationAssets
```

- Confirm the directive is rendered in the page layout.
- Confirm the published files exist in `public/vendor/client-validation`.
- Check the network tab for the package bundle or the CDN fallback.

## Rules render, but errors never appear

### Symptoms

- Inputs contain attributes, but no validation message is shown.
- Classes such as `is-invalid` or `validation-error` never appear.

### Checks

```php
'error_template' => [
    'enabled' => true,
],

'field_styling' => [
    'enabled' => true,
],
```

- Verify `error_template.enabled` or `field_styling.enabled` has not been disabled.
- Inspect the rendered markup and confirm the directive output is attached to the correct field.
- Test with a simpler rule like `required` before adding compound logic.

## Remote rules never finish

### Symptoms

- `unique` stays pending.
- No request reaches the Laravel application.

### Checks

```php
'enable_ajax_validation' => true,
'route_prefix' => 'client-validation',
'ajax_timeout' => 5000,
```

- Confirm the validation endpoint exists at the configured prefix.
- Confirm the page includes the CSRF token and the route is not blocked by middleware.
- Increase `ajax_timeout` temporarily while debugging slow responses.

## Cross-field rules behave inconsistently

Rules like `same`, `different`, `required_if`, `gt`, or `lte` depend on up-to-date sibling field values.

```html
<input name="password" @validateBlur('password', 'required|min:8')>
<input name="password_confirmation" @validateBlur('password_confirmation', 'required|same:password')>
```

Use form bindings that keep both fields synchronized before the comparison runs.

## Still blocked?

- Compare the current form markup with the working snippets in [usage](./usage.md) and [examples](./examples.md).
- Re-run the checks in [testing](./testing.md).


---

# Examples

> Start from realistic Laravel examples for Blade, Alpine.js, Livewire, Filament, and programmatic validation.

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

## FormRequest-backed Blade form

```php
use App\Http\Requests\CreateUserRequest;
use MrPunyapal\ClientValidation\Facades\ClientValidation;

public function create()
{
    return view('users.create', [
        'validation' => ClientValidation::fromRequest(CreateUserRequest::class),
    ]);
}
```

```blade
<div x-data="validation(@js($validation))">
    <form @submit.prevent="submit(async (payload) => await saveUser(payload))">
        <input x-model="form.name" @blur="validate('name')" name="name">
        <p x-show="hasError('name')" x-text="error('name')"></p>

        <input x-model="form.email" @blur="validate('email')" name="email">
        <p x-show="hasError('email')" x-text="error('email')"></p>
    </form>
</div>
```

This keeps the Laravel `FormRequest` as the source of truth while still exposing parsed client rules, custom messages, and remote-validation metadata to the browser.

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


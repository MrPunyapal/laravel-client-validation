# Laravel Client Validation

[![Latest Version on Packagist](https://img.shields.io/packagist/v/mrpunyapal/laravel-client-validation.svg?style=flat-square)](https://packagist.org/packages/mrpunyapal/laravel-client-validation)
[![Total Downloads](https://img.shields.io/packagist/dt/mrpunyapal/laravel-client-validation.svg?style=flat-square)](https://packagist.org/packages/mrpunyapal/laravel-client-validation)

A powerful validation package that brings Laravel validation rules to the client-side. Validate forms in real-time using the same rules you know from Laravel — works with **any backend** or as a standalone NPM package.

## Features

- **104 client-side rules** — Comprehensive coverage of Laravel validation rules
- **5 remote rules** — Server-side AJAX validation for `unique`, `exists`, etc.
- **TypeScript declarations** — Full type definitions for IDE autocompletion
- **Laravel 12/13 support** — Compatible with the latest Laravel versions
- **Livewire v3 & v4** — Automatic version detection and optimized integration
- **Filament v3 & v5** — Panel plugin with field-level validation
- **Backend-agnostic** — Use with Laravel, Django, Express, Rails, or any backend
- **Multiple integrations** — Alpine.js, Livewire, Filament, Vanilla JS, React, Vue
- **Real-time validation** — Instant feedback on blur, input, or submit
- **FormRequest support** — Extract rules from existing Laravel FormRequest classes
- **Validation hooks** — `beforeValidate`, `afterValidate`, field-level events
- **Bail support** — Stop on first failure per field with `bail` rule
- **Batch validation** — Validate multiple fields in a single AJAX request
- **Rate limiting** — Built-in request throttling for AJAX validation
- **Zero configuration** — Works out of the box with sensible defaults
- **Tree-shakeable** — ES module subpath exports for minimal bundle size

## Quick Start

### Option A: Laravel Package (Composer)

```bash
composer require mrpunyapal/laravel-client-validation
php artisan client-validation:install
```

### Option B: Standalone NPM Package

```bash
npm install laravel-client-validation
```

Import only what you need:

```js
// Core engine only (no framework dependency)
import { LaravelValidator, RuleRegistry } from 'laravel-client-validation/core';

// Alpine.js adapter
import { createAlpineValidator } from 'laravel-client-validation/alpine';

// Vanilla JS adapter
import { createFormValidator } from 'laravel-client-validation/vanilla';
```

### Option C: CDN / Script Tag

```html
<script src="https://unpkg.com/laravel-client-validation/resources/js/dist/client-validation.iife.js"></script>
<script>
  const validator = new LaravelClientValidation.Validator({
    rules: { email: 'required|email' }
  });
</script>
```

---

## Usage with Alpine.js

### Simple Field Validation

```html
{{-- Validate on blur (default) --}}
<input x-validate="'required|email'" name="email">

{{-- Validate as you type --}}
<input x-validate.live="'required|min:3'" name="username">

{{-- Validate on form submit only --}}
<input x-validate.submit="'required|min:8'" name="password">

{{-- Bail on first failure --}}
<input x-validate="'bail|required|email|unique:users'" name="email">
```

### Complete Form Component

```html
<div x-data="validation({
    rules: {
        email: 'required|email',
        password: 'required|min:8',
        password_confirmation: 'required|same:password'
    },
    messages: {
        'email.required': 'Please enter your email',
        'password.min': 'Password is too short'
    }
})">
    <form @submit.prevent="submit(async (data) => {
        console.log('Valid!', data);
    })">
        <input x-model="form.email" @blur="validate('email')">
        <span x-text="error('email')" x-show="hasError('email')"></span>

        <input type="password" x-model="form.password" @blur="validate('password')">
        <span x-text="error('password')" x-show="hasError('password')"></span>

        <input type="password" x-model="form.password_confirmation">

        <button :disabled="validating || !isValid()">Submit</button>
    </form>
</div>
```

### Available Methods in `validation()` Component

| Method | Description |
|--------|-------------|
| `validate('field')` | Validate a single field |
| `validateAll()` | Validate all fields |
| `submit(callback)` | Validate then call callback if valid |
| `error('field')` | Get first error for field |
| `hasError('field')` | Check if field has errors |
| `hasErrors()` | Check if any errors exist |
| `isValid()` | Check if form is valid |
| `clearError('field')` | Clear errors for field |
| `reset()` | Reset form to initial state |

---

## Usage with Livewire

> Supports both Livewire v3 and v4. Version is detected automatically.

### Using the `x-wire-validate` Directive

```html
<div wire:id="my-component">
    <form wire:submit="save">
        <input type="email"
               wire:model="email"
               x-wire-validate="'required|email'"
               name="email">
        <span class="validation-error" data-error="email"></span>

        {{-- Livewire v4: use wire:model.live for real-time sync --}}
        <input type="text"
               wire:model.live="username"
               x-wire-validate.live="'required|alpha_dash|min:3'"
               name="username">
        <span class="validation-error" data-error="username"></span>

        <button type="submit">Submit</button>
    </form>
</div>
```

### Using the PHP Trait

```php
use Livewire\Component;
use MrPunyapal\ClientValidation\Livewire\WithClientValidation;

class CreateUser extends Component
{
    use WithClientValidation;

    public string $name = '';
    public string $email = '';
    public string $password = '';
    public string $password_confirmation = '';

    protected $rules = [
        'name' => 'required|string|min:2|max:50',
        'email' => 'required|email',
        'password' => 'required|min:8|confirmed',
    ];

    protected $messages = [
        'email.required' => 'Please enter your email address',
        'password.confirmed' => 'Passwords do not match',
    ];

    public function render()
    {
        return view('livewire.create-user');
    }
}
```

In your Blade view:

```html
<div x-data="{ clientRules: @json($this->getClientRules()) }">
    <input wire:model="email"
           x-wire-validate="clientRules.email"
           name="email">
</div>
```

### Livewire Events

```php
protected $listeners = [
    'client-validation-error' => 'handleClientError',
    'client-validation-cleared' => 'handleClientCleared',
];

public function handleClientError($data)
{
    // $data = ['field' => 'email', 'errors' => ['The email field is required.']]
}
```

---

## Usage with Filament

### Register the Plugin

```php
use MrPunyapal\ClientValidation\Filament\ClientValidationPlugin;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->plugins([
                ClientValidationPlugin::make()
                    ->enableRemoteValidation()
                    ->validationMode('live'),
            ]);
    }
}
```

### Add Validation to Fields

Use the `HasClientValidation` trait on your custom Filament fields:

```php
use Filament\Forms\Components\Field;
use MrPunyapal\ClientValidation\Filament\HasClientValidation;

class MyField extends Field
{
    use HasClientValidation;
}
```

Or use the pre-built `ClientValidatedField`:

```php
use MrPunyapal\ClientValidation\Filament\ClientValidatedField;

ClientValidatedField::make('email')
    ->clientValidation('required|email')
    ->clientValidationMode('live');
```

---

## Usage with Vanilla JS (No Framework)

### Using Data Attributes

```html
<form data-validate>
    <input name="email"
           data-rules="required|email"
           data-validate-on="blur">

    <input name="username"
           data-rules="required|alpha_dash|min:3"
           data-validate-on="input">

    <button type="submit">Submit</button>
</form>
```

### Programmatic Validation

```javascript
import { LaravelValidator } from 'laravel-client-validation/core';

const validator = new LaravelValidator({
    rules: {
        email: 'required|email',
        password: 'required|min:8'
    },
    messages: {
        'email.required': 'Email is required'
    }
});

const result = await validator.validateField('email', 'test@example.com');
console.log(result.valid, result.errors);

const formResult = await validator.validateAll({
    email: 'test@example.com',
    password: '12345678'
});
```

### Using Blade Directives

```html
<form data-validate>
    <input name="email" @rules('email', 'required|email', ['mode' => 'blur'])>
    <input name="username" @validateLive('username', 'required|min:3')>
    <input name="password" @validateBlur('password', 'required|min:8')>
</form>
```

---

## Using with FormRequest

### In Controller

```php
use MrPunyapal\ClientValidation\Facades\ClientValidation;

public function create()
{
    $validation = ClientValidation::fromRequest(CreateUserRequest::class);
    return view('users.create', compact('validation'));
}
```

### In Blade

```blade
<div x-data="validation(@json($validation))">
    {{-- Form fields --}}
</div>
```

---

## Backend-Agnostic Remote Validation

The `RemoteValidator` works with any backend, not just Laravel. Configure it for your stack:

### Express.js / Node

```javascript
import { RemoteValidator } from 'laravel-client-validation/core';

const remote = new RemoteValidator({
    endpoint: '/api/validate',
    csrf: false,
    requestFormatter: (field, value, rule, params) => ({
        field_name: field,
        field_value: value,
        validation_rule: rule,
        rule_params: params
    }),
    responseParser: (response) => ({
        valid: response.success,
        message: response.error || null
    })
});
```

### Django

```javascript
const remote = new RemoteValidator({
    endpoint: '/validate/',
    csrfHeaderName: 'X-CSRFToken',
    csrfTokenResolver: () => document.cookie.match(/csrftoken=([^;]+)/)?.[1]
});
```

### Custom Adapter

```javascript
const remote = new RemoteValidator();
remote.setAdapter(async (field, value, rule, params) => {
    const res = await myHttpClient.post('/validate', { field, value, rule });
    return { valid: res.ok, message: res.error };
});
```

---

## Validation Rules

### Client-Side Rules (104 — Instant)

**Core:** `required`, `nullable`, `filled`, `present`, `bail`

**String:** `string`, `email`, `url`, `active_url`, `alpha`, `alpha:ascii`, `alpha_num`, `alpha_num:ascii`, `alpha_dash`, `alpha_dash:ascii`, `regex`, `not_regex`, `contains`, `doesnt_contain`, `lowercase`, `uppercase`, `starts_with`, `ends_with`, `doesnt_start_with`, `doesnt_end_with`, `ascii`, `uuid`, `uuid:version`, `ulid`, `json`, `hex_color`

**Numeric:** `numeric`, `numeric:strict`, `integer`, `integer:strict`, `decimal`, `multiple_of`, `digits`, `digits_between`, `min_digits`, `max_digits`

**Size:** `min`, `max`, `between`, `size`

**Comparison:** `confirmed`, `confirmed:field`, `same`, `different`, `gt`, `gte`, `lt`, `lte`, `in`, `not_in`, `enum`

**Date:** `date`, `after`, `before`, `after_or_equal`, `before_or_equal`, `date_equals`, `date_format`, `timezone`

**Conditional:** `required_if`, `required_unless`, `required_with`, `required_without`, `required_with_all`, `required_without_all`, `required_if_accepted`, `required_if_declined`, `required_array_keys`

**Presence / Missing:** `present_if`, `present_unless`, `present_with`, `present_with_all`, `missing`, `missing_if`, `missing_unless`, `missing_with`, `missing_with_all`

**Prohibition:** `prohibited`, `prohibited_if`, `prohibited_unless`, `prohibited_if_accepted`, `prohibited_if_declined`, `prohibits`

**Boolean:** `boolean`, `boolean:strict`, `accepted`, `accepted_if`, `declined`, `declined_if`

**Network:** `ip`, `ipv4`, `ipv6`, `mac_address`

**Array:** `array`, `distinct`, `in_array`, `in_array_keys`, `list`

**File:** `file`, `image`, `mimes`, `mimetypes`, `extensions`, `dimensions`

**Advanced:** `any_of`, `password_strength`

### Remote Rules (5 — AJAX)

`unique`, `exists`, `password`, `current_password`, `encoding`

```html
<input x-validate.live="'required|email|unique:users,email'" name="email">
```

See [docs/RULES.md](docs/RULES.md) for full details and examples.

---

## Configuration

```bash
php artisan vendor:publish --tag=client-validation-config
```

Key options:

```php
return [
    'validation_mode' => 'blur',        // 'blur', 'input', 'submit'
    'debounce_ms' => 300,               // Debounce for live validation
    'enable_ajax_validation' => true,   // Enable AJAX for remote rules
    'rate_limit' => [
        'max_attempts' => 60,           // Requests per window (0 = disabled)
        'decay_seconds' => 60,          // Window duration
    ],
    'error_template' => [
        'container_class' => 'text-red-500 text-sm mt-1',
    ],
    'field_styling' => [
        'valid_class' => 'border-green-500',
        'invalid_class' => 'border-red-500',
    ],
];
```

---

## Validation Hooks

```javascript
const validator = new LaravelClientValidation.Validator({ rules });

validator
    .beforeValidate(({ data }) => console.log('Starting...'))
    .afterValidate(({ valid, errors }) => console.log('Done!', valid));
```

---

## Custom Rules

### Client-Side

```javascript
LaravelClientValidation.extend('phone', (value, params, field, context) => {
    if (!value) return true;
    return /^\+?[\d\s-]{10,}$/.test(value);
}, 'The :attribute must be a valid phone number.');
```

```html
<input x-validate="'required|phone'" name="phone">
```

### Server-Side (PHP)

```php
ClientValidation::extend('strong_password', function ($value) {
    return preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/', $value);
}, 'Password must contain uppercase, lowercase, and numbers.');
```

---

## NPM Subpath Exports

| Import Path | Contents |
|-------------|----------|
| `laravel-client-validation` | Full bundle (all adapters) |
| `laravel-client-validation/core` | `LaravelValidator`, `RuleRegistry`, `RemoteValidator`, `EventEmitter` |
| `laravel-client-validation/alpine` | Alpine.js `x-validate` directive |
| `laravel-client-validation/vanilla` | Vanilla JS `data-validate` form validator |
| `laravel-client-validation/livewire` | Livewire adapter |
| `laravel-client-validation/react` | React hook adapter |
| `laravel-client-validation/vue` | Vue composable adapter |

---

## Examples

See the `examples/` directory for complete demos:

- [Alpine.js demo](examples/alpine-demo.blade.php)
- [Vanilla JS demo](examples/vanilla-demo.blade.php)
- [Livewire demo](examples/livewire-demo.blade.php)

---

## Testing

```bash
# PHP tests (Pest)
composer test

# JavaScript tests (Vitest)
npm test
```

---

## License

The MIT License (MIT). See [License File](LICENSE.md) for more information.

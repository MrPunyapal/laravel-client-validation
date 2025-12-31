# Laravel Client Validation

[![Latest Version on Packagist](https://img.shields.io/packagist/v/mrpunyapal/laravel-client-validation.svg?style=flat-square)](https://packagist.org/packages/mrpunyapal/laravel-client-validation)
[![Total Downloads](https://img.shields.io/packagist/dt/mrpunyapal/laravel-client-validation.svg?style=flat-square)](https://packagist.org/packages/mrpunyapal/laravel-client-validation)

A powerful Laravel package that brings server-side validation rules to the client-side. Validate forms in real-time with the same rules you use in your Laravel backend.

## ✨ Features

- 🚀 **Real-time validation** - Instant feedback as users fill forms
- 📝 **FormRequest support** - Extract rules from your existing FormRequest classes
- ⚡ **Client + Remote validation** - Client-side rules run instantly, server rules via AJAX
- 🎨 **Multiple integrations** - Alpine.js, Vanilla JS, or programmatic use
- 🔧 **Zero configuration** - Works out of the box with sensible defaults
- 🎯 **Flexible triggers** - Validate on blur, input, or form submit
- 🎪 **Validation Hooks** - beforeValidate, afterValidate events
- ⚡ **High Performance** - Debouncing, caching, request deduplication

## 🚀 Quick Start

### 1. Install

```bash
composer require mrpunyapal/laravel-client-validation
```

### 2. Include Assets

Add to your layout's `<head>`:

```blade
@clientValidationAssets
```

### 3. Start Validating

Choose your preferred approach below.

---

## 📘 Usage with Alpine.js

### Simple Field Validation

```html
{{-- Validate on blur (default) --}}
<input x-validate="'required|email'" name="email">

{{-- Validate as you type --}}
<input x-validate.live="'required|min:3'" name="username">

{{-- Validate on form submit only --}}
<input x-validate.submit="'required|min:8'" name="password">
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
        // Form is valid, submit to server
        console.log(data);
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

## 📗 Usage with Vanilla JS (No Framework)

### Using Data Attributes

```html
{{-- Add data-validate to form, data-rules to inputs --}}
<form data-validate>
    <input name="email" 
           data-rules="required|email" 
           data-validate-on="blur">
    
    <input name="username" 
           data-rules="required|alpha_dash|min:3" 
           data-validate-on="input"> {{-- validates as you type --}}
    
    <button type="submit">Submit</button>
</form>
```

### Using Blade Directives

```html
<form data-validate>
    {{-- Using @rules directive --}}
    <input name="email" @rules('email', 'required|email', ['mode' => 'blur'])>
    
    {{-- Shorthand directives --}}
    <input name="username" @validateLive('username', 'required|min:3')>
    <input name="password" @validateBlur('password', 'required|min:8')>
    <input name="terms" @validateSubmit('terms', 'accepted')>
</form>
```

### Programmatic Validation

```javascript
// Create validator
const validator = new LaravelClientValidation.Validator({
    rules: {
        email: 'required|email',
        password: 'required|min:8'
    },
    messages: {
        'email.required': 'Email is required'
    }
});

// Validate a field
const result = await validator.validateField('email', 'test@example.com');
console.log(result.valid, result.errors);

// Validate all
const formResult = await validator.validateAll({ 
    email: 'test@example.com', 
    password: '12345678' 
});
```

---

## 📙 Using with FormRequest

### In Controller

```php
use MrPunyapal\ClientValidation\Facades\ClientValidation;

public function create()
{
    $validation = ClientValidation::fromRequest(CreateUserRequest::class);
    return view('users.create', compact('validation'));
}
```

### In Blade (Alpine.js)

```blade
<div x-data="validation(@json($validation))">
    {{-- Form fields --}}
</div>
```

---

## 🔧 Validation Types

### Client-Side Rules (Instant)

These rules validate immediately in the browser:

`required`, `email`, `url`, `min`, `max`, `between`, `size`, `numeric`, `integer`, `alpha`, `alpha_num`, `alpha_dash`, `confirmed`, `same`, `different`, `in`, `not_in`, `date`, `after`, `before`, `regex`, `boolean`, `accepted`, `nullable`

### Remote Rules (AJAX)

These rules require server-side validation:

`unique`, `exists`, `password`, `current_password`

```html
{{-- AJAX validation happens automatically for 'unique' --}}
<input x-validate.live="'required|email|unique:users,email'" name="email">
```

---

## ⚙️ Configuration

Publish the config file:

```bash
php artisan vendor:publish --tag=client-validation-config
```

Key configuration options:

```php
return [
    // Validation trigger default mode
    'validation_mode' => 'blur', // 'blur', 'input', 'submit'
    
    // Debounce for live validation (ms)
    'debounce_ms' => 300,
    
    // Enable AJAX for remote rules
    'enable_ajax_validation' => true,
    
    // Error display styling
    'error_template' => [
        'container_class' => 'text-red-500 text-sm mt-1',
    ],
    
    // Field styling on validation
    'field_styling' => [
        'valid_class' => 'border-green-500',
        'invalid_class' => 'border-red-500',
    ],
];
```

---

## 🎣 Validation Hooks

```javascript
const validator = new LaravelClientValidation.Validator({ rules });

validator
    .beforeValidate(({ data }) => console.log('Starting...'))
    .afterValidate(({ valid, errors }) => console.log('Done!', valid));
```

---

## 🔌 Custom Rules

### Client-Side Custom Rule

```javascript
// Register custom rule
LaravelClientValidation.extend('phone', (value, params) => {
    return /^\d{10}$/.test(value);
}, 'The :attribute must be a valid phone number.');

// Use it
<input x-validate="'required|phone'" name="phone">
```

### Server-Side Custom Rule (PHP)

```php
ClientValidation::extend('strong_password', function ($value) {
    return preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/', $value);
}, 'Password must contain uppercase, lowercase, and numbers.');
```

---

## 📁 Examples

Check the `examples/` directory for complete demos:

- [alpine-demo.blade.php](examples/alpine-demo.blade.php) - Alpine.js integration
- [vanilla-demo.blade.php](examples/vanilla-demo.blade.php) - Vanilla JS with data attributes

---

## 🔄 Future Packages

This package is designed to be modular. In the future, we plan to offer:

- `laravel-client-validation-livewire` - Deep Livewire integration
- `laravel-client-validation-inertia` - Inertia.js + Vue/React support
- `laravel-client-validation-core` - Standalone JS package for any framework

---

## 📄 License

The MIT License (MIT). See [License File](LICENSE.md) for more information.

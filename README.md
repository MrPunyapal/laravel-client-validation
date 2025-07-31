# Laravel Client Validation

[![Latest Version on Packagist](https://img.shields.io/packagist/v/mrpunyapal/laravel-client-validation.svg?style=flat-square)](https://packagist.org/packages/mrpunyapal/laravel-client-validation)
[![Total Downloads](https://img.shields.io/packagist/dt/mrpunyapal/laravel-client-validation.svg?style=flat-square)](https://packagist.org/packages/mrpunyapal/laravel-client-validation)

A powerful Laravel package that brings server-side validation rules to the client-side using Alpine.js. Validate forms in real-time with the same rules you use in your Laravel backend, including support for FormRequest classes and AJAX fallbacks for complex validation rules.

## ✨ Features

- 🚀 **Real-time validation** with Alpine.js integration
- 📝 **FormRequest support** - Extract rules, messages, and attributes automatically  
- ⚡ **AJAX fallback** for complex rules (unique, exists, etc.)
- 🎨 **Customizable templates** and styling
- 🔧 **Zero configuration** - Works out of the box
- 🖼️ **Livewire ready** - Seamless integration
- 📱 **Mobile friendly** - Responsive validation UX
- 🎯 **Elegant DX** - Expressive, clean code
- 🎪 **Validation Hooks** - beforeValidate, afterValidate, onPasses, onFails
- ⚡ **High Performance** - Debouncing, caching, batching

## 🚀 Quick Start

### 1. Install & Setup

```bash
composer require mrpunyapal/laravel-client-validation
```

### 2. Include Assets

Add to your layout:

```blade
@clientValidationAssets
```

### 3. Start Validating

**Validation modes:**
```html
<!-- Live validation (validates as you type) -->
<input x-validate.live="'required|email|unique:users,email'">

<!-- Form validation (validates on submit) -->
<input x-validate.form="'required|min:8|confirmed'">

<!-- Blur validation (validates when field loses focus) -->
<input x-validate="'required|alpha_dash|min:3'">
```

**Complete form with FormRequest:**
```php
// Controller
use MrPunyapal\ClientValidation\Facades\ClientValidation;

$validation = ClientValidation::fromRequest(CreateUserRequest::class);
return view('users.create', compact('validation'));
```

```blade
{{-- Blade Template --}}
<div x-data="@alpineValidation($validation)">
    <form @submit.prevent="submitForm">
        <input x-model="form.name" @blur="validate('name')">
        <div x-show="hasError('name')" x-text="getError('name')"></div>
        
        <input x-model="form.email" @blur="validate('email')">
        <div x-show="hasError('email')" x-text="getError('email')"></div>
        
        <button :disabled="!isValid()">Create User</button>
    </form>
</div>
```

#### Alpine.js Form Component

```html
<div x-data="validateForm({
    email: 'required|email|unique:users,email',
    password: 'required|min:8|confirmed',
    terms: 'required|accepted'
}, {
    'email.unique': 'This email is already registered',
    'password.confirmed': 'Passwords do not match'
})">
    <form @submit.prevent="submitForm(async (data) => {
        // Your submission logic
        console.log('Form data:', data);
    })">
        <input type="email" x-model="form.email" @blur="validate('email')">
        <div x-show="hasError('email')" x-text="getError('email')"></div>
        
        <input type="password" x-model="form.password" @blur="validate('password')">
        <input type="password" x-model="form.password_confirmation">
        
        <input type="checkbox" x-model="form.terms" value="1">
        
        <button :disabled="!isValid() || validating">
            <span x-show="!validating">Submit</span>
            <span x-show="validating">Validating...</span>
## 🎯 Advanced Features

### Validation Hooks

```javascript
validator
    .beforeValidate(ctx => console.log('Starting validation...'))
    .afterValidate(ctx => console.log('Validation complete'))
    .onPasses(ctx => enableSubmitButton())
    .onFails(ctx => showValidationErrors());
```

### Blade Directives

```blade
{{-- Quick validation directives --}}
@validate('email', 'required|email')
@validateLive('username', 'required|alpha_dash|min:3')
@validateForm('password', 'required|min:8')

{{-- Alpine.js data generation --}}
<div x-data="@alpineValidation($rules, $messages, $attributes)">
    <!-- Your form -->
</div>
```

### Custom Rules

```php
// Register custom server-side rule
ClientValidation::extend('strong_password', function ($value) {
    return preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/', $value);
}, 'Password must contain uppercase, lowercase, number and special character.');

// Make it client-side capable
ClientValidation::extendClientSide('strong_password', `
    (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(value)
`);
```

### Smart AJAX Fallback

The package automatically detects which rules require server-side validation:

- **Client-side**: `required`, `email`, `min`, `max`, `regex`, etc.
- **Server-side**: `unique`, `exists`, `password`, etc.
- **Conditional**: `required_if`, `required_unless`, etc.

```html
<!-- This will automatically use AJAX for the 'unique' rule -->
<input x-validate.live="'required|email|unique:users,email'">
```
```

#### Direct Rule Validation

```html
<!-- Manual validation trigger -->
<input type="email" name="email" x-validate="'required|email'" placeholder="Enter email">
<button onclick="document.querySelector('[name=email]').validate()">Validate</button>

<!-- Live validation (validates as you type) -->
<input type="text" name="username" x-validate.live="'required|alpha_dash|min:3'" placeholder="Username">

<!-- Form validation (validates on submit) -->
<form>
    <input type="text" name="name" x-validate.form="'required|string|min:2'" placeholder="Full Name">
    <button type="submit">Submit</button>
</form>
```

#### Alpine.js Data Component

```html
<div x-data="validateForm({
    email: 'required|email',
    password: 'required|min:8|confirmed',
    terms: 'required|accepted'
}, {
    'email.required': 'Please provide your email address',
    'password.min': 'Password must be at least 8 characters'
}, {
    email: 'email address'
})">
    <form @submit.prevent="submitForm">
        <input type="email" name="email" x-model="form.email" @blur="validate('email')">
        <div x-show="hasError('email')" x-text="getError('email')"></div>
        
        <input type="password" name="password" x-model="form.password">
        <input type="password" name="password_confirmation" x-model="form.password_confirmation">
        
        <input type="checkbox" name="terms" x-model="form.terms" value="1">
        
        <button type="submit" :disabled="!isValid()">Submit</button>
    </form>
</div>
```

### 3. FormRequest Integration

Create a FormRequest:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateUserRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => 'required|string|min:2|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'age' => 'required|integer|min:18|max:120',
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'This email is already registered.',
            'password.confirmed' => 'Password confirmation does not match.',
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'full name',
            'email' => 'email address',
        ];
    }
}
```

Use in your controller:

```php
use MrPunyapal\ClientValidation\Facades\ClientValidation;

public function create()
{
    $validation = ClientValidation::fromRequest(CreateUserRequest::class);
    return view('user.create', compact('validation'));
}
```

Use in your Blade template:

```blade
<div x-data="validateForm(@json($validation['rules']), @json($validation['messages']), @json($validation['attributes']))">
    <form @submit.prevent="submitForm">
        <input type="text" name="name" x-model="form.name" x-validate.live="rules.name">
        <input type="email" name="email" x-model="form.email" x-validate.live="rules.email">
        <!-- AJAX validation for unique email will happen automatically -->
        
        <button type="submit" :disabled="!isValid()">Create User</button>
    </form>
</div>
```

## Supported Validation Rules

### Client-Side Rules
These rules are validated instantly on the client:

- `required`, `nullable`
- `email`, `url`
- `string`, `numeric`, `integer`, `boolean`
- `min`, `max`, `between`, `size`
- `alpha`, `alpha_num`, `alpha_dash`
- `confirmed`, `same`, `different`
- `in`, `not_in`
- `date`, `after`, `before`
- `regex`

### AJAX-Fallback Rules
These rules automatically fall back to server-side validation:

- `unique` - Check database uniqueness
- `exists` - Verify record exists
- `password` - Current password verification
- `current_password` - Laravel's current password rule

## Configuration

The configuration file `config/client-validation.php` allows you to customize everything.

## Examples

Check the `examples/` directory for complete working examples including:
- Basic HTML demo
- Laravel FormRequest integration
- Livewire components
- API usage

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

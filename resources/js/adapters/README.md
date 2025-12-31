# JavaScript Adapters

This directory contains framework-specific adapters for Laravel Client Validation.

## Available Adapters

### 1. Alpine.js Adapter (`alpine.js`)

Provides seamless integration with Alpine.js through:

- **`x-validate` directive** - Validate individual fields
- **`validation()` data component** - Full form handling with reactive state

#### Usage

```html
<!-- Simple directive -->
<input x-validate="'required|email'" name="email">
<input x-validate.live="'required|min:3'" name="username">
<input x-validate.submit="'required'" name="password">

<!-- Full form component -->
<div x-data="validation({
    rules: { email: 'required|email', password: 'required|min:8' }
})">
    <input x-model="form.email" @blur="validate('email')">
    <span x-text="error('email')"></span>
</div>
```

### 2. Vanilla JS Adapter (`vanilla.js`)

Works with plain HTML using data attributes - no framework required.

#### Usage

```html
<form data-validate>
    <input name="email" data-rules="required|email">
    <input name="password" data-rules="required|min:8" data-validate-on="blur">
    <button type="submit">Submit</button>
</form>
```

#### Data Attributes

| Attribute | Description |
|-----------|-------------|
| `data-validate` | Add to `<form>` to enable validation |
| `data-rules` | Validation rules (same as Laravel) |
| `data-validate-on` | Trigger: `blur`, `input`, or `submit` |
| `data-message` | Custom error message |
| `data-attribute` | Display name for field in messages |

## Creating Custom Adapters

Adapters should:

1. Import the core `LaravelValidator` class
2. Set up event listeners based on the framework's patterns
3. Call `validator.validateField()` or `validator.validateAll()`
4. Update UI based on results

Example skeleton:

```javascript
import LaravelValidator from '../core/LaravelValidator.js';

export default function myFrameworkAdapter(framework) {
    // Create validator instances
    // Set up framework-specific event handling
    // Update UI on validation results
}
```

## Future Adapters

Planned adapters:

- **React** - Hook-based validation (`useValidation()`)
- **Vue** - Composition API integration
- **Livewire** - Deep Livewire 3 integration
- **Inertia** - Inertia.js form helpers

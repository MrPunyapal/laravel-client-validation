# JavaScript Adapters

This directory contains framework-specific adapters for Laravel Client Validation.

## Available Adapters

### 1. Alpine.js Adapter (`alpine.js`)

Provides seamless integration with Alpine.js through:

- **`x-validate` directive** - Validate individual fields
- **`validation()` data component** - Full form handling with reactive state

```html
<!-- Simple directive -->
<input x-validate="'required|email'" name="email">
<input x-validate.live="'required|min:3'" name="username">

<!-- Full form component -->
<div x-data="validation({
    rules: { email: 'required|email', password: 'required|min:8' }
})">
    <input x-model="form.email" @blur="validate('email')">
    <span x-text="error('email')"></span>
</div>
```

### 2. Livewire Adapter (`livewire.js`)

Deep integration with Livewire 3 for client-side pre-validation.

```html
<!-- x-wire-validate directive -->
<input wire:model="email" x-wire-validate="'required|email'" name="email">
<input wire:model="password" x-wire-validate.live="'required|min:8'" name="password">
```

```javascript
import { createLivewireValidator } from 'laravel-client-validation';

const validator = createLivewireValidator(component, {
    rules: { email: 'required|email' }
});
```

### 3. Vanilla JS Adapter (`vanilla.js`)

Works with plain HTML using data attributes - no framework required.

```html
<form data-validate>
    <input name="email" data-rules="required|email">
    <input name="password" data-rules="required|min:8" data-validate-on="blur">
    <button type="submit">Submit</button>
</form>
```

### 4. React Adapter (`react.js`)

Hook-based validation for React applications.

```jsx
import { useValidation, ReactValidator, createFieldProps } from 'laravel-client-validation';

// Hook usage (for functional components)
function MyForm() {
    const validation = useValidation({
        rules: {
            email: 'required|email',
            password: 'required|min:8'
        }
    });

    const handleBlur = async (e) => {
        await validation.validateField(e.target.name, e.target.value);
    };

    return (
        <form>
            <input 
                name="email" 
                onBlur={handleBlur}
                className={validation.hasError('email') ? 'border-red-500' : ''}
            />
            {validation.hasError('email') && (
                <span className="text-red-500">{validation.getError('email')}</span>
            )}
        </form>
    );
}

// Class-based usage
const validator = new ReactValidator({
    rules: { email: 'required|email' }
});

validator.on('validated', ({ field, result }) => {
    console.log(field, result.valid);
});
```

#### React Adapter API

| Export | Description |
|--------|-------------|
| `useValidation(options)` | Hook for functional components |
| `ReactValidator` | Class for imperative use |
| `createReactValidator(options)` | Factory function |
| `createFieldProps(validator, field, options)` | Generate input props |
| `getErrorProps(validator, field)` | Generate error display props |

### 5. Vue Adapter (`vue.js`)

Composition API and directive support for Vue 3.

```vue
<script setup>
import { useValidation } from 'laravel-client-validation';

const { validateField, hasError, getError, validateAll } = useValidation({
    rules: {
        email: 'required|email',
        password: 'required|min:8'
    }
});

const form = reactive({ email: '', password: '' });

const handleBlur = async (field) => {
    await validateField(field, form[field], form);
};

const handleSubmit = async () => {
    const result = await validateAll(form);
    if (result.valid) {
        // Submit form
    }
};
</script>

<template>
    <form @submit.prevent="handleSubmit">
        <input v-model="form.email" @blur="handleBlur('email')">
        <span v-if="hasError('email')">{{ getError('email') }}</span>
        
        <input v-model="form.password" type="password" @blur="handleBlur('password')">
        <span v-if="hasError('password')">{{ getError('password') }}</span>
        
        <button type="submit">Submit</button>
    </form>
</template>
```

#### Vue Directive

```vue
<template>
    <!-- Use v-validate directive -->
    <input v-validate="'required|email'" name="email">
    <input v-validate.live="'required|min:3'" name="username">
</template>

<script>
import { vValidate } from 'laravel-client-validation';

export default {
    directives: { validate: vValidate }
}
</script>
```

#### Vue Plugin

```javascript
import { createApp } from 'vue';
import { VueValidationPlugin } from 'laravel-client-validation';

const app = createApp(App);
app.use(VueValidationPlugin, {
    debounce: 300,
    validClass: 'border-green-500',
    invalidClass: 'border-red-500'
});
```

#### Vue Adapter API

| Export | Description |
|--------|-------------|
| `useValidation(options)` | Composition API composable |
| `createVueValidator(options)` | Factory function |
| `vValidate` | Vue 3 directive |
| `VueValidationPlugin` | Vue 3 plugin |
| `ValidationMixin` | Options API mixin |

## Data Attributes (Vanilla)

| Attribute | Description |
|-----------|-------------|
| `data-validate` | Add to `<form>` to enable validation |
| `data-rules` | Validation rules (same as Laravel) |
| `data-validate-on` | Trigger: `blur`, `input`, or `submit` |
| `data-message` | Custom error message |
| `data-attribute` | Display name for field in messages |

## Livewire Events

The Livewire adapter dispatches events to components:
- `client-validation-error` - When validation fails
- `client-validation-cleared` - When errors are cleared
- `client-validation` - General validation event

## Creating Custom Adapters

Adapters should:

1. Import the core `LaravelValidator` class
2. Set up event listeners based on the framework's patterns
3. Call `validator.validateField()` or `validator.validateAll()`
4. Update UI based on results

```javascript
import LaravelValidator from '../core/LaravelValidator.js';

export function myFrameworkAdapter(options) {
    const validator = new LaravelValidator(options);
    
    // Framework-specific setup
    // Return API for the framework
    
    return {
        validateField: (field, value) => validator.validateField(field, value),
        validateAll: (data) => validator.validateAll(data),
        // ... other methods
    };
}
```

## Future Adapters

Planned:

- **Inertia.js** - Form helper integration
- **Svelte** - Store-based validation

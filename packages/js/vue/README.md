# @laravel-client-validation/vue

Vue 3 adapter for Laravel Client Validation. Validate with the `v-validate` directive, register global behavior via `VueValidationPlugin`, or use composables directly.

Requires `@laravel-client-validation/core` (installed automatically as a dependency).

## Install

```bash
npm install @laravel-client-validation/vue
```

## Usage

Register the plugin to get the global directive:

```javascript
import { createApp } from 'vue';
import { VueValidationPlugin } from '@laravel-client-validation/vue';
import App from './App.vue';

createApp(App)
    .use(VueValidationPlugin, {
        debounce: 300,
        invalidClass: 'border-red-500',
        validClass: 'border-green-500',
    })
    .mount('#app');
```

Then attach Laravel rule strings per field. Errors render into a sibling `[data-error="field"]` or `.validation-error` element when present; validation runs on blur (`v-validate.live` adds debounced input validation):

```vue
<script setup>
const form = { email: '', password: '' };
</script>

<template>
    <form @submit.prevent="save">
        <div>
            <input type="email" name="email" v-model="form.email" v-validate="'required|email'">
            <span class="validation-error" data-error="email"></span>
        </div>

        <input type="password" name="password" v-model="form.password"
               v-validate.live="'required|min:8'">
        <span class="validation-error" data-error="password"></span>

        <button type="submit">Sign up</button>
    </form>
</template>
```

For programmatic control, use the `useValidation(options)` composable (returns `validateField`, `validateAll`, `hasError`, `getError`, `clearErrors`, …) or `createVueValidator(options)` outside components. Note that its returned state is plain — wrap rendered values in your own `ref`/`reactive`. A `ValidationMixin` is included for Options API components.

## Using with Inertia

No dedicated Inertia adapter is needed: the Vue adapter composes with `@inertiajs/vue3`. Use it inside an Inertia page component and post only after client validation passes:

```vue
<script setup>
import { useForm } from '@inertiajs/vue3';
import { createVueValidator } from '@laravel-client-validation/vue';

const form = useForm({ email: '', password: '' });

const validator = createVueValidator({
    rules: { email: 'required|email', password: 'required|min:8' },
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
        <input type="email" name="email" v-model="form.email" v-validate="'required|email'">
        <span class="validation-error" data-error="email"></span>

        <input type="password" name="password" v-model="form.password"
               v-validate="'required|min:8'">
        <span class="validation-error" data-error="password"></span>

        <button type="submit" :disabled="form.processing">Sign up</button>
    </form>
</template>
```

Remote rules such as `unique` still call the configured Laravel endpoint before the Inertia request fires.

## Documentation

https://mrpunyapal.github.io/laravel-client-validation/vue/

---
title: Vue
description: Use the shipped Vue directive, plugin, or validator helpers to keep Laravel rules close to Vue forms.
order: 10
slug: vue
---

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

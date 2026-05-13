---
title: Inertia
description: Use Laravel Client Validation inside Inertia pages by composing the shipped React or Vue adapters; no dedicated Inertia adapter is required.
order: 11
slug: inertia
---

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

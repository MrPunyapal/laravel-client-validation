# @laravel-client-validation/react

React adapter for Laravel Client Validation. Validate against Laravel rule strings with a stable validator instance plus field-prop helpers that plug into your inputs.

Requires `@laravel-client-validation/core` (installed automatically as a dependency).

## Install

```bash
npm install @laravel-client-validation/react
```

## Usage

The adapter exposes helper functions rather than a state library: `createReactValidator()` returns a plain validator object that does not trigger re-renders. Keep the instance stable (`useRef`), subscribe to changes, and drive your own component state:

```jsx
import { useEffect, useRef, useState } from 'react';
import {
    createFieldProps,
    createReactValidator,
    getErrorProps,
} from '@laravel-client-validation/react';

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

    useEffect(() => validatorRef.current.subscribe(() => forceRender((n) => n + 1)), []);

    const validator = validatorRef.current;

    const submit = async (event) => {
        event.preventDefault();
        const result = await validator.validateAll(form);
        if (result.valid) {
            // Post the form or call your mutation.
        }
    };

    return (
        <form onSubmit={submit}>
            <input
                name="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                {...createFieldProps(validator, 'email', { getData: () => form })}
            />
            <p {...getErrorProps(validator, 'email')} />

            <button type="submit">Sign up</button>
        </form>
    );
}
```

Exports: `useValidation(options)` (same object as `createReactValidator`; not a true hook — no internal React state), `createReactValidator(options)`, `ReactValidator` (class for imperative use), `createFieldProps(validator, field, options)` (blur/change handlers + ARIA attributes), and `getErrorProps(validator, field)` (error `<p>` props). Server-backed rules such as `unique` are checked via AJAX automatically.

## Using with Inertia

No dedicated Inertia adapter is needed: the React adapter composes with `@inertiajs/react`. Use the hook inside an Inertia page component and post only after client validation passes:

```jsx
import { useForm } from '@inertiajs/react';
import { createReactValidator } from '@laravel-client-validation/react';

const validator = createReactValidator({
    rules: { email: 'required|email', password: 'required|min:8' },
});

export default function Register() {
    const form = useForm({ email: '', password: '' });

    const submit = async (event) => {
        event.preventDefault();

        const result = await validator.validateAll(form.data);
        if (!result.valid) return;

        form.post('/register');
    };

    return (
        <form onSubmit={submit}>
            <input name="email" value={form.data.email}
                   onChange={(e) => form.setData('email', e.target.value)} />
            <input type="password" name="password" value={form.data.password}
                   onChange={(e) => form.setData('password', e.target.value)} />

            <button type="submit" disabled={form.processing}>Sign up</button>
        </form>
    );
}
```

Remote rules still call the configured Laravel endpoint before the Inertia request fires, so `unique` feedback arrives without a round-trip through your controller.

## Documentation

https://mrpunyapal.github.io/laravel-client-validation/react/

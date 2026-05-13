---
title: React
description: Keep Laravel rule strings in React components with the shipped React validator helpers and field prop generators.
order: 9
slug: react
---

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

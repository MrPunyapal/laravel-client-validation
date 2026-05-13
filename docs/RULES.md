# Validation Rules

This file is retained as a compatibility pointer for repository links.

The canonical validation rules documentation now lives in [docs/md/validation-rules.md](./md/validation-rules.md).

When you need to update validation-rule documentation:

1. Edit [docs/md/validation-rules.md](./md/validation-rules.md).
2. Run `php docs/build.php`.
3. Review the generated output in `docs/generated/validation-rules.html`.
4. Commit the Markdown source and generated HTML together.

Do not edit generated HTML files by hand.

{{-- Confirmed with custom field --}}
<input x-validate="'confirmed:repeat_email'" name="email">

{{-- Alpha with ASCII-only mode --}}
<input x-validate="'alpha:ascii'" name="code">

{{-- Boolean strict mode --}}
<input x-validate="'boolean:strict'" name="flag">
```

## Adding Custom Rules

```javascript
LaravelClientValidation.extend('phone', (value, params, field, context) => {
    if (!value) return true;
    return /^\+?[\d\s-]{10,}$/.test(value);
}, 'The :attribute must be a valid phone number.');
```

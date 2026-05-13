---
title: Troubleshooting
description: Resolve the most common installation, asset loading, and remote validation issues when Laravel Client Validation does not behave as expected.
order: 15
slug: troubleshooting
---

Most validation failures come down to one of three causes: the browser bundle is not loaded, the field metadata was not rendered, or a remote validation request cannot reach the backend.

## The browser bundle never initializes

### Symptoms

- `x-validate` or `data-validate` fields do nothing.
- `window.LaravelClientValidation` is undefined in the console.

### Checks

```php
@clientValidationAssets
```

- Confirm the directive is rendered in the page layout.
- Confirm the published files exist in `public/vendor/client-validation`.
- Check the network tab for the package bundle or the CDN fallback.

## Rules render, but errors never appear

### Symptoms

- Inputs contain attributes, but no validation message is shown.
- Classes such as `is-invalid` or `validation-error` never appear.

### Checks

```php
'error_template' => [
    'enabled' => true,
],

'field_styling' => [
    'enabled' => true,
],
```

- Verify `error_template.enabled` or `field_styling.enabled` has not been disabled.
- Inspect the rendered markup and confirm the directive output is attached to the correct field.
- Test with a simpler rule like `required` before adding compound logic.

## Remote rules never finish

### Symptoms

- `unique` stays pending.
- No request reaches the Laravel application.

### Checks

```php
'enable_ajax_validation' => true,
'route_prefix' => 'client-validation',
'ajax_timeout' => 5000,
```

- Confirm the validation endpoint exists at the configured prefix.
- Confirm the page includes the CSRF token and the route is not blocked by middleware.
- Increase `ajax_timeout` temporarily while debugging slow responses.

## Cross-field rules behave inconsistently

Rules like `same`, `different`, `required_if`, `gt`, or `lte` depend on up-to-date sibling field values.

```html
<input name="password" @validateBlur('password', 'required|min:8')>
<input name="password_confirmation" @validateBlur('password_confirmation', 'required|same:password')>
```

Use form bindings that keep both fields synchronized before the comparison runs.

## The docs site looks stale

The generated HTML is not the canonical source. Rebuild the site from Markdown.

```bash
php docs/build.php
```

Then review the generated files in `docs/`.

## Still blocked?

- Compare the current form markup with the working snippets in [usage](./usage.md) and [examples](./examples.md).
- Re-run the checks in [testing](./testing.md).
- Document the failure mode in `docs/md` once you find the root cause so the next contributor does not need to rediscover it.

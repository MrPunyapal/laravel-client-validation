---
title: Configuration
description: Configure default validation behavior, AJAX, styling, and message handling through config/client-validation.php.
order: 3
slug: configuration
---

Laravel Client Validation publishes a single configuration file, `config/client-validation.php`, that controls how the browser bundle is loaded and how validation behaves by default.

## Publishing and editing config

If you skipped the installer, publish the configuration manually:

```bash
php artisan vendor:publish --tag=client-validation-config
```

Then edit the generated file in your application.

## Core runtime options

Use these settings to decide when validation runs and whether server-backed rules are allowed.

```php
return [
    'auto_include_assets' => true,
    'enable_ajax_validation' => true,
    'ajax_timeout' => 5000,
    'route_prefix' => 'client-validation',
    'validation_mode' => 'blur',
    'debounce_ms' => 300,
];
```

### Recommended defaults

- Keep `validation_mode` at `blur` for most text fields.
- Switch to `input` or `live` only when feedback needs to be immediate.
- Leave `enable_ajax_validation` enabled if you use `unique`, `exists`, `password`, or other server-side rules.

## Rate limiting and caching

AJAX validation is throttled and cached to avoid spamming the backend while the user types.

```php
'rate_limit' => [
    'max_attempts' => 60,
    'decay_seconds' => 60,
],

'cache' => [
    'enabled' => true,
    'ttl' => 300,
    'max_size' => 1000,
],
```

Use a lower debounce or lower rate limit only when you have confirmed the validation endpoint can tolerate the extra traffic.

## Error templates and field styling

The package can add and remove CSS classes automatically when a field passes or fails validation.

```php
'error_template' => [
    'enabled' => true,
    'container_class' => 'validation-error text-red-500 text-sm mt-1',
    'show_on' => ['fail'],
    'position' => 'after',
],

'field_styling' => [
    'enabled' => true,
    'valid_class' => 'is-valid border-green-500',
    'invalid_class' => 'is-invalid border-red-500',
],
```

This is a good place to align the generated classes with your Tailwind, Bootstrap, or bespoke utility classes.

## Default messages and attributes

Message placeholders are merged with per-form messages, so keep the config file focused on cross-application defaults.

```php
'messages' => [
    'required' => 'The :attribute field is required.',
    'email' => 'The :attribute must be a valid email address.',
],

'attributes' => [
    'password_confirmation' => 'password confirmation',
],
```

## Rule capability lists

The configuration file also keeps track of which rules are treated as fully client-side and which rules should always use the server.

```php
'client_side_rules' => [
    'required', 'email', 'min', 'max', 'between', 'confirmed',
],

'server_side_rules' => [
    'unique', 'exists', 'password', 'current_password', 'encoding',
],
```

Only adjust those lists when you are extending the package itself and you fully understand how the parser and browser runtime treat the rule.

## Example environment overrides

```ini
CLIENT_VALIDATION_AUTO_INCLUDE=true
CLIENT_VALIDATION_ENABLE_AJAX=true
CLIENT_VALIDATION_AJAX_TIMEOUT=7000
CLIENT_VALIDATION_RATE_LIMIT=30
CLIENT_VALIDATION_RATE_DECAY=60
CLIENT_VALIDATION_MODE=blur
CLIENT_VALIDATION_DEBOUNCE=250
```

## Related pages

- See [usage](./usage.md) for directive-level overrides.
- See [validation rules](./validation-rules.md) for rule behavior and remote fallback.
- See [troubleshooting](./troubleshooting.md) when configuration and runtime behavior drift apart.

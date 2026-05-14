---
title: Custom Rules
description: Extend Laravel Client Validation with browser-side JavaScript rules and server-side Laravel validators without losing clarity about where a rule runs.
order: 13
slug: custom-rules
---

Custom rules work best when you decide first whether the behavior belongs in the browser, on the server, or both.

## Client-side custom rules

Use the global bundle helper or the core `RuleRegistry` to add a browser-only rule.

```javascript
LaravelClientValidation.extend('phone', (value) => {
    if (!value) {
        return true;
    }

    return /^\+?[\d\s-]{10,}$/.test(value);
}, 'The :attribute must be a valid phone number.');
```

You can then reference the rule anywhere you already use package directives.

```html
<input name="phone" @validateBlur('phone', 'required|phone')>
```

### ES module registration

```javascript
import { RuleRegistry } from 'laravel-client-validation/core';

RuleRegistry.extend('sku', (value) => /^[A-Z]{3}-\d{4}$/.test(value), 'The :attribute must be a valid SKU.');
```

## Server-side custom rules

Use the package facade when the rule depends on backend state or you want the parser to treat it as server-side by default.

```php
use MrPunyapal\ClientValidation\Facades\ClientValidation;

ClientValidation::extend('strong_password', function ($attribute, $value) {
    return preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/', (string) $value) === 1;
}, 'Password must contain uppercase, lowercase, and numbers.');
```

The package registers that rule with Laravel's validator and classifies it as server-side unless you also provide a matching browser implementation.

## Shared rule strategy

If the same rule should behave consistently in both places, keep the rule name identical and maintain one browser implementation and one Laravel implementation.

```php
$rules = [
    'sku' => 'required|sku',
];
```

```javascript
LaravelClientValidation.extend('sku', (value) => /^[A-Z]{3}-\d{4}$/.test(value));
```

## Testing custom rules

- Validate the JavaScript rule in a browser or JavaScript test.
- Validate the PHP rule with Laravel or package tests.

## Documentation checklist for new rules

- Link to the user-facing rule description from [validation rules](./validation-rules.md).
- Show one passing example and one failing example.
- State clearly whether the rule is browser-only, server-only, or shared.
- Avoid renaming an existing rule unless you are prepared to update every internal link and every rule string that references it.

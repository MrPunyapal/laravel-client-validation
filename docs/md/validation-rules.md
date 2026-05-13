---
title: Validation Rules
description: Understand which Laravel validation rules run fully in the browser, which rules remain server-backed, and how to document edge cases.
order: 12
slug: validation-rules
---

Laravel Client Validation currently ships broad client-side coverage and a smaller set of explicitly remote rules. Use this page as the working overview when deciding whether a rule can stay in the browser or must hit the backend.

## Rule parity at a glance

- Client-side rules: 104
- Remote rules: 5 primary rules handled through AJAX
- Rule source lists: `config/client-validation.php`, `resources/js/core/rules`, and `resources/js/core/RuleRegistry.js`

## Common client-side categories

### Core and string rules

| Rule | Purpose | Data types | Example |
| --- | --- | --- | --- |
| `required` | Reject empty input | string, array, file | `required` |
| `email` | Validate email format | string | `required|email` |
| `alpha_dash` | Allow letters, numbers, dashes, underscores | string | `required|alpha_dash|min:3` |
| `contains:value` | Require a substring | string | `contains:@company.com` |
| `uuid:4` | Validate UUID format and version | string | `required|uuid:4` |

### Numeric and size rules

| Rule | Purpose | Data types | Example |
| --- | --- | --- | --- |
| `numeric` | Accept numeric values | string, number | `required|numeric` |
| `integer:strict` | Enforce integer-only values | number, numeric string | `integer:strict|min:1` |
| `between:min,max` | Constrain range or length | string, array, numeric | `between:3,10` |
| `multiple_of:value` | Enforce divisibility | number | `multiple_of:5` |
| `digits_between:min,max` | Validate exact digit count range | numeric string | `digits_between:6,8` |

### Comparison and conditional rules

| Rule | Purpose | Data types | Example |
| --- | --- | --- | --- |
| `confirmed` | Match a confirmation field | string | `required|confirmed` |
| `same:field` | Match another field value | mixed | `same:billing_email` |
| `required_if:field,value` | Require when another field matches | mixed | `required_if:role,admin` |
| `required_without:field` | Require when another field is missing | mixed | `required_without:phone` |
| `prohibits:field` | Prevent conflicting fields | mixed | `prohibits:coupon_code` |

### Date, network, and file rules

| Rule | Purpose | Data types | Example |
| --- | --- | --- | --- |
| `date_format:format` | Match a Laravel-style date format | string | `date_format:Y-m-d` |
| `after:today` | Compare against a relative date | string | `date|after:today` |
| `ip` / `ipv4` / `ipv6` | Validate network values | string | `required|ipv6` |
| `image` | Restrict uploaded files to images | file | `file|image|mimes:jpg,png` |
| `dimensions:...` | Inspect image width or height | image file | `dimensions:min_width=640,min_height=480` |

## Remote rules

Remote rules are intentionally delegated to the server because they depend on application state or backend facilities.

| Rule | Why it stays remote | Typical example |
| --- | --- | --- |
| `unique` | Needs database access | `unique:users,email` |
| `exists` | Needs database access | `exists:roles,id` |
| `password` | Needs current auth context | `password` |
| `current_password` | Needs current auth context | `current_password` |
| `encoding` | Needs backend encoding checks | `encoding:UTF-8` |

If a remote rule never fires, check [troubleshooting](./troubleshooting.md) for route, CSRF, or timeout issues.

## Usage examples

### Typical account form

```html
<input name="name" @validateBlur('name', 'required|string|min:2|max:50')>
<input name="email" @validateLive('email', 'required|email|unique:users,email')>
<input name="password" @validateSubmit('password', 'required|min:8|confirmed')>
```

### Array, date, and file examples

```html
<input name="timezone" @rules('timezone', 'required|timezone')>
<input name="launch_date" @rules('launch_date', 'required|date|after_or_equal:today')>
<input type="file" name="avatar" @rules('avatar', 'file|image|mimes:jpg,png|dimensions:min_width=256,min_height=256')>
```

## Edge cases and expected behavior

- `nullable` allows empty input but does not skip other rules when the value is non-empty.
- Rules that compare against sibling fields, such as `same`, `different`, `gt`, or `required_if`, depend on the form data already being available to the validator.
- Remote rules still need normal Laravel validation messages and backend authorization to be correct.
- File rules depend on browser-provided `File` objects, so they should be tested in a real browser flow rather than only in isolated unit tests.

## Message placeholders

Default browser messages use the same placeholder vocabulary Laravel developers expect, such as `:attribute`, `:min`, `:max`, `:other`, and `:values`.

```php
'messages' => [
    'required' => 'The :attribute field is required.',
    'min' => 'The :attribute must be at least :min characters.',
    'unique' => 'The :attribute has already been taken.',
],
```

## When documenting a new rule

- Explain the rule purpose in one sentence.
- Include a realistic Laravel rule string.
- Call out the supported value types.
- Document edge cases, especially for remote or cross-field rules.
- Show at least one example validation message.

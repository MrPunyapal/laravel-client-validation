# Validation Rules

This document lists all available validation rules and their implementation status.

## Available Rules (44)

These rules are implemented and ready for client-side validation:

| Rule | Description | Status |
|------|-------------|--------|
| `required` | Field must not be empty | ✅ Implemented |
| `email` | Must be valid email format | ✅ Implemented |
| `min:value` | Minimum length/value | ✅ Implemented |
| `max:value` | Maximum length/value | ✅ Implemented |
| `numeric` | Must be numeric | ✅ Implemented |
| `integer` | Must be an integer | ✅ Implemented |
| `alpha` | Letters only | ✅ Implemented |
| `alpha_num` | Letters and numbers only | ✅ Implemented |
| `alpha_dash` | Letters, numbers, dashes, underscores | ✅ Implemented |
| `url` | Valid URL format | ✅ Implemented |
| `between:min,max` | Value between min and max | ✅ Implemented |
| `confirmed` | Must match `{field}_confirmation` | ✅ Implemented |
| `size:value` | Exact size/length | ✅ Implemented |
| `in:val1,val2` | Must be one of listed values | ✅ Implemented |
| `not_in:val1,val2` | Must not be one of listed values | ✅ Implemented |
| `boolean` | Must be true/false | ✅ Implemented |
| `date` | Valid date format | ✅ Implemented |
| `after:date` | Must be after given date | ✅ Implemented |
| `before:date` | Must be before given date | ✅ Implemented |
| `regex:pattern` | Must match regex pattern | ✅ Implemented |
| `same:field` | Must match another field | ✅ Implemented |
| `different:field` | Must differ from another field | ✅ Implemented |
| `accepted` | Must be accepted (yes, on, 1, true) | ✅ Implemented |
| `digits:value` | Exact number of digits | ✅ Implemented |
| `digits_between:min,max` | Digits between min and max | ✅ Implemented |
| `string` | Must be a string | ✅ Implemented |
| `nullable` | Field can be null/empty | ✅ Implemented |
| `array` | Must be an array | ✅ Implemented |
| `gt:field` | Greater than another field | ✅ Implemented |
| `gte:field` | Greater than or equal to another field | ✅ Implemented |
| `lt:field` | Less than another field | ✅ Implemented |
| `lte:field` | Less than or equal to another field | ✅ Implemented |
| `filled` | Must not be empty when present | ✅ Implemented |
| `present` | Field must be present (can be empty) | ✅ Implemented |
| `starts_with:prefix` | Must start with given value | ✅ Implemented |
| `ends_with:suffix` | Must end with given value | ✅ Implemented |
| `uuid` | Valid UUID format | ✅ Implemented |
| `json` | Valid JSON string | ✅ Implemented |
| `lowercase` | Must be lowercase | ✅ Implemented |
| `uppercase` | Must be uppercase | ✅ Implemented |
| `ip` | Valid IP address | ✅ Implemented |
| `ipv4` | Valid IPv4 address | ✅ Implemented |
| `ipv6` | Valid IPv6 address | ✅ Implemented |

## Remote Rules (4)

These rules require server-side validation via AJAX:

| Rule | Description | Status |
|------|-------------|--------|
| `unique:table,column` | Must be unique in database | 🌐 Remote |
| `exists:table,column` | Must exist in database | 🌐 Remote |
| `password` | Current password verification | 🌐 Remote |
| `current_password` | Current password verification | 🌐 Remote |

## Missing Rules - Priority

### High Priority (Commonly Used)

| Rule | Description | Difficulty |
|------|-------------|------------|
| `required_if:field,value` | Required if another field has value | Medium |
| `required_unless:field,value` | Required unless another field has value | Medium |
| `required_with:field` | Required if another field is present | Medium |
| `required_without:field` | Required if another field is absent | Medium |
| `after_or_equal:date` | Must be after or equal to date | Easy |
| `before_or_equal:date` | Must be before or equal to date | Easy |

### Medium Priority

| Rule | Description | Difficulty |
|------|-------------|------------|
| `distinct` | Array values must be unique | Medium |
| `mac_address` | Valid MAC address | Easy |
| `ascii` | ASCII characters only | Easy |
| `decimal:min,max` | Decimal with specific precision | Medium |
| `multiple_of:value` | Multiple of given number | Easy |

### Low Priority (Less Common)

| Rule | Description | Difficulty |
|------|-------------|------------|
| `mac_address` | Valid MAC address | Easy |
| `timezone` | Valid timezone | Medium |
| `ascii` | ASCII characters only | Easy |
| `decimal:min,max` | Decimal with specific precision | Medium |
| `multiple_of:value` | Multiple of given number | Easy |
| `prohibited` | Field must be empty | Easy |
| `prohibited_if:field,value` | Prohibited if condition met | Medium |
| `prohibited_unless:field,value` | Prohibited unless condition met | Medium |
| `required_with_all:fields` | Required if all fields present | Medium |
| `required_without_all:fields` | Required if all fields absent | Medium |
| `required_array_keys:keys` | Array must have specific keys | Medium |
| `min_digits:value` | Minimum number of digits | Easy |
| `max_digits:value` | Maximum number of digits | Easy |

### File Rules (Remote Recommended)

These are best handled server-side but can have basic client checks:

| Rule | Description | Difficulty |
|------|-------------|------------|
| `file` | Must be a file | Easy |
| `image` | Must be an image | Easy |
| `mimes:types` | Must be specific mime types | Medium |
| `mimetypes:types` | Must be specific mime types | Medium |
| `extensions:ext` | Must have specific extension | Easy |
| `dimensions:rules` | Image dimensions | Hard |

## Implementation Plan

### Phase 1: Comparison Rules
1. `gt`, `gte`, `lt`, `lte` - Compare with other fields or values
2. `filled`, `present` - Presence checks

### Phase 2: Conditional Required
1. `required_if`, `required_unless`
2. `required_with`, `required_without`

### Phase 3: String Utilities
1. `starts_with`, `ends_with`
2. `lowercase`, `uppercase`
3. `uuid`, `json`

### Phase 4: Network/Format
1. `ip`, `ipv4`, `ipv6`
2. `mac_address`

### Phase 5: Date Extensions
1. `after_or_equal`, `before_or_equal`
2. `date_format`

## Usage Examples

### Basic Validation
```html
<input x-validate="'required|email'" name="email">
<input x-validate="'required|min:8'" name="password">
```

### With Multiple Rules
```html
<input x-validate="'required|alpha_dash|between:3,20'" name="username">
```

### Live Validation
```html
<input x-validate.live="'required|email'" name="email">
```

### Submit-Only Validation
```html
<input x-validate.submit="'required'" name="terms">
```

## Adding Custom Rules

```javascript
LaravelClientValidation.extend('phone', (value, params, context) => {
    if (!value) return true;
    return /^\+?[\d\s-]{10,}$/.test(value);
}, 'The :attribute must be a valid phone number.');
```

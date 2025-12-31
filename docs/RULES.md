# Validation Rules

This document lists all available validation rules and their implementation status.

## Available Rules (64)

These rules are implemented and ready for client-side validation:

### Core Rules
| Rule | Description | Status |
|------|-------------|--------|
| `required` | Field must not be empty | ✅ Implemented |
| `nullable` | Field can be null/empty | ✅ Implemented |
| `filled` | Must not be empty when present | ✅ Implemented |
| `present` | Field must be present (can be empty) | ✅ Implemented |

### String Rules
| Rule | Description | Status |
|------|-------------|--------|
| `string` | Must be a string | ✅ Implemented |
| `email` | Must be valid email format | ✅ Implemented |
| `url` | Valid URL format | ✅ Implemented |
| `alpha` | Letters only | ✅ Implemented |
| `alpha_num` | Letters and numbers only | ✅ Implemented |
| `alpha_dash` | Letters, numbers, dashes, underscores | ✅ Implemented |
| `regex:pattern` | Must match regex pattern | ✅ Implemented |
| `lowercase` | Must be lowercase | ✅ Implemented |
| `uppercase` | Must be uppercase | ✅ Implemented |
| `starts_with:prefix` | Must start with given value | ✅ Implemented |
| `ends_with:suffix` | Must end with given value | ✅ Implemented |
| `doesnt_start_with:prefix` | Must not start with given value | ✅ Implemented |
| `doesnt_end_with:suffix` | Must not end with given value | ✅ Implemented |
| `ascii` | ASCII characters only | ✅ Implemented |
| `uuid` | Valid UUID format | ✅ Implemented |
| `json` | Valid JSON string | ✅ Implemented |

### Numeric Rules
| Rule | Description | Status |
|------|-------------|--------|
| `numeric` | Must be numeric | ✅ Implemented |
| `integer` | Must be an integer | ✅ Implemented |
| `decimal:min,max` | Decimal with specific precision | ✅ Implemented |
| `multiple_of:value` | Multiple of given number | ✅ Implemented |
| `digits:value` | Exact number of digits | ✅ Implemented |
| `digits_between:min,max` | Digits between min and max | ✅ Implemented |

### Size Rules
| Rule | Description | Status |
|------|-------------|--------|
| `min:value` | Minimum length/value | ✅ Implemented |
| `max:value` | Maximum length/value | ✅ Implemented |
| `between:min,max` | Value between min and max | ✅ Implemented |
| `size:value` | Exact size/length | ✅ Implemented |

### Comparison Rules
| Rule | Description | Status |
|------|-------------|--------|
| `confirmed` | Must match `{field}_confirmation` | ✅ Implemented |
| `same:field` | Must match another field | ✅ Implemented |
| `different:field` | Must differ from another field | ✅ Implemented |
| `gt:field` | Greater than another field | ✅ Implemented |
| `gte:field` | Greater than or equal to another field | ✅ Implemented |
| `lt:field` | Less than another field | ✅ Implemented |
| `lte:field` | Less than or equal to another field | ✅ Implemented |
| `in:val1,val2` | Must be one of listed values | ✅ Implemented |
| `not_in:val1,val2` | Must not be one of listed values | ✅ Implemented |

### Date Rules
| Rule | Description | Status |
|------|-------------|--------|
| `date` | Valid date format | ✅ Implemented |
| `after:date` | Must be after given date | ✅ Implemented |
| `before:date` | Must be before given date | ✅ Implemented |
| `after_or_equal:date` | Must be after or equal to date | ✅ Implemented |
| `before_or_equal:date` | Must be before or equal to date | ✅ Implemented |
| `date_equals:date` | Must equal given date | ✅ Implemented |

### Conditional Rules
| Rule | Description | Status |
|------|-------------|--------|
| `required_if:field,value` | Required if another field has value | ✅ Implemented |
| `required_unless:field,value` | Required unless another field has value | ✅ Implemented |
| `required_with:field` | Required if another field is present | ✅ Implemented |
| `required_without:field` | Required if another field is absent | ✅ Implemented |
| `prohibited` | Field must be empty | ✅ Implemented |
| `prohibited_if:field,value` | Prohibited if condition met | ✅ Implemented |
| `prohibited_unless:field,value` | Prohibited unless condition met | ✅ Implemented |

### Boolean/Acceptance Rules
| Rule | Description | Status |
|------|-------------|--------|
| `boolean` | Must be true/false | ✅ Implemented |
| `accepted` | Must be accepted (yes, on, 1, true) | ✅ Implemented |
| `accepted_if:field,value` | Must be accepted when condition met | ✅ Implemented |
| `declined` | Must be declined (no, off, 0, false) | ✅ Implemented |
| `declined_if:field,value` | Must be declined when condition met | ✅ Implemented |

### Network Rules
| Rule | Description | Status |
|------|-------------|--------|
| `ip` | Valid IP address | ✅ Implemented |
| `ipv4` | Valid IPv4 address | ✅ Implemented |
| `ipv6` | Valid IPv6 address | ✅ Implemented |
| `mac_address` | Valid MAC address | ✅ Implemented |

### Array Rules
| Rule | Description | Status |
|------|-------------|--------|
| `array` | Must be an array | ✅ Implemented |
| `distinct` | Array values must be unique | ✅ Implemented |

## Remote Rules (4)

These rules require server-side validation via AJAX:

| Rule | Description | Status |
|------|-------------|--------|
| `unique:table,column` | Must be unique in database | 🌐 Remote |
| `exists:table,column` | Must exist in database | 🌐 Remote |
| `password` | Current password verification | 🌐 Remote |
| `current_password` | Current password verification | 🌐 Remote |

## Missing Rules (Low Priority)

| Rule | Description | Difficulty |
|------|-------------|------------|
| `required_with_all:fields` | Required if all fields present | Medium |
| `required_without_all:fields` | Required if all fields absent | Medium |
| `required_array_keys:keys` | Array must have specific keys | Medium |
| `min_digits:value` | Minimum number of digits | Easy |
| `max_digits:value` | Maximum number of digits | Easy |
| `timezone` | Valid timezone | Medium |
| `date_format:format` | Specific date format | Medium |

## Usage Examples

### Basic Validation
```html
<input x-validate="'required|email'" name="email">
<input x-validate="'required|min:8'" name="password">
```

### Conditional Rules
```html
<input x-validate="'required_if:role,admin'" name="permissions">
<input x-validate="'required_with:first_name'" name="last_name">
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
LaravelClientValidation.extend('phone', (value, params, field, context) => {
    if (!value) return true;
    return /^\+?[\d\s-]{10,}$/.test(value);
}, 'The :attribute must be a valid phone number.');
```

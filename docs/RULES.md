# Validation Rules

This document lists all available validation rules and their implementation status.

## Available Rules (104)

These rules are implemented and ready for client-side validation:

### Core Rules
| Rule | Description | Status |
|------|-------------|--------|
| `required` | Field must not be empty | ✅ Implemented |
| `nullable` | Field can be null/empty | ✅ Implemented |
| `filled` | Must not be empty when present | ✅ Implemented |
| `present` | Field must be present (can be empty) | ✅ Implemented |
| `bail` | Stop validation on first failure for this field | ✅ Implemented |

### String Rules
| Rule | Description | Status |
|------|-------------|--------|
| `string` | Must be a string | ✅ Implemented |
| `email` | Must be valid email format | ✅ Implemented |
| `url` | Valid URL format | ✅ Implemented |
| `active_url` | Valid URL with hostname | ✅ Implemented |
| `alpha` | Letters only (Unicode by default, `alpha:ascii` for ASCII-only) | ✅ Implemented |
| `alpha_num` | Letters and numbers only (Unicode by default, `alpha_num:ascii` for ASCII-only) | ✅ Implemented |
| `alpha_dash` | Letters, numbers, dashes, underscores (Unicode by default, `alpha_dash:ascii` for ASCII-only) | ✅ Implemented |
| `regex:pattern` | Must match regex pattern | ✅ Implemented |
| `not_regex:pattern` | Must not match regex pattern | ✅ Implemented |
| `contains:value` | Must contain the given string | ✅ Implemented |
| `doesnt_contain:value` | Must not contain the given string | ✅ Implemented |
| `lowercase` | Must be lowercase | ✅ Implemented |
| `uppercase` | Must be uppercase | ✅ Implemented |
| `starts_with:prefix` | Must start with given value | ✅ Implemented |
| `ends_with:suffix` | Must end with given value | ✅ Implemented |
| `doesnt_start_with:prefix` | Must not start with given value | ✅ Implemented |
| `doesnt_end_with:suffix` | Must not end with given value | ✅ Implemented |
| `ascii` | ASCII characters only | ✅ Implemented |
| `uuid` | Valid UUID format (`uuid:4` for specific version) | ✅ Implemented |
| `ulid` | Valid ULID format | ✅ Implemented |
| `json` | Valid JSON string | ✅ Implemented |
| `hex_color` | Valid hexadecimal color | ✅ Implemented |

### Numeric Rules
| Rule | Description | Status |
|------|-------------|--------|
| `numeric` | Must be numeric (`numeric:strict` for type-only) | ✅ Implemented |
| `integer` | Must be an integer (`integer:strict` for type-only) | ✅ Implemented |
| `decimal:min,max` | Decimal with specific precision | ✅ Implemented |
| `multiple_of:value` | Multiple of given number | ✅ Implemented |
| `digits:value` | Exact number of digits | ✅ Implemented |
| `digits_between:min,max` | Digits between min and max | ✅ Implemented |
| `min_digits:value` | Minimum number of digits | ✅ Implemented |
| `max_digits:value` | Maximum number of digits | ✅ Implemented |

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
| `confirmed` | Must match `{field}_confirmation` or `confirmed:custom_field` | ✅ Implemented |
| `same:field` | Must match another field | ✅ Implemented |
| `different:field` | Must differ from another field | ✅ Implemented |
| `gt:field` | Greater than another field | ✅ Implemented |
| `gte:field` | Greater than or equal to another field | ✅ Implemented |
| `lt:field` | Less than another field | ✅ Implemented |
| `lte:field` | Less than or equal to another field | ✅ Implemented |
| `in:val1,val2` | Must be one of listed values | ✅ Implemented |
| `not_in:val1,val2` | Must not be one of listed values | ✅ Implemented |
| `enum:ClassName` | Must be a valid enum value (pass values as params) | ✅ Implemented |

### Date Rules
| Rule | Description | Status |
|------|-------------|--------|
| `date` | Valid date format | ✅ Implemented |
| `after:date` | Must be after given date | ✅ Implemented |
| `before:date` | Must be before given date | ✅ Implemented |
| `after_or_equal:date` | Must be after or equal to date | ✅ Implemented |
| `before_or_equal:date` | Must be before or equal to date | ✅ Implemented |
| `date_equals:date` | Must equal given date | ✅ Implemented |
| `date_format:format` | Must match date format | ✅ Implemented |
| `timezone` | Must be a valid timezone | ✅ Implemented |

### Conditional Rules
| Rule | Description | Status |
|------|-------------|--------|
| `required_if:field,value` | Required if another field has value | ✅ Implemented |
| `required_unless:field,value` | Required unless another field has value | ✅ Implemented |
| `required_with:field` | Required if another field is present | ✅ Implemented |
| `required_without:field` | Required if another field is absent | ✅ Implemented |
| `required_with_all:fields` | Required if all fields are present | ✅ Implemented |
| `required_without_all:fields` | Required if all fields are absent | ✅ Implemented |
| `required_if_accepted:field` | Required if another field is accepted | ✅ Implemented |
| `required_if_declined:field` | Required if another field is declined | ✅ Implemented |
| `required_array_keys:keys` | Array must contain specified keys | ✅ Implemented |
| `prohibited` | Field must be empty | ✅ Implemented |
| `prohibited_if:field,value` | Prohibited if condition met | ✅ Implemented |
| `prohibited_unless:field,value` | Prohibited unless condition met | ✅ Implemented |
| `prohibited_if_accepted:field` | Prohibited if another field is accepted | ✅ Implemented |
| `prohibited_if_declined:field` | Prohibited if another field is declined | ✅ Implemented |
| `prohibits:field1,field2` | If present, other fields must be empty | ✅ Implemented |
| `present_if:field,value` | Must be present if condition met | ✅ Implemented |
| `present_unless:field,value` | Must be present unless condition met | ✅ Implemented |
| `present_with:field` | Must be present when another field exists | ✅ Implemented |
| `present_with_all:fields` | Must be present when all fields exist | ✅ Implemented |
| `missing` | Field must not be present | ✅ Implemented |
| `missing_if:field,value` | Must not be present if condition met | ✅ Implemented |
| `missing_unless:field,value` | Must not be present unless condition met | ✅ Implemented |
| `missing_with:field` | Must not be present when another field exists | ✅ Implemented |
| `missing_with_all:fields` | Must not be present when all fields exist | ✅ Implemented |

### Boolean/Acceptance Rules
| Rule | Description | Status |
|------|-------------|--------|
| `boolean` | Must be true/false (`boolean:strict` for type-only) | ✅ Implemented |
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
| `in_array:field` | Must exist in another field's array | ✅ Implemented |
| `in_array_keys:field` | Must exist as a key in another field's array | ✅ Implemented |
| `list` | Must be a zero-indexed sequential array | ✅ Implemented |

### File Rules
| Rule | Description | Status |
|------|-------------|--------|
| `file` | Must be a File object | ✅ Implemented |
| `image` | Must be an image (jpeg, png, gif, bmp, svg, webp) | ✅ Implemented |
| `mimes:ext1,ext2` | Must have one of the given file extensions | ✅ Implemented |
| `mimetypes:type1,type2` | Must have one of the given MIME types | ✅ Implemented |
| `extensions:ext1,ext2` | Must have one of the given extensions | ✅ Implemented |
| `dimensions:constraints` | Image must meet dimension constraints | ✅ Implemented |

### Advanced Rules
| Rule | Description | Status |
|------|-------------|--------|
| `any_of:ruleset1;ruleset2` | Must match at least one ruleset (semicolon-separated) | ✅ Implemented |
| `password_strength` | Password strength validation (`min=8,letters,mixedCase,numbers,symbols`) | ✅ Implemented |

## Remote Rules (5)

These rules require server-side validation via AJAX:

| Rule | Description | Status |
|------|-------------|--------|
| `unique:table,column` | Must be unique in database | 🌐 Remote |
| `exists:table,column` | Must exist in database | 🌐 Remote |
| `password` | Current password verification | 🌐 Remote |
| `current_password` | Current password verification | 🌐 Remote |
| `encoding:enc` | Must be valid in the given encoding | 🌐 Remote |

## Usage Examples

### Basic Validation
```html
<input x-validate="'required|email'" name="email">
<input x-validate="'required|min:8'" name="password">
```

### Bail on First Error
```html
<input x-validate="'bail|required|email|unique:users'" name="email">
```

### Conditional Rules
```html
<input x-validate="'required_if:role,admin'" name="permissions">
<input x-validate="'required_with:first_name'" name="last_name">
<input x-validate="'required_with_all:street,city'" name="zip">
<input x-validate="'required_if_accepted:newsletter'" name="email">
<input x-validate="'prohibited_if_declined:terms'" name="premium_features">
```

### Presence/Missing Rules
```html
<input x-validate="'present_if:type,business'" name="company_name">
<input x-validate="'missing_if:type,personal'" name="company_name">
<input x-validate="'missing_with:alternative_email'" name="phone">
```

### Date Validation
```html
<input x-validate="'date|after:today'" name="start_date">
<input x-validate="'date|date_format:Y-m-d'" name="birth_date">
<input x-validate="'timezone'" name="timezone">
```

### String Content Rules
```html
<input x-validate="'contains:@company.com'" name="work_email">
<input x-validate="'doesnt_contain:spam'" name="message">
<input x-validate="'not_regex:/[<>]/'" name="safe_input">
```

### File Validation
```html
<input type="file" x-validate="'file|image|mimes:jpg,png|dimensions:min_width=100,min_height=100'" name="avatar">
<input type="file" x-validate="'file|extensions:pdf,docx'" name="document">
```

### Network Validation
```html
<input x-validate="'ip'" name="ip_address">
<input x-validate="'mac_address'" name="mac">
<input x-validate="'active_url'" name="website">
```

### Format Validation
```html
<input x-validate="'uuid'" name="uuid">
<input x-validate="'ulid'" name="ulid">
<input x-validate="'hex_color'" name="color">
```

### Array Validation
```html
<input x-validate="'in_array:allowed_values'" name="selection">
<input x-validate="'list'" name="items">
```

### Live Validation
```html
<input x-validate.live="'required|email'" name="email">
```

### Submit-Only Validation
```html
<input x-validate.submit="'required'" name="terms">
```

### Advanced Rules
```html
{{-- Password strength --}}
<input x-validate="'password_strength:min=8,letters,mixedCase,numbers,symbols'" name="password">

{{-- Any of (match at least one ruleset) --}}
<input x-validate="'any_of:email;url'" name="contact">

{{-- UUID with version --}}
<input x-validate="'uuid:4'" name="token">

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

# Validation Rules

This directory contains individual validation rule implementations that mirror Laravel's validation rules.

## Available Rules

### Basic Rules
- `required.js` - Field must have a value
- `email.js` - Field must be a valid email address
- `numeric.js` - Field must be numeric
- `integer.js` - Field must be an integer
- `boolean.js` - Field must be a boolean value

### String Rules
- `alpha.js` - Field must contain only alphabetic characters
- `alpha_num.js` - Field must contain only alphanumeric characters
- `alpha_dash.js` - Field must contain only alphanumeric characters, dashes, and underscores
- `string.js` - Field must be a string (alias implemented in index.js)

### Size Rules
- `min.js` - Field must have a minimum value/length
- `max.js` - Field must have a maximum value/length
- `between.js` - Field must be between two values/lengths
- `size.js` - Field must be exactly a certain size/length

### Comparison Rules
- `same.js` - Field must match another field
- `different.js` - Field must be different from another field
- `confirmed.js` - Field must match `field_confirmation`

### Date Rules
- `date.js` - Field must be a valid date
- `after.js` - Field must be after a given date
- `before.js` - Field must be before a given date

### Array/List Rules
- `in.js` - Field must be in a list of values
- `not_in.js` - Field must not be in a list of values

### Advanced Rules
- `regex.js` - Field must match a regular expression
- `url.js` - Field must be a valid URL

## Usage

Each rule is implemented as a function that:
1. Takes the value as the first parameter
2. Takes rule parameters as the second parameter (array)
3. Takes the field name as the third parameter
4. Takes all form data as the fourth parameter (for cross-field validation)

```javascript
import required from './required.js';

// Returns true if valid, false if invalid
const isValid = required('some value');
```

## Adding New Rules

To add a new rule:

1. Create a new file in this directory (e.g., `my_rule.js`)
2. Export a default function that implements the validation logic
3. Add the rule to the exports in `index.js`
4. Follow the naming convention used by Laravel

Example:
```javascript
// my_rule.js
export default function myRule(value, params, field, data) {
    // Your validation logic here
    return true; // or false
}
```

```javascript
// index.js
import myRule from './my_rule.js';

export default {
    // ...existing rules...
    my_rule: myRule,
};
```

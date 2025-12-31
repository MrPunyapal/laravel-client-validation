# AI Agent Guidelines

This document provides guidelines for AI agents working on this codebase.

## Project Overview

Laravel Client Validation is a package that provides client-side validation for Laravel applications. It converts Laravel validation rules to JavaScript and supports multiple integration patterns (Alpine.js, Vanilla JS).

## Architecture

### PHP (Backend)
- `src/Core/` - Core validation logic (RuleParser, ValidationManager, ValidationContext)
- `src/Contracts/` - Interfaces for dependency injection
- `src/Facades/` - Laravel facades
- `src/Http/Controllers/` - AJAX validation endpoint
- `src/Livewire/` - Livewire trait for validation

### JavaScript (Frontend)
- `resources/js/core/` - Core validation engine
  - `LaravelValidator.js` - Main validator class
  - `RuleRegistry.js` - Rule registration and messages
  - `RemoteValidator.js` - AJAX validation for server-only rules
  - `EventEmitter.js` - Event system for hooks
  - `rules/` - Individual validation rule implementations
- `resources/js/adapters/` - Framework integrations
  - `alpine.js` - Alpine.js x-validate directive
  - `vanilla.js` - Vanilla JS form validator

## Code Style

### PHP
- Follow PSR-12 coding standards
- Use PHP 8.2+ features (typed properties, constructor promotion)
- Run `composer pint` for code formatting
- Run `composer analyse` for static analysis

### JavaScript
- ES Modules only (no CommonJS)
- No TypeScript - plain JavaScript with JSDoc for types
- Minimal comments - code should be self-documenting
- Each validation rule in its own file under `rules/`

### Rule Function Signature
All validation rules must follow this signature:
```javascript
export default function ruleName(value, params, field, context = {}) {
    // value: The field value being validated
    // params: Array of rule parameters (e.g., ['5'] for min:5)
    // field: The field name
    // context: { field, allData, rules }
    return boolean;
}
```

## Testing

### PHP Tests
```bash
composer test        # Run Pest tests
composer test-coverage  # With coverage
```

### JavaScript Tests
```bash
npm test            # Run Vitest tests
npm run test:coverage  # With coverage
```

## Common Tasks

### Adding a New Validation Rule

1. Create rule file: `resources/js/core/rules/rule_name.js`
2. Export from: `resources/js/core/rules/index.js`
3. Add message in: `resources/js/core/RuleRegistry.js`
4. Add to PHP parser if needed: `src/Core/RuleParser.php`
5. Write tests in: `tests/js/rules.test.js`
6. Update docs: `docs/RULES.md`

### Building Assets
```bash
npm run build       # Build production assets
npm run dev         # Watch mode
```

## Files to Avoid Modifying

- `vendor/` - Composer dependencies
- `node_modules/` - NPM dependencies
- `resources/js/dist/` - Built files (auto-generated)
- `build/` - Build cache

## Important Patterns

### Client vs Server Rules
- **Client-side**: `required`, `email`, `min`, `max`, etc.
- **Server-side (AJAX)**: `unique`, `exists`, database-dependent rules

### Error Handling
- Never throw exceptions in validation rules - return false
- Log errors with console.error for debugging
- Provide meaningful error messages via RuleRegistry

### Event Hooks
Validators emit events that can be hooked:
- `field:validating` - Before field validation
- `field:validated` - After field validation
- `form:validating` - Before form validation
- `form:validated` - After form validation

## Playground Testing

The `/playground/` folder (gitignored) is for testing in a real Laravel app:
1. Link the package: `composer require local/client-validation --prefer-source`
2. Publish config: `php artisan vendor:publish --tag=client-validation-config`
3. Test with real forms and validation scenarios

## Pull Request Guidelines

1. All tests must pass
2. Run linters before committing
3. Update CHANGELOG.md for notable changes
4. Keep commits atomic and well-described

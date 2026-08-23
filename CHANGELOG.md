# Changelog

All notable changes to `laravel-client-validation` will be documented in this file.

## Unreleased

### Added

- Livewire magic mode: a component hook (`ClientValidationHook`) now injects the client validation payload into the snapshot memo for components using `WithClientValidation`, and the browser adapter automatically binds blur/live validation and submit blocking to all `wire:model` fields — no Blade changes required.
- Conditional rules such as `required_if` are now included in generated client payloads (previously dropped) because they can be evaluated against sibling fields in the browser.
- Server-side rules are serialized into payloads prefixed with `ajax:` (e.g. `ajax:unique:users,email`) so the browser routes them through the AJAX validation endpoint while client rules still apply instantly.
- New `auto_bind_livewire` config option (`CLIENT_VALIDATION_AUTO_BIND_LIVEWIRE`, default `true`) to disable magic mode; manual `x-wire-validate` remains available as an escape hatch.
- The Livewire adapter now survives DOM morphs: injected error containers are marked `wire:ignore`, replaced inputs/forms are re-bound, and error state is re-applied after each request.
- New `onPasses()` and `onFails()` hooks for running callbacks when the whole form passes or fails validation.
- Livewire dependent-field revalidation: editing a confirmation field clears its stale error as you type, and conditional siblings such as `required_if` re-validate when the field they depend on changes.
- Date comparison rules (`after`, `before`, `after_or_equal`, `before_or_equal`, `date_equals`) accept another field name or the `today` / `tomorrow` / `yesterday` keywords as their parameter.
- Default browser messages for the `array` and `nullable` rules.

### Fixed

- Alpine directives register reliably whether the package loads before or after Alpine starts, including Alpine 3.14+.
- `valid_class` / `invalid_class` values containing multiple class names apply correctly instead of breaking styling updates.
- `regex` and `not_regex` patterns containing commas are no longer split into fragments.
- Digit rules (`digits`, `digits_between`, `min_digits`, `max_digits`) no longer ignore non-digit characters and now reach the same verdict as Laravel.
- `integer` and `decimal` enforce Laravel's exact number formats.
- `in`, `not_in`, and `enum` evaluate falsy values (such as `0`) correctly.
- Rules throughout the library fail validation instead of throwing errors on unexpected input.

### Changed

- Duplicate rule strings in a field's rule list are collapsed when building client payloads.
- `size`, `between`, `min`, and `max` compare values numerically in numeric contexts, matching Laravel.

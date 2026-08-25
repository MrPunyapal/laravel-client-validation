# Changelog

## 0.1.0

### Minor Changes

- 47f6005: Split into publishable packages: core + adapters under the @laravel-client-validation scope; meta-package unchanged for BC.

### Patch Changes

- Updated dependencies [47f6005]
    - @laravel-client-validation/core@0.1.0
    - @laravel-client-validation/alpine@0.1.0
    - @laravel-client-validation/vanilla@0.1.0
    - @laravel-client-validation/livewire@0.1.0
    - @laravel-client-validation/react@0.1.0
    - @laravel-client-validation/vue@0.1.0

All notable changes to `laravel-client-validation` will be documented in this file.

## Unreleased

### Added

- Package split: JavaScript sources now live in `packages/js/*` as publishable packages (`@laravel-client-validation/core`, `/alpine`, `/vanilla`, `/livewire`, `/react`, `/vue`) managed via npm workspaces. The `laravel-client-validation` meta-package keeps working unchanged: same entry points, same subpath exports (`/core`, `/alpine`, `/vanilla`, `/livewire`, `/react`, `/vue`), and the Laravel-served IIFE/UMD bundle is unchanged.
- Livewire PHP integration (WithClientValidation trait, snapshot hook) moved to the new `mrpunyapal/client-validation-livewire` package. The trait namespace is unchanged; run `composer require mrpunyapal/client-validation-livewire` after upgrading. The core package's service provider auto-registers the snapshot hook when that package is installed.

### Fixed- Livewire magic mode: a component hook (`ClientValidationHook`) now injects the client validation payload into the snapshot memo for components using `WithClientValidation`, and the browser adapter automatically binds blur/live validation and submit blocking to all `wire:model` fields — no Blade changes required.

- Conditional rules such as `required_if` are now included in generated client payloads (previously dropped) because they can be evaluated against sibling fields in the browser.
- Server-side rules are serialized into payloads prefixed with `ajax:` (e.g. `ajax:unique:users,email`) so the browser routes them through the AJAX validation endpoint while client rules still apply instantly.
- New `auto_bind_livewire` config option (`CLIENT_VALIDATION_AUTO_BIND_LIVEWIRE`, default `true`) to disable magic mode; manual `x-wire-validate` remains available as an escape hatch.
- The Livewire adapter now survives DOM morphs: injected error containers are marked `wire:ignore`, replaced inputs/forms are re-bound, and error state is re-applied after each request.
- New `onPasses()` and `onFails()` hooks for running callbacks when the whole form passes or fails validation.
- Livewire dependent-field revalidation: editing a confirmation field clears its stale error as you type, and conditional siblings such as `required_if` re-validate when the field they depend on changes.
- Date comparison rules (`after`, `before`, `after_or_equal`, `before_or_equal`, `date_equals`) accept another field name or the `today` / `tomorrow` / `yesterday` keywords as their parameter.
- Default browser messages for the `array` and `nullable` rules.

### Fixed

- `ajax:`-prefixed server rules (used by Livewire magic mode) no longer crash validation with a temporal-dead-zone reference; the AJAX round-trip now completes and its error renders. Found via real-browser testing.
- Vanilla adapter (`data-rules` forms) now passes all named sibling fields to the validator, so cross-field rules such as `confirmed`, `same`, and `required_if` work even when the sibling input has no rules of its own.
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

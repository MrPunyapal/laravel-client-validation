# Changelog

## Unreleased

### Added

- Filament: `clientValidation()` / `withoutClientValidation()` now work on **native** fields (`TextInput`, `Select`, ...) through macros registered by the panel plugin — no wrapper field or custom view required. `clientValidation()` with no rules automatically derives client-side rules from the field's own required state and validation rules; the plugin also injects an HTML `name` attribute (the field's state path) onto native inputs, which Filament v5 renders without — required for the browser runtime to bind `x-validate` and for sibling rules like `confirmed`. Existing `ClientValidatedField` and `HasClientValidation` remain fully supported.
- Optional `ClientValidationPlugin::make()->enableAutoValidation()` infers client-side rules from each field's own required state and rules, filtering out server-only rules via the rule parser.
- Alpine adapter: once any validated field lives inside a `<form>`, the form is guarded on submit — every bound field in that form is re-validated and submission is blocked until all pass. Blur/live fields now participate in form saves, not just fields marked `x-validate.submit`.
- Forms containing `x-validate` fields now disable native browser constraint popups so package validation messages are shown consistently.
- Native Filament fields now forward evaluated `validationMessages()` and `validationAttribute()` values to the Alpine validator for consistent client-side messages.
- Filament integration has been extracted into its own package, `mrpunyapal/client-validation-filament` (`packages/php/filament/`), mirroring the Livewire split. The core package is now framework-agnostic again; the subtree-split workflow pushes the sub-directory to the dedicated repo on `main` pushes and tags.

## 0.1.1

### Patch Changes

- 2be6f24: Verify the npm trusted publishing (OIDC) release pipeline end-to-end. No product changes.
- Updated dependencies [2be6f24]
    - @laravel-client-validation/core@0.1.1
    - @laravel-client-validation/alpine@0.1.1
    - @laravel-client-validation/vanilla@0.1.1
    - @laravel-client-validation/livewire@0.1.1
    - @laravel-client-validation/react@0.1.1
    - @laravel-client-validation/vue@0.1.1

### Fixed

- Livewire magic mode now picks up rules defined through Livewire's `#[Validate]` property attributes. Previously only a `rules()` method or `$rules` property was read (`mrpunyapal/client-validation-livewire`), so components relying purely on attributes got no client-side validation. Attribute-derived messages (`message:`) and labels (`as:`/`attribute:`) are included too, and attribute rules merge with `rules()`/property definitions.

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

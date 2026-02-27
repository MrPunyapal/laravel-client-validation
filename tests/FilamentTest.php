<?php

use MrPunyapal\ClientValidation\Filament\HasClientValidation;

beforeEach(function () {
    $this->component = new class
    {
        use HasClientValidation;

        public function evaluate($value)
        {
            return is_callable($value) ? $value() : $value;
        }

        public function isRequired(): bool
        {
            return true;
        }

        public function getValidationRules(): array
        {
            return ['required', 'email', 'max:255'];
        }
    };
});

it('has client validation disabled by default', function () {
    expect($this->component->hasClientValidation())->toBeFalse();
});

it('can enable client validation with explicit rules', function () {
    $this->component->clientValidation('required|email');

    expect($this->component->hasClientValidation())->toBeTrue()
        ->and($this->component->getClientValidationRules())->toBe('required|email');
});

it('can enable client validation with closure rules', function () {
    $this->component->clientValidation(fn () => 'required|min:3');

    expect($this->component->getClientValidationRules())->toBe('required|min:3');
});

it('can enable client validation using withClientValidation', function () {
    $this->component->withClientValidation();

    expect($this->component->hasClientValidation())->toBeTrue();
});

it('can disable client validation', function () {
    $this->component->withClientValidation();
    $this->component->withoutClientValidation();

    expect($this->component->hasClientValidation())->toBeFalse()
        ->and($this->component->getClientValidationRules())->toBeNull();
});

it('resolves rules from field when no explicit rules set', function () {
    $this->component->withClientValidation();

    $rules = $this->component->getClientValidationRules();

    expect($rules)->toContain('required')
        ->and($rules)->toContain('email')
        ->and($rules)->toContain('max:255');
});

it('returns blur modifier by default', function () {
    expect($this->component->getClientValidationModifier())->toBe('');
});

it('returns live modifier when set', function () {
    $this->component->clientValidationMode('live');

    expect($this->component->getClientValidationModifier())->toBe('.live');
});

it('returns submit modifier when set', function () {
    $this->component->clientValidationMode('submit');

    expect($this->component->getClientValidationModifier())->toBe('.submit');
});

it('generates validation attributes for Alpine.js', function () {
    $this->component->clientValidation('required|email');

    $attributes = $this->component->getClientValidationAttributes();

    expect($attributes)->toHaveKey('x-validate')
        ->and($attributes['x-validate'])->toBe("'required|email'");
});

it('generates live validation attributes', function () {
    $this->component->clientValidation('required|min:3')->clientValidationMode('live');

    $attributes = $this->component->getClientValidationAttributes();

    expect($attributes)->toHaveKey('x-validate.live')
        ->and($attributes['x-validate.live'])->toBe("'required|min:3'");
});

it('returns empty attributes when disabled', function () {
    $attributes = $this->component->getClientValidationAttributes();

    expect($attributes)->toBe([]);
});

it('supports fluent chaining', function () {
    $result = $this->component
        ->clientValidation('required')
        ->clientValidationMode('live');

    expect($result)->toBe($this->component);
});

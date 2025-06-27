<?php

use MrPunyapal\ClientValidation\ClientValidation;
use MrPunyapal\ClientValidation\Support\ValidationRuleConverter;

it('registers the client validation service', function () {
    expect(app()->has('client-validation'))->toBeTrue();

    $service = app('client-validation');
    expect($service)->toBeInstanceOf(ClientValidation::class);
});

it('registers the validation rule converter', function () {
    expect(app()->has(ValidationRuleConverter::class))->toBeTrue();

    $converter = app(ValidationRuleConverter::class);
    expect($converter)->toBeInstanceOf(ValidationRuleConverter::class);
});

it('registers the clientValidation blade directive', function () {
    $directives = app('blade.compiler')->getCustomDirectives();

    expect($directives)->toHaveKey('clientValidation');
});

it('can resolve client validation through facade', function () {
    $service = app('client-validation');

    expect($service)->toBeInstanceOf(ClientValidation::class);

    // Test it can convert rules
    $rulesJson = $service->rules(['name' => 'required']);
    $decoded = json_decode($rulesJson, true);

    expect($rulesJson)->toBeString()
        ->and($decoded)->toBeArray()
        ->and($decoded['name'])->toContain('required');
});

it('loads default configuration', function () {
    expect(config('client-validation'))->toBeArray()
        ->and(config('client-validation.messages'))->toBeArray();
});

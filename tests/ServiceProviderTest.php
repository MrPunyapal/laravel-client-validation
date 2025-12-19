<?php

use MrPunyapal\ClientValidation\ClientValidation;
use MrPunyapal\ClientValidation\Core\ValidationManager;
use MrPunyapal\ClientValidation\Contracts\RuleParserInterface;
use MrPunyapal\ClientValidation\Hooks\ValidationHooks;

it('registers the client validation service', function () {
    expect(app()->has('client-validation'))->toBeTrue();

    $service = app('client-validation');
    expect($service)->toBeInstanceOf(ClientValidation::class);
});

it('registers the validation manager', function () {
    expect(app()->has(ValidationManager::class))->toBeTrue();

    $manager = app(ValidationManager::class);
    expect($manager)->toBeInstanceOf(ValidationManager::class);
});

it('registers the rule parser interface', function () {
    expect(app()->has(RuleParserInterface::class))->toBeTrue();
});

it('registers the validation hooks', function () {
    expect(app()->has(ValidationHooks::class))->toBeTrue();

    $hooks = app(ValidationHooks::class);
    expect($hooks)->toBeInstanceOf(ValidationHooks::class);
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

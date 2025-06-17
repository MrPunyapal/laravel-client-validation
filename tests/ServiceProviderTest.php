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

it('registers blade directives', function () {
    $directives = app('blade.compiler')->getCustomDirectives();

    expect($directives)->toHaveKey('clientValidation')
        ->and($directives)->toHaveKey('validateWith')
        ->and($directives)->toHaveKey('alpineValidation');
});

it('publishes configuration file', function () {
    expect(config('client-validation'))->toBeArray()
        ->and(config('client-validation.messages'))->toBeArray()
        ->and(config('client-validation.forms'))->toBeArray();
});

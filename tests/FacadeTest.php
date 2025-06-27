<?php

use MrPunyapal\ClientValidation\Facades\ClientValidation;

it('can access client validation through facade', function () {
    $rules = [
        'name' => 'required|string',
        'email' => 'required|email',
    ];

    $rulesJson = ClientValidation::rules($rules);
    $decoded = json_decode($rulesJson, true);

    expect($rulesJson)->toBeString()
        ->and($decoded)->toBeArray()
        ->and($decoded['name'])->toContain('required')
        ->and($decoded['name'])->toContain('string')
        ->and($decoded['email'])->toContain('required')
        ->and($decoded['email'])->toContain('email');
});

it('can convert rules through facade', function () {
    $rules = [
        'username' => 'required|alpha_dash|min:3',
    ];

    $jsRules = ClientValidation::rules($rules);
    $decoded = json_decode($jsRules, true);

    expect($decoded)->toBeArray()
        ->and($decoded)->toHaveKey('username');
});

it('can handle custom messages through facade', function () {
    $messages = [
        'password.required' => 'Password is required',
        'email.email' => 'Please enter a valid email',
    ];

    $messagesJson = ClientValidation::messages($messages);
    $decoded = json_decode($messagesJson, true);

    expect($messagesJson)->toBeString()
        ->and($decoded)->toBeArray()
        ->and($decoded['password.required'])->toBe('Password is required')
        ->and($decoded['email.email'])->toBe('Please enter a valid email');
});

it('facade returns same instance as app resolution', function () {
    $fromApp = app('client-validation');
    $fromFacade = ClientValidation::getFacadeRoot();

    expect($fromFacade)->toBe($fromApp);
});

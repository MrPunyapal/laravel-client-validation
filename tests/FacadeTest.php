<?php

use MrPunyapal\ClientValidation\Facades\ClientValidation;

it('can access client validation through facade', function () {
    $rules = [
        'name' => 'required|string',
        'email' => 'required|email',
    ];

    $js = ClientValidation::generate($rules);

    expect($js)->toBeString()
        ->and($js)->toContain('validateForm');
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

it('can generate inline validation through facade', function () {
    $rules = [
        'password' => 'required|min:8',
    ];

    $messages = [
        'password.required' => 'Password is required',
    ];

    $js = ClientValidation::generateInline($rules, $messages);

    expect($js)->toBeString()
        ->and($js)->toContain('validateInline')
        ->and($js)->toContain('Password is required');
});

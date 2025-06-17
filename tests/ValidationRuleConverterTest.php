<?php

use MrPunyapal\ClientValidation\Support\ValidationRuleConverter;

it('can convert basic validation rules to javascript', function () {
    $converter = new ValidationRuleConverter;

    $rules = [
        'email' => 'required|email|max:255',
        'password' => 'required|min:8|confirmed',
        'age' => 'nullable|integer|min:18|max:120',
    ];

    $jsRules = $converter->convert($rules);
    $decoded = json_decode($jsRules, true);

    expect($decoded)->toBeArray()
        ->and($decoded)->toHaveKey('email')
        ->and($decoded)->toHaveKey('password')
        ->and($decoded)->toHaveKey('age');    // Test email field rules
    expect($decoded['email'])->toContain(['rule' => 'required'])
        ->and($decoded['email'])->toContain(['rule' => 'email'])
        ->and($decoded['email'])->toContain(['rule' => 'max', 'parameters' => ['255']]);

    // Test password field rules
    expect($decoded['password'])->toContain(['rule' => 'required'])
        ->and($decoded['password'])->toContain(['rule' => 'min', 'parameters' => ['8']])
        ->and($decoded['password'])->toContain(['rule' => 'confirmed']);
});

it('handles complex validation rules', function () {
    $converter = new ValidationRuleConverter;

    $rules = [
        'username' => 'required|alpha_dash|unique:users,username|between:3,20',
        'status' => 'required|in:active,inactive,pending',
    ];

    $jsRules = $converter->convert($rules);
    $decoded = json_decode($jsRules, true);
    expect($decoded['username'])->toContain(['rule' => 'required'])
        ->and($decoded['username'])->toContain(['rule' => 'alphaDash'])
        ->and($decoded['username'])->toContain(['rule' => 'between', 'parameters' => ['3', '20']]);

    expect($decoded['status'])->toContain(['rule' => 'required'])
        ->and($decoded['status'])->toContain(['rule' => 'in', 'parameters' => ['active', 'inactive', 'pending']]);
});

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
        ->and($decoded)->toHaveKey('age');

    // Test email field rules - expect simple array of Laravel-style rules
    expect($decoded['email'])->toContain('required')
        ->and($decoded['email'])->toContain('email')
        ->and($decoded['email'])->toContain('max:255');

    // Test password field rules
    expect($decoded['password'])->toContain('required')
        ->and($decoded['password'])->toContain('min:8')
        ->and($decoded['password'])->toContain('confirmed');

    // Test age field rules
    expect($decoded['age'])->toContain('integer')
        ->and($decoded['age'])->toContain('min:18')
        ->and($decoded['age'])->toContain('max:120');
});

it('handles complex validation rules', function () {
    $converter = new ValidationRuleConverter;

    $rules = [
        'username' => 'required|alpha_dash|between:3,20',
        'status' => 'required|in:active,inactive,pending',
    ];

    $jsRules = $converter->convert($rules);
    $decoded = json_decode($jsRules, true);

    expect($decoded['username'])->toContain('required')
        ->and($decoded['username'])->toContain('alpha_dash')
        ->and($decoded['username'])->toContain('between:3,20');

    expect($decoded['status'])->toContain('required')
        ->and($decoded['status'])->toContain('in:active,inactive,pending');
});

it('handles regex patterns with commas correctly', function () {
    $converter = new ValidationRuleConverter;

    $rules = [
        'phone' => 'regex:/^[0-9]{10,15}$/',
        'code' => 'required|regex:/^[A-Z]{2,4}-[0-9]{3,6}$/',
    ];

    $jsRules = $converter->convert($rules);
    $decoded = json_decode($jsRules, true);

    expect($decoded['phone'])->toContain('regex:/^[0-9]{10,15}$/');
    expect($decoded['code'])->toContain('required')
        ->and($decoded['code'])->toContain('regex:/^[A-Z]{2,4}-[0-9]{3,6}$/');
});

it('handles empty and null rules gracefully', function () {
    $converter = new ValidationRuleConverter;

    $rules = [
        'optional' => '',
        'another' => 'required',
    ];

    $jsRules = $converter->convert($rules);
    $decoded = json_decode($jsRules, true);

    expect($decoded)->toHaveKey('another')
        ->and($decoded['another'])->toContain('required');
});

it('keeps rule names as they are in js/core', function () {
    $converter = new ValidationRuleConverter;

    $rules = [
        'field' => 'alpha_num|alpha_dash|not_in:admin,root',
    ];

    $jsRules = $converter->convert($rules);
    $decoded = json_decode($jsRules, true);

    // Keep rule names as they are in the js/core/rules - no camelCase conversion needed
    expect($decoded['field'])->toContain('alpha_num')
        ->and($decoded['field'])->toContain('alpha_dash')
        ->and($decoded['field'])->toContain('not_in:admin,root');
});

it('handles numeric and boolean validation rules', function () {
    $converter = new ValidationRuleConverter;

    $rules = [
        'price' => 'required|numeric|min:0|max:999999.99',
        'active' => 'required|boolean',
        'count' => 'required|integer|between:1,100',
    ];

    $jsRules = $converter->convert($rules);
    $decoded = json_decode($jsRules, true);

    expect($decoded['price'])->toContain('required')
        ->and($decoded['price'])->toContain('numeric')
        ->and($decoded['price'])->toContain('min:0')
        ->and($decoded['price'])->toContain('max:999999.99');

    expect($decoded['active'])->toContain('boolean');
    expect($decoded['count'])->toContain('integer')
        ->and($decoded['count'])->toContain('between:1,100');
});

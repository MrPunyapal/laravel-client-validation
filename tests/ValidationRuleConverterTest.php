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

it('handles regex patterns with commas correctly', function () {
    $converter = new ValidationRuleConverter;

    $rules = [
        'phone' => 'nullable|regex:/^[0-9]{10,15}$/',
        'code' => 'required|regex:/^[A-Z]{2,4}-[0-9]{3,6}$/',
    ];

    $jsRules = $converter->convert($rules);
    $decoded = json_decode($jsRules, true);

    expect($decoded['phone'])->toContain(['rule' => 'regex', 'parameters' => ['/^[0-9]{10,15}$/']]);
    expect($decoded['code'])->toContain(['rule' => 'regex', 'parameters' => ['/^[A-Z]{2,4}-[0-9]{3,6}$/']]);
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
        ->and($decoded['another'])->toContain(['rule' => 'required']);
});

it('converts rule names to camelCase correctly', function () {
    $converter = new ValidationRuleConverter;

    $rules = [
        'field' => 'alpha_num|alpha_dash|not_in:admin,root',
    ];

    $jsRules = $converter->convert($rules);
    $decoded = json_decode($jsRules, true);

    expect($decoded['field'])->toContain(['rule' => 'alphaNum'])
        ->and($decoded['field'])->toContain(['rule' => 'alphaDash'])
        ->and($decoded['field'])->toContain(['rule' => 'notIn', 'parameters' => ['admin', 'root']]);
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

    expect($decoded['price'])->toContain(['rule' => 'required'])
        ->and($decoded['price'])->toContain(['rule' => 'numeric'])
        ->and($decoded['price'])->toContain(['rule' => 'min', 'parameters' => ['0']])
        ->and($decoded['price'])->toContain(['rule' => 'max', 'parameters' => ['999999.99']]);

    expect($decoded['active'])->toContain(['rule' => 'boolean']);
    expect($decoded['count'])->toContain(['rule' => 'integer'])
        ->and($decoded['count'])->toContain(['rule' => 'between', 'parameters' => ['1', '100']]);
});

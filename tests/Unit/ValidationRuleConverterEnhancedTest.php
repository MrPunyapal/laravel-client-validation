<?php

use MrPunyapal\ClientValidation\Support\ValidationRuleConverter;

it('converts AJAX rules correctly', function () {
    $converter = new ValidationRuleConverter;

    $rules = [
        'email' => 'required|email|unique:users,email',
        'username' => 'required|exists:users,username',
        'password' => 'required|current_password',
    ];

    $jsRules = $converter->convert($rules);
    $decoded = json_decode($jsRules, true);

    // Test unique rule conversion
    expect($decoded['email'])->toContain('required')
        ->and($decoded['email'])->toContain('email')
        ->and($decoded['email'])->toContain('ajax:unique:users,email');

    // Test exists rule conversion
    expect($decoded['username'])->toContain('required')
        ->and($decoded['username'])->toContain('ajax:exists:users,username');

    // Test current_password rule conversion
    expect($decoded['password'])->toContain('required')
        ->and($decoded['password'])->toContain('ajax:current_password');
});

it('filters out unsupported rules', function () {
    $converter = new ValidationRuleConverter;

    $rules = [
        'field' => 'required|some_custom_rule|email',
    ];

    $jsRules = $converter->convert($rules);
    $decoded = json_decode($jsRules, true);

    expect($decoded['field'])->toContain('required')
        ->and($decoded['field'])->toContain('email')
        ->and($decoded['field'])->not->toContain('some_custom_rule');
});

it('handles mixed client and AJAX rules', function () {
    $converter = new ValidationRuleConverter;

    $rules = [
        'email' => 'required|email|max:255|unique:users,email',
    ];

    $jsRules = $converter->convert($rules);
    $decoded = json_decode($jsRules, true);

    expect($decoded['email'])->toContain('required')
        ->and($decoded['email'])->toContain('email')
        ->and($decoded['email'])->toContain('max:255')
        ->and($decoded['email'])->toContain('ajax:unique:users,email');
});

it('handles object rules correctly', function () {
    $converter = new ValidationRuleConverter;

    $ruleObject = new class {
        public function __toString()
        {
            return 'required|email';
        }
    };

    $rules = [
        'email' => ['required', 'email', 'max:255'],
    ];

    $jsRules = $converter->convert($rules);
    $decoded = json_decode($jsRules, true);

    expect($decoded['email'])->toContain('required')
        ->and($decoded['email'])->toContain('email')
        ->and($decoded['email'])->toContain('max:255');
});

it('preserves complex regex patterns', function () {
    $converter = new ValidationRuleConverter;

    $rules = [
        'phone' => 'required|regex:/^[0-9]{3}-[0-9]{3}-[0-9]{4}$/',
        'code' => 'regex:/^[A-Z]{2,4}-[0-9]{3,6}$/',
    ];

    $jsRules = $converter->convert($rules);
    $decoded = json_decode($jsRules, true);

    expect($decoded['phone'])->toContain('required')
        ->and($decoded['phone'])->toContain('regex:/^[0-9]{3}-[0-9]{3}-[0-9]{4}$/');

    expect($decoded['code'])->toContain('regex:/^[A-Z]{2,4}-[0-9]{3,6}$/');
});

it('handles empty rule arrays correctly', function () {
    $converter = new ValidationRuleConverter;

    $rules = [
        'optional' => [],
        'required' => 'required',
        'empty_string' => '',
    ];

    $jsRules = $converter->convert($rules);
    $decoded = json_decode($jsRules, true);

    expect($decoded)->toHaveKey('required')
        ->and($decoded['required'])->toContain('required')
        ->and($decoded)->not->toHaveKey('optional')
        ->and($decoded)->not->toHaveKey('empty_string');
});

it('correctly identifies client-only vs AJAX rules', function () {
    $converter = new ValidationRuleConverter;

    $clientRules = [
        'name' => 'required|string|min:2|max:255',
        'age' => 'required|integer|between:18,120',
        'email_format' => 'required|email',
    ];

    $ajaxRules = [
        'email' => 'required|unique:users,email',
        'username' => 'required|exists:users,username',
        'password' => 'required|current_password',
    ];

    $clientResult = json_decode($converter->convert($clientRules), true);
    $ajaxResult = json_decode($converter->convert($ajaxRules), true);

    // Client rules should not have ajax: prefix
    expect($clientResult['name'])->not->toContain('ajax:');
    expect($clientResult['age'])->not->toContain('ajax:');
    expect($clientResult['email_format'])->not->toContain('ajax:');

    // AJAX rules should have ajax: prefix for complex rules
    expect($ajaxResult['email'])->toContain('ajax:unique:users,email');
    expect($ajaxResult['username'])->toContain('ajax:exists:users,username');
    expect($ajaxResult['password'])->toContain('ajax:current_password');
});

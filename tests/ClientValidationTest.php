<?php

use MrPunyapal\ClientValidation\ClientValidation;
use MrPunyapal\ClientValidation\Support\ValidationRuleConverter;

it('can generate basic validation javascript', function () {
    $converter = new ValidationRuleConverter;
    $clientValidation = new ClientValidation($converter);

    $rules = [
        'name' => 'required|string|max:100',
        'email' => 'required|email',
    ];

    $js = $clientValidation->generate($rules);

    expect($js)->toBeString()
        ->and($js)->toContain('validateForm')
        ->and($js)->toContain('required')
        ->and($js)->toContain('email');
});

it('can generate validation with custom messages', function () {
    $converter = new ValidationRuleConverter;
    $clientValidation = new ClientValidation($converter);

    $rules = [
        'name' => 'required|min:2',
        'email' => 'required|email',
    ];

    $messages = [
        'name.required' => 'Name is required',
        'email.email' => 'Please enter a valid email',
    ];

    $js = $clientValidation->generate($rules, $messages);

    expect($js)->toBeString()
        ->and($js)->toContain('validateForm')
        ->and($js)->toContain('Name is required')
        ->and($js)->toContain('Please enter a valid email');
});

it('can generate validation with custom attributes', function () {
    $converter = new ValidationRuleConverter;
    $clientValidation = new ClientValidation($converter);

    $rules = [
        'name' => 'required',
        'email' => 'required|email',
    ];

    $attributes = [
        'name' => 'Full Name',
        'email' => 'Email Address',
    ];

    $js = $clientValidation->generate($rules, [], $attributes);

    expect($js)->toBeString()
        ->and($js)->toContain('validateForm')
        ->and($js)->toContain('Full Name')
        ->and($js)->toContain('Email Address');
});

it('can convert rules to json format', function () {
    $converter = new ValidationRuleConverter;
    $clientValidation = new ClientValidation($converter);

    $rules = [
        'username' => 'required|min:3|max:20',
        'age' => 'required|integer|min:18',
    ];

    $json = $clientValidation->rules($rules);

    expect($json)->toBeString()
        ->and($json)->toContain('required')
        ->and($json)->toContain('min')
        ->and($json)->toContain('max')
        ->and($json)->toContain('integer');
});

it('merges with default config messages', function () {
    $converter = new ValidationRuleConverter;
    $clientValidation = new ClientValidation($converter);

    // Set some default messages in config for testing
    config([
        'client-validation.messages' => [
            'required' => 'This field is required.',
            'email' => 'Please enter a valid email address.',
        ]
    ]);

    $rules = ['email' => 'required|email'];
    $customMessages = ['email.required' => 'Email is required'];

    $js = $clientValidation->generate($rules, $customMessages);

    expect($js)->toBeString()
        ->and($js)->toContain('Email is required')
        ->and($js)->toContain('Please enter a valid email address');
});

it('merges with default config attributes', function () {
    $converter = new ValidationRuleConverter;
    $clientValidation = new ClientValidation($converter);

    // Set some default attributes in config for testing
    config([
        'client-validation.attributes' => [
            'email' => 'email address',
            'phone' => 'phone number',
        ]
    ]);

    $rules = ['email' => 'required', 'phone' => 'required'];
    $customAttributes = ['email' => 'Email Address'];

    $js = $clientValidation->generate($rules, [], $customAttributes);

    expect($js)->toBeString()
        ->and($js)->toContain('Email Address')
        ->and($js)->toContain('phone number');
});

it('handles empty rules gracefully', function () {
    $converter = new ValidationRuleConverter;
    $clientValidation = new ClientValidation($converter);

    $js = $clientValidation->generate([]);

    expect($js)->toBeString()
        ->and($js)->toContain('validateForm');
});

it('handles complex validation rules', function () {
    $converter = new ValidationRuleConverter;
    $clientValidation = new ClientValidation($converter);

    $rules = [
        'password' => 'required|min:8|confirmed',
        'terms' => 'required|accepted',
        'age' => 'required|integer|between:18,65',
    ];

    $js = $clientValidation->generate($rules);

    expect($js)->toBeString()
        ->and($js)->toContain('required')
        ->and($js)->toContain('min')
        ->and($js)->toContain('confirmed')
        ->and($js)->toContain('accepted')
        ->and($js)->toContain('integer')
        ->and($js)->toContain('between');
});

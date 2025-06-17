<?php

use MrPunyapal\ClientValidation\ClientValidation;
use MrPunyapal\ClientValidation\Support\ValidationRuleConverter;

it('can generate validation javascript', function () {
    $converter = new ValidationRuleConverter;
    $clientValidation = new ClientValidation($converter);

    $rules = [
        'name' => 'required|string|max:100',
        'email' => 'required|email',
    ];

    $messages = [
        'name.required' => 'Name is required',
        'email.email' => 'Please enter a valid email',
    ];

    $attributes = [
        'name' => 'Full Name',
        'email' => 'Email Address',
    ];

    $js = $clientValidation->generate($rules, $messages, $attributes);

    expect($js)->toBeString()
        ->and($js)->toContain('validateForm')
        ->and($js)->toContain('Name is required')
        ->and($js)->toContain('Please enter a valid email')
        ->and($js)->toContain('Full Name')
        ->and($js)->toContain('Email Address');
});

it('can get rules for a specific form', function () {
    $converter = new ValidationRuleConverter;
    $clientValidation = new ClientValidation($converter);

    // This tests the configuration-based form rules
    $result = $clientValidation->getRulesForForm('post');

    expect($result)->toBeArray();
});

it('can validate data against rules', function () {
    $converter = new ValidationRuleConverter;
    $clientValidation = new ClientValidation($converter);

    $data = [
        'email' => 'invalid-email',
        'name' => '',
    ];

    $rules = [
        'name' => 'required',
        'email' => 'required|email',
    ];

    $errors = $clientValidation->validateData($data, $rules);

    expect($errors)->toBeArray()
        ->and($errors)->toHaveKey('name')
        ->and($errors)->toHaveKey('email');
});

it('can generate inline validation javascript', function () {
    $converter = new ValidationRuleConverter;
    $clientValidation = new ClientValidation($converter);

    $rules = [
        'username' => 'required|min:3',
    ];

    $js = $clientValidation->generateInline($rules);

    expect($js)->toBeString()
        ->and($js)->toContain('validateInline');
});

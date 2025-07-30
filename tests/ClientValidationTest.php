<?php

use MrPunyapal\ClientValidation\ClientValidation;
use MrPunyapal\ClientValidation\Support\ValidationRuleConverter;

it('can convert basic validation rules', function () {
    $converter = new ValidationRuleConverter;
    $clientValidation = new ClientValidation($converter);

    $rules = [
        'name' => 'required|string|max:100',
        'email' => 'required|email',
    ];

    $rulesJson = $clientValidation->rules($rules);
    $decoded = json_decode($rulesJson, true);

    expect($rulesJson)->toBeString()
        ->and($decoded)->toBeArray()
        ->and($decoded)->toHaveKey('name')
        ->and($decoded)->toHaveKey('email')
        ->and($decoded['name'])->toContain('required')
        ->and($decoded['name'])->toContain('string')
        ->and($decoded['name'])->toContain('max:100')
        ->and($decoded['email'])->toContain('required')
        ->and($decoded['email'])->toContain('email');
});

it('can handle custom messages', function () {
    $converter = new ValidationRuleConverter;
    $clientValidation = new ClientValidation($converter);

    $messages = [
        'name.required' => 'Name is required',
        'email.email' => 'Please enter a valid email',
    ];

    $messagesJson = $clientValidation->messages($messages);
    $decoded = json_decode($messagesJson, true);

    expect($messagesJson)->toBeString()
        ->and($decoded)->toBeArray()
        ->and($decoded['name.required'])->toBe('Name is required')
        ->and($decoded['email.email'])->toBe('Please enter a valid email');
});

it('can handle custom attributes', function () {
    $converter = new ValidationRuleConverter;
    $clientValidation = new ClientValidation($converter);

    $attributes = [
        'name' => 'Full Name',
        'email' => 'Email Address',
    ];

    $attributesJson = $clientValidation->attributes($attributes);
    $decoded = json_decode($attributesJson, true);

    expect($attributesJson)->toBeString()
        ->and($decoded)->toBeArray()
        ->and($decoded['name'])->toBe('Full Name')
        ->and($decoded['email'])->toBe('Email Address');
});

it('merges custom messages with default messages', function () {
    config(['client-validation.messages' => [
        'required' => 'This field is required.',
        'email' => 'Please enter a valid email address.',
    ]]);

    $converter = new ValidationRuleConverter;
    $clientValidation = new ClientValidation($converter);

    $customMessages = [
        'name.required' => 'Name is required',
        'email.email' => 'Please enter a valid email',
    ];

    $messagesJson = $clientValidation->messages($customMessages);
    $decoded = json_decode($messagesJson, true);

    expect($decoded['required'])->toBe('This field is required.')
        ->and($decoded['email'])->toBe('Please enter a valid email address.')
        ->and($decoded['name.required'])->toBe('Name is required')
        ->and($decoded['email.email'])->toBe('Please enter a valid email');
});

it('merges custom attributes with default attributes', function () {
    config(['client-validation.attributes' => [
        'email' => 'email address',
        'password' => 'password',
    ]]);

    $converter = new ValidationRuleConverter;
    $clientValidation = new ClientValidation($converter);

    $customAttributes = [
        'name' => 'Full Name',
        'email' => 'Email Address', // This should override the default
    ];

    $attributesJson = $clientValidation->attributes($customAttributes);
    $decoded = json_decode($attributesJson, true);

    expect($decoded['password'])->toBe('password')
        ->and($decoded['name'])->toBe('Full Name')
        ->and($decoded['email'])->toBe('Email Address'); // Custom should override default
});

it('handles empty rules gracefully', function () {
    $converter = new ValidationRuleConverter;
    $clientValidation = new ClientValidation($converter);

    $rulesJson = $clientValidation->rules([]);
    $decoded = json_decode($rulesJson, true);

    expect($rulesJson)->toBeString()
        ->and($decoded)->toBeArray()
        ->and($decoded)->toBeEmpty();
});

it('filters out unsupported validation rules', function () {
    $converter = new ValidationRuleConverter;
    $clientValidation = new ClientValidation($converter);

    $rules = [
        'email' => 'required|email|unique:users,email', // unique is not supported in JS
        'name' => 'required|string|exists:categories,name', // exists is not supported in JS
    ];

    $rulesJson = $clientValidation->rules($rules);
    $decoded = json_decode($rulesJson, true);

    expect($decoded['email'])->toContain('required')
        ->and($decoded['email'])->toContain('email')
        ->and($decoded['email'])->not->toContain('unique:users,email')
        ->and($decoded['name'])->toContain('required')
        ->and($decoded['name'])->toContain('string')
        ->and($decoded['name'])->not->toContain('exists:categories,name');
});

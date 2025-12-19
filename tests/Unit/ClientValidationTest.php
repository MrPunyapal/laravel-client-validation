<?php

use MrPunyapal\ClientValidation\ClientValidation;
use MrPunyapal\ClientValidation\Core\ValidationManager;
use MrPunyapal\ClientValidation\Core\RuleParser;
use MrPunyapal\ClientValidation\Hooks\ValidationHooks;

function createClientValidation(): ClientValidation {
    $ruleParser = new RuleParser();
    $hooks = new ValidationHooks();
    $config = config('client-validation', []);
    $manager = new ValidationManager($ruleParser, $hooks, $config);
    return new ClientValidation($manager);
}


it('can generate complete validation configuration', function () {
    $clientValidation = createClientValidation();

    $rules = [
        'name' => 'required|string|min:2',
        'email' => 'required|email|unique:users,email',
    ];

    $messages = [
        'name.required' => 'Name is required',
        'email.unique' => 'Email already exists',
    ];

    $attributes = [
        'name' => 'Full Name',
        'email' => 'Email Address',
    ];

    $result = $clientValidation->generate($rules, $messages, $attributes);
    $decoded = json_decode($result, true);

    expect($decoded)->toHaveKeys(['rules', 'messages', 'attributes'])
        ->and($decoded['rules'])->toBeArray()
        ->and($decoded['messages'])->toBeArray()
        ->and($decoded['attributes'])->toBeArray();

    // Test rules
    expect($decoded['rules'])->toHaveKey('name')
        ->and($decoded['rules']['name'])->toContain('required');

    // Test messages (should merge with defaults)
    expect($decoded['messages'])->toHaveKey('name.required')
        ->and($decoded['messages']['name.required'])->toBe('Name is required');

    // Test attributes
    expect($decoded['attributes'])->toHaveKey('name')
        ->and($decoded['attributes']['name'])->toBe('Full Name');
});

it('merges custom data with configuration defaults', function () {
    config(['client-validation.messages.required' => 'Default required message']);
    config(['client-validation.attributes.email' => 'default email']);

    $clientValidation = createClientValidation();

    $result = $clientValidation->generate(
        ['name' => 'required'],
        ['name.required' => 'Custom required message'],
        ['name' => 'Custom Name']
    );

    $decoded = json_decode($result, true);

    // Should have custom message
    expect($decoded['messages']['name.required'])->toBe('Custom required message');

    // Should have default message for other fields
    expect($decoded['messages']['required'])->toBe('Default required message');

    // Should have custom attribute
    expect($decoded['attributes']['name'])->toBe('Custom Name');

    // Should have default attribute for other fields
    expect($decoded['attributes']['email'])->toBe('default email');
});

it('handles empty inputs gracefully', function () {
    $clientValidation = createClientValidation();

    $result = $clientValidation->generate([], [], []);
    $decoded = json_decode($result, true);

    expect($decoded['rules'])->toBeArray()->toBeEmpty()
        ->and($decoded['messages'])->toBeArray()
        ->and($decoded['attributes'])->toBeArray();
});

it('preserves JSON encoding format for complex data', function () {
    $clientValidation = createClientValidation();

    $rules = [
        'tags' => 'required|regex:/^[a-zA-Z0-9,\s]+$/',
        'status' => 'required|in:active,inactive,pending',
    ];

    $result = $clientValidation->generate($rules);
    $decoded = json_decode($result, true);

    expect($decoded['rules']['tags'])->toContain('regex:/^[a-zA-Z0-9,\s]+$/')
        ->and($decoded['rules']['status'])->toContain('in:active,inactive,pending');

    // Should be valid JSON
    expect(json_last_error())->toBe(JSON_ERROR_NONE);
});

it('handles nested message structures correctly', function () {
    config([
        'client-validation.messages.min.string' => 'String must be at least :min characters',
        'client-validation.messages.min.numeric' => 'Number must be at least :min',
    ]);

    $clientValidation = createClientValidation();

    $result = $clientValidation->generate(['name' => 'required|min:3']);
    $decoded = json_decode($result, true);

    expect($decoded['messages'])->toHaveKey('min.string')
        ->and($decoded['messages'])->toHaveKey('min.numeric');
});

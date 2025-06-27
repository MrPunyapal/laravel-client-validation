<?php

use MrPunyapal\ClientValidation\Facades\ClientValidation;

it('can create a complete form validation example', function () {
    $rules = [
        'name' => 'required|string|min:2|max:50',
        'email' => 'required|email|max:255',
        'password' => 'required|min:8|confirmed',
        'age' => 'required|integer|min:18|max:120',
        'website' => 'nullable|url',
        'bio' => 'nullable|string|max:1000',
    ];

    $messages = [
        'name.required' => 'Please enter your full name',
        'email.required' => 'Email address is required',
        'password.min' => 'Password must be at least 8 characters',
    ];

    $attributes = [
        'name' => 'Full Name',
        'email' => 'Email Address',
        'password' => 'Password',
        'age' => 'Age',
        'website' => 'Website URL',
        'bio' => 'Biography',
    ];

    // Test individual methods
    $rulesJS = ClientValidation::rules($rules);
    $messagesJson = ClientValidation::messages($messages);
    $attributesJson = ClientValidation::attributes($attributes);

    $decodedRules = json_decode($rulesJS, true);
    $decodedMessages = json_decode($messagesJson, true);
    $decodedAttributes = json_decode($attributesJson, true);

    expect($decodedRules)->toHaveKey('name')
        ->and($decodedRules)->toHaveKey('email')
        ->and($decodedRules)->toHaveKey('password')
        ->and($decodedRules['name'])->toContain('required')
        ->and($decodedRules['name'])->toContain('string')
        ->and($decodedRules['name'])->toContain('min:2')
        ->and($decodedRules['email'])->toContain('required')
        ->and($decodedRules['email'])->toContain('email');

    expect($decodedMessages['name.required'])->toBe('Please enter your full name')
        ->and($decodedMessages['email.required'])->toBe('Email address is required');

    expect($decodedAttributes['name'])->toBe('Full Name')
        ->and($decodedAttributes['email'])->toBe('Email Address');
});

it('handles edge cases and real-world scenarios', function () {
    $rules = [
        'tags' => 'required|array|min:1|max:5',
        'priority' => 'required|in:low,medium,high',
        'phone' => 'nullable|regex:/^[0-9\-\+\s\(\)]+$/',
        'terms' => 'required|accepted',
        'score' => 'required|numeric|between:0,100',
    ];

    $rulesJson = ClientValidation::rules($rules);
    $decoded = json_decode($rulesJson, true);

    expect($decoded)->toBeArray()
        ->and($decoded['priority'])->toContain('required')
        ->and($decoded['priority'])->toContain('in:low,medium,high')
        ->and($decoded['phone'])->toContain('regex:/^[0-9\-\+\s\(\)]+$/')
        ->and($decoded['score'])->toContain('numeric')
        ->and($decoded['score'])->toContain('between:0,100');

    // Verify that unsupported rules are filtered out
    $rulesWithUnsupported = [
        'email' => 'required|email|unique:users,email', // unique not supported in JS
        'category' => 'required|exists:categories,id', // exists not supported in JS
    ];

    $filteredRules = ClientValidation::rules($rulesWithUnsupported);
    $decodedFiltered = json_decode($filteredRules, true);

    expect($decodedFiltered['email'])->toContain('required')
        ->and($decodedFiltered['email'])->toContain('email')
        ->and($decodedFiltered['email'])->not->toContain('unique:users,email')
        ->and($decodedFiltered['category'])->toContain('required')
        ->and($decodedFiltered['category'])->not->toContain('exists:categories,id');
});

it('works with configuration-based validation', function () {
    // Set up some config values
    config([
        'client-validation.messages' => [
            'required' => 'This field is required.',
            'email' => 'Please enter a valid email address.',
            'min' => [
                'string' => 'Must be at least :min characters.',
            ],
        ],
        'client-validation.attributes' => [
            'email' => 'email address',
            'password' => 'password',
        ],
    ]);

    $rules = [
        'email' => 'required|email',
        'password' => 'required|min:8',
    ];

    $rulesJson = ClientValidation::rules($rules);
    $messagesJson = ClientValidation::messages([]);
    $attributesJson = ClientValidation::attributes([]);

    $decodedRules = json_decode($rulesJson, true);
    $decodedMessages = json_decode($messagesJson, true);
    $decodedAttributes = json_decode($attributesJson, true);

    expect($decodedRules['email'])->toContain('required')
        ->and($decodedRules['email'])->toContain('email')
        ->and($decodedRules['password'])->toContain('min:8');

    expect($decodedMessages['required'])->toBe('This field is required.')
        ->and($decodedMessages['email'])->toBe('Please enter a valid email address.');

    expect($decodedAttributes['email'])->toBe('email address')
        ->and($decodedAttributes['password'])->toBe('password');
});

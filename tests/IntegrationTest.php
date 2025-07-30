<?php

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Route;
use MrPunyapal\ClientValidation\Facades\ClientValidation;
use MrPunyapal\ClientValidation\Http\Controllers\ValidationController;

class CompleteFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|min:2|max:100',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'age' => 'required|integer|min:18|max:120',
            'phone' => 'nullable|regex:/^[0-9]{10,15}$/',
            'website' => 'nullable|url',
            'bio' => 'nullable|string|max:1000',
            'status' => 'required|in:active,inactive,pending',
            'tags' => 'nullable|regex:/^[a-zA-Z0-9,\s]+$/',
            'terms' => 'required|accepted',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Please provide your full name.',
            'email.unique' => 'This email address is already registered.',
            'password.confirmed' => 'Password confirmation does not match.',
            'age.min' => 'You must be at least 18 years old.',
            'phone.regex' => 'Please enter a valid phone number (10-15 digits).',
            'terms.accepted' => 'You must accept the terms and conditions.',
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'full name',
            'email' => 'email address',
            'password' => 'password',
            'phone' => 'phone number',
            'website' => 'website URL',
            'bio' => 'biography',
            'terms' => 'terms and conditions',
        ];
    }
}

it('handles complete real-world form validation workflow', function () {
    // Test the complete flow with manual rule creation instead of FormRequest
    $rules = [
        'name' => 'required|string|min:2|max:100',
        'email' => 'required|email|unique:users,email',
        'password' => 'required|string|min:8|confirmed',
        'age' => 'required|integer|min:18|max:120',
        'phone' => 'nullable|regex:/^[0-9]{10,15}$/',
        'website' => 'nullable|url',
        'bio' => 'nullable|string|max:1000',
        'status' => 'required|in:active,inactive,pending',
        'tags' => 'nullable|regex:/^[a-zA-Z0-9,\s]+$/',
        'terms' => 'required|accepted',
    ];

    $messages = [
        'name.required' => 'Please provide your full name.',
        'email.unique' => 'This email address is already registered.',
        'password.confirmed' => 'Password confirmation does not match.',
        'age.min' => 'You must be at least 18 years old.',
        'phone.regex' => 'Please enter a valid phone number (10-15 digits).',
        'terms.accepted' => 'You must accept the terms and conditions.',
    ];

    $attributes = [
        'name' => 'full name',
        'email' => 'email address',
        'password' => 'password',
        'phone' => 'phone number',
        'website' => 'website URL',
        'bio' => 'biography',
        'terms' => 'terms and conditions',
    ];

    $validation = ClientValidation::generate($rules, $messages, $attributes);
    $decoded = json_decode($validation, true);

    expect($decoded)->toBeArray()
        ->toHaveKeys(['rules', 'messages', 'attributes']);

    $convertedRules = $decoded['rules'];
    $convertedMessages = $decoded['messages'];
    $convertedAttributes = $decoded['attributes'];

    // Test mixed client-side and AJAX rules
    expect($convertedRules['name'])->toContain('required', 'string', 'min:2', 'max:100')
        ->and($convertedRules['email'])->toContain('required', 'email', 'ajax:unique:users,email')
        ->and($convertedRules['password'])->toContain('required', 'string', 'min:8', 'confirmed')
        ->and($convertedRules['age'])->toContain('required', 'integer', 'min:18', 'max:120')
        ->and($convertedRules['phone'])->toContain('regex:/^[0-9]{10,15}$/')
        ->and($convertedRules['website'])->toContain('url')
        ->and($convertedRules['bio'])->toContain('string', 'max:1000')
        ->and($convertedRules['status'])->toContain('required', 'in:active,inactive,pending')
        ->and($convertedRules['tags'])->toContain('regex:/^[a-zA-Z0-9,\s]+$/')
        ->and($convertedRules['terms'])->toContain('required', 'accepted');

    // Test custom messages are included
    expect($convertedMessages['name.required'])->toBe('Please provide your full name.')
        ->and($convertedMessages['email.unique'])->toBe('This email address is already registered.');

    // Test attributes are included
    expect($convertedAttributes['name'])->toBe('full name')
        ->and($convertedAttributes['email'])->toBe('email address');
});it('integrates validation workflow end-to-end', function () {
    // Test that rules, messages, and attributes work together
    $rules = [
        'email' => 'required|email',
        'password' => 'required|min:8',
    ];

    $messages = [
        'email.required' => 'Email is required',
        'password.min' => 'Password must be at least 8 characters',
    ];

    $attributes = [
        'email' => 'Email Address',
        'password' => 'Password',
    ];

    $validation = ClientValidation::generate($rules, $messages, $attributes);
    $decoded = json_decode($validation, true);

    expect($decoded)->toHaveKeys(['rules', 'messages', 'attributes'])
        ->and($decoded['rules']['email'])->toContain('required', 'email')
        ->and($decoded['messages']['email.required'])->toBe('Email is required')
        ->and($decoded['attributes']['email'])->toBe('Email Address');
});

it('handles edge cases and complex validation scenarios', function () {
    // Test complex regex patterns
    $rules = [
        'credit_card' => 'required|regex:/^[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}$/',
        'postal_code' => 'required|regex:/^[A-Z0-9]{3,10}$/',
        'complex_pattern' => 'nullable|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/',
    ];

    $jsRules = ClientValidation::rules($rules);
    $decoded = json_decode($jsRules, true);

    expect($decoded['credit_card'])->toContain('regex:/^[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}$/')
        ->and($decoded['postal_code'])->toContain('regex:/^[A-Z0-9]{3,10}$/')
        ->and($decoded['complex_pattern'])->toContain('regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/');

    // Test that JSON encoding doesn't break the patterns
    expect(json_last_error())->toBe(JSON_ERROR_NONE);
});

it('properly segregates client vs server validation rules', function () {
    $rules = [
        'client_only' => 'required|email|min:5|max:100|alpha_dash',
        'mixed_rules' => 'required|string|min:3|unique:users,username',
        'server_only' => 'unique:posts,slug|exists:categories,id',
        'complex_mix' => 'required|email|max:255|unique:users,email|confirmed',
    ];

    $jsRules = ClientValidation::rules($rules);
    $decoded = json_decode($jsRules, true);

    // Client-only rules should not have ajax: prefix
    expect($decoded['client_only'])->not->toContain('ajax:')
        ->and($decoded['client_only'])->toContain('required', 'email', 'min:5', 'max:100', 'alpha_dash');

    // Mixed rules should have some client rules and some ajax rules
    expect($decoded['mixed_rules'])->toContain('required', 'string', 'min:3')
        ->and($decoded['mixed_rules'])->toContain('ajax:unique:users,username');

    // Server-only rules should all be ajax
    expect($decoded['server_only'])->toContain('ajax:unique:posts,slug')
        ->and($decoded['server_only'])->toContain('ajax:exists:categories,id');

    // Complex mix should have both types
    expect($decoded['complex_mix'])->toContain('required', 'email', 'max:255', 'confirmed')
        ->and($decoded['complex_mix'])->toContain('ajax:unique:users,email');
});

it('maintains data integrity through complete validation pipeline', function () {
    // Test that data remains consistent through the entire process
    $originalRules = [
        'name' => 'required|string|min:2|max:100',
        'email' => 'required|email|unique:users,email',
        'tags' => 'nullable|regex:/^[a-zA-Z0-9,\s]+$/',
        'status' => 'required|in:active,inactive,pending',
    ];

    $originalMessages = [
        'name.required' => 'Name is required',
        'email.unique' => 'Email exists',
    ];

    $originalAttributes = [
        'name' => 'Full Name',
        'email' => 'Email Address',
    ];

    // Generate complete configuration
    $generated = ClientValidation::generate($originalRules, $originalMessages, $originalAttributes);
    $decoded = json_decode($generated, true);

    // Verify structure
    expect($decoded)->toHaveKeys(['rules', 'messages', 'attributes']);

    // Verify rules are properly converted
    expect($decoded['rules']['name'])->toContain('required', 'string', 'min:2', 'max:100')
        ->and($decoded['rules']['email'])->toContain('ajax:unique:users,email');

    // Verify messages are merged
    expect($decoded['messages']['name.required'])->toBe('Name is required');

    // Verify attributes are included
    expect($decoded['attributes']['name'])->toBe('Full Name');

    // Verify JSON is valid
    expect(json_last_error())->toBe(JSON_ERROR_NONE);
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

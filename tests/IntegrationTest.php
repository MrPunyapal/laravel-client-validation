<?php

use MrPunyapal\ClientValidation\Facades\ClientValidation;

it('can create a complete form validation example', function () {
    // Simulate a typical Laravel form validation scenario
    $rules = [
        'name' => 'required|string|max:100',
        'email' => 'required|email',
        'password' => 'required|min:8|confirmed',
        'age' => 'nullable|integer|min:18|max:120',
        'website' => 'nullable|url',
        'bio' => 'nullable|string|max:500',
    ];

    $messages = [
        'name.required' => 'Please enter your full name',
        'email.email' => 'Please enter a valid email address',
        'password.min' => 'Password must be at least 8 characters',
        'age.min' => 'You must be at least 18 years old',
    ];

    $attributes = [
        'name' => 'Full Name',
        'email' => 'Email Address',
        'password' => 'Password',
        'age' => 'Age',
        'website' => 'Website URL',
        'bio' => 'Biography',
    ];

    // Generate the validation JavaScript
    $validationJS = ClientValidation::generate($rules, $messages, $attributes);

    expect($validationJS)->toBeString()
        ->and($validationJS)->toContain('validateForm')
        ->and($validationJS)->toContain('Please enter your full name')
        ->and($validationJS)->toContain('Full Name')
        ->and($validationJS)->toContain('Email Address');

    // Test individual rule conversion
    $rulesJS = ClientValidation::rules($rules);
    $decodedRules = json_decode($rulesJS, true);

    expect($decodedRules)->toHaveKey('name')
        ->and($decodedRules)->toHaveKey('email')
        ->and($decodedRules)->toHaveKey('password');

    // Verify complex rules are converted correctly
    expect($decodedRules['password'])->toContain(['rule' => 'required'])
        ->and($decodedRules['password'])->toContain(['rule' => 'min', 'parameters' => ['8']])
        ->and($decodedRules['password'])->toContain(['rule' => 'confirmed']);
});

it('handles edge cases and real-world scenarios', function () {
    // Test with complex validation rules
    $rules = [
        'username' => 'required|alpha_dash|min:3|max:20',
        'phone' => 'nullable|regex:/^[0-9]{10,15}$/',
        'tags' => 'required|array|min:1|max:5',
        'status' => 'required|in:active,inactive,pending',
        'price' => 'required|numeric|min:0.01|max:99999.99',
    ];

    $js = ClientValidation::generate($rules);

    expect($js)->toBeString()
        ->and($js)->toContain('validateForm');

    // Verify the rules are converted properly
    $rulesJS = ClientValidation::rules($rules);
    $decodedRules = json_decode($rulesJS, true);

    expect($decodedRules['username'])->toContain(['rule' => 'alphaDash'])
        ->and($decodedRules['phone'])->toContain(['rule' => 'regex', 'parameters' => ['/^[0-9]{10,15}$/']])
        ->and($decodedRules['status'])->toContain(['rule' => 'in', 'parameters' => ['active', 'inactive', 'pending']])
        ->and($decodedRules['price'])->toContain(['rule' => 'numeric']);
});

it('works with configuration-based validation', function () {
    // Set up config
    config([
        'client-validation.messages' => [
            'required' => 'This field is required.',
            'email' => 'Please enter a valid email address.',
            'min.string' => 'This field must be at least :min characters.',
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

    $js = ClientValidation::generate($rules);

    expect($js)->toBeString()
        ->and($js)->toContain('validateForm')
        ->and($js)->toContain('This field is required')
        ->and($js)->toContain('email address')
        ->and($js)->toContain('password');
});

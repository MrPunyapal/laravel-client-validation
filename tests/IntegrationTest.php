<?php

use MrPunyapal\ClientValidation\Facades\ClientValidation;

it('can create a complete form validation example', function () {
    // Simulate a typical Laravel form validation scenario
    $rules = [
        'name' => 'required|string|max:100',
        'email' => 'required|email|unique:users,email',
        'password' => 'required|min:8|confirmed',
        'age' => 'nullable|integer|min:18|max:120',
        'website' => 'nullable|url',
        'bio' => 'nullable|string|max:500',
    ];

    $messages = [
        'name.required' => 'Please enter your full name',
        'email.unique' => 'This email is already taken',
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

it('works with real Laravel validation data', function () {
    // Test with actual validation that would fail
    $invalidData = [
        'name' => '',
        'email' => 'not-an-email',
        'password' => '123', // too short
        'age' => 15, // too young
    ];

    $rules = [
        'name' => 'required|string',
        'email' => 'required|email',
        'password' => 'required|min:8',
        'age' => 'required|integer|min:18',
    ];

    $errors = ClientValidation::validateData($invalidData, $rules);

    expect($errors)->toBeArray()
        ->and($errors)->toHaveKey('name')
        ->and($errors)->toHaveKey('email')
        ->and($errors)->toHaveKey('password')
        ->and($errors)->toHaveKey('age');

    // Test with valid data
    $validData = [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => 'secretpassword',
        'age' => 25,
    ];

    $errors = ClientValidation::validateData($validData, $rules);

    expect($errors)->toBeEmpty();
});

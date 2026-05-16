<?php

use Illuminate\Foundation\Http\FormRequest;
use MrPunyapal\ClientValidation\Facades\ClientValidation;

it('can access client validation through facade', function () {
    $rules = [
        'name' => 'required|string',
        'email' => 'required|email',
    ];

    $rulesJson = ClientValidation::rules($rules);
    $decoded = json_decode($rulesJson, true);

    expect($rulesJson)->toBeString()
        ->and($decoded)->toBeArray()
        ->and($decoded['name'])->toContain('required')
        ->and($decoded['name'])->toContain('string')
        ->and($decoded['email'])->toContain('required')
        ->and($decoded['email'])->toContain('email');
});

it('can convert rules through facade', function () {
    $rules = [
        'username' => 'required|alpha_dash|min:3',
    ];

    $jsRules = ClientValidation::rules($rules);
    $decoded = json_decode($jsRules, true);

    expect($decoded)->toBeArray()
        ->and($decoded)->toHaveKey('username');
});

it('can handle custom messages through facade', function () {
    $messages = [
        'password.required' => 'Password is required',
        'email.email' => 'Please enter a valid email',
    ];

    $messagesJson = ClientValidation::messages($messages);
    $decoded = json_decode($messagesJson, true);

    expect($messagesJson)->toBeString()
        ->and($decoded)->toBeArray()
        ->and($decoded['password.required'])->toBe('Password is required')
        ->and($decoded['email.email'])->toBe('Please enter a valid email');
});

it('facade returns same instance as app resolution', function () {
    $fromApp = app('client-validation');
    $fromFacade = ClientValidation::getFacadeRoot();

    expect($fromFacade)->toBe($fromApp);
});

it('can create an Alpine-ready payload from a FormRequest', function () {
    $request = new class extends FormRequest
    {
        public function authorize(): bool
        {
            return true;
        }

        public function rules(): array
        {
            return [
                'email' => 'required|email|unique:users,email',
                'password' => 'required|min:8',
            ];
        }

        public function messages(): array
        {
            return [
                'email.required' => 'Email is required.',
            ];
        }

        public function attributes(): array
        {
            return [
                'email' => 'email address',
            ];
        }
    };

    $payload = ClientValidation::fromRequest($request);

    expect($payload)->toHaveKeys(['rules', 'ajax_rules', 'messages', 'attributes', 'config'])
        ->and($payload['rules']['email'])->toContain('required', 'email', 'ajax:unique:users,email')
        ->and($payload['rules']['password'])->toContain('required', 'min:8')
        ->and($payload['ajax_rules'])->toHaveKey('email')
        ->and($payload['messages']['email.required'])->toBe('Email is required.')
        ->and($payload['attributes']['email'])->toBe('email address');
});

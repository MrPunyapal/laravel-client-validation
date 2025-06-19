<?php

use MrPunyapal\ClientValidation\Livewire\WithClientValidation;

it('can use the WithClientValidation trait with rules property', function () {
    $component = new class
    {
        use WithClientValidation;

        protected $rules = [
            'name' => 'required|string|max:100',
            'email' => 'required|email',
        ];
    };

    $clientRules = $component->getClientRulesProperty();

    expect($clientRules)->toBeString()
        ->and($clientRules)->toContain('name')
        ->and($clientRules)->toContain('email')
        ->and($clientRules)->toContain('required');
});

it('can use the WithClientValidation trait with rules method', function () {
    $component = new class
    {
        use WithClientValidation;

        protected function rules()
        {
            return [
                'title' => 'required|string|min:3',
                'content' => 'required|string',
            ];
        }
    };

    $clientRules = $component->getClientRulesProperty();

    expect($clientRules)->toBeString()
        ->and($clientRules)->toContain('title')
        ->and($clientRules)->toContain('content');
});

it('can get client messages through trait', function () {
    $component = new class
    {
        use WithClientValidation;

        protected $messages = [
            'title.required' => 'Title is required',
            'email.email' => 'Invalid email format',
        ];
    };

    $clientMessages = $component->getClientMessagesProperty();
    $decoded = json_decode($clientMessages, true);

    expect($decoded)->toBeArray()
        ->and($decoded)->toHaveKey('title.required')
        ->and($decoded['title.required'])->toBe('Title is required');
});

it('can get client attributes through trait', function () {
    $component = new class
    {
        use WithClientValidation;

        protected function validationAttributes()
        {
            return [
                'email' => 'email address',
                'name' => 'full name',
            ];
        }
    };

    $clientAttributes = $component->getClientAttributesProperty();
    $decoded = json_decode($clientAttributes, true);

    expect($decoded)->toBeArray()
        ->and($decoded)->toHaveKey('email')
        ->and($decoded['email'])->toBe('email address');
});

it('handles empty rules gracefully', function () {
    $component = new class
    {
        use WithClientValidation;
    };

    $clientRules = $component->getClientRulesProperty();
    $clientMessages = $component->getClientMessagesProperty();
    $clientAttributes = $component->getClientAttributesProperty();

    expect($clientRules)->toBeString();
    expect(json_decode($clientMessages, true))->toBeArray();
    expect(json_decode($clientAttributes, true))->toBeArray();
});

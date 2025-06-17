<?php

use MrPunyapal\ClientValidation\Livewire\WithClientValidation;

it('can use the WithClientValidation trait', function () {
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
        ->and($clientRules)->toContain('email');
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

    $messages = $component->getClientMessagesProperty();
    $decoded = json_decode($messages, true);

    expect($decoded)->toBeArray()
        ->and($decoded)->toHaveKey('title.required')
        ->and($decoded['title.required'])->toBe('Title is required');
});

it('can get client attributes through trait', function () {
    $component = new class
    {
        use WithClientValidation;

        public function validationAttributes()
        {
            return [
                'name' => 'Full Name',
                'email' => 'Email Address',
            ];
        }
    };

    $attributes = $component->getClientAttributesProperty();
    $decoded = json_decode($attributes, true);

    expect($decoded)->toBeArray()
        ->and($decoded)->toHaveKey('name')
        ->and($decoded['name'])->toBe('Full Name');
});

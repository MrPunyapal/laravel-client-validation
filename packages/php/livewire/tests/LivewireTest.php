<?php

use Livewire\Attributes\Validate;
use Livewire\Component;
use MrPunyapal\ClientValidation\Livewire\WithClientValidation;

/**
 * Boot Livewire attributes the same way the SupportAttributes lifecycle hook
 * does during mount, so #[Validate] params land in getRules()/getMessages().
 */
function bootLivewireAttributes(Component $component): void
{
    foreach ($component->getAttributes() as $attribute) {
        if (method_exists($attribute, 'boot')) {
            $attribute->boot();
        }
    }
}

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

it('returns empty payload when no rules are defined', function () {
    $component = new class
    {
        use WithClientValidation;
    };

    expect($component->getClientValidationPayload())->toBe([]);
});

it('generates client validation payload for livewire components', function () {
    $component = new class
    {
        use WithClientValidation;

        protected $rules = [
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
        ];

        protected $messages = [
            'name.required' => 'Name is required',
        ];

        protected function validationAttributes()
        {
            return ['email' => 'email address'];
        }
    };

    $payload = $component->getClientValidationPayload();

    expect($payload)->toHaveKeys(['rules', 'ajax_rules', 'messages', 'attributes', 'config'])
        ->and($payload['rules'])->toHaveKey('name')
        ->and($payload['rules']['name'])->toContain('required')
        ->and($payload['messages'])->toHaveKey('name.required')
        ->and($payload['attributes'])->toHaveKey('email');
});

it('prefixes server rules with ajax in the payload while keeping client rules clean', function () {
    $component = new class
    {
        use WithClientValidation;

        protected $rules = [
            'email' => 'required|email|unique:users,email',
            'company' => 'required_if:role,admin|string',
        ];
    };

    $rules = $component->getClientValidationPayload()['rules'];

    expect($rules['email'])->toContain('required')
        ->and($rules['email'])->toContain('ajax:unique:users,email')
        ->and($rules['company'])->toContain('required_if:role,admin');
});

it('extracts rules from #[Validate] attributes only', function () {
    $component = new class extends Component
    {
        use WithClientValidation;

        #[Validate('required|min:3')]
        public string $title = '';

        #[Validate('required|email')]
        public string $email = '';

        public function render()
        {
            return view('welcome');
        }
    };

    bootLivewireAttributes($component);

    $clientRules = $component->getClientRulesProperty();

    expect($clientRules)->toBeString()
        ->and($clientRules)->toContain('title')
        ->and($clientRules)->toContain('email')
        ->and($clientRules)->toContain('required');
});

it('merges #[Validate] attributes with the rules property', function () {
    $component = new class extends Component
    {
        use WithClientValidation;

        #[Validate('required|integer')]
        public string $age = '';

        protected $rules = [
            'name' => 'required|string|max:100',
        ];

        public function render()
        {
            return view('welcome');
        }
    };

    bootLivewireAttributes($component);

    $payload = $component->getClientValidationPayload();

    expect($payload['rules'])->toHaveKey('name')
        ->and($payload['rules'])->toHaveKey('age')
        ->and($payload['rules']['age'])->toContain('required');
});

it('picks up messages and attribute labels from #[Validate] params', function () {
    $component = new class extends Component
    {
        use WithClientValidation;

        #[Validate('required', as: 'Email address', message: 'We need your email.')]
        public string $email = '';

        public function render()
        {
            return view('welcome');
        }
    };

    bootLivewireAttributes($component);

    $decodedMessages = json_decode($component->getClientMessagesProperty(), true);
    $decodedAttributes = json_decode($component->getClientAttributesProperty(), true);

    expect($decodedMessages)->toHaveKey('email.required')
        ->and($decodedMessages['email.required'])->toBe('We need your email.')
        ->and($decodedAttributes)->toHaveKey('email')
        ->and($decodedAttributes['email'])->toBe('Email address');
});

it('prefixes server rules from #[Validate] attributes with ajax in the payload', function () {
    $component = new class extends Component
    {
        use WithClientValidation;

        #[Validate('required|email|unique:users,email')]
        public string $email = '';

        public function render()
        {
            return view('welcome');
        }
    };

    bootLivewireAttributes($component);

    $rules = $component->getClientValidationPayload()['rules'];

    expect($rules['email'])->toContain('required')
        ->and($rules['email'])->toContain('ajax:unique:users,email');
});

it('returns empty payload when a Livewire component has no rules or attributes', function () {
    $component = new class extends Component
    {
        use WithClientValidation;

        public string $name = '';

        public function render()
        {
            return view('welcome');
        }
    };

    bootLivewireAttributes($component);

    expect($component->getClientValidationPayload())->toBe([]);
});

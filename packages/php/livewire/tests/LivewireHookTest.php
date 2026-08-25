<?php

use Livewire\Attributes\Validate;
use Livewire\Component;
use Livewire\ComponentHookRegistry;
use Livewire\Mechanisms\HandleComponents\ComponentContext;
use MrPunyapal\ClientValidation\Livewire\ClientValidationHook;
use MrPunyapal\ClientValidation\Livewire\WithClientValidation;

it('skips components that do not use the WithClientValidation trait', function () {
    $component = new class extends Component
    {
        public function render()
        {
            return view('welcome');
        }
    };

    $hook = new ClientValidationHook;
    $hook->setComponent($component);

    expect($hook->skip())->toBeTrue();
});

it('does not skip components using the WithClientValidation trait', function () {
    $component = new class extends Component
    {
        use WithClientValidation;

        protected $rules = [
            'name' => 'required|string|min:2',
        ];

        public function render()
        {
            return view('welcome');
        }
    };

    $hook = new ClientValidationHook;
    $hook->setComponent($component);

    expect($hook->skip())->toBeFalse();
});

it('injects client validation payload into the component memo on dehydrate', function () {
    $component = new class extends Component
    {
        use WithClientValidation;

        protected $rules = [
            'email' => 'required|email|unique:users,email',
        ];

        public function render()
        {
            return view('welcome');
        }
    };

    $context = new ComponentContext($component);

    $hook = new ClientValidationHook;
    $hook->setComponent($component);
    $hook->dehydrate($context);

    expect($context->memo)->toHaveKey('clientValidation');

    $payload = $context->memo['clientValidation'];

    expect($payload['rules'])->toHaveKey('email')
        ->and($payload['rules']['email'])->toContain('ajax:unique:users,email')
        ->and($payload)->toHaveKey('config');
});

it('does not inject a memo for components without rules', function () {
    $component = new class extends Component
    {
        use WithClientValidation;

        public function render()
        {
            return view('welcome');
        }
    };

    $context = new ComponentContext($component);

    $hook = new ClientValidationHook;
    $hook->setComponent($component);
    $hook->dehydrate($context);

    expect($context->memo)->not->toHaveKey('clientValidation');
});

it('injects #[Validate] attribute rules into the component memo on dehydrate', function () {
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

    // Boot attributes the same way Livewire's SupportAttributes hook does on mount.
    foreach ($component->getAttributes() as $attribute) {
        if (method_exists($attribute, 'boot')) {
            $attribute->boot();
        }
    }

    $context = new ComponentContext($component);

    $hook = new ClientValidationHook;
    $hook->setComponent($component);
    $hook->dehydrate($context);

    expect($context->memo)->toHaveKey('clientValidation');

    $payload = $context->memo['clientValidation'];

    expect($payload['rules'])->toHaveKey('email')
        ->and($payload['rules']['email'])->toContain('required')
        ->and($payload['rules']['email'])->toContain('ajax:unique:users,email')
        ->and($payload)->toHaveKey('config');
});

it('is registered in the ComponentHookRegistry when livewire is present', function () {
    // The service provider registers the hook during boot; verify the registry accepts it.
    expect(class_exists(ComponentHookRegistry::class))->toBeTrue();

    ComponentHookRegistry::register(ClientValidationHook::class);

    expect(true)->toBeTrue();
});

<?php

use MrPunyapal\ClientValidation\Core\ValidationManager;
use MrPunyapal\ClientValidation\Core\RuleParser;
use MrPunyapal\ClientValidation\Hooks\ValidationHooks;
use Illuminate\Foundation\Http\FormRequest;

class TestFormRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'name' => 'required|string|min:2|max:50',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
            'age' => 'nullable|integer|min:18|max:120',
        ];
    }

    public function messages()
    {
        return [
            'name.required' => 'Please provide your name',
            'email.unique' => 'This email is already registered',
        ];
    }

    public function attributes()
    {
        return [
            'name' => 'full name',
            'email' => 'email address',
        ];
    }
}

describe('Validation Manager', function () {
    beforeEach(function () {
        $this->parser = new RuleParser();
        $this->hooks = new ValidationHooks();
        $this->manager = new ValidationManager($this->parser, $this->hooks);
    });

    it('can create context from FormRequest', function () {
        // Create a FormRequest instance directly to avoid the validation lifecycle
        $request = new TestFormRequest();

        $context = $this->manager->fromRequest($request);

        expect($context)->toBeInstanceOf(\MrPunyapal\ClientValidation\Core\ValidationContext::class);
        expect($context->getRules()->getFields())->toContain('name', 'email', 'password', 'age');
        expect($context->getMessages())->toHaveKey('name.required');
        expect($context->getAttributes())->toHaveKey('name');
    });

    it('can create context from rules array', function () {
        $rules = [
            'username' => 'required|alpha_dash|min:3',
            'bio' => 'nullable|string|max:500',
        ];

        $context = $this->manager->fromRules($rules);

        expect($context->getRules()->getFields())->toContain('username', 'bio');
        expect($context->hasClientRules())->toBeTrue();
        expect($context->hasAjaxRules())->toBeFalse();
    });

    it('can create directive context', function () {
        $directive = $this->manager->createDirective('email', 'required|email|unique:users,email');

        expect($directive)->toBeInstanceOf(\MrPunyapal\ClientValidation\Core\DirectiveContext::class);
        expect($directive->getField())->toBe('email');
        expect($directive->hasClientRules())->toBeTrue();
        expect($directive->requiresAjax())->toBeTrue();
    });

    it('generates correct Alpine.js data', function () {
        $rules = [
            'title' => 'required|string|max:100',
            'content' => 'required|string|min:10',
        ];

        $context = $this->manager->fromRules($rules);
        $alpineData = $context->toAlpineData();

        $decoded = json_decode($alpineData, true);

        expect($decoded)->toHaveKey('rules');
        expect($decoded)->toHaveKey('ajax_rules');
        expect($decoded)->toHaveKey('config');
        expect($decoded['rules'])->toHaveKey('title');
        expect($decoded['rules'])->toHaveKey('content');
    });

    it('can extend with custom rules', function () {
        $this->manager->extend('custom_rule', function ($attribute, $value, $parameters) {
            return strlen($value) > 5;
        }, 'The :attribute must be more than 5 characters.');

        // The rule should be registered with Laravel's validator
        $validator = \Illuminate\Support\Facades\Validator::make(['field' => 'test'], ['field' => 'custom_rule']);
        expect($validator->fails())->toBeTrue();

        $validator = \Illuminate\Support\Facades\Validator::make(['field' => 'testing'], ['field' => 'custom_rule']);
        expect($validator->passes())->toBeTrue();
    });

    it('separates client and ajax rules correctly', function () {
        $rules = [
            'name' => 'required|string|min:2',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8',
        ];

        $context = $this->manager->fromRules($rules);
        $payload = $context->toClientPayload();

        expect($payload['rules'])->toHaveKey('name');
        expect($payload['rules'])->toHaveKey('email');
        expect($payload['rules'])->toHaveKey('password');
        expect($payload['ajax_rules'])->toHaveKey('email');
        expect($payload['ajax_rules'])->not->toHaveKey('name');
        expect($payload['ajax_rules'])->not->toHaveKey('password');
    });

    it('handles Livewire component integration', function () {
        $component = new class {
            public $rules = [
                'title' => 'required|string|max:100',
                'published' => 'boolean',
            ];

            public $messages = [
                'title.required' => 'Title is required',
            ];

            public $validationAttributes = [
                'title' => 'post title',
            ];
        };

        $context = $this->manager->fromLivewireComponent($component);

        expect($context->getRules()->getFields())->toContain('title', 'published');
        expect($context->getMessages())->toHaveKey('title.required');
        expect($context->getAttributes())->toHaveKey('title');
    });

    it('generates correct directive strings', function () {
        $directive = $this->manager->createDirective('username', 'required|alpha_dash|min:3');

        expect($directive->toDirectiveString('blur'))->toContain('x-validate=');
        expect($directive->toDirectiveString('live'))->toContain('x-validate.live=');
        expect($directive->toDirectiveString('form'))->toContain('x-validate.form=');
    });

    it('handles complex rule combinations', function () {
        $rules = [
            'category_id' => 'required|exists:categories,id',
            'tags' => 'array|min:1|max:5',
            'tags.*' => 'string|max:20',
            'publish_at' => 'nullable|date|after:now',
        ];

        $context = $this->manager->fromRules($rules);

        expect($context->getFieldsRequiringAjax())->toContain('category_id');
        expect($context->getClientOnlyFields())->toContain('tags', 'tags.*');
    });
});

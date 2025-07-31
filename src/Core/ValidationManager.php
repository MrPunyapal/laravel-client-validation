<?php

namespace MrPunyapal\ClientValidation\Core;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Validator;
use MrPunyapal\ClientValidation\Contracts\RuleParserInterface;
use MrPunyapal\ClientValidation\Hooks\ValidationHooks;

class ValidationManager
{
    protected RuleParserInterface $parser;
    protected ValidationHooks $hooks;
    protected array $config;

    public function __construct(RuleParserInterface $parser, ValidationHooks $hooks, array $config = [])
    {
        $this->parser = $parser;
        $this->hooks = $hooks;
        $this->config = array_merge($this->getDefaultConfig(), $config);
    }

    public function fromRequest(string|FormRequest $request): ValidationContext
    {
        if (is_string($request)) {
            $request = app($request);
        }

        if (!$request instanceof FormRequest) {
            throw new \InvalidArgumentException('Must be a FormRequest class or instance');
        }

        $rules = $request->rules();
        $messages = $request->messages();
        $attributes = $request->attributes();

        return $this->createContext($rules, $messages, $attributes);
    }

    public function fromValidator(string $validatorClass, array $data = []): ValidationContext
    {
        $validator = app($validatorClass);

        if (method_exists($validator, 'rules')) {
            $rules = $validator->rules($data);
        } else {
            throw new \InvalidArgumentException('Validator class must have a rules() method');
        }

        $messages = method_exists($validator, 'messages') ? $validator->messages() : [];
        $attributes = method_exists($validator, 'attributes') ? $validator->attributes() : [];

        return $this->createContext($rules, $messages, $attributes);
    }

    public function fromRules(array $rules, array $messages = [], array $attributes = []): ValidationContext
    {
        return $this->createContext($rules, $messages, $attributes);
    }

    public function fromLivewireComponent($component): ValidationContext
    {
        $rules = [];
        $messages = [];
        $attributes = [];

        // Extract rules from Livewire component
        if (method_exists($component, 'rules')) {
            $rules = $component->rules();
        } elseif (property_exists($component, 'rules')) {
            $rules = $component->rules;
        }

        // Extract messages
        if (method_exists($component, 'messages')) {
            $messages = $component->messages();
        } elseif (property_exists($component, 'messages')) {
            $messages = $component->messages;
        }

        // Extract custom attributes
        if (method_exists($component, 'validationAttributes')) {
            $attributes = $component->validationAttributes();
        } elseif (property_exists($component, 'validationAttributes')) {
            $attributes = $component->validationAttributes;
        }

        return $this->createContext($rules, $messages, $attributes);
    }

    public function createDirective(string $field, string $rules, array $options = []): DirectiveContext
    {
        $parsedRules = $this->parser->parseFieldRules($field, $rules);

        return new DirectiveContext(
            field: $field,
            rules: $parsedRules,
            options: array_merge($this->config, $options),
            hooks: $this->hooks
        );
    }

    public function extend(string $rule, callable $validator, string $message = null): void
    {
        // Register custom rule with Laravel validator
        Validator::extend($rule, $validator, $message);

        // Also register with our parser as a server-side rule by default
        $this->parser->addServerSideRule($rule);
    }

    public function extendClientSide(string $rule, string $jsValidator): void
    {
        // Register rule as client-side capable
        $this->parser->addClientSideRule($rule);

        // TODO: Register JS validator function
        $this->registerJsValidator($rule, $jsValidator);
    }

    protected function createContext(array $rules, array $messages, array $attributes): ValidationContext
    {
        $parsedRules = $this->parser->parse($rules);

        // Merge with default messages and attributes from config
        $defaultMessages = $this->config['messages'] ?? [];
        $defaultAttributes = $this->config['attributes'] ?? [];

        $mergedMessages = array_merge($defaultMessages, $messages);
        $mergedAttributes = array_merge($defaultAttributes, $attributes);

        return new ValidationContext(
            rules: $parsedRules,
            messages: $mergedMessages,
            attributes: $mergedAttributes,
            config: $this->config,
            hooks: $this->hooks
        );
    }

    protected function registerJsValidator(string $rule, string $jsValidator): void
    {
        // This would register the JS validator with the frontend
        // Implementation depends on how we want to handle dynamic JS loading
    }

    protected function getDefaultConfig(): array
    {
        return [
            'enable_ajax' => config('client-validation.enable_ajax_validation', true),
            'ajax_url' => route('client-validation.validate', absolute: false),
            'ajax_timeout' => config('client-validation.ajax_timeout', 5000),
            'validation_mode' => 'blur', // 'blur', 'input', 'submit', 'live'
            'error_template' => config('client-validation.error_template', []),
            'field_styling' => config('client-validation.field_styling', []),
            'debounce_ms' => config('client-validation.debounce_ms', 300),
        ];
    }
}

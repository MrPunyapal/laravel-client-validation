<?php

namespace MrPunyapal\ClientValidation\Core;

use MrPunyapal\ClientValidation\Hooks\ValidationHooks;

class ValidationContext
{
    protected ParsedRules $rules;
    protected array $messages;
    protected array $attributes;
    protected array $config;
    protected ValidationHooks $hooks;

    public function __construct(
        ParsedRules $rules,
        array $messages = [],
        array $attributes = [],
        array $config = [],
        ValidationHooks $hooks = null
    ) {
        $this->rules = $rules;
        $this->messages = $messages;
        $this->attributes = $attributes;
        $this->config = $config;
        $this->hooks = $hooks ?? new ValidationHooks();
    }

    public function getRules(): ParsedRules
    {
        return $this->rules;
    }

    public function getMessages(): array
    {
        return $this->messages;
    }

    public function getAttributes(): array
    {
        return $this->attributes;
    }

    public function getConfig(): array
    {
        return $this->config;
    }

    public function getHooks(): ValidationHooks
    {
        return $this->hooks;
    }

    public function toClientPayload(): array
    {
        return [
            'rules' => $this->rules->toClientRules(),
            'ajax_rules' => $this->rules->toAjaxRules(),
            'messages' => $this->messages,
            'attributes' => $this->attributes,
            'config' => $this->getClientConfig(),
        ];
    }

    public function toAlpineData(): string
    {
        return json_encode($this->toClientPayload(), JSON_UNESCAPED_SLASHES);
    }

    public function renderDirective(string $field, array $options = []): string
    {
        $fieldRules = $this->rules->getField($field);
        if (!$fieldRules) {
            return '';
        }

        $mode = $options['mode'] ?? $this->config['validation_mode'] ?? 'blur';
        $rules = $fieldRules->toClientRuleStrings();

        if ($fieldRules->requiresAjax()) {
            // Add ajax indicator to rules
            $rules[] = 'ajax:' . implode('|', $fieldRules->toServerRuleStrings());
        }

        $ruleString = implode('|', $rules);
        $directive = match($mode) {
            'live', 'input' => "x-validate.live=\"'{$ruleString}'\"",
            'form', 'submit' => "x-validate.form=\"'{$ruleString}'\"",
            default => "x-validate=\"'{$ruleString}'\"",
        };

        return $directive;
    }

    public function getClientConfig(): array
    {
        return [
            'ajax_url' => $this->config['ajax_url'] ?? '/client-validation/validate',
            'ajax_timeout' => $this->config['ajax_timeout'] ?? 5000,
            'enable_ajax' => $this->config['enable_ajax'] ?? true,
            'validation_mode' => $this->config['validation_mode'] ?? 'blur',
            'debounce_ms' => $this->config['debounce_ms'] ?? 300,
            'error_template' => $this->config['error_template'] ?? [],
            'field_styling' => $this->config['field_styling'] ?? [],
        ];
    }

    public function hasClientRules(): bool
    {
        return !empty($this->rules->getClientOnlyFields());
    }

    public function hasAjaxRules(): bool
    {
        return !empty($this->rules->getAjaxFields());
    }

    public function getFieldsRequiringAjax(): array
    {
        return array_keys($this->rules->getAjaxFields());
    }

    public function getClientOnlyFields(): array
    {
        return array_keys($this->rules->getClientOnlyFields());
    }
}

<?php

declare(strict_types=1);

namespace MrPunyapal\ClientValidation\Core;

use MrPunyapal\ClientValidation\Hooks\ValidationHooks;

/**
 * Context object containing all validation data for a set of fields.
 *
 * This encapsulates parsed rules, custom messages, field attributes,
 * configuration, and validation hooks for a complete validation setup.
 */
readonly class ValidationContext
{
    private ValidationHooks $hooks;

    /**
     * @param ParsedRules $rules Parsed validation rules
     * @param array<string, string> $messages Custom validation messages
     * @param array<string, string> $attributes Custom attribute names
     * @param array<string, mixed> $config Validation configuration
     * @param ValidationHooks|null $hooks Validation lifecycle hooks
     */
    public function __construct(
        private ParsedRules $rules,
        private array $messages = [],
        private array $attributes = [],
        private array $config = [],
        ?ValidationHooks $hooks = null
    ) {
        $this->hooks = $hooks ?? new ValidationHooks();
    }

    public function getRules(): ParsedRules
    {
        return $this->rules;
    }

    /**
     * @return array<string, string>
     */
    public function getMessages(): array
    {
        return $this->messages;
    }

    /**
     * @return array<string, string>
     */
    public function getAttributes(): array
    {
        return $this->attributes;
    }

    /**
     * @return array<string, mixed>
     */
    public function getConfig(): array
    {
        return $this->config;
    }

    public function getHooks(): ValidationHooks
    {
        return $this->hooks;
    }

    /**
     * Get complete payload for client-side validation.
     *
     * @return array{rules: array<string, array<int, string>>, ajax_rules: array<string, array{server: array<int, string>, client: array<int, string>}>, messages: array<string, string>, attributes: array<string, string>, config: array<string, mixed>}
     */
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

    /**
     * Convert to JSON string for Alpine.js x-data attribute.
     */
    public function toAlpineData(): string
    {
        return json_encode($this->toClientPayload(), JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    }

    /**
     * Render an x-validate directive for a specific field.
     *
     * @param array<string, mixed> $options Additional options (e.g., mode)
     */
    public function renderDirective(string $field, array $options = []): string
    {
        $fieldRules = $this->rules->getField($field);
        if ($fieldRules === null) {
            return '';
        }

        $mode = $options['mode'] ?? $this->config['validation_mode'] ?? 'blur';
        $rules = $fieldRules->toClientRuleStrings();

        if ($fieldRules->requiresAjax()) {
            $rules[] = 'ajax:' . implode('|', $fieldRules->toServerRuleStrings());
        }

        $ruleString = implode('|', $rules);

        return match ($mode) {
            'live', 'input' => "x-validate.live=\"'{$ruleString}'\"",
            'form', 'submit' => "x-validate.form=\"'{$ruleString}'\"",
            default => "x-validate=\"'{$ruleString}'\"",
        };
    }

    /**
     * Get configuration for the client-side validator.
     *
     * @return array<string, mixed>
     */
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

    /**
     * Check if any client-only rules exist.
     */
    public function hasClientRules(): bool
    {
        return $this->rules->getClientOnlyFields() !== [];
    }

    /**
     * Check if any AJAX rules exist.
     */
    public function hasAjaxRules(): bool
    {
        return $this->rules->getAjaxFields() !== [];
    }

    /**
     * Get field names that require AJAX validation.
     *
     * @return array<int, string>
     */
    public function getFieldsRequiringAjax(): array
    {
        return array_keys($this->rules->getAjaxFields());
    }

    /**
     * Get field names that only need client-side validation.
     *
     * @return array<int, string>
     */
    public function getClientOnlyFields(): array
    {
        return array_keys($this->rules->getClientOnlyFields());
    }
}

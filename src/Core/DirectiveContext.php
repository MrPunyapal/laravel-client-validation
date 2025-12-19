<?php

declare(strict_types=1);

namespace MrPunyapal\ClientValidation\Core;

use MrPunyapal\ClientValidation\Hooks\ValidationHooks;

/**
 * Context object for a single field validation directive.
 *
 * Used when generating x-validate directives for individual form fields.
 */
readonly class DirectiveContext
{
    private ValidationHooks $hooks;

    /**
     * @param string $field The field name
     * @param ParsedFieldRules $rules Parsed validation rules for the field
     * @param array<string, mixed> $options Validation options
     * @param ValidationHooks|null $hooks Validation lifecycle hooks
     */
    public function __construct(
        private string $field,
        private ParsedFieldRules $rules,
        private array $options = [],
        ?ValidationHooks $hooks = null
    ) {
        $this->hooks = $hooks ?? new ValidationHooks();
    }

    public function getField(): string
    {
        return $this->field;
    }

    public function getRules(): ParsedFieldRules
    {
        return $this->rules;
    }

    /**
     * @return array<string, mixed>
     */
    public function getOptions(): array
    {
        return $this->options;
    }

    public function getHooks(): ValidationHooks
    {
        return $this->hooks;
    }

    /**
     * Generate the x-validate directive string.
     *
     * @param string $mode Validation mode: 'blur', 'live', 'input', 'form', 'submit'
     */
    public function toDirectiveString(string $mode = 'blur'): string
    {
        $rules = $this->rules->toClientRuleStrings();

        if ($this->rules->requiresAjax()) {
            $rules[] = 'ajax:' . implode('|', $this->rules->toServerRuleStrings());
        }

        $ruleString = implode('|', $rules);

        return match ($mode) {
            'live', 'input' => "x-validate.live=\"'{$ruleString}'\"",
            'form', 'submit' => "x-validate.form=\"'{$ruleString}'\"",
            default => "x-validate=\"'{$ruleString}'\"",
        };
    }

    /**
     * Get the client payload for this field.
     *
     * @return array{field: string, client_rules: array<int, string>, server_rules: array<int, string>, requires_ajax: bool, options: array<string, mixed>}
     */
    public function toClientPayload(): array
    {
        return [
            'field' => $this->field,
            'client_rules' => $this->rules->toClientRuleStrings(),
            'server_rules' => $this->rules->toServerRuleStrings(),
            'requires_ajax' => $this->rules->requiresAjax(),
            'options' => $this->options,
        ];
    }

    /**
     * Check if this field has client-side rules.
     */
    public function hasClientRules(): bool
    {
        return $this->rules->hasClientRules();
    }

    /**
     * Check if this field requires AJAX validation.
     */
    public function requiresAjax(): bool
    {
        return $this->rules->requiresAjax();
    }
}

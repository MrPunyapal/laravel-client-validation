<?php

namespace MrPunyapal\ClientValidation\Core;

use MrPunyapal\ClientValidation\Hooks\ValidationHooks;

class DirectiveContext
{
    protected string $field;
    protected ParsedFieldRules $rules;
    protected array $options;
    protected ValidationHooks $hooks;

    public function __construct(
        string $field,
        ParsedFieldRules $rules,
        array $options = [],
        ValidationHooks $hooks = null
    ) {
        $this->field = $field;
        $this->rules = $rules;
        $this->options = $options;
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

    public function getOptions(): array
    {
        return $this->options;
    }

    public function getHooks(): ValidationHooks
    {
        return $this->hooks;
    }

    public function toDirectiveString(string $mode = 'blur'): string
    {
        $rules = $this->rules->toClientRuleStrings();

        if ($this->rules->requiresAjax()) {
            $rules[] = 'ajax:' . implode('|', $this->rules->toServerRuleStrings());
        }

        $ruleString = implode('|', $rules);

        return match($mode) {
            'live', 'input' => "x-validate.live=\"'{$ruleString}'\"",
            'form', 'submit' => "x-validate.form=\"'{$ruleString}'\"",
            default => "x-validate=\"'{$ruleString}'\"",
        };
    }

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

    public function hasClientRules(): bool
    {
        return $this->rules->hasClientRules();
    }

    public function requiresAjax(): bool
    {
        return $this->rules->requiresAjax();
    }
}

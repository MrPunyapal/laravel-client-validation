<?php

namespace MrPunyapal\ClientValidation\Core;

class ParsedFieldRules
{
    protected string $field;
    protected array $clientRules;
    protected array $serverRules;
    protected array $conditionalRules;

    public function __construct(string $field, array $clientRules = [], array $serverRules = [], array $conditionalRules = [])
    {
        $this->field = $field;
        $this->clientRules = $clientRules;
        $this->serverRules = $serverRules;
        $this->conditionalRules = $conditionalRules;
    }

    public function getField(): string
    {
        return $this->field;
    }

    public function getClientRules(): array
    {
        return $this->clientRules;
    }

    public function getServerRules(): array
    {
        return $this->serverRules;
    }

    public function getConditionalRules(): array
    {
        return $this->conditionalRules;
    }

    public function getAllRules(): array
    {
        return array_merge($this->clientRules, $this->serverRules, $this->conditionalRules);
    }

    public function hasClientRules(): bool
    {
        return !empty($this->clientRules);
    }

    public function hasServerRules(): bool
    {
        return !empty($this->serverRules);
    }

    public function hasConditionalRules(): bool
    {
        return !empty($this->conditionalRules);
    }

    public function requiresAjax(): bool
    {
        return $this->hasServerRules() || $this->hasConditionalRules();
    }

    public function toClientRuleStrings(): array
    {
        return array_map(fn(RuleData $rule) => $rule->getString(), $this->clientRules);
    }

    public function toServerRuleStrings(): array
    {
        return array_map(fn(RuleData $rule) => $rule->getString(), $this->serverRules);
    }

    public function toArray(): array
    {
        return [
            'field' => $this->field,
            'client' => $this->toClientRuleStrings(),
            'server' => $this->toServerRuleStrings(),
            'conditional' => array_map(fn(RuleData $rule) => $rule->getString(), $this->conditionalRules),
        ];
    }
}

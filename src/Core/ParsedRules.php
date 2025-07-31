<?php

namespace MrPunyapal\ClientValidation\Core;

use Illuminate\Support\Collection;

class ParsedRules
{
    protected array $rules;

    public function __construct(array $rules)
    {
        $this->rules = $rules;
    }

    public function getField(string $field): ?ParsedFieldRules
    {
        return $this->rules[$field] ?? null;
    }

    public function getFields(): array
    {
        return array_keys($this->rules);
    }

    public function getAllRules(): array
    {
        return $this->rules;
    }

    public function getClientOnlyFields(): array
    {
        return array_filter($this->rules, fn(ParsedFieldRules $rules) =>
            $rules->hasClientRules() && !$rules->requiresAjax()
        );
    }

    public function getAjaxFields(): array
    {
        return array_filter($this->rules, fn(ParsedFieldRules $rules) =>
            $rules->requiresAjax()
        );
    }

    public function toClientRules(): array
    {
        $clientRules = [];

        foreach ($this->rules as $field => $fieldRules) {
            if ($fieldRules->hasClientRules() || $fieldRules->hasServerRules()) {
                $clientRules[$field] = $fieldRules->toClientRuleStrings();
            }
        }

        return $clientRules;
    }

    public function toAjaxRules(): array
    {
        $ajaxRules = [];

        foreach ($this->rules as $field => $fieldRules) {
            if ($fieldRules->requiresAjax()) {
                $ajaxRules[$field] = [
                    'server' => $fieldRules->toServerRuleStrings(),
                    'client' => $fieldRules->toClientRuleStrings(),
                ];
            }
        }

        return $ajaxRules;
    }

    public function toArray(): array
    {
        $result = [];

        foreach ($this->rules as $field => $fieldRules) {
            $result[$field] = $fieldRules->toArray();
        }

        return $result;
    }

    public function toJson(): string
    {
        return json_encode($this->toArray(), JSON_UNESCAPED_SLASHES);
    }

    public function collect(): Collection
    {
        return collect($this->rules);
    }
}

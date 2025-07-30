<?php

namespace MrPunyapal\ClientValidation\Support;

class ValidationRuleConverter
{
    protected array $clientOnlyRules = [
        'required', 'email', 'min', 'max', 'numeric', 'integer',
        'alpha', 'alpha_num', 'alpha_dash', 'url', 'between',
        'confirmed', 'size', 'in', 'not_in', 'boolean', 'date',
        'after', 'before', 'regex', 'same', 'different', 'digits',
        'digits_between', 'string', 'nullable', 'accepted'
    ];

    protected array $ajaxRules = [
        'unique', 'exists', 'password', 'current_password'
    ];

    public function convert(array $rules): string
    {
        $jsRules = [];

        foreach ($rules as $field => $fieldRules) {
            $convertedRules = $this->convertFieldRules($fieldRules);
            if (!empty($convertedRules)) {
                $jsRules[$field] = $convertedRules;
            }
        }

        return json_encode($jsRules, JSON_UNESCAPED_SLASHES);
    }

    protected function convertFieldRules($rules): array
    {
        if (is_string($rules)) {
            $rules = explode('|', $rules);
        }

        $jsRules = [];

        foreach ($rules as $rule) {
            if (is_string($rule)) {
                $convertedRule = $this->parseStringRule($rule);
                if ($convertedRule) {
                    $jsRules[] = $convertedRule;
                }
            } elseif (is_object($rule)) {
                $convertedRule = $this->parseObjectRule($rule);
                if ($convertedRule) {
                    $jsRules[] = $convertedRule;
                }
            }
        }

        return $jsRules;
    }

    protected function parseStringRule(string $rule): ?string
    {
        if (strpos($rule, 'regex:') === 0) {
            return $rule;
        }

        $ruleName = explode(':', $rule, 2)[0];

        if (in_array($ruleName, $this->ajaxRules)) {
            return "ajax:{$rule}";
        }

        return $this->isValidJsRule($rule) ? $rule : null;
    }

    protected function parseObjectRule(object $rule): ?string
    {
        if (method_exists($rule, '__toString')) {
            return $this->parseStringRule((string) $rule);
        }

        return null;
    }

    protected function isValidJsRule(string $rule): bool
    {
        $ruleName = explode(':', $rule, 2)[0];
        return in_array($ruleName, $this->clientOnlyRules);
    }
}

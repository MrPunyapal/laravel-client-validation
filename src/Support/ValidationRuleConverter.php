<?php

namespace MrPunyapal\ClientValidation\Support;

class ValidationRuleConverter
{
    public function convert(array $rules): string
    {
        $jsRules = [];

        foreach ($rules as $field => $fieldRules) {
            $jsRules[$field] = $this->convertFieldRules($fieldRules);
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
        // Handle regex patterns specially to avoid splitting on comma within the pattern
        if (strpos($rule, 'regex:') === 0) {
            return $rule; // Keep the full regex rule as-is
        }

        // For rules with parameters, keep them in Laravel format
        // The JS validator will handle parsing them
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
        // Extract rule name (before any colon)
        $ruleName = explode(':', $rule, 2)[0];

        // List of rules that are supported in js/core/rules
        $supportedRules = [
            'required', 'email', 'min', 'max', 'numeric', 'integer',
            'alpha', 'alpha_num', 'alpha_dash', 'url', 'between',
            'confirmed', 'size', 'in', 'not_in', 'boolean', 'date',
            'after', 'before', 'regex', 'same', 'different', 'digits',
            'digits_between', 'string', 'nullable'
        ];

        return in_array($ruleName, $supportedRules);
    }
}

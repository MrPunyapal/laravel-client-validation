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

    public function convertToJson(array $rules): string
    {
        return $this->convert($rules);
    }

    protected function convertFieldRules($rules): array
    {
        if (is_string($rules)) {
            $rules = explode('|', $rules);
        }

        $jsRules = [];

        foreach ($rules as $rule) {
            if (is_string($rule)) {
                $jsRules[] = $this->parseStringRule($rule);
            } elseif (is_object($rule)) {
                $jsRules[] = $this->parseObjectRule($rule);
            }
        }

        return array_filter($jsRules);
    }

    protected function parseStringRule(string $rule): ?array
    {
        // Handle regex patterns specially to avoid splitting on comma within the pattern
        if (strpos($rule, 'regex:') === 0) {
            $pattern = substr($rule, 6); // Remove 'regex:' prefix

            return $this->mapRule('regex', [$pattern]);
        }

        $parts = explode(':', $rule, 2);
        $ruleName = $parts[0];
        $parameters = isset($parts[1]) ? explode(',', $parts[1]) : [];

        return $this->mapRule($ruleName, $parameters);
    }

    protected function parseObjectRule(object $rule): ?array
    {
        if (method_exists($rule, '__toString')) {
            return $this->parseStringRule((string) $rule);
        }

        return null;
    }

    protected function mapRule(string $rule, array $parameters = []): ?array
    {
        $mappings = [
            'required' => ['rule' => 'required'],
            'email' => ['rule' => 'email'],
            'numeric' => ['rule' => 'numeric'],
            'integer' => ['rule' => 'integer'],
            'string' => ['rule' => 'string'],
            'boolean' => ['rule' => 'boolean'],
            'alpha' => ['rule' => 'alpha'],
            'alpha_num' => ['rule' => 'alphaNum'],
            'alpha_dash' => ['rule' => 'alphaDash'],
            'url' => ['rule' => 'url'],
            'uuid' => ['rule' => 'uuid'],
            'json' => ['rule' => 'json'],
            'date' => ['rule' => 'date'],
            'min' => ['rule' => 'min', 'parameters' => $parameters],
            'max' => ['rule' => 'max', 'parameters' => $parameters],
            'between' => ['rule' => 'between', 'parameters' => $parameters],
            'size' => ['rule' => 'size', 'parameters' => $parameters],
            'in' => ['rule' => 'in', 'parameters' => $parameters],
            'not_in' => ['rule' => 'notIn', 'parameters' => $parameters],
            'confirmed' => ['rule' => 'confirmed'],
            'same' => ['rule' => 'same', 'parameters' => $parameters],
            'different' => ['rule' => 'different', 'parameters' => $parameters],
            'regex' => ['rule' => 'regex', 'parameters' => $parameters],
            'accepted' => ['rule' => 'accepted'],
            'after' => ['rule' => 'after', 'parameters' => $parameters],
            'before' => ['rule' => 'before', 'parameters' => $parameters],
            'date_format' => ['rule' => 'dateFormat', 'parameters' => $parameters],
            'ip' => ['rule' => 'ip'],
            'ipv4' => ['rule' => 'ipv4'],
            'ipv6' => ['rule' => 'ipv6'],
            'starts_with' => ['rule' => 'startsWith', 'parameters' => $parameters],
            'ends_with' => ['rule' => 'endsWith', 'parameters' => $parameters],
            'contains' => ['rule' => 'contains', 'parameters' => $parameters],
        ];

        return $mappings[$rule] ?? null;
    }
}

<?php

namespace MrPunyapal\ClientValidation\Core;

use Illuminate\Support\Collection;
use Illuminate\Validation\Rule;
use MrPunyapal\ClientValidation\Contracts\RuleParserInterface;
use MrPunyapal\ClientValidation\Contracts\RuleTransformerInterface;

class RuleParser implements RuleParserInterface
{
    protected array $clientSideRules = [
        'required', 'email', 'min', 'max', 'numeric', 'integer',
        'alpha', 'alpha_num', 'alpha_dash', 'url', 'between',
        'confirmed', 'size', 'in', 'not_in', 'boolean', 'date',
        'after', 'before', 'regex', 'same', 'different', 'digits',
        'digits_between', 'string', 'nullable', 'accepted', 'array',
        'json', 'file', 'image', 'mimes', 'extensions', 'filled',
        'present', 'distinct', 'lt', 'lte', 'gt', 'gte',
    ];

    protected array $serverSideRules = [
        'unique', 'exists', 'password', 'current_password',
        'exclude', 'exclude_if', 'exclude_unless', 'exclude_with',
        'exclude_without', 'sometimes',
    ];

    protected array $conditionalRules = [
        'required_if', 'required_unless', 'required_with',
        'required_with_all', 'required_without', 'required_without_all',
        'nullable_if', 'nullable_unless',
    ];

    protected Collection $transformers;

    public function __construct()
    {
        $this->transformers = collect();
    }

    public function parse(array $rules): ParsedRules
    {
        $parsedRules = [];

        foreach ($rules as $field => $fieldRules) {
            $parsedRules[$field] = $this->parseFieldRules($field, $fieldRules);
        }

        return new ParsedRules($parsedRules);
    }

    public function parseFieldRules(string $field, $rules): ParsedFieldRules
    {
        $normalizedRules = $this->normalizeRules($rules);
        $clientRules = [];
        $serverRules = [];
        $conditionalRules = [];

        foreach ($normalizedRules as $rule) {
            $ruleData = $this->parseRule($rule);
            $category = $this->categorizeRule($ruleData);

            switch ($category) {
                case 'client':
                    $clientRules[] = $ruleData;
                    break;
                case 'server':
                    $serverRules[] = $ruleData;
                    break;
                case 'conditional':
                    $conditionalRules[] = $ruleData;
                    break;
            }
        }

        return new ParsedFieldRules($field, $clientRules, $serverRules, $conditionalRules);
    }

    public function addTransformer(RuleTransformerInterface $transformer): void
    {
        $this->transformers->push($transformer);
    }

    public function addClientSideRule(string $rule): void
    {
        if (!in_array($rule, $this->clientSideRules)) {
            $this->clientSideRules[] = $rule;
        }
    }

    public function addServerSideRule(string $rule): void
    {
        if (!in_array($rule, $this->serverSideRules)) {
            $this->serverSideRules[] = $rule;
        }
    }

    protected function normalizeRules($rules): array
    {
        if (is_string($rules)) {
            return explode('|', $rules);
        }

        if (is_array($rules)) {
            $normalized = [];
            foreach ($rules as $rule) {
                if (is_string($rule)) {
                    $normalized[] = $rule;
                } elseif (is_object($rule)) {
                    $normalized[] = $this->objectToString($rule);
                }
            }
            return $normalized;
        }

        return [];
    }

    protected function parseRule($rule): RuleData
    {
        if (is_string($rule)) {
            return $this->parseStringRule($rule);
        }

        if (is_object($rule)) {
            return $this->parseObjectRule($rule);
        }

        throw new \InvalidArgumentException('Invalid rule type: ' . gettype($rule));
    }

    protected function parseStringRule(string $rule): RuleData
    {
        $parts = explode(':', $rule, 2);
        $name = $parts[0];
        $parameters = isset($parts[1]) ? $this->parseParameters($parts[1]) : [];

        return new RuleData($name, $parameters, $rule);
    }

    protected function parseObjectRule(object $rule): RuleData
    {
        $ruleString = $this->objectToString($rule);
        $ruleData = $this->parseStringRule($ruleString);
        $ruleData->setOriginal($rule);

        return $ruleData;
    }

    protected function parseParameters(string $parameters): array
    {
        // Handle complex parameter parsing for rules like in:one,two,three
        // or regex patterns that might contain colons/commas
        if (preg_match('/^\/.*\/[gimuy]*$/', $parameters)) {
            // This looks like a regex pattern
            return [$parameters];
        }

        return explode(',', $parameters);
    }

    protected function categorizeRule(RuleData $ruleData): string
    {
        $ruleName = $ruleData->getName();

        if (in_array($ruleName, $this->conditionalRules)) {
            return 'conditional';
        }

        if (in_array($ruleName, $this->serverSideRules)) {
            return 'server';
        }

        if (in_array($ruleName, $this->clientSideRules)) {
            return 'client';
        }

        // Check custom transformers
        foreach ($this->transformers as $transformer) {
            if ($transformer->canTransform($ruleData)) {
                return $transformer->getCategory($ruleData);
            }
        }

        // Default to server-side for unknown rules
        return 'server';
    }

    protected function objectToString(object $rule): string
    {
        if ($rule instanceof Rule) {
            return (string) $rule;
        }

        if (method_exists($rule, '__toString')) {
            return (string) $rule;
        }

        return get_class($rule);
    }
}

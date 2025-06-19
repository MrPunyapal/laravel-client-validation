<?php

namespace MrPunyapal\ClientValidation;

use MrPunyapal\ClientValidation\Support\ValidationRuleConverter;

class ClientValidation
{
    protected ValidationRuleConverter $converter;

    public function __construct(ValidationRuleConverter $converter)
    {
        $this->converter = $converter;
    }

    /**
     * Generate validation JavaScript for given rules
     */
    public function generate(array $rules, array $messages = [], array $attributes = []): string
    {
        $rulesJson = $this->converter->convert($rules);
        $messagesJson = json_encode($this->mergeMessages($messages));
        $attributesJson = json_encode($this->mergeAttributes($attributes));

        return "validateForm({$rulesJson}, {$messagesJson}, {$attributesJson})";
    }

    /**
     * Convert rules to JSON format
     */
    public function rules(array $rules): string
    {
        return $this->converter->convert($rules);
    }

    /**
     * Merge custom messages with default messages
     */
    protected function mergeMessages(array $messages): array
    {
        $defaultMessages = config('client-validation.messages', []);
        return array_merge($defaultMessages, $messages);
    }

    /**
     * Merge custom attributes with default attributes
     */
    protected function mergeAttributes(array $attributes): array
    {
        $defaultAttributes = config('client-validation.attributes', []);
        return array_merge($defaultAttributes, $attributes);
    }
}

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
     * Convert rules to JSON format for client-side use
     */
    public function rules(array $rules): string
    {
        return $this->converter->convert($rules);
    }

    /**
     * Get merged messages for client-side use
     */
    public function messages(array $messages = []): string
    {
        return json_encode($this->mergeMessages($messages));
    }

    /**
     * Get merged attributes for client-side use
     */
    public function attributes(array $attributes = []): string
    {
        return json_encode($this->mergeAttributes($attributes));
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

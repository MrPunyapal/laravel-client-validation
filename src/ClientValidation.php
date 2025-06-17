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

    public function generate(array $rules, array $messages = [], array $attributes = []): string
    {
        $rulesJson = $this->converter->convert($rules);
        $messagesJson = json_encode($this->mergeMessages($messages));
        $attributesJson = json_encode($attributes);

        return "validateForm({$rulesJson}, {$messagesJson}, {$attributesJson})";
    }

    public function rules(array $rules): string
    {
        return $this->converter->convert($rules);
    }

    public function getRulesForForm(string $form): array
    {
        $forms = config('client-validation.forms', []);

        return $forms[$form] ?? [];
    }

    public function validateData(array $data, array $rules): array
    {
        $validator = app('validator')->make($data, $rules);

        return $validator->errors()->toArray();
    }

    public function generateInline(array $rules, array $messages = []): string
    {
        $rulesJson = $this->converter->convert($rules);
        $messagesJson = json_encode($this->mergeMessages($messages));

        return "validateInline({$rulesJson}, {$messagesJson})";
    }

    protected function mergeMessages(array $customMessages = []): array
    {
        $defaultMessages = config('client-validation.messages', []);

        return array_merge($defaultMessages, $customMessages);
    }
}

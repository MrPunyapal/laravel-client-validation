<?php

namespace MrPunyapal\ClientValidation\Concerns;

trait HasClientValidation
{
    /**
     * Share validation rules with the view
     */
    protected function shareValidationRules(string $key, array $rules, array $messages = [], array $attributes = []): void
    {
        $validationJs = app('client-validation')->generate($rules, $messages, $attributes);
        
        view()->share($key, $validationJs);
    }

    /**
     * Share common validation rules from config with the view
     */
    protected function shareCommonRules(string $key, string $ruleSet): void
    {
        $rules = config("client-validation.common_rules.{$ruleSet}", []);
        $messages = config('client-validation.messages', []);
        $attributes = config('client-validation.attributes', []);
        
        $this->shareValidationRules($key, $rules, $messages, $attributes);
    }

    /**
     * Get common validation rules from config
     */
    protected function getCommonRules(string $ruleSet): array
    {
        return config("client-validation.common_rules.{$ruleSet}", []);
    }
}

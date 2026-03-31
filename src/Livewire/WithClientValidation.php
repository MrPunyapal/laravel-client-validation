<?php

declare(strict_types=1);

namespace MrPunyapal\ClientValidation\Livewire;

use MrPunyapal\ClientValidation\Facades\ClientValidation;

/**
 * @property-read string $clientRules
 * @property-read string $clientMessages
 * @property-read string $clientAttributes
 * @property-read array<string, mixed> $clientValidationData
 * @property-read string $validationConfig
 */
trait WithClientValidation
{
    public function getClientRulesProperty(): string
    {
        return ClientValidation::rules($this->extractRules());
    }

    public function getClientMessagesProperty(): string
    {
        return ClientValidation::messages($this->extractMessages());
    }

    public function getClientAttributesProperty(): string
    {
        return ClientValidation::attributes($this->extractValidationAttributes());
    }

    /** @return array{rules: string, messages: string, attributes: string, config: string} */
    public function getClientValidationDataProperty(): array
    {
        return [
            'rules' => $this->getClientRulesProperty(),
            'messages' => $this->getClientMessagesProperty(),
            'attributes' => $this->getClientAttributesProperty(),
            'config' => $this->getValidationConfigProperty(),
        ];
    }

    public function getValidationConfigProperty(): string
    {
        return json_encode($this->getClientValidationConfig(), JSON_THROW_ON_ERROR);
    }

    public function getAlpineValidationProperty(): string
    {
        return ClientValidation::generate(
            $this->extractRules(),
            $this->extractMessages(),
            $this->extractValidationAttributes()
        );
    }

    /** @return array<string, mixed> */
    protected function extractRules(): array
    {
        if (method_exists($this, 'rules')) {
            return $this->rules();
        }

        if (property_exists($this, 'rules')) {
            return $this->rules;
        }

        return [];
    }

    /** @return array<string, string> */
    protected function extractMessages(): array
    {
        if (method_exists($this, 'messages')) {
            return $this->messages();
        }

        if (property_exists($this, 'messages')) {
            return $this->messages;
        }

        return [];
    }

    /** @return array<string, string> */
    protected function extractValidationAttributes(): array
    {
        if (method_exists($this, 'validationAttributes')) {
            return $this->validationAttributes();
        }

        if (property_exists($this, 'validationAttributes')) {
            return $this->validationAttributes;
        }

        return [];
    }

    /** @return array<string, mixed> */
    protected function getClientValidationConfig(): array
    {
        return [
            'ajax_url' => '/'.config('client-validation.route_prefix', 'client-validation').'/validate',
            'debounce_ms' => config('client-validation.debounce_ms', 300),
            'enable_ajax' => config('client-validation.enable_ajax_validation', true),
            'validation_mode' => config('client-validation.validation_mode', 'blur'),
        ];
    }
}

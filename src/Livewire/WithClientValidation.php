<?php

declare(strict_types=1);

namespace MrPunyapal\ClientValidation\Livewire;

use MrPunyapal\ClientValidation\Facades\ClientValidation;

/**
 * Livewire trait for client-side validation integration.
 *
 * This trait provides computed properties that expose validation rules,
 * messages, and attributes to Livewire components for use in Blade templates.
 *
 * @property-read string $clientRules JSON-encoded client-side validation rules
 * @property-read string $clientMessages JSON-encoded validation messages
 * @property-read string $clientAttributes JSON-encoded attribute names
 * @property-read array<string, mixed> $clientValidationData Complete validation data array
 * @property-read string $validationConfig JSON-encoded validation configuration
 */
trait WithClientValidation
{
    /**
     * Get the JSON-encoded client-side validation rules.
     */
    public function getClientRulesProperty(): string
    {
        return ClientValidation::rules($this->extractRules());
    }

    /**
     * Get the JSON-encoded validation messages.
     */
    public function getClientMessagesProperty(): string
    {
        return ClientValidation::messages($this->extractMessages());
    }

    /**
     * Get the JSON-encoded attribute names.
     */
    public function getClientAttributesProperty(): string
    {
        return ClientValidation::attributes($this->extractValidationAttributes());
    }

    /**
     * Get complete validation data as an array.
     *
     * @return array{rules: string, messages: string, attributes: string, config: string}
     */
    public function getClientValidationDataProperty(): array
    {
        return [
            'rules' => $this->getClientRulesProperty(),
            'messages' => $this->getClientMessagesProperty(),
            'attributes' => $this->getClientAttributesProperty(),
            'config' => $this->getValidationConfigProperty(),
        ];
    }

    /**
     * Get the JSON-encoded validation configuration.
     */
    public function getValidationConfigProperty(): string
    {
        return json_encode($this->getClientValidationConfig(), JSON_THROW_ON_ERROR);
    }

    /**
     * Get the Alpine.js compatible validation data string.
     * Can be used directly in x-data attribute.
     */
    public function getAlpineValidationProperty(): string
    {
        return ClientValidation::generate(
            $this->extractRules(),
            $this->extractMessages(),
            $this->extractValidationAttributes()
        );
    }

    /**
     * Extract validation rules from the component.
     *
     * @return array<string, mixed>
     */
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

    /**
     * Extract validation messages from the component.
     *
     * @return array<string, string>
     */
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

    /**
     * Extract validation attribute names from the component.
     *
     * @return array<string, string>
     */
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

    /**
     * Get client-side validation configuration.
     *
     * @return array<string, mixed>
     */
    protected function getClientValidationConfig(): array
    {
        return [
            'ajax_url' => '/' . config('client-validation.route_prefix', 'client-validation') . '/validate',
            'debounce_ms' => config('client-validation.debounce_ms', 300),
            'enable_ajax' => config('client-validation.enable_ajax_validation', true),
            'validation_mode' => config('client-validation.validation_mode', 'blur'),
        ];
    }
}

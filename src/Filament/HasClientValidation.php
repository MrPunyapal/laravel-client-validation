<?php

declare(strict_types=1);

namespace MrPunyapal\ClientValidation\Filament;

use Closure;

/**
 * Trait for Filament form components to enable client-side validation.
 *
 * Adds the x-validate Alpine.js directive to form components, running
 * client-side validation using the same Laravel validation rules.
 *
 * @example
 * // In a Filament form field:
 * TextInput::make('email')
 *     ->clientValidation('required|email')
 *     ->clientValidationMode('live')
 *
 * // Or using the rules already defined on the field:
 * TextInput::make('email')
 *     ->required()
 *     ->email()
 *     ->withClientValidation()
 */
trait HasClientValidation
{
    protected string|Closure|null $clientValidationRules = null;

    protected string $clientValidationMode = 'blur';

    protected bool $clientValidationEnabled = false;

    /**
     * Set explicit client-side validation rules.
     */
    public function clientValidation(string|Closure|null $rules = null): static
    {
        $this->clientValidationEnabled = true;
        $this->clientValidationRules = $rules;

        return $this;
    }

    /**
     * Enable client validation using the field's existing rules.
     */
    public function withClientValidation(): static
    {
        $this->clientValidationEnabled = true;

        return $this;
    }

    /**
     * Disable client-side validation.
     */
    public function withoutClientValidation(): static
    {
        $this->clientValidationEnabled = false;

        return $this;
    }

    /**
     * Set the client validation mode.
     */
    public function clientValidationMode(string $mode): static
    {
        $this->clientValidationMode = $mode;

        return $this;
    }

    /**
     * Check if client validation is enabled.
     */
    public function hasClientValidation(): bool
    {
        return $this->clientValidationEnabled;
    }

    /**
     * Get the resolved client validation rules string.
     */
    public function getClientValidationRules(): ?string
    {
        if (! $this->clientValidationEnabled) {
            return null;
        }

        if ($this->clientValidationRules !== null) {
            return $this->evaluate($this->clientValidationRules);
        }

        return $this->resolveRulesFromField();
    }

    /**
     * Get the x-validate directive modifier based on mode.
     */
    public function getClientValidationModifier(): string
    {
        return match ($this->clientValidationMode) {
            'live', 'input' => '.live',
            'submit', 'form' => '.submit',
            default => '',
        };
    }

    /**
     * Get the extra Alpine attributes for client validation.
     *
     * @return array<string, string>
     */
    public function getClientValidationAttributes(): array
    {
        $rules = $this->getClientValidationRules();

        if ($rules === null) {
            return [];
        }

        $modifier = $this->getClientValidationModifier();

        return [
            "x-validate{$modifier}" => "'{$rules}'",
        ];
    }

    /**
     * Try to resolve validation rules from the field's existing configuration.
     */
    protected function resolveRulesFromField(): ?string
    {
        $rules = [];

        if (method_exists($this, 'isRequired') && $this->isRequired()) {
            $rules[] = 'required';
        }

        if (method_exists($this, 'getValidationRules')) {
            $fieldRules = $this->getValidationRules();

            foreach ($fieldRules as $rule) {
                if (is_string($rule)) {
                    $rules[] = $rule;
                }
            }
        }

        return $rules !== [] ? implode('|', array_unique($rules)) : null;
    }
}

<?php

declare(strict_types=1);

namespace MrPunyapal\ClientValidation\Filament;

use Closure;

trait HasClientValidation
{
    protected string|Closure|null $clientValidationRules = null;

    protected string $clientValidationMode = 'blur';

    protected bool $clientValidationEnabled = false;

    public function clientValidation(string|Closure|null $rules = null): static
    {
        $this->clientValidationEnabled = true;
        $this->clientValidationRules = $rules;

        return $this;
    }

    public function withClientValidation(): static
    {
        $this->clientValidationEnabled = true;

        return $this;
    }

    public function withoutClientValidation(): static
    {
        $this->clientValidationEnabled = false;

        return $this;
    }

    public function clientValidationMode(string $mode): static
    {
        $this->clientValidationMode = $mode;

        return $this;
    }

    public function hasClientValidation(): bool
    {
        return $this->clientValidationEnabled;
    }

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

    public function getClientValidationModifier(): string
    {
        return match ($this->clientValidationMode) {
            'live', 'input' => '.live',
            'submit', 'form' => '.submit',
            default => '',
        };
    }

    /** @return array<string, string> */
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

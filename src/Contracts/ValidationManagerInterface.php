<?php

declare(strict_types=1);

namespace MrPunyapal\ClientValidation\Contracts;

use Illuminate\Foundation\Http\FormRequest;
use MrPunyapal\ClientValidation\Core\DirectiveContext;
use MrPunyapal\ClientValidation\Core\ValidationContext;

/**
 * Contract for the validation manager that orchestrates client-side validation.
 */
interface ValidationManagerInterface
{
    /**
     * Create validation context from a FormRequest class or instance.
     *
     * @param string|FormRequest $request FormRequest class name or instance
     */
    public function fromRequest(string|FormRequest $request): ValidationContext;

    /**
     * Create validation context from a validator class.
     *
     * @param string $validatorClass The validator class name
     * @param array<string, mixed> $data Optional data for dynamic rules
     */
    public function fromValidator(string $validatorClass, array $data = []): ValidationContext;

    /**
     * Create validation context from raw rules array.
     *
     * @param array<string, mixed> $rules Validation rules
     * @param array<string, string> $messages Custom validation messages
     * @param array<string, string> $attributes Custom attribute names
     */
    public function fromRules(array $rules, array $messages = [], array $attributes = []): ValidationContext;

    /**
     * Create validation context from a Livewire component.
     *
     * @param object $component Livewire component instance
     */
    public function fromLivewireComponent(object $component): ValidationContext;

    /**
     * Create a directive context for a single field.
     *
     * @param string $field The field name
     * @param string $rules The validation rules as string
     * @param array<string, mixed> $options Additional options
     */
    public function createDirective(string $field, string $rules, array $options = []): DirectiveContext;

    /**
     * Register a custom validation rule.
     *
     * @param string $rule The rule name
     * @param callable $validator The validation callback
     * @param string|null $message Optional error message
     */
    public function extend(string $rule, callable $validator, ?string $message = null): void;

    /**
     * Register a rule as client-side capable with its JavaScript implementation.
     *
     * @param string $rule The rule name
     * @param string $jsValidator JavaScript function body as string
     */
    public function extendClientSide(string $rule, string $jsValidator): void;
}

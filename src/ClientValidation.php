<?php

declare(strict_types=1);

namespace MrPunyapal\ClientValidation;

use Illuminate\Foundation\Http\FormRequest;
use MrPunyapal\ClientValidation\Core\ValidationManager;

/**
 * Main service class for Laravel Client Validation.
 *
 * This class provides the public API for generating client-side
 * validation rules from Laravel validation rules.
 */
class ClientValidation
{
    public function __construct(
        protected readonly ValidationManager $manager
    ) {}

    /**
     * Generate validation data from a FormRequest class.
     *
     * @param string|FormRequest $request FormRequest class name or instance
     * @return array<string, string> JSON-encoded validation components
     */
    public function fromRequest(string|FormRequest $request): array
    {
        $context = $this->manager->fromRequest($request);

        return $this->contextToJsonArray($context);
    }

    /**
     * Generate validation data from a Livewire component.
     *
     * @param object $component Livewire component instance
     * @return array<string, string> JSON-encoded validation components
     */
    public function fromLivewire(object $component): array
    {
        $context = $this->manager->fromLivewireComponent($component);

        return $this->contextToJsonArray($context);
    }

    /**
     * Convert validation rules to JSON for client-side use.
     *
     * @param array<string, mixed> $rules Laravel validation rules
     */
    public function rules(array $rules): string
    {
        $context = $this->manager->fromRules($rules);

        return json_encode($context->getRules()->toClientRules(), JSON_THROW_ON_ERROR);
    }

    /**
     * Generate an x-validate directive string for a field.
     *
     * @param array<string, mixed> $options Options including 'mode'
     */
    public function directive(string $field, string $rules, array $options = []): string
    {
        $directive = $this->manager->createDirective($field, $rules, $options);
        $mode = $options['mode'] ?? 'blur';

        return $directive->toDirectiveString($mode);
    }

    /**
     * Generate Alpine.js x-data compatible validation object.
     *
     * @param array<string, mixed> $rules Validation rules
     * @param array<string, string> $messages Custom messages
     * @param array<string, string> $attributes Custom attribute names
     * @param array<string, mixed> $options Additional options
     */
    public function alpineData(
        array $rules,
        array $messages = [],
        array $attributes = [],
        array $options = []
    ): string {
        $context = $this->manager->fromRules($rules, $messages, $attributes);

        return $context->toAlpineData();
    }

    /**
     * Get messages JSON (merges with defaults from config).
     *
     * @param array<string, string> $messages Custom messages to merge
     */
    public function messages(array $messages = []): string
    {
        return json_encode($this->mergeMessages($messages), JSON_THROW_ON_ERROR);
    }

    /**
     * Get attributes JSON (merges with defaults from config).
     *
     * @param array<string, string> $attributes Custom attributes to merge
     */
    public function attributes(array $attributes = []): string
    {
        return json_encode($this->mergeAttributes($attributes), JSON_THROW_ON_ERROR);
    }

    /**
     * Generate complete validation configuration for Alpine.js.
     *
     * @param array<string, mixed> $rules Validation rules
     * @param array<string, string> $messages Custom messages
     * @param array<string, string> $attributes Custom attribute names
     */
    public function generate(array $rules, array $messages = [], array $attributes = []): string
    {
        $context = $this->manager->fromRules($rules, $messages, $attributes);

        return $context->toAlpineData();
    }

    /**
     * Render the script tag for validation assets.
     */
    public function renderAssets(): string
    {
        if (! config('client-validation.auto_include_assets', true)) {
            return '';
        }

        $cdnUrl = 'https://unpkg.com/laravel-client-validation@latest/dist';
        $localPath = asset('vendor/client-validation');

        $assetUrl = file_exists(public_path('vendor/client-validation/client-validation.iife.js'))
            ? $localPath
            : $cdnUrl;

        return sprintf('<script src="%s/client-validation.iife.js"></script>', $assetUrl);
    }

    /**
     * Register a custom server-side validation rule.
     */
    public function extend(string $rule, callable $validator, ?string $message = null): void
    {
        $this->manager->extend($rule, $validator, $message);
    }

    /**
     * Register a custom client-side validation rule.
     */
    public function extendClientSide(string $rule, string $jsValidator): void
    {
        $this->manager->extendClientSide($rule, $jsValidator);
    }

    /**
     * Convert a ValidationContext to JSON array format.
     *
     * @return array<string, string>
     */
    private function contextToJsonArray(\MrPunyapal\ClientValidation\Core\ValidationContext $context): array
    {
        return [
            'rules' => json_encode($context->getRules()->toClientRules(), JSON_THROW_ON_ERROR),
            'ajax_rules' => json_encode($context->getRules()->toAjaxRules(), JSON_THROW_ON_ERROR),
            'messages' => json_encode($context->getMessages(), JSON_THROW_ON_ERROR),
            'attributes' => json_encode($context->getAttributes(), JSON_THROW_ON_ERROR),
            'config' => json_encode($context->getClientConfig(), JSON_THROW_ON_ERROR),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function mergeMessages(array $messages): array
    {
        $defaultMessages = config('client-validation.messages', []);

        return array_merge($defaultMessages, $messages);
    }

    /**
     * @return array<string, string>
     */
    private function mergeAttributes(array $attributes): array
    {
        $defaultAttributes = config('client-validation.attributes', []);

        return array_merge($defaultAttributes, $attributes);
    }
}

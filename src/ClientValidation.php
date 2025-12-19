<?php

namespace MrPunyapal\ClientValidation;

use Illuminate\Foundation\Http\FormRequest;
use MrPunyapal\ClientValidation\Core\ValidationManager;

class ClientValidation
{
    public function __construct(
        protected readonly ValidationManager $manager
    ) {}


    public function fromRequest(string|FormRequest $request): array
    {
        $context = $this->manager->fromRequest($request);

        return [
            'rules' => json_encode($context->getRules()->toClientRules()),
            'ajax_rules' => json_encode($context->getRules()->toAjaxRules()),
            'messages' => json_encode($context->getMessages()),
            'attributes' => json_encode($context->getAttributes()),
            'config' => json_encode($context->getClientConfig()),
        ];
    }

    public function fromLivewire($component): array
    {
        $context = $this->manager->fromLivewireComponent($component);

        return [
            'rules' => json_encode($context->getRules()->toClientRules()),
            'ajax_rules' => json_encode($context->getRules()->toAjaxRules()),
            'messages' => json_encode($context->getMessages()),
            'attributes' => json_encode($context->getAttributes()),
            'config' => json_encode($context->getClientConfig()),
        ];
    }

    public function rules(array $rules): string
    {
        $context = $this->manager->fromRules($rules);
        return json_encode($context->getRules()->toClientRules());
    }

    public function directive(string $field, string $rules, array $options = []): string
    {
        $directive = $this->manager->createDirective($field, $rules, $options);
        $mode = $options['mode'] ?? 'blur';
        return $directive->toDirectiveString($mode);
    }

    public function alpineData(array $rules, array $messages = [], array $attributes = [], array $options = []): string
    {
        $context = $this->manager->fromRules($rules, $messages, $attributes);
        return $context->toAlpineData();
    }

    // Backward compatibility methods
    public function messages(array $messages = []): string
    {
        return json_encode($this->mergeMessages($messages));
    }

    public function attributes(array $attributes = []): string
    {
        return json_encode($this->mergeAttributes($attributes));
    }

    public function generate(array $rules, array $messages = [], array $attributes = []): string
    {
        $context = $this->manager->fromRules($rules, $messages, $attributes);
        return $context->toAlpineData();
    }

    public function renderAssets(): string
    {
        if (! config('client-validation.auto_include_assets', true)) {
            return '';
        }

        $cdnUrl = 'https://unpkg.com/laravel-client-validation@latest/dist';
        $localPath = asset('vendor/client-validation');

        // Check if assets are published locally, otherwise use CDN
        $assetUrl = file_exists(public_path('vendor/client-validation/client-validation.iife.js'))
            ? $localPath
            : $cdnUrl;

        return sprintf(
            '<script src="%s/client-validation.iife.js"></script>',
            $assetUrl
        );
    }

    public function extend(string $rule, callable $validator, string $message = null): void
    {
        $this->manager->extend($rule, $validator, $message);
    }

    public function extendClientSide(string $rule, string $jsValidator): void
    {
        $this->manager->extendClientSide($rule, $jsValidator);
    }

    protected function mergeMessages(array $messages): array
    {
        $defaultMessages = config('client-validation.messages', []);
        return array_merge($defaultMessages, $messages);
    }

    protected function mergeAttributes(array $attributes): array
    {
        $defaultAttributes = config('client-validation.attributes', []);
        return array_merge($defaultAttributes, $attributes);
    }
}

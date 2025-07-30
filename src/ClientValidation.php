<?php

namespace MrPunyapal\ClientValidation;

use Illuminate\Foundation\Http\FormRequest;
use MrPunyapal\ClientValidation\Support\ValidationRuleConverter;

class ClientValidation
{
    protected ValidationRuleConverter $converter;

    public function __construct(ValidationRuleConverter $converter)
    {
        $this->converter = $converter;
    }

    public function fromRequest(string|FormRequest $request): array
    {
        if (is_string($request)) {
            $request = app($request);
        }

        if (!$request instanceof FormRequest) {
            throw new \InvalidArgumentException('Must be a FormRequest class or instance');
        }

        return [
            'rules' => $this->converter->convert($request->rules()),
            'messages' => json_encode($this->mergeMessages($request->messages())),
            'attributes' => json_encode($this->mergeAttributes($request->attributes())),
        ];
    }

    public function rules(array $rules): string
    {
        return $this->converter->convert($rules);
    }

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
        $data = [
            'rules' => json_decode($this->converter->convert($rules), true),
            'messages' => $this->mergeMessages($messages),
            'attributes' => $this->mergeAttributes($attributes),
        ];

        return json_encode($data);
    }

    public function renderAssets(): string
    {
        if (!config('client-validation.auto_include_assets', true)) {
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

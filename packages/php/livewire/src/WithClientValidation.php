<?php

declare(strict_types=1);

namespace MrPunyapal\ClientValidation\Livewire;

use Illuminate\Contracts\Support\Arrayable;
use MrPunyapal\ClientValidation\Core\ValidationManager;
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
    /**
     * Payload injected into the Livewire snapshot by ClientValidationHook.
     *
     * Contains only client-safe rules; server rules (unique, exists, ...)
     * are prefixed with "ajax:" and validated remotely.
     *
     * @return array{rules: array<string, array<int, string>>, ajax_rules?: array<string, mixed>, messages: array<string, string>, attributes: array<string, string>, config: array<string, mixed>}|array<empty, empty>
     */
    public function getClientValidationPayload(): array
    {
        $rules = $this->extractRules();

        if ($rules === []) {
            return [];
        }

        /** @var ValidationManager $manager */
        $manager = app(ValidationManager::class);

        return $manager->fromRules(
            $rules,
            $this->extractMessages(),
            $this->extractValidationAttributes()
        )->toClientPayload();
    }

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

    /**
     * Extract rules from the component.
     *
     * Prefers Livewire's getRules(), which aggregates the rules() method, the
     * $rules property, and any #[Validate] attribute rules. Falls back to
     * manual extraction for non-Livewire classes using this trait.
     *
     * @return array<string, mixed>
     */
    protected function extractRules(): array
    {
        if (method_exists($this, 'getRules')) {
            return $this->toExtractedArray($this->getRules());
        }

        if (method_exists($this, 'rules')) {
            return $this->toExtractedArray($this->rules());
        }

        if (property_exists($this, 'rules')) {
            return $this->toExtractedArray($this->rules);
        }

        return [];
    }

    /**
     * Extract custom validation messages.
     *
     * Prefers Livewire's getMessages() so #[Validate(message: ...)] params are
     * included alongside messages()/property definitions.
     *
     * @return array<string, string>
     */
    protected function extractMessages(): array
    {
        if (method_exists($this, 'getMessages')) {
            return $this->toExtractedArray($this->getMessages());
        }

        if (method_exists($this, 'messages')) {
            return $this->toExtractedArray($this->messages());
        }

        if (property_exists($this, 'messages')) {
            return $this->toExtractedArray($this->messages);
        }

        return [];
    }

    /**
     * Extract custom attribute names.
     *
     * Prefers Livewire's getValidationAttributes() so #[Validate(as: ...)]
     * and #[Validate(attribute: ...)] params are included.
     *
     * @return array<string, string>
     */
    protected function extractValidationAttributes(): array
    {
        if (method_exists($this, 'getValidationAttributes')) {
            return $this->toExtractedArray($this->getValidationAttributes());
        }

        if (method_exists($this, 'validationAttributes')) {
            return $this->toExtractedArray($this->validationAttributes());
        }

        if (property_exists($this, 'validationAttributes')) {
            return $this->toExtractedArray($this->validationAttributes);
        }

        return [];
    }

    /**
     * Coerce an extracted value into a plain array payload.
     *
     * @return array<string, mixed>
     */
    private function toExtractedArray(mixed $value): array
    {
        if ($value instanceof Arrayable) {
            $value = $value->toArray();
        }

        return is_array($value) ? $value : [];
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

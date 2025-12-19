<?php

declare(strict_types=1);

namespace MrPunyapal\ClientValidation\Core;

use Illuminate\Support\Collection;

/**
 * Collection of parsed validation rules for multiple fields.
 *
 * This is an immutable container for field-level validation rules.
 */
readonly class ParsedRules
{
    /**
     * @param array<string, ParsedFieldRules> $rules Field name => parsed rules mapping
     */
    public function __construct(
        private array $rules
    ) {}

    /**
     * Get parsed rules for a specific field.
     */
    public function getField(string $field): ?ParsedFieldRules
    {
        return $this->rules[$field] ?? null;
    }

    /**
     * Get all field names.
     *
     * @return array<int, string>
     */
    public function getFields(): array
    {
        return array_keys($this->rules);
    }

    /**
     * Get all parsed field rules.
     *
     * @return array<string, ParsedFieldRules>
     */
    public function getAllRules(): array
    {
        return $this->rules;
    }

    /**
     * Get fields that only have client-side rules (no AJAX required).
     *
     * @return array<string, ParsedFieldRules>
     */
    public function getClientOnlyFields(): array
    {
        return array_filter(
            $this->rules,
            static fn (ParsedFieldRules $rules): bool => $rules->hasClientRules() && ! $rules->requiresAjax()
        );
    }

    /**
     * Get fields that require AJAX validation.
     *
     * @return array<string, ParsedFieldRules>
     */
    public function getAjaxFields(): array
    {
        return array_filter(
            $this->rules,
            static fn (ParsedFieldRules $rules): bool => $rules->requiresAjax()
        );
    }

    /**
     * Convert to client-side rules format.
     *
     * @return array<string, array<int, string>>
     */
    public function toClientRules(): array
    {
        $clientRules = [];

        foreach ($this->rules as $field => $fieldRules) {
            if ($fieldRules->hasClientRules() || $fieldRules->hasServerRules()) {
                $clientRules[$field] = $fieldRules->toClientRuleStrings();
            }
        }

        return $clientRules;
    }

    /**
     * Get rules that require AJAX with both server and client rules.
     *
     * @return array<string, array{server: array<int, string>, client: array<int, string>}>
     */
    public function toAjaxRules(): array
    {
        $ajaxRules = [];

        foreach ($this->rules as $field => $fieldRules) {
            if ($fieldRules->requiresAjax()) {
                $ajaxRules[$field] = [
                    'server' => $fieldRules->toServerRuleStrings(),
                    'client' => $fieldRules->toClientRuleStrings(),
                ];
            }
        }

        return $ajaxRules;
    }

    /**
     * Convert to array representation.
     *
     * @return array<string, array{field: string, client: array<int, string>, server: array<int, string>, conditional: array<int, string>}>
     */
    public function toArray(): array
    {
        $result = [];

        foreach ($this->rules as $field => $fieldRules) {
            $result[$field] = $fieldRules->toArray();
        }

        return $result;
    }

    /**
     * Convert to JSON string.
     */
    public function toJson(): string
    {
        return json_encode($this->toArray(), JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    }

    /**
     * Convert to Laravel Collection.
     *
     * @return Collection<string, ParsedFieldRules>
     */
    public function collect(): Collection
    {
        return collect($this->rules);
    }

    /**
     * Check if any fields are defined.
     */
    public function isEmpty(): bool
    {
        return $this->rules === [];
    }

    /**
     * Count the number of fields.
     */
    public function count(): int
    {
        return count($this->rules);
    }
}

<?php

declare(strict_types=1);

namespace MrPunyapal\ClientValidation\Core;

/**
 * Represents the parsed validation rules for a single field.
 *
 * Contains categorized rules: client-side, server-side, and conditional.
 * This is an immutable data object.
 *
 * @property-read string $field The field name
 * @property-read array<int, RuleData> $clientRules Rules validated client-side
 * @property-read array<int, RuleData> $serverRules Rules requiring AJAX validation
 * @property-read array<int, RuleData> $conditionalRules Rules depending on other fields
 */
readonly class ParsedFieldRules
{
    /**
     * @param string $field The field name
     * @param array<int, RuleData> $clientRules Client-side validation rules
     * @param array<int, RuleData> $serverRules Server-side validation rules (AJAX)
     * @param array<int, RuleData> $conditionalRules Conditional validation rules
     */
    public function __construct(
        private string $field,
        private array $clientRules = [],
        private array $serverRules = [],
        private array $conditionalRules = []
    ) {}

    public function getField(): string
    {
        return $this->field;
    }

    /**
     * @return array<int, RuleData>
     */
    public function getClientRules(): array
    {
        return $this->clientRules;
    }

    /**
     * @return array<int, RuleData>
     */
    public function getServerRules(): array
    {
        return $this->serverRules;
    }

    /**
     * @return array<int, RuleData>
     */
    public function getConditionalRules(): array
    {
        return $this->conditionalRules;
    }

    /**
     * Get all rules regardless of category.
     *
     * @return array<int, RuleData>
     */
    public function getAllRules(): array
    {
        return [...$this->clientRules, ...$this->serverRules, ...$this->conditionalRules];
    }

    public function hasClientRules(): bool
    {
        return $this->clientRules !== [];
    }

    public function hasServerRules(): bool
    {
        return $this->serverRules !== [];
    }

    public function hasConditionalRules(): bool
    {
        return $this->conditionalRules !== [];
    }

    /**
     * Whether this field requires AJAX validation.
     */
    public function requiresAjax(): bool
    {
        return $this->hasServerRules() || $this->hasConditionalRules();
    }

    /**
     * Get rule strings for client-side validation with ajax: prefix for server rules.
     *
     * @return array<int, string>
     */
    public function toClientRuleStrings(): array
    {
        $rules = array_map(
            static fn (RuleData $rule): string => $rule->getString(),
            $this->clientRules
        );

        $serverRules = array_map(
            static fn (RuleData $rule): string => 'ajax:' . $rule->getString(),
            $this->serverRules
        );

        return [...$rules, ...$serverRules];
    }

    /**
     * Get server-side rule strings (without ajax: prefix).
     *
     * @return array<int, string>
     */
    public function toServerRuleStrings(): array
    {
        return array_map(
            static fn (RuleData $rule): string => $rule->getString(),
            $this->serverRules
        );
    }

    /**
     * Convert to array representation.
     *
     * @return array{field: string, client: array<int, string>, server: array<int, string>, conditional: array<int, string>}
     */
    public function toArray(): array
    {
        return [
            'field' => $this->field,
            'client' => $this->toClientRuleStrings(),
            'server' => $this->toServerRuleStrings(),
            'conditional' => array_map(
                static fn (RuleData $rule): string => $rule->getString(),
                $this->conditionalRules
            ),
        ];
    }
}

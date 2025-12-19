<?php

declare(strict_types=1);

namespace MrPunyapal\ClientValidation\Contracts;

use MrPunyapal\ClientValidation\Core\ParsedFieldRules;
use MrPunyapal\ClientValidation\Core\ParsedRules;

/**
 * Contract for parsing Laravel validation rules.
 */
interface RuleParserInterface
{
    /**
     * Parse an array of validation rules for multiple fields.
     *
     * @param array<string, mixed> $rules Field => rules mapping
     */
    public function parse(array $rules): ParsedRules;

    /**
     * Parse validation rules for a single field.
     *
     * @param string $field The field name
     * @param string|array<int, mixed> $rules The validation rules
     */
    public function parseFieldRules(string $field, string|array $rules): ParsedFieldRules;

    /**
     * Register a custom callable transformer for rule categorization.
     *
     * @param callable $transformer Returns category string or null if not applicable
     */
    public function addTransformer(callable $transformer): void;

    /**
     * Register a rule to be validated on the client-side.
     */
    public function addClientSideRule(string $rule): void;

    /**
     * Register a rule to be validated on the server-side via AJAX.
     */
    public function addServerSideRule(string $rule): void;
}

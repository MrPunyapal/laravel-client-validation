<?php

declare(strict_types=1);

namespace MrPunyapal\ClientValidation\Core;

use Illuminate\Support\Collection;
use MrPunyapal\ClientValidation\Contracts\RuleParserInterface;

/**
 * Parses Laravel validation rules and categorizes them for client/server-side validation.
 *
 * This parser separates rules into three categories:
 * - Client-side: Rules that can be validated in the browser (required, email, min, etc.)
 * - Server-side: Rules requiring database/server access (unique, exists, etc.)
 * - Conditional: Rules dependent on other field values (required_if, required_with, etc.)
 */
class RuleParser implements RuleParserInterface
{
    /** @var array<int, string> Client-side validation rules */
    protected array $clientSideRules;

    /** @var array<int, string> Server-side validation rules (require AJAX) */
    protected array $serverSideRules;

    /** @var array<int, string> Conditional validation rules */
    protected array $conditionalRules;

    /** @var Collection<int, callable> Custom rule transformers */
    protected Collection $transformers;

    /**
     * Default client-side rules when config is not available.
     *
     * @link https://laravel.com/docs/validation#available-validation-rules
     */
    private const DEFAULT_CLIENT_RULES = [
        // Core
        'accepted', 'accepted_if', 'after', 'after_or_equal', 'alpha',
        'alpha_dash', 'alpha_num', 'any_of', 'array', 'ascii', 'before',
        'before_or_equal', 'between', 'boolean', 'confirmed', 'contains',
        'date', 'date_equals', 'date_format', 'decimal', 'declined',
        'declined_if', 'different', 'digits', 'digits_between', 'dimensions',
        'distinct', 'doesnt_contain', 'doesnt_end_with', 'doesnt_start_with',
        'email', 'ends_with', 'enum', 'extensions', 'file', 'filled',
        'gt', 'gte', 'hex_color', 'image', 'in', 'in_array', 'in_array_keys',
        'integer', 'ip', 'ipv4', 'ipv6', 'json', 'list', 'lowercase',
        'lt', 'lte', 'mac_address', 'max', 'max_digits', 'mimes',
        'mimetypes', 'min', 'min_digits', 'missing', 'missing_if',
        'missing_unless', 'missing_with', 'missing_with_all',
        'multiple_of', 'not_in', 'not_regex', 'nullable', 'numeric',
        'password_strength', 'present', 'present_if', 'present_unless',
        'present_with', 'present_with_all', 'prohibited', 'prohibited_if',
        'prohibited_if_accepted', 'prohibited_if_declined',
        'prohibited_unless', 'prohibits', 'regex', 'required',
        'required_array_keys', 'required_if', 'required_if_accepted',
        'required_if_declined', 'required_unless', 'required_with',
        'required_with_all', 'required_without', 'required_without_all',
        'same', 'size', 'starts_with', 'string', 'timezone', 'ulid',
        'uppercase', 'url', 'uuid',

        // Package extras
        'active_url', 'bail', 'password_strength',
    ];

    /**
     * Default server-side rules when config is not available.
     */
    private const DEFAULT_SERVER_RULES = [
        'unique', 'exists', 'password', 'current_password',
        'can',
        'exclude', 'exclude_if', 'exclude_unless', 'exclude_with',
        'exclude_without', 'sometimes',
    ];

    /**
     * Default conditional rules when config is not available.
     */
    private const DEFAULT_CONDITIONAL_RULES = [
        'required_if', 'required_unless', 'required_with',
        'required_with_all', 'required_without', 'required_without_all',
    ];

    public function __construct()
    {
        $this->clientSideRules = config('client-validation.client_side_rules', self::DEFAULT_CLIENT_RULES);
        $this->serverSideRules = config('client-validation.server_side_rules', self::DEFAULT_SERVER_RULES);
        $this->conditionalRules = config('client-validation.conditional_rules', self::DEFAULT_CONDITIONAL_RULES);
        $this->transformers = collect();
    }

    /**
     * Parse an array of validation rules for multiple fields.
     *
     * @param array<string, mixed> $rules Field => rules mapping
     */
    public function parse(array $rules): ParsedRules
    {
        $parsedRules = [];

        foreach ($rules as $field => $fieldRules) {
            $parsedRules[$field] = $this->parseFieldRules($field, $fieldRules);
        }

        return new ParsedRules($parsedRules);
    }

    /**
     * Parse validation rules for a single field.
     *
     * @param string $field The field name
     * @param string|array<int, mixed> $rules The validation rules
     */
    public function parseFieldRules(string $field, string|array $rules): ParsedFieldRules
    {
        $normalizedRules = $this->normalizeRules($rules);
        $clientRules = [];
        $serverRules = [];
        $conditionalRules = [];

        foreach ($normalizedRules as $rule) {
            $ruleData = $this->parseRule($rule);
            $category = $this->categorizeRule($ruleData);

            match ($category) {
                'client' => $clientRules[] = $ruleData,
                'conditional' => $conditionalRules[] = $ruleData,
                default => $serverRules[] = $ruleData,
            };
        }

        return new ParsedFieldRules($field, $clientRules, $serverRules, $conditionalRules);
    }

    /**
     * Register a custom callable transformer for rule categorization.
     *
     * @param callable(RuleData): ?string $transformer Returns category or null if not applicable
     */
    public function addTransformer(callable $transformer): void
    {
        $this->transformers->push($transformer);
    }

    /**
     * Register a rule to be validated on the client-side.
     */
    public function addClientSideRule(string $rule): void
    {
        if (! in_array($rule, $this->clientSideRules, true)) {
            $this->clientSideRules[] = $rule;
        }
    }

    /**
     * Register a rule to be validated on the server-side via AJAX.
     */
    public function addServerSideRule(string $rule): void
    {
        if (! in_array($rule, $this->serverSideRules, true)) {
            $this->serverSideRules[] = $rule;
        }
    }

    /**
     * Get the current list of client-side rules.
     *
     * @return array<int, string>
     */
    public function getClientSideRules(): array
    {
        return $this->clientSideRules;
    }

    /**
     * Get the current list of server-side rules.
     *
     * @return array<int, string>
     */
    public function getServerSideRules(): array
    {
        return $this->serverSideRules;
    }

    /**
     * Get the current list of conditional rules.
     *
     * @return array<int, string>
     */
    public function getConditionalRules(): array
    {
        return $this->conditionalRules;
    }

    /**
     * Normalize rules to an array of strings.
     *
     * @param string|array<int, mixed> $rules
     * @return array<int, string>
     */
    protected function normalizeRules(string|array $rules): array
    {
        if (is_string($rules)) {
            return explode('|', $rules);
        }

        $normalized = [];
        foreach ($rules as $rule) {
            if (is_string($rule)) {
                $normalized[] = $rule;
            } elseif (is_object($rule)) {
                $normalized[] = $this->objectToString($rule);
            }
        }

        return $normalized;
    }

    /**
     * Parse a single rule into a RuleData object.
     */
    protected function parseRule(string $rule): RuleData
    {
        return $this->parseStringRule($rule);
    }

    /**
     * Parse a string rule into name and parameters.
     */
    protected function parseStringRule(string $rule): RuleData
    {
        $parts = explode(':', $rule, 2);
        $name = $parts[0];
        $parameters = isset($parts[1]) ? $this->parseParameters($parts[1]) : [];

        return new RuleData($name, $parameters, $rule);
    }

    /**
     * Parse rule parameters, handling special cases like regex patterns.
     *
     * @return array<int, string>
     */
    protected function parseParameters(string $parameters): array
    {
        // Handle regex patterns that might contain colons/commas
        if (preg_match('/^\/.*\/[gimuy]*$/', $parameters)) {
            return [$parameters];
        }

        return explode(',', $parameters);
    }

    /**
     * Categorize a rule as client, server, or conditional.
     */
    protected function categorizeRule(RuleData $ruleData): string
    {
        $ruleName = $ruleData->getName();

        if (in_array($ruleName, $this->conditionalRules, true)) {
            return 'conditional';
        }

        if (in_array($ruleName, $this->serverSideRules, true)) {
            return 'server';
        }

        if (in_array($ruleName, $this->clientSideRules, true)) {
            return 'client';
        }

        // Check custom transformers
        foreach ($this->transformers as $transformer) {
            $category = $transformer($ruleData);
            if ($category !== null) {
                return $category;
            }
        }

        // Default to server-side for unknown rules (safer)
        return 'server';
    }

    /**
     * Convert a rule object to its string representation.
     */
    protected function objectToString(object $rule): string
    {
        // Check if the object has __toString method (most rule objects do)
        if (method_exists($rule, '__toString')) {
            return (string) $rule;
        }

        // Fallback to class name for non-stringable objects
        return $rule::class;
    }
}

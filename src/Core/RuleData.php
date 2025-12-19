<?php

declare(strict_types=1);

namespace MrPunyapal\ClientValidation\Core;

/**
 * Represents a parsed validation rule with its name, parameters, and metadata.
 */
readonly class RuleData
{
    private string $string;

    /**
     * @param string $name The rule name (e.g., 'required', 'min', 'email')
     * @param array<int, string> $parameters The rule parameters (e.g., ['8'] for min:8)
     * @param string $originalString The original rule string
     * @param mixed $original The original rule object (if any)
     */
    public function __construct(
        private string $name,
        private array $parameters = [],
        string $originalString = '',
        private mixed $original = null
    ) {
        $this->string = $originalString !== '' ? $originalString : $this->buildString();
    }

    public function getName(): string
    {
        return $this->name;
    }

    /**
     * @return array<int, string>
     */
    public function getParameters(): array
    {
        return $this->parameters;
    }

    public function getParameter(int $index, mixed $default = null): mixed
    {
        return $this->parameters[$index] ?? $default;
    }

    public function hasParameters(): bool
    {
        return $this->parameters !== [];
    }

    public function getString(): string
    {
        return $this->string;
    }

    public function getOriginal(): mixed
    {
        return $this->original;
    }

    /**
     * Create a new instance with a different original value.
     */
    public function withOriginal(mixed $original): self
    {
        return new self($this->name, $this->parameters, $this->string, $original);
    }

    public function isConditional(): bool
    {
        return str_starts_with($this->name, 'required_')
            || str_starts_with($this->name, 'nullable_');
    }

    public function requiresServer(): bool
    {
        return in_array($this->name, ['unique', 'exists', 'password', 'current_password'], true);
    }

    /**
     * @return array{name: string, parameters: array<int, string>, string: string}
     */
    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'parameters' => $this->parameters,
            'string' => $this->string,
        ];
    }

    public function __toString(): string
    {
        return $this->string;
    }

    private function buildString(): string
    {
        if ($this->parameters === []) {
            return $this->name;
        }

        return $this->name . ':' . implode(',', $this->parameters);
    }
}

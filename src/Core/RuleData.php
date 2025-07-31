<?php

namespace MrPunyapal\ClientValidation\Core;

class RuleData
{
    protected string $name;
    protected array $parameters;
    protected string $string;
    protected $original;

    public function __construct(string $name, array $parameters = [], string $string = '', $original = null)
    {
        $this->name = $name;
        $this->parameters = $parameters;
        $this->string = $string ?: $this->buildString();
        $this->original = $original ?? $string;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getParameters(): array
    {
        return $this->parameters;
    }

    public function getParameter(int $index, $default = null)
    {
        return $this->parameters[$index] ?? $default;
    }

    public function hasParameters(): bool
    {
        return !empty($this->parameters);
    }

    public function getString(): string
    {
        return $this->string;
    }

    public function getOriginal()
    {
        return $this->original;
    }

    public function setOriginal($original): void
    {
        $this->original = $original;
    }

    public function isConditional(): bool
    {
        return str_starts_with($this->name, 'required_') ||
               str_starts_with($this->name, 'nullable_');
    }

    public function requiresServer(): bool
    {
        $serverRules = ['unique', 'exists', 'password', 'current_password'];
        return in_array($this->name, $serverRules);
    }

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

    protected function buildString(): string
    {
        if (empty($this->parameters)) {
            return $this->name;
        }

        return $this->name . ':' . implode(',', $this->parameters);
    }
}

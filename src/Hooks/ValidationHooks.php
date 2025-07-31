<?php

namespace MrPunyapal\ClientValidation\Hooks;

class ValidationHooks
{
    protected array $hooks = [
        'before_validate' => [],
        'after_validate' => [],
        'on_passes' => [],
        'on_fails' => [],
        'before_field_validate' => [],
        'after_field_validate' => [],
    ];

    public function beforeValidate(callable $callback): void
    {
        $this->hooks['before_validate'][] = $callback;
    }

    public function afterValidate(callable $callback): void
    {
        $this->hooks['after_validate'][] = $callback;
    }

    public function onPasses(callable $callback): void
    {
        $this->hooks['on_passes'][] = $callback;
    }

    public function onFails(callable $callback): void
    {
        $this->hooks['on_fails'][] = $callback;
    }

    public function beforeFieldValidate(callable $callback): void
    {
        $this->hooks['before_field_validate'][] = $callback;
    }

    public function afterFieldValidate(callable $callback): void
    {
        $this->hooks['after_field_validate'][] = $callback;
    }

    public function fire(string $event, ...$args): void
    {
        foreach ($this->hooks[$event] ?? [] as $callback) {
            call_user_func($callback, ...$args);
        }
    }

    public function fireAsync(string $event, ...$args): array
    {
        $results = [];
        foreach ($this->hooks[$event] ?? [] as $callback) {
            $results[] = call_user_func($callback, ...$args);
        }
        return $results;
    }

    public function has(string $event): bool
    {
        return !empty($this->hooks[$event]);
    }

    public function clear(string $event = null): void
    {
        if ($event) {
            $this->hooks[$event] = [];
        } else {
            $this->hooks = array_map(fn() => [], $this->hooks);
        }
    }

    public function toArray(): array
    {
        return array_map(fn($callbacks) => count($callbacks), $this->hooks);
    }
}

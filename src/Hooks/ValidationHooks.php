<?php

declare(strict_types=1);

namespace MrPunyapal\ClientValidation\Hooks;

/**
 * Event hooks for validation lifecycle.
 *
 * Allows registering callbacks for various validation events:
 * - before_validate / after_validate: Form-level validation
 * - on_passes / on_fails: Validation result events
 * - before_field_validate / after_field_validate: Field-level validation
 */
class ValidationHooks
{
    /** @var array<string, array<int, callable>> */
    private array $hooks = [
        'before_validate' => [],
        'after_validate' => [],
        'on_passes' => [],
        'on_fails' => [],
        'before_field_validate' => [],
        'after_field_validate' => [],
    ];

    /**
     * Register a callback to run before validation starts.
     */
    public function beforeValidate(callable $callback): self
    {
        $this->hooks['before_validate'][] = $callback;
        return $this;
    }

    /**
     * Register a callback to run after validation completes.
     */
    public function afterValidate(callable $callback): self
    {
        $this->hooks['after_validate'][] = $callback;
        return $this;
    }

    /**
     * Register a callback to run when validation passes.
     */
    public function onPasses(callable $callback): self
    {
        $this->hooks['on_passes'][] = $callback;
        return $this;
    }

    /**
     * Register a callback to run when validation fails.
     */
    public function onFails(callable $callback): self
    {
        $this->hooks['on_fails'][] = $callback;
        return $this;
    }

    /**
     * Register a callback to run before validating a field.
     */
    public function beforeFieldValidate(callable $callback): self
    {
        $this->hooks['before_field_validate'][] = $callback;
        return $this;
    }

    /**
     * Register a callback to run after validating a field.
     */
    public function afterFieldValidate(callable $callback): self
    {
        $this->hooks['after_field_validate'][] = $callback;
        return $this;
    }

    /**
     * Fire all callbacks for an event.
     */
    public function fire(string $event, mixed ...$args): void
    {
        foreach ($this->hooks[$event] ?? [] as $callback) {
            $callback(...$args);
        }
    }

    /**
     * Fire all callbacks for an event and collect results.
     *
     * @return array<int, mixed>
     */
    public function fireAsync(string $event, mixed ...$args): array
    {
        $results = [];

        foreach ($this->hooks[$event] ?? [] as $callback) {
            $results[] = $callback(...$args);
        }

        return $results;
    }

    /**
     * Check if any callbacks are registered for an event.
     */
    public function has(string $event): bool
    {
        return isset($this->hooks[$event]) && $this->hooks[$event] !== [];
    }

    /**
     * Clear callbacks for a specific event or all events.
     */
    public function clear(?string $event = null): self
    {
        if ($event !== null) {
            $this->hooks[$event] = [];
        } else {
            foreach (array_keys($this->hooks) as $key) {
                $this->hooks[$key] = [];
            }
        }

        return $this;
    }

    /**
     * Get callback counts for each event.
     *
     * @return array<string, int>
     */
    public function toArray(): array
    {
        return array_map(
            static fn (array $callbacks): int => count($callbacks),
            $this->hooks
        );
    }
}

<?php

declare(strict_types=1);

namespace MrPunyapal\ClientValidation\Filament;

use Filament\Forms\Components\Field;

/**
 * Filament form component wrapper that adds client-side validation.
 *
 * Extends a base Filament Field to inject x-validate directives
 * into the rendered HTML, enabling real-time client-side validation.
 *
 * @example
 * // In your Filament form schema:
 * ClientValidatedField::make('email')
 *     ->rules('required|email')
 *     ->validationMode('live')
 */
class ClientValidatedField extends Field
{
    use HasClientValidation;

    protected string $view = 'client-validation::filament.client-validated-field';

    protected function setUp(): void
    {
        parent::setUp();

        $this->clientValidationEnabled = true;
    }

    /**
     * Shorthand to set rules and enable client validation.
     */
    public function rules(string $rules): static
    {
        return $this->clientValidation($rules);
    }

    /**
     * Shorthand for live validation mode.
     */
    public function live(): static
    {
        return $this->clientValidationMode('live');
    }
}

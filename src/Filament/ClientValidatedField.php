<?php

declare(strict_types=1);

namespace MrPunyapal\ClientValidation\Filament;

use Filament\Forms\Components\Field;

class ClientValidatedField extends Field
{
    use HasClientValidation;

    protected string $view = 'client-validation::filament.client-validated-field';

    protected function setUp(): void
    {
        parent::setUp();

        $this->clientValidationEnabled = true;
    }

    public function rules(string $rules): static
    {
        return $this->clientValidation($rules);
    }

    public function live(): static
    {
        return $this->clientValidationMode('live');
    }
}

<?php

declare(strict_types=1);

namespace MrPunyapal\ClientValidation\Filament;

use Closure;
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

    public function rules(string|array|Closure $rules, bool|Closure $condition = true): static
    {
        parent::rules($rules, $condition);

        if (is_string($rules)) {
            return $this->clientValidation($rules);
        }

        return $this->withClientValidation();
    }

    public function live(bool $onBlur = false, int|string|null $debounce = null, bool|Closure|null $condition = true): static
    {
        parent::live($onBlur, $debounce, $condition);

        return $this->clientValidationMode($onBlur ? 'blur' : 'live');
    }
}

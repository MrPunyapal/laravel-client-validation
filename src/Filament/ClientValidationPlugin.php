<?php

declare(strict_types=1);

namespace MrPunyapal\ClientValidation\Filament;

use Closure;
use Filament\Contracts\Plugin;
use Filament\Forms\Components\Field;
use Filament\Panel;
use Filament\Support\Assets\Js;
use Filament\Support\Components\ComponentManager;
use Filament\Support\Components\Contracts\ScopedComponentManager;
use Filament\Support\Facades\FilamentAsset;

class ClientValidationPlugin implements Plugin
{
    protected bool $enableRemoteValidation = true;

    protected bool $enableAutoValidation = false;

    protected string $validationMode = 'blur';

    private static ?ScopedComponentManager $configuredManager = null;

    public static function make(): self
    {
        return new self;
    }

    public function getId(): string
    {
        return 'client-validation';
    }

    public function register(Panel $panel): void
    {
        //
    }

    public function boot(Panel $panel): void
    {
        self::registerFieldMacros();
        self::registerFieldConfiguration();

        ClientValidationAttributes::configure($this->enableAutoValidation, $this->validationMode);

        $this->registerAssets();
    }

    public function enableRemoteValidation(bool $enabled = true): static
    {
        $this->enableRemoteValidation = $enabled;

        return $this;
    }

    /**
     * Automatically attach client-side validation to native fields based on their
     * own required state and rules; server-only rules are filtered out.
     */
    public function enableAutoValidation(bool $enabled = true): static
    {
        $this->enableAutoValidation = $enabled;

        return $this;
    }

    public function validationMode(string $mode): static
    {
        $this->validationMode = $mode;

        return $this;
    }

    /**
     * Make clientValidation() / withoutClientValidation() available on every field,
     * including native components such as TextInput and Select.
     */
    public static function registerFieldMacros(): void
    {
        Field::macro('clientValidation', function (string|array|Closure|null $rules = null, ?string $mode = null) {
            // Filament's Macroable binds macro closures to the component at call time.
            /** @var Field $field */
            $field = $this; // @phpstan-ignore variable.undefined

            ClientValidationAttributes::record($field, $rules, $mode);

            // Append an evaluator so the attributes land even when the user has
            // already called extraInputAttributes() (which replaces by default).
            if (method_exists($field, 'extraInputAttributes')) {
                $field->extraInputAttributes(
                    fn (): array => ClientValidationAttributes::resolve($field),
                    merge: true,
                );
            }

            return $field;
        });

        Field::macro('withoutClientValidation', function () {
            // Filament's Macroable binds macro closures to the component at call time.
            /** @var Field $field */
            $field = $this; // @phpstan-ignore variable.undefined

            ClientValidationAttributes::disable($field);

            return $field;
        });
    }

    /**
     * Attach the render-time resolver to every field once per component manager
     * (the manager is container-scoped, so each application registers its own).
     */
    public static function registerFieldConfiguration(): void
    {
        $manager = ComponentManager::resolve();

        if (self::$configuredManager === $manager) {
            return;
        }

        self::$configuredManager = $manager;

        Field::configureUsing(function (Field $component): void {
            if (! method_exists($component, 'extraInputAttributes')) {
                return;
            }

            $component->extraInputAttributes(
                fn (): array => ClientValidationAttributes::resolve($component),
                merge: true,
            );
        });
    }

    protected function registerAssets(): void
    {
        $distPath = __DIR__.'/../../resources/js/dist';

        if (file_exists($distPath.'/client-validation.iife.js')) {
            FilamentAsset::register([
                Js::make('client-validation', $distPath.'/client-validation.iife.js'),
            ], 'mrpunyapal/laravel-client-validation');
        }
    }
}

<?php

declare(strict_types=1);

namespace MrPunyapal\ClientValidation\Filament;

use Filament\Contracts\Plugin;
use Filament\Panel;
use Filament\Support\Assets\Js;
use Filament\Support\Facades\FilamentAsset;

class ClientValidationPlugin implements Plugin
{
    protected bool $enableRemoteValidation = true;

    protected string $validationMode = 'blur';

    public static function make(): static
    {
        return new static;
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
        $this->registerAssets();
    }

    public function enableRemoteValidation(bool $enabled = true): static
    {
        $this->enableRemoteValidation = $enabled;

        return $this;
    }

    public function validationMode(string $mode): static
    {
        $this->validationMode = $mode;

        return $this;
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

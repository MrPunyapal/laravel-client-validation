<?php

declare(strict_types=1);

namespace MrPunyapal\ClientValidation\Filament;

use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;

class ClientValidationFilamentServiceProvider extends PackageServiceProvider
{
    public function configurePackage(Package $package): void
    {
        $package
            ->name('client-validation-filament')
            ->hasViews();
    }
}

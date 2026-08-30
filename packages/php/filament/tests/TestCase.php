<?php

namespace Tests;

use MrPunyapal\ClientValidation\ClientValidationServiceProvider;
use MrPunyapal\ClientValidation\Filament\ClientValidationFilamentServiceProvider;
use Orchestra\Testbench\TestCase as Orchestra;

class TestCase extends Orchestra
{
    protected function getPackageProviders($app)
    {
        return [
            ClientValidationServiceProvider::class,
            ClientValidationFilamentServiceProvider::class,
        ];
    }

    public function getEnvironmentSetUp($app)
    {
        config()->set('database.default', 'testing');
    }
}

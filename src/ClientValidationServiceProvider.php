<?php

namespace MrPunyapal\ClientValidation;

use Illuminate\Support\Facades\Blade;
use MrPunyapal\ClientValidation\Support\ValidationRuleConverter;
use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;

class ClientValidationServiceProvider extends PackageServiceProvider
{    public function configurePackage(Package $package): void
    {
        $package
            ->name('client-validation')
            ->hasConfigFile()
            ->publishesServiceProvider('ClientValidationServiceProvider');
    }

    public function packageBooted(): void
    {
        $this->registerBladeDirectives();
    }

    public function packageRegistered(): void
    {
        $this->app->singleton(ValidationRuleConverter::class, function ($app) {
            return new ValidationRuleConverter;
        });

        $this->app->singleton('client-validation', function ($app) {
            return new ClientValidation($app->make(ValidationRuleConverter::class));
        });
    }    protected function registerBladeDirectives(): void
    {
        // Main directive for direct validation rules
        Blade::directive('clientValidation', function ($expression) {
            return "<?php echo app('client-validation')->generate({$expression}); ?>";
        });
    }
}

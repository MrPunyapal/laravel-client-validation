<?php

namespace MrPunyapal\ClientValidation;

use Illuminate\Support\Facades\Blade;
use MrPunyapal\ClientValidation\Support\ValidationRuleConverter;
use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;

class ClientValidationServiceProvider extends PackageServiceProvider
{
    public function configurePackage(Package $package): void
    {
        $package
            ->name('client-validation')
            ->hasConfigFile()
            ->hasRoute('web')
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
    }

    protected function registerBladeDirectives(): void
    {
        Blade::directive('clientValidation', function ($expression) {
            return "<?php echo app('client-validation')->generate({$expression}); ?>";
        });

        Blade::directive('validateWith', function ($expression) {
            return "<?php echo app('client-validation')->generateInline({$expression}); ?>";
        });

        Blade::directive('alpineValidation', function ($expression) {
            return "<?php echo 'x-data=\"validateForm(' . json_encode({$expression}) . ')\"'; ?>";
        });
    }
}

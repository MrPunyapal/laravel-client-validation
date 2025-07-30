<?php

namespace MrPunyapal\ClientValidation;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\Route;
use MrPunyapal\ClientValidation\Http\Controllers\ValidationController;
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
            ->hasViews()
            ->publishesServiceProvider('ClientValidationServiceProvider');
    }

    public function packageBooted(): void
    {
        $this->registerBladeDirectives();
        $this->registerRoutes();
        $this->publishAssets();
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

        Blade::directive('clientValidationAssets', function () {
            return "<?php echo view('client-validation::assets')->render(); ?>";
        });
    }

    protected function registerRoutes(): void
    {
        if (config('client-validation.enable_ajax_validation', true)) {
            Route::middleware('web')
                ->prefix(config('client-validation.route_prefix', 'client-validation'))
                ->group(function () {
                    Route::post('validate', [ValidationController::class, 'validate'])
                        ->name('client-validation.validate');
                });
        }
    }

    protected function publishAssets(): void
    {
        if (config('client-validation.auto_include_assets', true)) {
            $this->publishes([
                __DIR__.'/../resources/js/dist' => public_path('vendor/client-validation'),
            ], 'client-validation-assets');
        }
    }
}

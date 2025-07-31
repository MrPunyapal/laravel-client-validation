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

        $this->app->singleton(\MrPunyapal\ClientValidation\Contracts\RuleParserInterface::class, function ($app) {
            return new \MrPunyapal\ClientValidation\Core\RuleParser;
        });

        $this->app->singleton(\MrPunyapal\ClientValidation\Hooks\ValidationHooks::class, function ($app) {
            return new \MrPunyapal\ClientValidation\Hooks\ValidationHooks;
        });

        $this->app->singleton(\MrPunyapal\ClientValidation\Core\ValidationManager::class, function ($app) {
            return new \MrPunyapal\ClientValidation\Core\ValidationManager(
                $app->make(\MrPunyapal\ClientValidation\Contracts\RuleParserInterface::class),
                $app->make(\MrPunyapal\ClientValidation\Hooks\ValidationHooks::class),
                config('client-validation', [])
            );
        });

        $this->app->singleton('client-validation', function ($app) {
            return new ClientValidation(
                $app->make(\MrPunyapal\ClientValidation\Core\ValidationManager::class),
                $app->make(ValidationRuleConverter::class)
            );
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

        Blade::directive('validate', function ($expression) {
            $params = str_replace(['(', ')'], '', $expression);
            [$field, $rules, $options] = array_pad(explode(',', $params, 3), 3, '[]');
            return "<?php echo app('client-validation')->directive({$field}, {$rules}, {$options}); ?>";
        });

        Blade::directive('validateLive', function ($expression) {
            $params = str_replace(['(', ')'], '', $expression);
            [$field, $rules] = array_pad(explode(',', $params, 2), 2, '""');
            return "<?php echo app('client-validation')->directive({$field}, {$rules}, ['mode' => 'live']); ?>";
        });

        Blade::directive('validateForm', function ($expression) {
            $params = str_replace(['(', ')'], '', $expression);
            [$field, $rules] = array_pad(explode(',', $params, 2), 2, '""');
            return "<?php echo app('client-validation')->directive({$field}, {$rules}, ['mode' => 'form']); ?>";
        });

        Blade::directive('alpineValidation', function ($expression) {
            return "<?php echo app('client-validation')->alpineData({$expression}); ?>";
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

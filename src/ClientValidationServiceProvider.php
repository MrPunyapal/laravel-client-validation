<?php

declare(strict_types=1);

namespace MrPunyapal\ClientValidation;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\Route;
use MrPunyapal\ClientValidation\Contracts\RuleParserInterface;
use MrPunyapal\ClientValidation\Contracts\ValidationManagerInterface;
use MrPunyapal\ClientValidation\Core\RuleParser;
use MrPunyapal\ClientValidation\Core\ValidationManager;
use MrPunyapal\ClientValidation\Hooks\ValidationHooks;
use MrPunyapal\ClientValidation\Http\Controllers\ValidationController;
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
        $this->app->singleton(RuleParserInterface::class, fn ($app) => new RuleParser());

        $this->app->singleton(ValidationHooks::class, fn ($app) => new ValidationHooks());

        $this->app->singleton(ValidationManager::class, fn ($app) => new ValidationManager(
            $app->make(RuleParserInterface::class),
            $app->make(ValidationHooks::class),
            config('client-validation', [])
        ));

        $this->app->singleton('client-validation', fn ($app) => new ClientValidation(
            $app->make(ValidationManager::class)
        ));
    }

    protected function registerBladeDirectives(): void
    {
        // ==================== Asset Directives ====================

        // Include validation assets
        // Usage: @clientValidationAssets
        Blade::directive('clientValidationAssets', function () {
            return "<?php echo view('client-validation::assets')->render(); ?>";
        });

        // Include validation config as JavaScript
        // Usage: @clientValidationConfig
        Blade::directive('clientValidationConfig', function () {
            return "<?php echo '<script>window.clientValidationConfig = ' . json_encode(app('client-validation')->getClientConfig()) . ';</script>'; ?>";
        });

        // ==================== Alpine.js Directives ====================

        // Generate Alpine.js validation component data
        // Usage: @alpineValidation(['email' => 'required|email'], ['email.required' => 'Email is required'])
        Blade::directive('alpineValidation', function ($expression) {
            return "<?php echo app('client-validation')->generate({$expression}); ?>";
        });

        // Generate validation JSON for custom use
        // Usage: @validationJson(['email' => 'required|email'])
        Blade::directive('validationJson', function ($expression) {
            return "<?php echo app('client-validation')->toJson({$expression}); ?>";
        });

        // ==================== Vanilla JS / Data Attribute Directives ====================

        // Generate data-rules and data-validate-on attributes
        // Usage: <input @rules('email', 'required|email', ['mode' => 'live'])>
        Blade::directive('rules', function ($expression) {
            return "<?php echo app('client-validation')->dataAttributes({$expression}); ?>";
        });

        // Shorthand for blur validation (default)
        // Usage: <input @validateBlur('email', 'required|email')>
        Blade::directive('validateBlur', function ($expression) {
            $params = str_replace(['(', ')'], '', $expression);
            [$field, $rules] = array_pad(explode(',', $params, 2), 2, '""');
            return "<?php echo app('client-validation')->dataAttributes({$field}, {$rules}, ['mode' => 'blur']); ?>";
        });

        // Shorthand for live validation (on input)
        // Usage: <input @validateLive('username', 'required|min:3')>
        Blade::directive('validateLive', function ($expression) {
            $params = str_replace(['(', ')'], '', $expression);
            [$field, $rules] = array_pad(explode(',', $params, 2), 2, '""');
            return "<?php echo app('client-validation')->dataAttributes({$field}, {$rules}, ['mode' => 'input']); ?>";
        });

        // Shorthand for submit-only validation
        // Usage: <input @validateSubmit('password', 'required|min:8')>
        Blade::directive('validateSubmit', function ($expression) {
            $params = str_replace(['(', ')'], '', $expression);
            [$field, $rules] = array_pad(explode(',', $params, 2), 2, '""');
            return "<?php echo app('client-validation')->dataAttributes({$field}, {$rules}, ['mode' => 'submit']); ?>";
        });

        // ==================== Legacy Directives (for backward compatibility) ====================

        Blade::directive('clientValidation', function ($expression) {
            return "<?php echo app('client-validation')->generate({$expression}); ?>";
        });

        Blade::directive('validate', function ($expression) {
            $params = str_replace(['(', ')'], '', $expression);
            [$field, $rules, $options] = array_pad(explode(',', $params, 3), 3, '[]');
            return "<?php echo app('client-validation')->directive({$field}, {$rules}, {$options}); ?>";
        });

        Blade::directive('validateForm', function ($expression) {
            $params = str_replace(['(', ')'], '', $expression);
            [$field, $rules] = array_pad(explode(',', $params, 2), 2, '""');
            return "<?php echo app('client-validation')->directive({$field}, {$rules}, ['mode' => 'form']); ?>";
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

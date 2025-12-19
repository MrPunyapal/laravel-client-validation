<?php

declare(strict_types=1);

namespace MrPunyapal\ClientValidation\Facades;

use Illuminate\Support\Facades\Facade;

/**
 * Facade for the ClientValidation service.
 *
 * @method static array fromRequest(string|\Illuminate\Foundation\Http\FormRequest $request)
 * @method static array fromLivewire(object $component)
 * @method static string rules(array $rules)
 * @method static string directive(string $field, string $rules, array $options = [])
 * @method static string alpineData(array $rules, array $messages = [], array $attributes = [], array $options = [])
 * @method static string messages(array $messages = [])
 * @method static string attributes(array $attributes = [])
 * @method static string generate(array $rules, array $messages = [], array $attributes = [])
 * @method static string renderAssets()
 * @method static void extend(string $rule, callable $validator, ?string $message = null)
 * @method static void extendClientSide(string $rule, string $jsValidator)
 *
 * @see \MrPunyapal\ClientValidation\ClientValidation
 */
class ClientValidation extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return 'client-validation';
    }
}

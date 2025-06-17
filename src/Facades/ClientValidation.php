<?php

namespace MrPunyapal\ClientValidation\Facades;

use Illuminate\Support\Facades\Facade;

class ClientValidation extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return 'client-validation';
    }
}

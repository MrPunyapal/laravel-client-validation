<?php

use Illuminate\Support\Facades\Route;
use MrPunyapal\ClientValidation\Http\Controllers\ClientValidationController;

Route::middleware(['web'])->prefix('client-validation')->name('client-validation.')->group(function () {
    Route::get('rules/{form}', [ClientValidationController::class, 'getRules'])
        ->name('rules');

    Route::post('validate', [ClientValidationController::class, 'validate'])
        ->name('validate');
});

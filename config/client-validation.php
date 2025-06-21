<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Auto Include Assets
    |--------------------------------------------------------------------------
    |
    | Automatically include the validation JavaScript in your pages.
    | Set to false if you want to manually include the assets.
    |
    */
    'auto_include_assets' => env('CLIENT_VALIDATION_AUTO_INCLUDE', true),

    /*
    |--------------------------------------------------------------------------
    | Default Messages
    |--------------------------------------------------------------------------
    |
    | Default validation messages for common rules. These can be overridden
    | in specific forms if needed.
    |
    */
    'messages' => [
        'required' => 'The :attribute field is required.',
        'email' => 'The :attribute must be a valid email address.',
        'min' => [
            'string' => 'The :attribute must be at least :min characters.',
        ],
        'max' => [
            'string' => 'The :attribute may not be greater than :max characters.',
        ],
        'regex' => 'The :attribute format is invalid.',
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Attributes
    |--------------------------------------------------------------------------
    |
    | Human-readable attribute names for form fields.
    |
    */
    'attributes' => [
        'email' => 'email address',
        'password' => 'password',
        'password_confirmation' => 'password confirmation',
        'name' => 'name',
        'phone' => 'phone number',
        'subject' => 'subject',
        'message' => 'message',
    ],

];

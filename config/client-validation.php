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
    | Enable AJAX Validation
    |--------------------------------------------------------------------------
    |
    | Enable AJAX fallback for validation rules that cannot be handled
    | on the client-side (like unique, exists, etc.).
    |
    */
    'enable_ajax_validation' => env('CLIENT_VALIDATION_ENABLE_AJAX', true),

    /*
    |--------------------------------------------------------------------------
    | Route Configuration
    |--------------------------------------------------------------------------
    |
    | Configure the route prefix for AJAX validation endpoints.
    |
    */
    'route_prefix' => 'client-validation',

    /*
    |--------------------------------------------------------------------------
    | Error Template Configuration
    |--------------------------------------------------------------------------
    |
    | Configure how validation errors are displayed.
    |
    */
    'error_template' => [
        'enabled' => true,
        'container_class' => 'validation-error text-red-500 text-sm mt-1',
        'show_on' => ['fail'], // 'fail', 'pass', 'both'
        'position' => 'after', // 'before', 'after'
        'template' => '<div class="{class}" id="{id}" style="display: {display}">{message}</div>',
    ],

    /*
    |--------------------------------------------------------------------------
    | Field Styling
    |--------------------------------------------------------------------------
    |
    | CSS classes to apply to form fields based on validation state.
    |
    */
    'field_styling' => [
        'enabled' => true,
        'valid_class' => 'is-valid',
        'invalid_class' => 'is-invalid',
        'remove_classes' => ['is-valid', 'is-invalid'], // Classes to remove before applying new ones
    ],

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
            'numeric' => 'The :attribute must be at least :min.',
        ],
        'max' => [
            'string' => 'The :attribute may not be greater than :max characters.',
            'numeric' => 'The :attribute may not be greater than :max.',
        ],
        'regex' => 'The :attribute format is invalid.',
        'numeric' => 'The :attribute must be a number.',
        'integer' => 'The :attribute must be an integer.',
        'alpha' => 'The :attribute may only contain letters.',
        'alpha_num' => 'The :attribute may only contain letters and numbers.',
        'alpha_dash' => 'The :attribute may only contain letters, numbers, dashes and underscores.',
        'url' => 'The :attribute format is invalid.',
        'boolean' => 'The :attribute field must be true or false.',
        'confirmed' => 'The :attribute confirmation does not match.',
        'same' => 'The :attribute and :other must match.',
        'different' => 'The :attribute and :other must be different.',
        'in' => 'The selected :attribute is invalid.',
        'not_in' => 'The selected :attribute is invalid.',
        'between' => [
            'string' => 'The :attribute must be between :min and :max characters.',
            'numeric' => 'The :attribute must be between :min and :max.',
        ],
        'size' => [
            'string' => 'The :attribute must be :size characters.',
            'numeric' => 'The :attribute must be :size.',
        ],
        'date' => 'The :attribute is not a valid date.',
        'after' => 'The :attribute must be a date after :date.',
        'before' => 'The :attribute must be a date before :date.',
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
        'first_name' => 'first name',
        'last_name' => 'last name',
        'phone' => 'phone number',
        'subject' => 'subject',
        'message' => 'message',
        'username' => 'username',
        'age' => 'age',
        'date_of_birth' => 'date of birth',
        'address' => 'address',
        'city' => 'city',
        'state' => 'state',
        'country' => 'country',
        'postal_code' => 'postal code',
        'zip_code' => 'zip code',
    ],

];

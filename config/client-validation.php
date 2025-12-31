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
    | AJAX Timeout
    |--------------------------------------------------------------------------
    |
    | Timeout in milliseconds for AJAX validation requests.
    |
    */
    'ajax_timeout' => env('CLIENT_VALIDATION_AJAX_TIMEOUT', 5000),

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
    | Validation Mode
    |--------------------------------------------------------------------------
    |
    | Default validation mode: 'blur', 'input', 'live', 'submit'
    |
    */
    'validation_mode' => env('CLIENT_VALIDATION_MODE', 'blur'),

    /*
    |--------------------------------------------------------------------------
    | Debounce Time
    |--------------------------------------------------------------------------
    |
    | Debounce time in milliseconds for live validation.
    |
    */
    'debounce_ms' => env('CLIENT_VALIDATION_DEBOUNCE', 300),

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
        'position' => 'after', // 'before', 'after', 'custom'
        'template' => '<div class="{class}" id="{id}" style="display: {display}">{message}</div>',
    ],

    /*
    |--------------------------------------------------------------------------
    | Field Styling Configuration
    |--------------------------------------------------------------------------
    |
    | Configure how form fields are styled during validation.
    |
    */
    'field_styling' => [
        'enabled' => true,
        'valid_class' => 'is-valid border-green-500',
        'invalid_class' => 'is-invalid border-red-500',
        'remove_classes' => ['is-valid', 'is-invalid', 'border-green-500', 'border-red-500'],
    ],

    /*
    |--------------------------------------------------------------------------
    | Custom Messages
    |--------------------------------------------------------------------------
    |
    | Default validation messages that can be overridden per validation.
    |
    */
    'messages' => [
        'required' => 'The :attribute field is required.',
        'email' => 'The :attribute must be a valid email address.',
        'min' => 'The :attribute must be at least :min characters.',
        'max' => 'The :attribute may not be greater than :max characters.',
        'unique' => 'The :attribute has already been taken.',
        'exists' => 'The selected :attribute is invalid.',
    ],

    /*
    |--------------------------------------------------------------------------
    | Custom Attributes
    |--------------------------------------------------------------------------
    |
    | Default field name attributes that can be overridden per validation.
    |
    */
    'attributes' => [
        'email' => 'email address',
        'password' => 'password',
        'password_confirmation' => 'password confirmation',
    ],

    /*
    |--------------------------------------------------------------------------
    | Client-Side Rules
    |--------------------------------------------------------------------------
    |
    | Rules that can be validated entirely on the client-side.
    | Add custom rules here if you implement client-side validators.
    |
    */
    'client_side_rules' => [
        // Core rules
        'required', 'email', 'min', 'max', 'numeric', 'integer',
        'alpha', 'alpha_num', 'alpha_dash', 'url', 'between',
        'confirmed', 'size', 'in', 'not_in', 'boolean', 'date',
        'after', 'before', 'regex', 'same', 'different', 'digits',
        'digits_between', 'string', 'nullable', 'accepted', 'array',
        'json', 'file', 'image', 'mimes', 'extensions', 'filled',
        'present', 'distinct', 'lt', 'lte', 'gt', 'gte',

        // String rules
        'starts_with', 'ends_with', 'doesnt_start_with', 'doesnt_end_with',
        'uuid', 'lowercase', 'uppercase', 'ascii',

        // Network rules
        'ip', 'ipv4', 'ipv6', 'mac_address',

        // Numeric rules
        'decimal', 'multiple_of',

        // Date rules
        'after_or_equal', 'before_or_equal', 'date_equals',

        // Acceptance rules
        'accepted_if', 'declined', 'declined_if',

        // Prohibition rules
        'prohibited', 'prohibited_if', 'prohibited_unless',

        // Conditional rules (client-side)
        'required_if', 'required_unless', 'required_with', 'required_without',
    ],

    /*
    |--------------------------------------------------------------------------
    | Server-Side Rules
    |--------------------------------------------------------------------------
    |
    | Rules that require server-side validation via AJAX.
    |
    */
    'server_side_rules' => [
        'unique', 'exists', 'password', 'current_password',
        'exclude', 'exclude_if', 'exclude_unless', 'exclude_with',
        'exclude_without', 'sometimes',
    ],

    /*
    |--------------------------------------------------------------------------
    | Conditional Rules
    |--------------------------------------------------------------------------
    |
    | Rules that depend on other field values and may require special handling.
    |
    */
    'conditional_rules' => [
        'required_if', 'required_unless', 'required_with',
        'required_with_all', 'required_without', 'required_without_all',
        'nullable_if', 'nullable_unless',
    ],

    /*
    |--------------------------------------------------------------------------
    | Cache Settings
    |--------------------------------------------------------------------------
    |
    | AJAX validation result caching configuration.
    |
    */
    'cache' => [
        'enabled' => true,
        'ttl' => 300, // 5 minutes in seconds
        'max_size' => 1000, // Maximum number of cached results
    ],

    /*
    |--------------------------------------------------------------------------
    | Development Mode
    |--------------------------------------------------------------------------
    |
    | Enable additional debugging features and verbose logging.
    |
    */
    'debug' => env('CLIENT_VALIDATION_DEBUG', env('APP_DEBUG', false)),

    /*
    |--------------------------------------------------------------------------
    | Performance Settings
    |--------------------------------------------------------------------------
    |
    | Configure performance-related settings.
    |
    */
    'performance' => [
        'stop_on_first_error' => false,
        'batch_ajax_requests' => true,
        'prevalidate_common_values' => true,
    ],

];

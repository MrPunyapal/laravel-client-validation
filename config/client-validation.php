<?php

return [

    'auto_include_assets' => env('CLIENT_VALIDATION_AUTO_INCLUDE', true),

    'cdn_url' => env('CLIENT_VALIDATION_CDN_URL', null),

    /*
    |--------------------------------------------------------------------------
    | Common Validation Rules
    |--------------------------------------------------------------------------
    |
    | Define reusable validation rule sets that can be shared between
    | server-side validation and client-side validation.
    |
    */
    'common_rules' => [
        'user' => [
            'name' => 'required|string|min:2|max:50',
            'email' => 'required|email|max:100',
            'phone' => 'nullable|regex:/^[0-9]{10,15}$/',
        ],
        'auth' => [
            'email' => 'required|email',
            'password' => 'required|string|min:8',
            'password_confirmation' => 'required|string|min:8|same:password',
        ],
        'contact' => [
            'name' => 'required|string|min:2|max:100',
            'email' => 'required|email',
            'subject' => 'required|string|max:200',
            'message' => 'required|string|min:10|max:1000',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Form Configurations
    |--------------------------------------------------------------------------
    |
    | Define specific form configurations with their validation rules,
    | custom messages, and attribute names.
    |
    */
    'forms' => [
        'user_profile' => [
            'rules' => 'user', // Reference to common_rules
            'messages' => [
                'name.required' => 'Please enter your full name',
                'email.email' => 'Please enter a valid email address',
            ],
            'attributes' => [
                'name' => 'Full Name',
                'email' => 'Email Address',
            ],
        ],
        'registration' => [
            'rules' => [
                'name' => 'required|string|min:2|max:50',
                'email' => 'required|email|unique:users',
                'password' => 'required|string|min:8|confirmed',
                'terms' => 'required|accepted',
            ],
            'messages' => [
                'terms.required' => 'You must accept the terms and conditions',
            ],
        ],
    ],

    'messages' => [
        'required' => 'The :attribute field is required.',
        'email' => 'The :attribute must be a valid email address.',
        'numeric' => 'The :attribute must be a number.',
        'integer' => 'The :attribute must be an integer.',
        'string' => 'The :attribute must be a string.',
        'boolean' => 'The :attribute field must be true or false.',
        'alpha' => 'The :attribute may only contain letters.',
        'alpha_num' => 'The :attribute may only contain letters and numbers.',
        'alpha_dash' => 'The :attribute may only contain letters, numbers, dashes and underscores.',
        'url' => 'The :attribute format is invalid.',
        'uuid' => 'The :attribute must be a valid UUID.',
        'json' => 'The :attribute must be a valid JSON string.',
        'date' => 'The :attribute is not a valid date.',
        'min' => [
            'numeric' => 'The :attribute must be at least :min.',
            'string' => 'The :attribute must be at least :min characters.',
            'array' => 'The :attribute must have at least :min items.',
        ],
        'max' => [
            'numeric' => 'The :attribute may not be greater than :max.',
            'string' => 'The :attribute may not be greater than :max characters.',
            'array' => 'The :attribute may not have more than :max items.',
        ],
        'between' => [
            'numeric' => 'The :attribute must be between :min and :max.',
            'string' => 'The :attribute must be between :min and :max characters.',
            'array' => 'The :attribute must have between :min and :max items.',
        ],
        'size' => [
            'numeric' => 'The :attribute must be :size.',
            'string' => 'The :attribute must be :size characters.',
            'array' => 'The :attribute must contain :size items.',
        ],
        'in' => 'The selected :attribute is invalid.',
        'not_in' => 'The selected :attribute is invalid.',
        'confirmed' => 'The :attribute confirmation does not match.',
        'same' => 'The :attribute and :other must match.',
        'different' => 'The :attribute and :other must be different.',
        'regex' => 'The :attribute format is invalid.',
        'accepted' => 'The :attribute must be accepted.',
        'after' => 'The :attribute must be a date after :date.',
        'before' => 'The :attribute must be a date before :date.',
        'date_format' => 'The :attribute does not match the format :format.',
        'ip' => 'The :attribute must be a valid IP address.',
        'ipv4' => 'The :attribute must be a valid IPv4 address.',
        'ipv6' => 'The :attribute must be a valid IPv6 address.',
        'starts_with' => 'The :attribute must start with one of the following: :values.',
        'ends_with' => 'The :attribute must end with one of the following: :values.',
        'contains' => 'The :attribute must contain one of the following: :values.',
    ],

    'attributes' => [
        'email' => 'email address',
        'password' => 'password',
        'password_confirmation' => 'password confirmation',
        'name' => 'name',
        'phone' => 'phone number',
        'subject' => 'subject',
        'message' => 'message',
        'terms' => 'terms and conditions',
    ],

];

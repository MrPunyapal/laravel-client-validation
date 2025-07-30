@if(config('client-validation.auto_include_assets', true))
<script>
    window.clientValidationConfig = @json([
        'ajaxUrl' => route('client-validation.validate'),
        'enableAjax' => config('client-validation.enable_ajax_validation', true),
        'fieldStyling' => config('client-validation.field_styling'),
        'errorTemplate' => config('client-validation.error_template'),
        'options' => [
            'ajaxTimeout' => 5000
        ]
    ]);
</script>

@if(file_exists(public_path('vendor/client-validation/client-validation.iife.js')))
<script src="{{ asset('vendor/client-validation/client-validation.iife.js') }}"></script>
@else
<script src="https://unpkg.com/laravel-client-validation@latest/dist/client-validation.iife.js"></script>
@endif
@endif

@if(config('client-validation.auto_include_assets', true))
{{-- Laravel Client Validation Configuration --}}
<script>
    window.clientValidationConfig = @json([
        'remoteUrl' => route('client-validation.validate'),
        'debounce' => config('client-validation.debounce_ms', 300),
        'errorClass' => config('client-validation.error_template.container_class', 'validation-error text-red-500 text-sm mt-1'),
        'validClass' => config('client-validation.field_styling.valid_class', 'border-green-500'),
        'invalidClass' => config('client-validation.field_styling.invalid_class', 'border-red-500'),
        'showErrors' => config('client-validation.error_template.enabled', true),
        'fieldStyling' => config('client-validation.field_styling.enabled', true),
        'enableAjax' => config('client-validation.enable_ajax_validation', true),
        'ajaxTimeout' => config('client-validation.ajax_timeout', 5000),
    ]);
</script>

{{-- Laravel Client Validation Script --}}
@if(file_exists(public_path('vendor/client-validation/client-validation.iife.js')))
<script src="{{ asset('vendor/client-validation/client-validation.iife.js') }}"></script>
@else
<script src="https://unpkg.com/laravel-client-validation@latest/dist/client-validation.iife.js"></script>
@endif
@endif

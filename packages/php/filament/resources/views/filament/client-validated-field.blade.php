<x-dynamic-component
    :component="$getFieldWrapperView()"
    :field="$field"
>
    <div
        @if ($hasClientValidation())
            x-validate{{ $getClientValidationModifier() }}="{{ $getClientValidationRules() }}"
        @endif
    >
        {{ $getChildComponentContainer() }}
    </div>
</x-dynamic-component>

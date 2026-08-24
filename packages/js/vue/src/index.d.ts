import type {
    LaravelValidator,
    ValidatorOptions,
    ValidationResult,
    FormValidationResult,
} from '@laravel-client-validation/core';

export interface UseValidationOptions extends ValidatorOptions {}

export interface VueUseValidationReturn {
    errors: Record<string, string[]>;
    readonly validating: boolean;
    init(): LaravelValidator | null;
    validateField(field: string, value: unknown, allData?: Record<string, unknown>): Promise<ValidationResult>;
    validateAll(data?: Record<string, unknown>): Promise<FormValidationResult>;
    hasError(field: string): boolean;
    getError(field: string): string | null;
    getErrors(field: string): string[];
    getAllErrors(): Record<string, string[]>;
    clearErrors(field?: string | null): void;
    isTouched(field: string): boolean;
    isValid(field: string): boolean;
    hasErrors(): boolean;
    reset(): void;
    destroy(): void;
}

export declare function useVueValidation(options?: UseValidationOptions): VueUseValidationReturn;

export declare function createVueValidator(options?: UseValidationOptions): VueUseValidationReturn;

export interface VValidateBinding {
    value: string | string[];
    modifiers?: Record<string, boolean>;
}

export declare const vValidate: {
    mounted(el: HTMLElement, binding: VValidateBinding): void;
    unmounted(el: HTMLElement): void;
};

export declare const VueValidationPlugin: {
    install(app: unknown, options?: Record<string, unknown>): void;
};

export declare const ValidationMixin: Record<string, unknown>;

declare const _default: {
    useValidation: typeof useVueValidation;
    createVueValidator: typeof createVueValidator;
    vValidate: typeof vValidate;
    VueValidationPlugin: typeof VueValidationPlugin;
    ValidationMixin: typeof ValidationMixin;
};
export default _default;

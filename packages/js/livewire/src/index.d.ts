import type {
    LaravelValidator,
    ValidatorOptions,
    ValidationResult,
    FormValidationResult,
} from '@laravel-client-validation/core';

export interface LivewireValidatorOptions extends ValidatorOptions {
    errorClass?: string;
    validClass?: string;
    invalidClass?: string;
}

export declare class LivewireValidator {
    constructor(component: unknown, options?: LivewireValidatorOptions);

    component: unknown;
    config: LivewireValidatorOptions & { remoteUrl: string; debounce: number };
    fields: Map<string, HTMLElement>;
    validator: LaravelValidator | null;
    errors: Record<string, string[]>;

    init(options: LivewireValidatorOptions): void;
    validateField(field: string, value: unknown, allData?: Record<string, unknown>): Promise<ValidationResult>;
    validateFieldDebounced(field: string, value: unknown, allData?: Record<string, unknown>): Promise<ValidationResult>;
    validateAll(data?: Record<string, unknown>): Promise<FormValidationResult>;

    registerField(name: string, element: HTMLElement): this;
    hasError(field: string): boolean;
    getError(field: string): string | null;
    getErrors(field?: string): string[];
    getAllErrors(): Record<string, string[]>;
    clearErrors(field?: string | null): void;
    isTouched(field: string): boolean;
    isValid(field: string): boolean;
    destroy(): void;
}

export declare function createLivewireValidator(
    component: unknown,
    options?: LivewireValidatorOptions
): LivewireValidator;

export declare function registerLivewireDirective(Alpine: unknown): void;

export interface AutoBindLivewireOptions {
    mode?: string;
    debounce?: number;
    showErrors?: boolean;
    fieldStyling?: boolean;
    errorClass?: string;
    validClass?: string;
    invalidClass?: string;
    enableAjax?: boolean;
}

/**
 * Auto-binds client validation to every Livewire component that exposes a
 * `clientValidation` payload in its snapshot (WithClientValidation trait).
 */
export declare function autoBindLivewireComponents(options?: AutoBindLivewireOptions): void;

/** Collects current values of every bound field inside a Livewire component root. */
export declare function collectData(rootEl: Element): Record<string, unknown>;

declare const _default: {
    LivewireValidator: typeof LivewireValidator;
    createLivewireValidator: typeof createLivewireValidator;
    registerLivewireDirective: typeof registerLivewireDirective;
    autoBindLivewireComponents: typeof autoBindLivewireComponents;
    collectData: typeof collectData;
};
export default _default;

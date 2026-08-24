import type {
    LaravelValidator,
    ValidatorOptions,
    ValidationResult,
    FormValidationResult,
} from '@laravel-client-validation/core';

export interface UseValidationOptions extends ValidatorOptions {}

export interface UseValidationState {
    errors: Record<string, string[]>;
    touched: Set<string>;
    validating: boolean;
}

export interface UseValidationReturn {
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
    subscribe(listener: (state: UseValidationState) => void): () => void;
    destroy(): void;
    readonly validating: boolean;
}

export declare function useReactValidation(options?: UseValidationOptions): UseValidationReturn;

export declare function createReactValidator(options?: UseValidationOptions): UseValidationReturn;

export declare class ReactValidator {
    constructor(options?: UseValidationOptions);

    validator: LaravelValidator | null;
    errors: Record<string, string[]>;
    touched: Set<string>;
    validating: boolean;

    init(options: UseValidationOptions): this;
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
    on(event: string, callback: (data: any) => void): () => void;
    off(event: string, callback: (data: any) => void): void;
    emit(event: string, data?: unknown): void;
    destroy(): void;
}

export interface FieldPropsOptions {
    mode?: 'blur' | 'change' | 'both';
    getData?: () => Record<string, unknown>;
    onBlur?: (e: FocusEvent) => void;
    onChange?: (e: Event) => void;
}

export declare function createFieldProps(
    validator: ReactValidator | UseValidationReturn,
    field: string,
    options?: FieldPropsOptions
): {
    name: string;
    'aria-invalid'?: string;
    'aria-describedby'?: string;
    onBlur?: (e: FocusEvent) => Promise<void>;
    onChange?: (e: Event) => Promise<void>;
};

export declare function getErrorProps(
    validator: ReactValidator | UseValidationReturn,
    field: string
): {
    id: string;
    role: string;
    'aria-live': string;
    children: string | null;
    style: { display: string };
};

declare const _default: {
    useValidation: typeof useReactValidation;
    createReactValidator: typeof createReactValidator;
    ReactValidator: typeof ReactValidator;
    createFieldProps: typeof createFieldProps;
    getErrorProps: typeof getErrorProps;
};
export default _default;

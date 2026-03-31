export interface ValidatorOptions {
    rules?: Record<string, string | string[]>;
    messages?: Record<string, string>;
    attributes?: Record<string, string>;
    remoteUrl?: string;
    debounce?: number;
    stopOnFirstError?: boolean;
}

export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

export interface FormValidationResult {
    valid: boolean;
    errors: Record<string, string[]>;
    results: Record<string, ValidationResult>;
}

export interface RuleContext {
    field: string;
    allData: Record<string, unknown>;
    rules: string[];
}

export type RuleFunction = (
    value: unknown,
    params: string[],
    field: string,
    context?: RuleContext
) => boolean | Promise<boolean>;

export declare class LaravelValidator {
    constructor(options?: ValidatorOptions);

    validateField(field: string, value: unknown, allData?: Record<string, unknown>): Promise<ValidationResult>;
    validateFieldDebounced(field: string, value: unknown, allData?: Record<string, unknown>): Promise<ValidationResult>;
    validateAll(data?: Record<string, unknown>): Promise<FormValidationResult>;

    getErrors(field: string): string[];
    getError(field: string): string | null;
    hasError(field: string): boolean;
    hasErrors(): boolean;
    isValidating(field?: string): boolean;
    isTouched(field: string): boolean;
    isValid(field?: string): boolean;

    clearErrors(field?: string): void;
    reset(): void;

    setRules(rules: Record<string, string | string[]>): void;
    setMessages(messages: Record<string, string>): void;
    setAttributes(attributes: Record<string, string>): void;
    extend(name: string, validator: RuleFunction, message?: string): void;

    beforeFieldValidate(callback: (data: { field: string; value: unknown }) => void): this;
    afterFieldValidate(callback: (data: { field: string; value: unknown; valid: boolean; errors: string[] }) => void): this;
    beforeValidate(callback: (data: { data: Record<string, unknown> }) => void): this;
    afterValidate(callback: (data: { valid: boolean; errors: Record<string, string[]> }) => void): this;

    destroy(): void;
}

export interface RuleRegistryInstance {
    has(ruleName: string): boolean;
    get(ruleName: string): RuleFunction | undefined;
    isRemote(ruleName: string): boolean;
    extend(name: string, validator: RuleFunction, message?: string): void;
    registerRemote(name: string): void;
    getMessage(ruleName: string): string;
    getAvailableRules(): string[];
}

export declare const RuleRegistry: RuleRegistryInstance;

export interface LivewireValidatorOptions extends ValidatorOptions {
    errorClass?: string;
    validClass?: string;
    invalidClass?: string;
}

export declare class LivewireValidator {
    constructor(component: unknown, options?: LivewireValidatorOptions);

    init(options: LivewireValidatorOptions): void;
    validateField(field: string, value: unknown, allData?: Record<string, unknown>): Promise<ValidationResult>;
    validateFieldDebounced(field: string, value: unknown, allData?: Record<string, unknown>): Promise<ValidationResult>;
    validateAll(data?: Record<string, unknown>): Promise<FormValidationResult>;

    registerField(name: string, element: HTMLElement): this;
    hasError(field: string): boolean;
    getError(field: string): string | null;
    getErrors(field?: string): string[];
    getAllErrors(): Record<string, string[]>;
    clearErrors(field?: string): void;
    isTouched(field: string): boolean;
    isValid(field: string): boolean;
    destroy(): void;
}

export declare function createLivewireValidator(component: unknown, options?: LivewireValidatorOptions): LivewireValidator;
export declare function registerLivewireDirective(Alpine: unknown): void;

export interface VanillaValidatorOptions extends ValidatorOptions {
    form: HTMLFormElement | string;
    errorClass?: string;
    validClass?: string;
    invalidClass?: string;
    errorTemplate?: string;
    validateOn?: 'blur' | 'input' | 'submit';
}

export declare class VanillaValidator {
    constructor(options: VanillaValidatorOptions);
    validateField(field: string): Promise<ValidationResult>;
    validateAll(): Promise<FormValidationResult>;
    destroy(): void;
}

export declare function createValidator(options: VanillaValidatorOptions): VanillaValidator;

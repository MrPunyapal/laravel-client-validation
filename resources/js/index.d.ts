/**
 * Type declarations for laravel-client-validation.
 * Mirrors the public exports of resources/js/index.js and resources/js/core/index.js.
 */

// ---------- Shared types ----------

export interface ValidatorOptions {
    rules?: Record<string, string | string[]>;
    messages?: Record<string, string>;
    attributes?: Record<string, string>;
    remoteUrl?: string;
    debounce?: number;
    stopOnFirstError?: boolean;
    enableAjax?: boolean;
}

export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

export interface RemoteValidationResult {
    valid: boolean;
    message: string | null;
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

export type EventCallback = (data: any) => void | Promise<void>;

// ---------- Core ----------

export declare class EventEmitter {
    on(event: string, callback: EventCallback): () => void;
    once(event: string, callback: EventCallback): void;
    off(event: string, callback: EventCallback): void;
    emit(event: string, data?: unknown): Promise<void>;
    removeAll(): void;
}

export interface RemoteRequestPayload {
    field: string;
    value: unknown;
    rule: string;
    parameters: string[];
    messages: Record<string, string>;
    attributes: Record<string, string>;
}

export interface RemoteAdapterOptions {
    timeout: number;
    headers: Record<string, string>;
    context: Record<string, unknown>;
}

export type RemoteAdapter = (
    url: string,
    payload: RemoteRequestPayload,
    options: RemoteAdapterOptions
) => Promise<{ valid: boolean; message?: string | null }> | { valid: boolean; message?: string | null };

export type RemoteRequestFormatter = (
    field: string,
    value: unknown,
    rule: string,
    params: string[],
    context: Record<string, unknown>
) => Record<string, unknown>;

export type RemoteResponseParser = (
    data: unknown
) => { valid: boolean; message?: string | null };

export interface RemoteValidatorOptions {
    url?: string;
    timeout?: number;
    headers?: Record<string, string>;
    csrf?: boolean;
    csrfHeaderName?: string;
    csrfTokenResolver?: (() => string) | null;
    adapter?: RemoteAdapter | null;
    requestFormatter?: RemoteRequestFormatter | null;
    responseParser?: RemoteResponseParser | null;
}

export declare class RemoteValidator {
    constructor(options?: RemoteValidatorOptions);

    options: RemoteValidatorOptions & { url: string };
    cache: Map<string, { result: RemoteValidationResult; timestamp: number }>;

    validate(
        field: string,
        value: unknown,
        rule: string,
        params?: string[],
        context?: { messages?: Record<string, string>; attributes?: Record<string, string> }
    ): Promise<RemoteValidationResult>;

    formatRequest(
        field: string,
        value: unknown,
        rule: string,
        params: string[],
        context: Record<string, unknown>
    ): RemoteRequestPayload | Record<string, unknown>;

    parseResponse(data: unknown): RemoteValidationResult;
    buildHeaders(): Record<string, string>;
    getCsrfToken(): string;
    setAdapter(adapter: RemoteAdapter): this;
    setCsrf(enabled: boolean, headerName?: string | null, tokenResolver?: (() => string) | null): this;
    clearCache(): void;
    updateOptions(options: Partial<RemoteValidatorOptions>): void;
}

export declare class LaravelValidator {
    constructor(options?: ValidatorOptions);

    rules: Record<string, string[]>;
    messages: Record<string, string>;
    attributes: Record<string, string>;
    options: ValidatorOptions & {
        remoteUrl: string;
        debounce: number;
        stopOnFirstError: boolean;
        enableAjax: boolean;
    };
    registry: RuleRegistryInstance;
    remote: RemoteValidator;
    events: EventEmitter;
    errors: Record<string, string[]>;

    normalizeRules(rules: Record<string, string | string[]>): Record<string, string[]>;
    parseRule(rule: string): { name: string; params: string[] };

    validateField(field: string, value: unknown, allData?: Record<string, unknown>): Promise<ValidationResult>;
    validateFieldDebounced(field: string, value: unknown, allData?: Record<string, unknown>): Promise<ValidationResult>;
    validateAll(data?: Record<string, unknown>): Promise<FormValidationResult>;

    formatMessage(field: string, ruleName: string, params?: string[]): string;
    hasRule(field: string, ruleName: string): boolean;
    isEmpty(value: unknown): boolean;

    getErrors(field: string): string[];
    getError(field: string): string | null;
    hasError(field: string): boolean;
    hasErrors(): boolean;
    isValidating(field?: string | null): boolean;
    isTouched(field: string): boolean;
    isValid(field?: string | null): boolean;

    clearErrors(field?: string | null): void;
    reset(): void;

    setRules(rules: Record<string, string | string[]>): void;
    setMessages(messages: Record<string, string>): void;
    setAttributes(attributes: Record<string, string>): void;
    extend(name: string, validator: RuleFunction, message?: string | null): void;

    beforeFieldValidate(callback: EventCallback): this;
    afterFieldValidate(callback: EventCallback): this;
    beforeValidate(callback: EventCallback): this;
    afterValidate(callback: EventCallback): this;

    destroy(): void;
}

export interface RuleRegistryInstance {
    has(ruleName: string): boolean;
    get(ruleName: string): RuleFunction | undefined;
    isRemote(ruleName: string): boolean;
    extend(name: string, validator: RuleFunction, message?: string | null): void;
    registerRemote(name: string): void;
    getMessage(ruleName: string): string;
    getAvailableRules(): string[];
}

export declare const RuleRegistry: RuleRegistryInstance;

// ---------- Alpine ----------

/** Registers the x-validate directive, the validation() data component and the $validation magic. */
export declare function registerAlpine(Alpine: unknown): void;

// ---------- Vanilla ----------

export interface VanillaFormValidatorOptions extends Omit<ValidatorOptions, 'rules' | 'messages' | 'attributes'> {
    errorClass?: string;
    validClass?: string;
    invalidClass?: string;
    showErrors?: boolean;
    onSubmit?: (data: Record<string, unknown>, form: HTMLFormElement) => void;
}

export declare class VanillaFormValidator {
    constructor(form: HTMLFormElement, options?: VanillaFormValidatorOptions);

    form: HTMLFormElement;
    config: VanillaFormValidatorOptions & Required<Pick<ValidatorOptions, 'remoteUrl' | 'debounce'>> & {
        errorClass: string;
        validClass: string;
        invalidClass: string;
    };
    fields: Map<string, HTMLElement>;
    validator: LaravelValidator;

    init(): void;
    validateAll(): Promise<FormValidationResult>;
    validateField(name: string): Promise<boolean>;
    getFormData(): Record<string, unknown>;
    getFieldValue(el: HTMLElement): unknown;
    clearErrors(field?: string | null): void;
    getErrors(): Record<string, string[]>;
    hasErrors(): boolean;
    destroy(): void;
}

export declare function initForms(selector?: string): VanillaFormValidator[];
export declare function createFormValidator(
    form: HTMLFormElement,
    options?: VanillaFormValidatorOptions
): VanillaFormValidator;

// ---------- Livewire ----------

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

// ---------- React ----------

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

// ---------- Vue ----------

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

// ---------- Bootstrap ----------

/**
 * Initializes global config, registers the Alpine/Livewire directives and
 * auto-initializes vanilla forms. Returns window.LaravelClientValidation
 * (or an empty object outside the browser).
 */
export declare function init(config?: Record<string, unknown>): Record<string, unknown>;

export { LaravelValidator as Validator };
export default LaravelValidator;

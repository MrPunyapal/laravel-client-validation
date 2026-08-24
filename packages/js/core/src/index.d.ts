/**
 * Type declarations for @laravel-client-validation/core.
 * Mirrors the public exports of src/index.js.
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

// ---------- Classes ----------

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

export { LaravelValidator as Validator };
export default LaravelValidator;

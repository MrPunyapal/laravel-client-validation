import type {
    LaravelValidator,
    ValidatorOptions,
    FormValidationResult,
} from '@laravel-client-validation/core';

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

export declare function autoInit(): VanillaFormValidator[];

declare const _default: {
    VanillaFormValidator: typeof VanillaFormValidator;
    initForms: typeof initForms;
    createFormValidator: typeof createFormValidator;
    autoInit: typeof autoInit;
};
export default _default;

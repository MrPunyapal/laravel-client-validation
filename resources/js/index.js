/**
 * Laravel Client Validation
 * Client-side validation for Laravel rules. Works with Alpine.js, Livewire, Vue, React, Vanilla JS, or any framework.
 */

// Core
import LaravelValidator from './core/LaravelValidator.js';
import RuleRegistry from './core/RuleRegistry.js';
import RemoteValidator from './core/RemoteValidator.js';
import EventEmitter from './core/EventEmitter.js';

// Adapters
import registerAlpine from './adapters/alpine.js';
import vanillaAdapter, { VanillaFormValidator, initForms, createFormValidator, autoInit } from './adapters/vanilla.js';
import livewireAdapter, { LivewireValidator, createLivewireValidator, registerLivewireDirective } from './adapters/livewire.js';
import reactAdapter, { useValidation as useReactValidation, ReactValidator, createReactValidator, createFieldProps, getErrorProps } from './adapters/react.js';
import vueAdapter, { useValidation as useVueValidation, createVueValidator, vValidate, VueValidationPlugin, ValidationMixin } from './adapters/vue.js';

function init(config = {}) {
    window.LaravelClientValidation = window.LaravelClientValidation || {};
    window.LaravelClientValidation.config = {
        remoteUrl: '/client-validation/validate',
        debounce: 300,
        errorClass: 'validation-error text-red-500 text-sm mt-1',
        validClass: 'border-green-500',
        invalidClass: 'border-red-500',
        ...window.clientValidationConfig,
        ...config
    };

    if (window.Alpine) {
        registerAlpine(window.Alpine);
        registerLivewireDirective(window.Alpine);
    } else {
        document.addEventListener('alpine:init', () => {
            registerAlpine(window.Alpine);
            registerLivewireDirective(window.Alpine);
        });
    }

    autoInit();
    return window.LaravelClientValidation;
}

if (typeof window !== 'undefined') {
    window.LaravelClientValidation = {
        Validator: LaravelValidator,
        RuleRegistry,
        RemoteValidator,
        EventEmitter,
        registerAlpine,
        VanillaFormValidator,
        initForms,
        createFormValidator,
        LivewireValidator,
        createLivewireValidator,
        registerLivewireDirective,
        // React
        ReactValidator,
        createReactValidator,
        useReactValidation,
        createFieldProps,
        getErrorProps,
        // Vue
        createVueValidator,
        useVueValidation,
        vValidate,
        VueValidationPlugin,
        ValidationMixin,
        config: {},
        init,
        extend(name, validator, message = null) {
            RuleRegistry.extend(name, validator, message);
        }
    };

    if (window.Alpine) {
        registerAlpine(window.Alpine);
        registerLivewireDirective(window.Alpine);
    } else {
        document.addEventListener('alpine:init', () => {
            registerAlpine(window.Alpine);
            registerLivewireDirective(window.Alpine);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => init(window.clientValidationConfig || {}));
    } else {
        init(window.clientValidationConfig || {});
    }
}

// ES Module exports
export {
    LaravelValidator,
    LaravelValidator as Validator,
    RuleRegistry,
    RemoteValidator,
    EventEmitter,
    registerAlpine,
    VanillaFormValidator,
    initForms,
    createFormValidator,
    LivewireValidator,
    createLivewireValidator,
    registerLivewireDirective,
    // React
    ReactValidator,
    createReactValidator,
    useReactValidation,
    createFieldProps,
    getErrorProps,
    // Vue
    createVueValidator,
    useVueValidation,
    vValidate,
    VueValidationPlugin,
    ValidationMixin,
    init
};

export default LaravelValidator;

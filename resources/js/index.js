/**
 * Laravel Client Validation
 *
 * Provides client-side validation for Laravel validation rules.
 * Works with Alpine.js, Vanilla JS, or any framework.
 *
 * @example With Alpine.js
 * <input x-validate="'required|email'" name="email">
 *
 * @example With Vanilla JS
 * <form data-validate>
 *     <input name="email" data-rules="required|email">
 * </form>
 *
 * @example Programmatic
 * const validator = new LaravelClientValidation.Validator({
 *     rules: { email: 'required|email' }
 * });
 * const result = await validator.validateField('email', 'test@example.com');
 */

// Core
import LaravelValidator from './core/LaravelValidator.js';
import RuleRegistry from './core/RuleRegistry.js';
import RemoteValidator from './core/RemoteValidator.js';
import EventEmitter from './core/EventEmitter.js';

// Adapters
import registerAlpine from './adapters/alpine.js';
import vanillaAdapter, { VanillaFormValidator, initForms, createFormValidator, autoInit } from './adapters/vanilla.js';

// Legacy support
import LegacyClientValidator from './core/validator.js';
import legacyAlpineIntegration from './integrations/alpine.js';

/**
 * Main entry point - auto-registers with Alpine and initializes vanilla forms
 */
function init(config = {}) {
    // Store config globally
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

    // Register with Alpine if available
    if (window.Alpine) {
        registerAlpine(window.Alpine);
    } else {
        document.addEventListener('alpine:init', () => {
            registerAlpine(window.Alpine);
        });
    }

    // Auto-init vanilla forms
    autoInit();

    return window.LaravelClientValidation;
}

// Auto-initialize on load
if (typeof window !== 'undefined') {
    // Expose API globally
    window.LaravelClientValidation = {
        // Core
        Validator: LaravelValidator,
        RuleRegistry,
        RemoteValidator,
        EventEmitter,

        // Adapters
        registerAlpine,
        VanillaFormValidator,
        initForms,
        createFormValidator,

        // Legacy compatibility
        ClientValidator: LegacyClientValidator,

        // Config (will be set by init)
        config: {},

        // Initialize
        init,

        // Utility: extend with custom rule
        extend(name, validator, message = null) {
            RuleRegistry.extend(name, validator, message);
        }
    };

    // Legacy alias
    window.LaravelValidator = {
        ClientValidator: LegacyClientValidator,
        Validator: LegacyClientValidator
    };

    // Auto-register Alpine integration
    if (window.Alpine) {
        registerAlpine(window.Alpine);
        legacyAlpineIntegration(window.Alpine);
    } else {
        document.addEventListener('alpine:init', () => {
            registerAlpine(window.Alpine);
            legacyAlpineIntegration(window.Alpine);
        });
    }

    // Auto-init when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            init(window.clientValidationConfig || {});
        });
    } else {
        init(window.clientValidationConfig || {});
    }
}

// Exports for ES modules
export {
    // Core
    LaravelValidator,
    LaravelValidator as Validator,
    RuleRegistry,
    RemoteValidator,
    EventEmitter,

    // Adapters
    registerAlpine,
    VanillaFormValidator,
    initForms,
    createFormValidator,

    // Legacy
    LegacyClientValidator as ClientValidator,
    legacyAlpineIntegration as alpineIntegration,

    // Init
    init
};

export default LaravelValidator;

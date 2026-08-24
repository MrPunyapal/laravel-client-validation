/**
 * Vue Adapter for Laravel Client Validation
 * Provides composables and directives for Vue 3 applications.
 */

import LaravelValidator from '@laravel-client-validation/core';

const defaults = {
  remoteUrl: '/client-validation/validate',
  debounce: 300,
  errorClass: 'text-red-500 text-sm mt-1',
  validClass: 'border-green-500',
  invalidClass: 'border-red-500',
};

// Options captured by VueValidationPlugin.install() so the v-validate
// directive (which reads config at mount time) honors app.use() options
// instead of only window-level config.
let pluginOptions = null;

function getConfig() {
  if (pluginOptions) {
    return { ...defaults, ...windowConfig(), ...pluginOptions };
  }
  if (typeof window !== 'undefined' && window.LaravelClientValidation?.config) {
    return { ...defaults, ...window.LaravelClientValidation.config };
  }
  return defaults;
}

function windowConfig() {
  return (typeof window !== 'undefined' && window.LaravelClientValidation?.config) || {};
}

/**
 * Vue 3 composable for form validation.
 *
 * Returns a plain object: mutations are NOT reactive by themselves. Wrap
 * values you render in your own `ref`/`reactive` state (see docs), or use
 * the v-validate directive / VueValidationPlugin for automatic rendering.
 *
 * @param {Object} options - Validation options
 * @returns {Object} - Validation state and methods
 */
export function useValidation(options = {}) {
  const config = { ...getConfig(), ...options };

  const state = {
    errors: {},
    touched: new Set(),
    validating: false,
    pendingValidations: 0,
  };

  let validator = null;

  const beginValidating = () => {
    state.pendingValidations++;
    state.validating = true;
  };

  const endValidating = () => {
    state.pendingValidations--;
    state.validating = state.pendingValidations > 0;
  };

  const init = () => {
    if (!validator && options.rules) {
      validator = new LaravelValidator({
        rules: options.rules,
        messages: options.messages || {},
        attributes: options.attributes || {},
        remoteUrl: config.remoteUrl,
        debounce: config.debounce,
      });
    }
    return validator;
  };

  const validateField = async (field, value, allData = {}) => {
    init();
    if (!validator) return { valid: true, errors: [] };

    state.touched.add(field);
    beginValidating();

    try {
      const result = await validator.validateField(field, value, allData);
      if (result.errors.length > 0) {
        state.errors[field] = result.errors;
      } else {
        delete state.errors[field];
      }
      return result;
    } finally {
      endValidating();
    }
  };

  const validateAll = async (data = {}) => {
    init();
    if (!validator) return { valid: true, errors: {} };

    beginValidating();

    try {
      const result = await validator.validateAll(data);
      Object.entries(result.results).forEach(([field, fieldResult]) => {
        state.touched.add(field);
        if (fieldResult.errors.length > 0) {
          state.errors[field] = fieldResult.errors;
        } else {
          delete state.errors[field];
        }
      });
      return result;
    } finally {
      endValidating();
    }
  };

  const hasError = (field) => (state.errors[field]?.length || 0) > 0;
  const getError = (field) => state.errors[field]?.[0] || null;
  const getErrors = (field) => state.errors[field] || [];
  const getAllErrors = () => ({ ...state.errors });

  const clearErrors = (field = null) => {
    if (field) {
      delete state.errors[field];
      state.touched.delete(field);
    } else {
      // Mutate in place so consumers holding the `errors` reference stay in sync.
      Object.keys(state.errors).forEach(key => delete state.errors[key]);
      state.touched.clear();
    }
    if (validator) validator.clearErrors(field);
  };

  const isTouched = (field) => state.touched.has(field);
  const isValid = (field) => isTouched(field) && !hasError(field);
  const hasErrors = () => Object.values(state.errors).some(e => e.length > 0);

  const reset = () => {
    clearErrors();
    if (validator) validator.clearErrors();
  };

  const destroy = () => {
    if (validator) validator.destroy();
  };

  if (options.rules) {
    init();
  }

  return {
    // State
    errors: state.errors,
    get validating() { return state.validating; },

    // Methods
    init,
    validateField,
    validateAll,
    hasError,
    getError,
    getErrors,
    getAllErrors,
    clearErrors,
    isTouched,
    isValid,
    hasErrors,
    reset,
    destroy,
  };
}

/**
 * Create a validator instance for use outside Vue
 */
export function createVueValidator(options = {}) {
  return useValidation(options);
}

/**
 * Vue 3 Directive for field validation
 * Usage: v-validate="'required|email'" or v-validate.live="'required|min:3'"
 */
export const vValidate = {
  mounted(el, binding) {
    const config = getConfig();
    const rules = binding.value;
    const fieldName = el.name || el.getAttribute('data-field');

    if (!fieldName || !rules) {
      console.warn('v-validate: Element must have a name attribute and rules');
      return;
    }

    const isLive = binding.modifiers.live;

    const validator = new LaravelValidator({
      rules: { [fieldName]: rules },
      ...config
    });

    el._validator = validator;
    el._fieldName = fieldName;

    const getFormData = () => {
      const form = el.closest('form');
      if (!form) return {};

      const data = {};
      form.querySelectorAll('[name]').forEach(field => {
        if (field.type === 'checkbox') {
          data[field.name] = field.checked;
        } else if (field.type === 'radio') {
          const checked = form.querySelector(`input[name="${field.name}"]:checked`);
          data[field.name] = checked?.value || '';
        } else {
          data[field.name] = field.value;
        }
      });
      return data;
    };

    const updateUI = (result) => {
      // Only use the next sibling when it is an actual error container;
      // otherwise we would overwrite unrelated markup.
      const nextSibling = el.nextElementSibling?.classList?.contains('validation-error')
        ? el.nextElementSibling
        : null;
      const errorContainer = el.parentElement?.querySelector(`[data-error="${fieldName}"]`)
                || el.parentElement?.querySelector('.validation-error')
                || nextSibling;

      el.classList.remove(...config.validClass.split(' '));
      el.classList.remove(...config.invalidClass.split(' '));

      if (result.valid) {
        el.classList.add(...config.validClass.split(' '));
        if (errorContainer) errorContainer.textContent = '';
      } else {
        el.classList.add(...config.invalidClass.split(' '));
        if (errorContainer) {
          errorContainer.textContent = result.errors[0] || '';
        }
      }
    };

    const validate = async () => {
      const value = el.type === 'checkbox' ? el.checked : el.value;
      const result = await validator.validateField(fieldName, value, getFormData());
      updateUI(result);
      return result.valid;
    };

    let debounceTimer;
    const validateDebounced = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(validate, config.debounce);
    };

    if (isLive) {
      el.addEventListener('input', validateDebounced);
    }
    el.addEventListener('blur', validate);

    el.validate = validate;

    el._cleanup = () => {
      clearTimeout(debounceTimer);
      el.removeEventListener('input', validateDebounced);
      el.removeEventListener('blur', validate);
      validator.destroy();
    };
  },

  unmounted(el) {
    el._cleanup?.();
  }
};

/**
 * Vue Plugin
 */
export const VueValidationPlugin = {
  install(app, options = {}) {
    const config = { ...getConfig(), ...options };

    // Directive mounts read getConfig(); make install-time options win.
    pluginOptions = options;

    // Register global directive
    app.directive('validate', vValidate);

    // Provide validation config
    app.provide('validationConfig', config);

    // Add global method
    app.config.globalProperties.$validation = {
      create: (opts) => useValidation({ ...config, ...opts }),
    };
  }
};

/**
 * Validation mixin for Options API
 */
export const ValidationMixin = {
  data() {
    return {
      validation: {
        errors: {},
        touched: new Set(),
        validating: false,
      }
    };
  },

  methods: {
    initValidation(options = {}) {
      this._validator = new LaravelValidator({
        rules: options.rules || this.$options.validationRules || {},
        messages: options.messages || this.$options.validationMessages || {},
        attributes: options.attributes || {},
        ...getConfig(),
      });
    },

    async validateField(field, value, allData = {}) {
      if (!this._validator) this.initValidation();

      this.validation.touched.add(field);
      this.validation.validating = true;

      try {
        const result = await this._validator.validateField(field, value, allData || this.getFormData());
        this.$set ? this.$set(this.validation.errors, field, result.errors) : (this.validation.errors[field] = result.errors);
        return result;
      } finally {
        this.validation.validating = false;
      }
    },

    async validateAll(data = {}) {
      if (!this._validator) this.initValidation();

      this.validation.validating = true;

      try {
        const result = await this._validator.validateAll(data || this.getFormData());
        Object.entries(result.results).forEach(([field, fieldResult]) => {
          this.validation.touched.add(field);
          if (this.$set) {
            this.$set(this.validation.errors, field, fieldResult.errors);
          } else {
            this.validation.errors[field] = fieldResult.errors;
          }
        });
        return result;
      } finally {
        this.validation.validating = false;
      }
    },

    hasError(field) {
      return (this.validation.errors[field]?.length || 0) > 0;
    },

    getError(field) {
      return this.validation.errors[field]?.[0] || null;
    },

    clearErrors(field = null) {
      if (field) {
        delete this.validation.errors[field];
        this.validation.touched.delete(field);
      } else {
        this.validation.errors = {};
        this.validation.touched.clear();
      }
      if (this._validator) this._validator.clearErrors(field);
    },

    getFormData() {
      // Override in component to provide form data
      return {};
    }
  },

  beforeUnmount() {
    if (this._validator) {
      this._validator.destroy();
    }
  }
};

export default {
  useValidation,
  createVueValidator,
  vValidate,
  VueValidationPlugin,
  ValidationMixin,
};

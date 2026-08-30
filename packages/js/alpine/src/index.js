/**
 * Alpine.js Adapter for Laravel Client Validation
 * Provides x-validate directive and validation() data component.
 */

import LaravelValidator from '@laravel-client-validation/core';

const defaults = {
  remoteUrl: '/client-validation/validate',
  debounce: 300,
  errorClass: 'text-red-500 text-sm mt-1',
  validClass: 'border-green-500',
  invalidClass: 'border-red-500',
};

function getConfig() {
  if (typeof window !== 'undefined' && window.LaravelClientValidation?.config) {
    return { ...defaults, ...window.LaravelClientValidation.config };
  }
  return defaults;
}

function getFieldValidationMetadata(el, fieldName) {
  const messagesValue = el.getAttribute('data-client-validation-messages');
  let messages = {};

  if (messagesValue) {
    try {
      messages = JSON.parse(messagesValue);
    } catch (error) {
      console.warn('x-validate: Invalid validation messages metadata', error);
    }
  }

  const attribute = el.getAttribute('data-client-validation-attribute');

  return {
    messages,
    attributes: attribute ? { [fieldName]: attribute } : {},
  };
}

/**
 * Register Alpine.js integration
 */
export default function registerAlpine(Alpine) {
  const config = getConfig();

  // x-validate Directive: <input x-validate="'required|email'" name="email">
  // Modifiers: .blur (default), .live, .submit
  Alpine.directive('validate', (el, { expression, modifiers }, { evaluate, effect, cleanup }) => {
    const fieldName = el.name || el.getAttribute('data-field');
    if (!fieldName) {
      console.warn('x-validate: Element must have a name attribute');
      return;
    }

    const mode = modifiers.includes('live') ? 'live'
      : modifiers.includes('submit') ? 'submit'
        : 'blur';

    let validator = null;
    let unsubscribers = [];

    effect(() => {
      const rules = evaluate(expression);
      if (!rules) return;

      // Re-runs must tear down previous listeners and validator first.
      unsubscribers.forEach(fn => fn());
      unsubscribers = [];
      if (validator) validator.destroy();

      validator = new LaravelValidator({
        rules: { [fieldName]: rules },
        ...getFieldValidationMetadata(el, fieldName),
        ...config
      });

      el._validator = validator;
      el._fieldName = fieldName;

      unsubscribers = setupFieldHandlers(el, validator, fieldName, mode, config);
    });

    cleanup(() => {
      unsubscribers.forEach(fn => fn());
      if (validator) validator.destroy();
    });
  });

  // validation() Alpine Data Component - full form validation with reactive state
  Alpine.data('validation', (options = {}) => ({
    form: {},
    _validator: null,
    errors: {},
    touched: {},
    validating: false,

    init() {
      const rules = options.rules || {};
      const messages = options.messages || {};
      const attributes = options.attributes || {};

      this.form = Object.keys(rules).reduce((acc, field) => {
        acc[field] = options.initialData?.[field] ?? '';
        return acc;
      }, {});

      this._validator = new LaravelValidator({
        rules,
        messages,
        attributes,
        ...config,
        ...options.config
      });

      this._validator.afterFieldValidate(({ field, valid, errors }) => {
        this.touched[field] = true;
        if (valid) {
          delete this.errors[field];
        } else {
          this.errors[field] = errors;
        }
      });
    },

    async validate(field) {
      if (!this._validator) return true;
      const result = await this._validator.validateField(field, this.form[field], this.form);
      return result.valid;
    },

    async validateLive(field) {
      if (!this._validator) return true;
      const result = await this._validator.validateFieldDebounced(field, this.form[field], this.form);
      return result.valid;
    },

    async validateAll() {
      if (!this._validator) return true;
      this.validating = true;
      const result = await this._validator.validateAll(this.form);
      this.validating = false;
      this.errors = { ...result.errors };
      return result.valid;
    },

    async submit(callback) {
      const isValid = await this.validateAll();
      if (isValid && callback) {
        try {
          await callback(this.form);
        } catch (err) {
          console.error('Form submission error:', err);
        }
      }
      return isValid;
    },

    error(field) {
      return this.errors[field]?.[0] || '';
    },

    errorList(field) {
      return this.errors[field] || [];
    },

    hasError(field) {
      return !!this.errors[field]?.length;
    },

    hasErrors() {
      return Object.keys(this.errors).length > 0;
    },

    clearError(field = null) {
      if (field) {
        delete this.errors[field];
        delete this.touched[field];
      } else {
        this.errors = {};
        this.touched = {};
      }
      this._validator?.clearErrors(field);
    },

    isTouched(field) {
      return !!this.touched[field];
    },

    isValid(field = null) {
      if (field) {
        return this.touched[field] && !this.hasError(field);
      }
      return !this.hasErrors() && Object.keys(this.touched).length > 0;
    },

    stateClass(field, validClass = '', invalidClass = '') {
      if (!this.touched[field]) return '';
      return this.hasError(field) ? (invalidClass || config.invalidClass) : (validClass || config.validClass);
    },

    reset() {
      const rules = options.rules || {};
      this.form = Object.keys(rules).reduce((acc, field) => {
        acc[field] = options.initialData?.[field] ?? '';
        return acc;
      }, {});
      this.clearError();
      this._validator?.reset();
    },

    destroy() {
      this._validator?.destroy();
    }
  }));

  // $validation magic for accessing validation in any component
  Alpine.magic('validation', (el) => {
    let current = el;
    while (current) {
      if (current._x_dataStack) {
        for (const data of current._x_dataStack) {
          if (data._validator) {
            return data;
          }
        }
      }
      current = current.parentElement;
    }
    return null;
  });
}

/**
 * Gather current values of sibling named fields so rules like `confirmed`,
 * `same:x`, or `required_if:y` can compare against them in bare-directive
 * mode (no validation() component supplying form state). Preference order:
 * enclosing <form> → enclosing x-data root → whole document.
 */
function collectSiblingData(el) {
  const scope = el.closest('form')
    || (function findXDataRoot() {
      let node = el;
      while ((node = node.parentElement)) {
        if (node.hasAttribute && node.hasAttribute('x-data')) return node;
      }
      return null;
    })()
    || el.ownerDocument;

  const data = {};
  scope.querySelectorAll('input[name], select[name], textarea[name]').forEach((input) => {
    if (input === el || input.type === 'file' || !input.name) return;
    if (input.type === 'checkbox') {
      data[input.name] = input.checked;
    } else if (input.type === 'radio') {
      if (input.checked) data[input.name] = input.value;
    } else {
      data[input.name] = input.value;
    }
  });

  // The field's own value is supplied separately by the caller; keep it out
  // of the sibling snapshot unless a duplicate name exists.
  delete data[el.name];

  return data;
}

const submitGuardedForms = new WeakSet();

/**
 * Let any validated field inside a `<form>` participate in form submission:
 * on submit every bound field in the form is re-validated, and the submission
 * is blocked until all of them pass. This makes `x-validate` / `.live` fields
 * gate the form too, not just fields explicitly using the `.submit` modifier.
 */
function ensureFormSubmitGuard(form) {
  if (submitGuardedForms.has(form)) return;
  submitGuardedForms.add(form);

  // Let the package render validation feedback instead of the browser's
  // native constraint popup before the submit event reaches this guard.
  form.setAttribute('novalidate', 'novalidate');

  const submitHandler = async (e) => {
    const fields = Array.from(form.querySelectorAll('input, select, textarea'))
      .filter((field) => field._validator && typeof field.validate === 'function');

    if (fields.length === 0) return;

    const results = await Promise.all(fields.map((field) => field.validate()));

    if (results.some((valid) => !valid)) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  form.addEventListener('submit', submitHandler, true);
}

function setupFieldHandlers(el, validator, fieldName, mode, config) {
  const unsubscribers = [];

  const validateField = async () => {
    const value = getFieldValue(el);
    const result = await validator.validateField(fieldName, value, collectSiblingData(el));
    updateFieldUI(el, result, config);
    return result.valid;
  };

  const validateFieldDebounced = async () => {
    const value = getFieldValue(el);
    const result = await validator.validateFieldDebounced(fieldName, value, collectSiblingData(el));
    updateFieldUI(el, result, config);
    return result.valid;
  };

  const form = el.closest('form');
  if (form) {
    ensureFormSubmitGuard(form);
  }

  switch (mode) {
    case 'live':
      el.addEventListener('input', validateFieldDebounced);
      el.addEventListener('blur', validateField);
      unsubscribers.push(() => {
        el.removeEventListener('input', validateFieldDebounced);
        el.removeEventListener('blur', validateField);
      });
      break;

    // The .submit modifier needs no per-field listener: the shared form guard
    // already blocks submission until every bound field in the form passes.
    case 'submit':
      break;

    case 'blur':
    default:
      el.addEventListener('blur', validateField);
      unsubscribers.push(() => el.removeEventListener('blur', validateField));
      break;
  }

  el.validate = validateField;

  return unsubscribers;
}

function getFieldValue(el) {
  if (el.type === 'checkbox') {
    return el.checked ? (el.value || true) : false;
  }
  if (el.tagName === 'SELECT' && el.multiple) {
    return Array.from(el.selectedOptions).map(option => option.value);
  }
  if (el.type === 'radio') {
    const form = el.closest('form') || document;
    const checked = form.querySelector(`input[name="${el.name}"]:checked`);
    return checked ? checked.value : '';
  }
  if (el.type === 'file') {
    return el.files;
  }
  return el.value;
}

function updateFieldUI(el, result, config) {
  const existingError = el.parentNode.querySelector(`[data-error-for="${el.name}"]`);
  if (existingError) {
    existingError.remove();
  }

  // Config classes may contain multiple tokens ("is-valid border-green-500").
  const validClasses = String(config.validClass || '').split(' ').filter(Boolean);
  const invalidClasses = String(config.invalidClass || '').split(' ').filter(Boolean);
  el.classList.remove(...validClasses, ...invalidClasses);

  if (result.valid) {
    el.classList.add(...validClasses);
  } else {
    el.classList.add(...invalidClasses);

    if (result.errors.length > 0 && config.showErrors !== false) {
      const errorEl = document.createElement('div');
      errorEl.setAttribute('data-error-for', el.name);
      errorEl.className = config.errorClass;
      errorEl.textContent = result.errors[0];
      el.parentNode.insertBefore(errorEl, el.nextSibling);
    }
  }

  el.dispatchEvent(new CustomEvent('validated', { detail: result, bubbles: true }));
}

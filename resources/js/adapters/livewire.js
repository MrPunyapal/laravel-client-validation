/**
 * Livewire Adapter for Laravel Client Validation
 * Supports both Livewire v3 and v4.
 */

import LaravelValidator from '../core/LaravelValidator.js';

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

function getLivewireVersion() {
  if (typeof window === 'undefined' || !window.Livewire) return null;
  if (typeof window.Livewire.interceptMessage === 'function') return 4;
  return 3;
}

function getComponentData(component) {
  if (!component || !component.$wire) return {};

  try {
    const snapshot = typeof component.$wire.snapshot === 'object'
      ? component.$wire.snapshot
      : null;

    // Data lives under memo.data in both Livewire v3 and v4 snapshots.
    const data = snapshot?.memo?.data ?? snapshot?.data ?? {};

    return typeof data === 'object' && !Array.isArray(data) ? { ...data } : {};
  } catch {
    return {};
  }
}

/**
 * Resolve the wire:model property name of an element.
 * Supports wire:model and its modifiers (.blur, .live, .change, .defer).
 */
function getWireFieldName(el) {
  for (const attr of el.getAttributeNames()) {
    if (attr === 'wire:model' || attr.startsWith('wire:model.')) {
      return el.getAttribute(attr);
    }
  }
  return null;
}


export class LivewireValidator {
  constructor(component, options = {}) {
    this.component = component;
    this.config = { ...getConfig(), ...options };
    this.validator = null;
    this.fields = new Map();
    this.errors = {};
    this.touched = new Set();
    this.eventListeners = [];

    if (options.rules) {
      this.init(options);
    }
  }

  init(options) {
    this.validator = new LaravelValidator({
      rules: options.rules || {},
      messages: options.messages || {},
      attributes: options.attributes || {},
      remoteUrl: this.config.remoteUrl,
      debounce: this.config.debounce,
    });

    this.validator.on('field:validated', ({ field, errors }) => {
      this.errors[field] = errors;
      this.touched.add(field);
      this.syncErrorsToLivewire(field, errors);
    });
  }

  syncErrorsToLivewire(field, errors) {
    if (!this.component || !this.component.$wire) return;

    try {
      if (errors.length > 0) {
        this.component.$wire.dispatch('client-validation-error', {
          field,
          errors
        });
      } else {
        this.component.$wire.dispatch('client-validation-cleared', { field });
      }
    } catch (e) {
      // Livewire may not be ready
    }
  }

  async validateField(field, value, allData = {}) {
    if (!this.validator) return { valid: true, errors: [] };

    const data = this.getFormData(allData);
    const result = await this.validator.validateField(field, value, data);

    this.updateFieldUI(field, result);
    return result;
  }

  async validateFieldDebounced(field, value, allData = {}) {
    if (!this.validator) return { valid: true, errors: [] };

    const data = this.getFormData(allData);
    return this.validator.validateFieldDebounced(field, value, data);
  }

  async validateAll(data = {}) {
    if (!this.validator) return { valid: true, errors: {} };

    const formData = this.getFormData(data);
    const result = await this.validator.validateAll(formData);

    Object.entries(result.results).forEach(([field, fieldResult]) => {
      this.updateFieldUI(field, fieldResult);
    });

    return result;
  }

  getFormData(additionalData = {}) {
    const data = { ...additionalData };

    if (this.component) {
      Object.assign(data, getComponentData(this.component));
    }

    this.fields.forEach((el, name) => {
      if (el && el.value !== undefined) {
        data[name] = this.getFieldValue(el);
      }
    });

    return data;
  }

  getFieldValue(el) {
    if (el.type === 'checkbox') {
      return el.checked;
    }
    if (el.type === 'radio') {
      const form = el.closest('form');
      const checked = form?.querySelector(`input[name="${el.name}"]:checked`);
      return checked?.value || '';
    }
    if (el.tagName === 'SELECT' && el.multiple) {
      return Array.from(el.selectedOptions).map(o => o.value);
    }
    return el.value;
  }

  updateFieldUI(field, result) {
    const el = this.fields.get(field) || document.querySelector(`[name="${field}"]`);
    if (!el) return;

    const errorContainer = this.findErrorContainer(el, field);

    el.classList.remove(...this.config.validClass.split(' '));
    el.classList.remove(...this.config.invalidClass.split(' '));

    if (result.valid) {
      el.classList.add(...this.config.validClass.split(' '));
      if (errorContainer) errorContainer.textContent = '';
    } else {
      el.classList.add(...this.config.invalidClass.split(' '));
      if (errorContainer) {
        errorContainer.textContent = result.errors[0] || '';
      }
    }
  }

  findErrorContainer(el, field) {
    let container = el.parentElement?.querySelector(`[data-error="${field}"]`);
    if (!container) {
      container = el.parentElement?.querySelector('.validation-error');
    }
    if (!container) {
      container = el.nextElementSibling;
      if (container && !container.classList.contains('validation-error')) {
        container = null;
      }
    }
    return container;
  }

  registerField(name, element) {
    this.fields.set(name, element);
    return this;
  }

  hasError(field) {
    return (this.errors[field]?.length || 0) > 0;
  }

  getError(field) {
    return this.errors[field]?.[0] || null;
  }

  getErrors(field) {
    return this.errors[field] || [];
  }

  getAllErrors() {
    return { ...this.errors };
  }

  clearErrors(field = null) {
    if (field) {
      delete this.errors[field];
      this.touched.delete(field);
    } else {
      this.errors = {};
      this.touched.clear();
    }
    if (this.validator) {
      this.validator.clearErrors(field);
    }
  }

  isTouched(field) {
    return this.touched.has(field);
  }

  isValid(field) {
    return this.isTouched(field) && !this.hasError(field);
  }

  destroy() {
    this.eventListeners.forEach(({ el, event, handler }) => {
      el.removeEventListener(event, handler);
    });
    this.eventListeners = [];
    this.fields.clear();
    this.errors = {};
    this.touched.clear();
  }
}

export function createLivewireValidator(component, options = {}) {
  return new LivewireValidator(component, options);
}

export function registerLivewireDirective(Alpine) {
  if (!Alpine) return;

  const config = getConfig();

  Alpine.directive('wire-validate', (el, { expression, modifiers }, { evaluate, effect, cleanup }) => {
    const fieldName = el.name
            || el.getAttribute('wire:model')
            || el.getAttribute('wire:model.live')
            || el.getAttribute('wire:model.blur')
            || el.getAttribute('wire:model.change')
            || el.getAttribute('data-field');
    if (!fieldName) {
      console.warn('x-wire-validate: Element must have a name or wire:model attribute');
      return;
    }

    const mode = modifiers.includes('live') ? 'live'
      : modifiers.includes('blur') ? 'blur'
        : 'blur';

    let validator = null;
    let unsubscribers = [];

    effect(() => {
      const rules = evaluate(expression);
      if (!rules) return;

      validator = new LaravelValidator({
        rules: { [fieldName]: rules },
        ...config
      });

      el._validator = validator;
      el._fieldName = fieldName;

      unsubscribers = setupLivewireFieldHandlers(el, validator, fieldName, mode, config);
    });

    cleanup(() => {
      unsubscribers.forEach(fn => fn());
      if (validator) validator.destroy();
    });
  });
}

function setupLivewireFieldHandlers(el, validator, fieldName, mode, config) {
  const unsubscribers = [];

  const getFormData = () => {
    const form = el.closest('form');
    if (!form) return {};

    const data = {};
    form.querySelectorAll('[name]').forEach(field => {
      data[field.name] = getFieldValue(field);
    });
    return data;
  };

  const getFieldValue = (field) => {
    if (field.type === 'checkbox') return field.checked;
    if (field.type === 'radio') {
      const form = field.closest('form');
      const checked = form?.querySelector(`input[name="${field.name}"]:checked`);
      return checked?.value || '';
    }
    return field.value;
  };

  const updateUI = (result) => {
    const errorContainer = el.parentElement?.querySelector(`[data-error="${fieldName}"]`)
            || el.parentElement?.querySelector('.validation-error')
            || el.nextElementSibling;

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
    const value = getFieldValue(el);
    const result = await validator.validateField(fieldName, value, getFormData());
    updateUI(result);

    const wireEl = el.closest('[wire\\:id]');
    if (window.Livewire && wireEl) {
      const wireId = wireEl.getAttribute('wire:id');
      const component = window.Livewire.find(wireId);
      if (component) {
        const version = getLivewireVersion();

        if (version === 4 && typeof component.$dispatch === 'function') {
          component.$dispatch('client-validation', {
            field: fieldName,
            valid: result.valid,
            errors: result.errors
          });
        } else if (component.dispatch) {
          component.dispatch('client-validation', {
            field: fieldName,
            valid: result.valid,
            errors: result.errors
          });
        }
      }
    }

    return result.valid;
  };

  const validateDebounced = debounce(validate, config.debounce);

  if (mode === 'live') {
    el.addEventListener('input', validateDebounced);
    unsubscribers.push(() => el.removeEventListener('input', validateDebounced));
  }

  el.addEventListener('blur', validate);
  unsubscribers.push(() => el.removeEventListener('blur', validate));

  el.validate = validate;

  return unsubscribers;
}

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Auto-bind client validation to Livewire components that expose a
 * `clientValidation` payload in their snapshot (injected by the
 * ClientValidationHook for components using the WithClientValidation trait).
 *
 * No Blade changes are required: every [wire:model] element whose field has
 * rules is validated on blur/input, and forms with wire:submit are blocked
 * until all fields pass validation.
 */
export function autoBindLivewireComponents(options = {}) {
  if (typeof window === 'undefined' || !window.Livewire || typeof window.Livewire.hook !== 'function') {
    return;
  }

  const globalConfig = getConfig();

  // Hook future component initializations...
  // Note: Livewire's component.init payload is { component, cleanup } — the
  // root element is component.el.
  window.Livewire.hook('component.init', ({ component }) => {
    try {
      bindComponent(component, component?.el, options, globalConfig);
    } catch (e) {
      console.error('[client-validation] bind failed:', e);
    }
  });

  // ...and bind anything that was already initialized before this call
  // (our script may load after Livewire has started).
  try {
    const existing = typeof window.Livewire.all === 'function' ? window.Livewire.all() : [];
    existing.forEach((component) => {
      bindComponent(component, component?.el, options, globalConfig);
    });
  } catch {
    // Livewire internals not ready — the hook above covers later inits.
  }
}

function bindComponent(component, el, options, globalConfig) {
  if (!component || !el || typeof el.querySelectorAll !== 'function') return;

  let payload;
  try {
    payload = component.snapshot?.memo?.clientValidation
                || component.$wire?.snapshot?.memo?.clientValidation;
  } catch {
    return;
  }

  if (!payload || typeof payload.rules !== 'object' || Object.keys(payload.rules).length === 0) {
    return;
  }

  if (component._clientValidation) return;

  // Per-component config: package config < window config < payload config < options
  const payloadConfig = payload.config || {};
  const mode = options.mode || payloadConfig.validation_mode || globalConfig.mode || 'blur';
  const debounceMs = options.debounce ?? payloadConfig.debounce_ms ?? globalConfig.debounce ?? 300;
  const showErrors = options.showErrors ?? globalConfig.showErrors ?? true;
  const fieldStyling = options.fieldStyling ?? globalConfig.fieldStyling ?? true;
  const errorClass = options.errorClass || payloadConfig.error_template?.container_class || globalConfig.errorClass || 'validation-error text-red-500 text-sm mt-1';
  const validClass = options.validClass ?? globalConfig.validClass ?? '';
  const invalidClass = options.invalidClass ?? globalConfig.invalidClass ?? '';

  const validator = new LaravelValidator({
    rules: payload.rules,
    messages: payload.messages || {},
    attributes: payload.attributes || {},
    remoteUrl: payloadConfig.ajax_url || globalConfig.remoteUrl,
    debounce: debounceMs,
    enableAjax: options.enableAjax ?? payloadConfig.enable_ajax ?? true,
    stopOnFirstError: false,
  });

  const state = { validator, cleanups: [], shownErrors: new Set() };

  const showError = (field, message) => {
    if (!showErrors) return;
    const container = ensureErrorContainer(el, field, errorClass);
    container.textContent = message || '';
    container.style.display = message ? '' : 'none';

    if (message) state.shownErrors.add(field);
    else state.shownErrors.delete(field);
  };

  const styleField = (input, valid) => {
    if (!fieldStyling || (!validClass && !invalidClass)) return;
    input.classList.remove(...validClass.split(' ').filter(Boolean));
    input.classList.remove(...invalidClass.split(' ').filter(Boolean));
    input.classList.add(...(valid ? validClass : invalidClass).split(' ').filter(Boolean));
  };

  // Fields whose validation depends on sibling values ("confirmed",
  // required_if:role, same:other, gt:other ...) should revalidate when
  // that sibling changes, so stale errors clear without a submit.
  const revalidateDependents = (changedField) => {
    Object.entries(validator.rules).forEach(([otherField, ruleStrings]) => {
      if (otherField === changedField || !validator.isTouched(otherField)) return;

      const dependsOnChanged = ruleStrings.some((ruleString) => {
        if (ruleString.startsWith('ajax:')) return false;
        const [name, paramPart] = ruleString.split(':');
        if (!paramPart) return name === 'confirmed'
            && `${otherField}_confirmation` === changedField;
        return paramPart.split(',').includes(changedField);
      });

      if (!dependsOnChanged) return;

      const input = findFieldInput(el, otherField);
      if (input) validateInput(input, otherField, true);
    });
  };

  const validateInput = async (input, field, immediate = false) => {
    const value = getInputValue(input);
    const allData = collectData(el);
    const run = () => validator.validateField(field, value, allData);
    const result = immediate ? await run() : await validator.validateFieldDebounced(field, value, allData);

    showError(field, result.valid ? '' : (result.errors[0] || ''));
    styleField(input, result.valid);

    dispatchComponentEvent(component, 'client-validation', {
      field,
      valid: result.valid,
      errors: result.errors,
    });

    revalidateDependents(field);

    return result.valid;
  };

  // Bind every wire:model element that has rules. Livewire morphs may
  // replace input nodes during updates, so this runs initially and again
  // after every morph (see the morphed hook below).
  const boundInputs = new WeakSet();

  const attachFieldListeners = (input) => {
    const field = getWireFieldName(input);
    if (!field || !validator.rules[field] || boundInputs.has(input)) return;
    boundInputs.add(input);

    const liveModifier = input.getAttributeNames().some(a => a.startsWith('wire:model.') &&
                  ['live', 'change'].some(m => a.includes(m)));
    const useLive = mode === 'live' || mode === 'input' || liveModifier;

    const onBlur = () => { validateInput(input, field, true); };
    const onInput = () => { validateInput(input, field); };
    const onChange = () => { validateInput(input, field, true); };

    input.addEventListener('blur', onBlur);
    if (useLive && (input.tagName === 'SELECT' || input.type === 'checkbox' || input.type === 'radio')) {
      input.addEventListener('change', onChange);
    } else if (useLive) {
      input.addEventListener('input', onInput);
    }

    state.cleanups.push(() => {
      input.removeEventListener('blur', onBlur);
      input.removeEventListener('input', onInput);
      input.removeEventListener('change', onChange);
    });
  };

  const bindAllFields = () => {
    el.querySelectorAll('[wire\\:model], [wire\\:model\\.blur], [wire\\:model\\.live], [wire\\:model\\.change], [wire\\:model\\.defer]')
      .forEach(attachFieldListeners);
  };

  bindAllFields();

  // Intercept submits of wire:submit forms until validation passes.
  // Forms can also be replaced by morphs, so this rescan runs after
  // every morph as well.
  const boundForms = new WeakSet();

  const attachFormInterceptor = (form) => {
    if (boundForms.has(form)) return;
    boundForms.add(form);

    const handler = async (event) => {
      if (form._cvBypass) {
        form._cvBypass = false;
        return; // Let the re-dispatched submit through.
      }

      event.preventDefault();
      event.stopImmediatePropagation();

      const data = collectData(el);
      const result = await validator.validateAll(data);

      Object.entries(result.results || {}).forEach(([field, fieldResult]) => {
        const input = findFieldInput(el, field);
        if (input) {
          showError(field, fieldResult.valid ? '' : (fieldResult.errors[0] || ''));
          styleField(input, fieldResult.valid);
        }
      });

      dispatchComponentEvent(component, 'client-validation-form', {
        valid: result.valid,
        errors: result.errors,
      });

      if (result.valid) {
        // Preferred: invoke the Livewire action directly through the
        // component proxy — replaying the submit via requestSubmit() can be
        // silently swallowed by native constraint validation on morphed
        // inputs, and re-dispatched events race Livewire's own handlers.
        const action = form.getAttribute('wire:submit');
        const rootEl = form.closest('[wire\\:id]');
        const owner = rootEl && typeof window.Livewire?.all === 'function'
          ? window.Livewire.all().find((c) => c.el === rootEl)
          : null;

        if (action && owner?.$wire && typeof owner.$wire.call === 'function') {
          owner.$wire.call(action.trim());
          return;
        }

        // Fallback for setups where the component proxy isn't reachable.
        form._cvBypass = true;
        if (typeof form.requestSubmit === 'function') {
          form.requestSubmit(event.submitter || undefined);
        } else {
          form.submit();
        }
      }
    };

    form.addEventListener('submit', handler, true);
    state.cleanups.push(() => form.removeEventListener('submit', handler, true));
  };

  const bindAllForms = () => {
    el.querySelectorAll('form[wire\\:submit]').forEach(attachFormInterceptor);
  };

  bindAllForms();

  // Livewire's DOM morphing wipes injected error containers when its own
  // wire:model round-trips complete — and may replace input nodes entirely.
  // After every morph: rebind replaced fields and re-apply error state.
  if (typeof window.Livewire.hook === 'function') {
    const onMorphed = ({ component: morphedComponent }) => {
      if (morphedComponent !== component) return;

      bindAllFields();
      bindAllForms();

      if (!showErrors) return;

      // Clear containers for fields that are now valid.
      [...state.shownErrors].forEach((field) => {
        if (!validator.errors[field]?.length) {
          showError(field, '');
        }
      });

      // Restore messages for fields that still have errors.
      Object.entries(validator.errors).forEach(([field, errs]) => {
        const input = findFieldInput(el, field);
        showError(field, errs[0] || '');
        if (input) styleField(input, false);
      });
    };

    window.Livewire.hook('morphed', onMorphed);
    state.cleanups.push(() => window.Livewire.removeHook?.('morphed', onMorphed));
  }

  component._clientValidation = state;
}

/**
 * Collect current values of every bound field inside a component root.
 *
 * Keys resolve from wire:model first (Livewire forms often omit the HTML
 * name attribute), falling back to the name attribute for plain inputs.
 */
export function collectData(rootEl) {
  const data = {};
  const selector = '[name], [wire\\:model], [wire\\:model\\.blur], [wire\\:model\\.live], [wire\\:model\\.change], [wire\\:model\\.defer]';

  rootEl?.querySelectorAll(selector).forEach((field) => {
    const key = getWireFieldName(field) || field.name;
    if (!key || field.type === 'file') return;
    data[key] = getInputValue(field);
  });

  return data;
}

function findFieldInput(rootEl, field) {
  const escaped = CSS.escape(field);
  return rootEl.querySelector(`[wire\\:model="${escaped}"], [wire\\:model\\.blur="${escaped}"], [wire\\:model\\.live="${escaped}"], [wire\\:model\\.change="${escaped}"], [wire\\:model\\.defer="${escaped}"]`)
        || rootEl.querySelector(`[name="${escaped}"]`);
}

function getInputValue(el) {
  if (el.type === 'checkbox') return el.checked;
  if (el.type === 'radio') {
    const form = el.closest('form');
    const checked = form?.querySelector(`input[name="${el.name}"]:checked`);
    return checked?.value || '';
  }
  if (el.tagName === 'SELECT' && el.multiple) {
    return Array.from(el.selectedOptions).map(o => o.value);
  }
  return el.value ?? '';
}

function ensureErrorContainer(rootEl, field, errorClass) {
  const input = findFieldInput(rootEl, field);
  if (!input) {
    return { textContent: '', style: {} };
  }

  const escaped = CSS.escape(field);
  let container = input.parentElement?.querySelector(`[data-error="${escaped}"]`);

  if (!container) {
    container = input.closest('div')?.querySelector(`[data-error="${escaped}"]`) ?? null;
  }

  if (!container && input.nextElementSibling?.classList?.contains('validation-error')) {
    container = input.nextElementSibling;
  }

  if (!container) {
    container = document.createElement('div');
    container.className = errorClass;
    container.setAttribute('data-error', field);
    container.style.display = 'none';
    // Append INSIDE the field's wrapper as the last child. Inserting a
    // sibling node would shift the parent's children and confuse Livewire's
    // morphing (it would replace neighbouring inputs, dropping listeners).
    // wire:ignore keeps morph from removing our node between renders.
    const wrapper = input.closest('div') || input.parentElement;
    if (wrapper) {
      container.setAttribute('wire:ignore', '');
      wrapper.appendChild(container);
    } else {
      return { textContent: '', style: {} };
    }
  }

  return container;
}

function dispatchComponentEvent(component, name, params) {
  try {
    if (typeof component.$wire?.dispatch === 'function') {
      component.$wire.dispatch(name, params);
    }
  } catch {
    // Livewire may not be ready — ignore.
  }
}

export default {
  LivewireValidator,
  createLivewireValidator,
  registerLivewireDirective,
  autoBindLivewireComponents,
};

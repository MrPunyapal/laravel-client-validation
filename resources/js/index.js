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
import { VanillaFormValidator, initForms, createFormValidator, autoInit } from './adapters/vanilla.js';
import { LivewireValidator, createLivewireValidator, registerLivewireDirective, autoBindLivewireComponents } from './adapters/livewire.js';
import { useValidation as useReactValidation, ReactValidator, createReactValidator, createFieldProps, getErrorProps } from './adapters/react.js';
import { useValidation as useVueValidation, createVueValidator, vValidate, VueValidationPlugin, ValidationMixin } from './adapters/vue.js';

/**
 * Register Alpine directives exactly once per page load, whichever order our
 * bundle, Alpine, and Livewire land in.
 *
 * When this runs after Alpine.start() has already walked the DOM (e.g. our
 * script loads late, or Livewire boots its own bundled Alpine), freshly
 * registered directives never execute on the existing tree — so we re-walk it
 * once on the next tick. Alpine skips nodes it has already initialised.
 */
function setupAlpine() {
  const alpine = typeof window !== 'undefined' ? window.Alpine : null;
  if (!alpine || !window.LaravelClientValidation) return;
  if (window.LaravelClientValidation._alpineRegistered) return;
  window.LaravelClientValidation._alpineRegistered = true;

  registerAlpine(alpine);
  registerLivewireDirective(alpine);

  // Covers the "registered after start" case; harmless otherwise.
  if (document.readyState !== 'loading' && document.body && typeof alpine.initTree === 'function') {
    setTimeout(() => {
      try {
        alpine.initTree(document.body);
      } catch {
        // Partial trees mid-morph — safe to ignore; Livewire re-inits updates.
      }
    }, 0);
  }
}

function init(config = {}) {
  if (typeof window === 'undefined') return {};

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

  // Alpine may already exist (we loaded after it booted) or appear later
  // (alpine:init). Both paths funnel through the idempotent setupAlpine().
  setupAlpine();

  autoInit();
  bindLivewireAuto();
  return window.LaravelClientValidation;
}

/**
 * Start auto-binding Livewire components as soon as Livewire is available.
 * Respects `autoBindLivewire: false` in the config.
 */
function bindLivewireAuto() {
  if (typeof window === 'undefined' || !window.LaravelClientValidation?.config) return;
  if (window.LaravelClientValidation.config.autoBindLivewire === false) return;
  if (window.LaravelClientValidation._livewireAutoBound) return;

  const start = () => autoBindLivewireComponents(window.LaravelClientValidation.config);

  if (window.Livewire && typeof window.Livewire.hook === 'function') {
    start();
  } else {
    document.addEventListener('livewire:init', start, { once: true });
  }

  window.LaravelClientValidation._livewireAutoBound = true;
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
    autoBindLivewireComponents,
    ReactValidator,
    createReactValidator,
    useReactValidation,
    createFieldProps,
    getErrorProps,
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

  // Listen from evaluation time (not DOMContentLoaded) so an Alpine that boots
  // while the page parses can never slip past us. Alpine >= 3.14 dispatches
  // 'alpine:init' on window; older versions dispatch on document.
  window.addEventListener('alpine:init', setupAlpine);
  document.addEventListener('alpine:init', setupAlpine);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init(window.clientValidationConfig || {}));
  } else {
    // Ready-state is already 'interactive' while deferred scripts execute.
    // Defer one tick so bundler-emitted globals (e.g. Vite/UMD export tails
    // that replace window.LaravelClientValidation) land BEFORE we decorate
    // it with config — otherwise user config is silently discarded.
    setTimeout(() => init(window.clientValidationConfig || {}), 0);
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
  autoBindLivewireComponents,
  ReactValidator,
  createReactValidator,
  useReactValidation,
  createFieldProps,
  getErrorProps,
  createVueValidator,
  useVueValidation,
  vValidate,
  VueValidationPlugin,
  ValidationMixin,
  init
};

export default LaravelValidator;

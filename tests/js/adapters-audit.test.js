import { describe, it, expect, beforeEach, vi } from 'vitest';
import registerAlpine from '@laravel-client-validation/alpine';
import { VanillaFormValidator, initForms, createFormValidator } from '@laravel-client-validation/vanilla';
import { useValidation as useReactValidation, ReactValidator, createFieldProps } from '@laravel-client-validation/react';
import { useValidation as useVueValidation, vValidate } from '@laravel-client-validation/vue';

const tick = (ms = 40) => new Promise(resolve => setTimeout(resolve, ms));

function setGlobalConfig(extra = {}) {
    window.LaravelClientValidation = { config: { debounce: 5, ...extra } };
}

/** Fake Alpine API that captures directive/data/magic registrations. */
function createFakeAlpine() {
    const api = {
        directives: {},
        dataComponents: {},
        magics: {},
        directive(name, callback) { api.directives[name] = callback; },
        data(name, factory) { api.dataComponents[name] = factory; },
        magic(name, getter) { api.magics[name] = getter; },
    };
    return api;
}

/** Fake directive context: effects run eagerly, re-runnable, cleanups collected. */
function createDirectiveContext(initialRules) {
    const ctx = {
        evaluateValue: initialRules,
        cleanups: [],
        effects: [],
        evaluate: () => ctx.evaluateValue,
        effect(fn) { ctx.effects.push(fn); fn(); },
        cleanup(fn) { ctx.cleanups.push(fn); },
    };
    return ctx;
}

/** Counts active listeners by wrapping add/removeEventListener on an element. */
function trackListeners(el) {
    const listeners = [];
    const origAdd = el.addEventListener.bind(el);
    const origRemove = el.removeEventListener.bind(el);
    el.addEventListener = (type, fn, opts) => {
        listeners.push({ type, fn });
        return origAdd(type, fn, opts);
    };
    el.removeEventListener = (type, fn, opts) => {
        const index = listeners.findIndex(l => l.type === type && l.fn === fn);
        if (index > -1) listeners.splice(index, 1);
        return origRemove(type, fn, opts);
    };
    return listeners;
}

beforeEach(() => {
    document.body.innerHTML = '';
    setGlobalConfig();
});

// ---------------------------------------------------------------------------
// Alpine adapter
// ---------------------------------------------------------------------------
describe('alpine adapter', () => {
    it('x-validate blur mode shows errors on invalid and clears them on valid', async () => {
        document.body.innerHTML = '<form><input name="email"></form>';
        const input = document.querySelector('input');
        const alpine = createFakeAlpine();
        registerAlpine(alpine);

        const ctx = createDirectiveContext('required|email');
        alpine.directives.validate(input, { expression: "'required|email'", modifiers: [] }, ctx);

        input.dispatchEvent(new Event('blur'));
        await tick();
        expect(input.classList.contains('border-red-500')).toBe(true);
        expect(input.classList.contains('border-green-500')).toBe(false);
        const errorEl = input.parentNode.querySelector('[data-error-for="email"]');
        expect(errorEl).not.toBeNull();
        expect(errorEl.textContent.length).toBeGreaterThan(0);

        input.value = 'test@example.com';
        input.dispatchEvent(new Event('blur'));
        await tick();
        expect(input.classList.contains('border-green-500')).toBe(true);
        expect(input.parentNode.querySelector('[data-error-for="email"]')).toBeNull();
    });

    it('x-validate .live modifier validates debounced input events', async () => {
        document.body.innerHTML = '<form><input name="email"></form>';
        const input = document.querySelector('input');
        const alpine = createFakeAlpine();
        registerAlpine(alpine);

        const ctx = createDirectiveContext('required|email');
        alpine.directives.validate(input, { expression: "'required|email'", modifiers: ['live'] }, ctx);

        input.value = 'not-an-email';
        input.dispatchEvent(new Event('input'));
        await tick();
        expect(input.classList.contains('border-red-500')).toBe(true);
    });

    it('x-validate .submit modifier blocks invalid submits and passes valid ones', async () => {
        document.body.innerHTML = '<form><input name="email"></form>';
        const form = document.querySelector('form');
        const input = form.querySelector('input');
        const alpine = createFakeAlpine();
        registerAlpine(alpine);

        const ctx = createDirectiveContext('required|email');
        alpine.directives.validate(input, { expression: "'required|email'", modifiers: ['submit'] }, ctx);

        let lastEvent = null;
        form.addEventListener('submit', e => { lastEvent = e; });

        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        await tick();
        expect(lastEvent.defaultPrevented).toBe(true);
        expect(input.parentNode.querySelector('[data-error-for="email"]')).not.toBeNull();

        input.value = 'test@example.com';
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        await tick();
        expect(lastEvent.defaultPrevented).toBe(false);
    });

    it('cleanup tears down listeners', async () => {
        document.body.innerHTML = '<form><input name="email"></form>';
        const input = document.querySelector('input');
        const alpine = createFakeAlpine();
        registerAlpine(alpine);

        const listeners = trackListeners(input);
        const ctx = createDirectiveContext('required|email');
        alpine.directives.validate(input, { expression: "'required|email'", modifiers: [] }, ctx);
        expect(listeners.filter(l => l.type === 'blur')).toHaveLength(1);

        ctx.cleanups.forEach(fn => fn());
        expect(listeners).toHaveLength(0);

        input.dispatchEvent(new Event('blur'));
        await tick();
        expect(input.classList.contains('border-red-500')).toBe(false);
    });

    it('effect re-runs replace listeners instead of stacking them', async () => {
        document.body.innerHTML = '<form><input name="email"></form>';
        const input = document.querySelector('input');
        const alpine = createFakeAlpine();
        registerAlpine(alpine);

        const listeners = trackListeners(input);
        const ctx = createDirectiveContext('required|min:2');
        alpine.directives.validate(input, { expression: "'rules'", modifiers: [] }, ctx);
        expect(listeners.filter(l => l.type === 'blur')).toHaveLength(1);

        // Simulate reactive rule change: effect re-runs with new rules.
        ctx.evaluateValue = 'required|min:5';
        ctx.effects.forEach(fn => fn());

        expect(listeners.filter(l => l.type === 'blur')).toHaveLength(1);

        // New rules are in force: 4 chars passes min:2 but fails min:5.
        input.value = 'abcd';
        input.dispatchEvent(new Event('blur'));
        await tick();
        expect(input.classList.contains('border-red-500')).toBe(true);
        expect(input.classList.contains('border-green-500')).toBe(false);
    });

    it('binds to Filament-style dotted state paths and resolves confirmed siblings', async () => {
        // Filament v5 renders name-less inputs; the plugin now injects a name
        // attribute carrying the absolute state path (e.g. "data.password"),
        // which is what the Alpine runtime addresses the field with.
        document.body.innerHTML = `
            <form>
                <input type="password" name="data.password" value="supersecret">
                <input type="password" name="data.password_confirmation" value="different">
            </form>`;
        const password = document.querySelector('input[name="data.password"]');
        const confirmation = document.querySelector('input[name="data.password_confirmation"]');
        const alpine = createFakeAlpine();
        registerAlpine(alpine);

        const ctx = createDirectiveContext('required|min:8|confirmed');
        alpine.directives.validate(password, { expression: "'required|min:8|confirmed'", modifiers: [] }, ctx);

        password.dispatchEvent(new Event('blur'));
        await tick();
        expect(password.classList.contains('border-red-500')).toBe(true);

        confirmation.value = 'supersecret';
        password.dispatchEvent(new Event('blur'));
        await tick();
        expect(password.classList.contains('border-green-500')).toBe(true);
    });

    it('x-validate .submit blocks invalid Filament-style dotted path form', async () => {
        document.body.innerHTML = '<form><input name="data.email" value="nope"></form>';
        const form = document.querySelector('form');
        const input = form.querySelector('input');
        const alpine = createFakeAlpine();
        registerAlpine(alpine);

        const ctx = createDirectiveContext('required|email');
        alpine.directives.validate(input, { expression: "'required|email'", modifiers: ['submit'] }, ctx);

        let lastEvent = null;
        form.addEventListener('submit', e => { lastEvent = e; });

        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        await tick();
        expect(lastEvent.defaultPrevented).toBe(true);
        expect(form.querySelector('[data-error-for="data.email"]')).not.toBeNull();

        input.value = 'test@example.com';
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        await tick();
        expect(lastEvent.defaultPrevented).toBe(false);
    });

    it('blocks form submit when any bound field is invalid, not only .submit ones', async () => {
        document.body.innerHTML = `
            <form>
                <input name="email" value="not-an-email">
                <input name="username" value="">
            </form>`;
        const form = document.querySelector('form');
        const email = form.querySelector('[name="email"]');
        const username = form.querySelector('[name="username"]');
        const alpine = createFakeAlpine();
        registerAlpine(alpine);

        // Email uses blur (no modifier), username uses .submit — the blur field
        // must still participate in the submit gate through the form guard.
        const ctxEmail = createDirectiveContext('required|email');
        alpine.directives.validate(email, { expression: "'required|email'", modifiers: [] }, ctxEmail);
        const ctxUsername = createDirectiveContext('required|min:3');
        alpine.directives.validate(username, { expression: "'required|min:3'", modifiers: ['submit'] }, ctxUsername);

        let lastEvent = null;
        form.addEventListener('submit', e => { lastEvent = e; });

        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        await tick();
        expect(lastEvent.defaultPrevented).toBe(true);
        expect(form.querySelector('[data-error-for="email"]')).not.toBeNull();

        email.value = 'test@example.com';
        username.value = 'abc';
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        await tick();
        expect(lastEvent.defaultPrevented).toBe(false);
        expect(form.querySelector('[data-error-for="email"]')).toBeNull();
    });

    it('disables native form validation when x-validate fields are present', async () => {
        document.body.innerHTML = '<form><input name="email" required></form>';
        const form = document.querySelector('form');
        const input = form.querySelector('input');
        const alpine = createFakeAlpine();
        registerAlpine(alpine);

        const ctx = createDirectiveContext('required|email');
        alpine.directives.validate(input, { expression: "'required|email'", modifiers: [] }, ctx);

        expect(form.noValidate).toBe(true);
    });

    it('uses field validation messages and attributes from metadata', async () => {
        document.body.innerHTML = `
            <form>
                <input name="data.email" value="not-an-email"
                    data-client-validation-messages='{"email":"Enter a valid :attribute."}'
                    data-client-validation-attribute="email address">
            </form>`;
        const input = document.querySelector('input');
        const alpine = createFakeAlpine();
        registerAlpine(alpine);

        const ctx = createDirectiveContext('required|email');
        alpine.directives.validate(input, { expression: "'required|email'", modifiers: [] }, ctx);

        input.dispatchEvent(new Event('blur'));
        await tick();

        expect(input.parentNode.querySelector('[data-error-for="data.email"]')?.textContent)
            .toBe('Enter a valid email address.');
    });

    it('validation() data component tracks state through validate/validateAll/submit/reset', async () => {
        const alpine = createFakeAlpine();
        registerAlpine(alpine);

        const component = alpine.dataComponents.validation({
            rules: { email: 'required|email' },
        });
        component.init();

        component.form.email = 'bad';
        expect(await component.validate('email')).toBe(false);
        expect(component.hasError('email')).toBe(true);
        expect(component.error('email')).not.toBe('');

        component.form.email = 'test@example.com';
        expect(await component.validate('email')).toBe(true);
        expect(component.hasError('email')).toBe(false);

        component.form.email = 'bad';
        const callback = vi.fn();
        expect(await component.submit(callback)).toBe(false);
        expect(callback).not.toHaveBeenCalled();

        component.form.email = 'test@example.com';
        expect(await component.submit(callback)).toBe(true);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback.mock.calls[0][0]).toMatchObject({ email: 'test@example.com' });

        component.reset();
        expect(component.form.email).toBe('');
        expect(component.hasErrors()).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Vanilla adapter
// ---------------------------------------------------------------------------
describe('vanilla adapter', () => {
    function buildForm(html) {
        document.body.innerHTML = html;
        return document.querySelector('form');
    }

    it('renders error UI with data-message on invalid blur', async () => {
        const form = buildForm(`
            <form data-validate>
                <input name="email" data-rules="required|email" data-message="Give us a real email">
            </form>`);
        const input = form.querySelector('input');

        createFormValidator(form, { debounce: 5 });

        input.dispatchEvent(new Event('blur'));
        await tick();

        const errorEl = form.querySelector('[data-error-for="email"]');
        expect(errorEl).not.toBeNull();
        expect(errorEl.textContent).toBe('Give us a real email');
        expect(input.classList.contains('is-invalid')).toBe(true);
    });

    it('blocks invalid submits, then routes valid submits through onSubmit', async () => {
        const form = buildForm(`
            <form data-validate>
                <input name="email" data-rules="required|email">
            </form>`);
        form.submit = vi.fn();
        const input = form.querySelector('input');
        const onSubmit = vi.fn();

        createFormValidator(form, { debounce: 5, onSubmit });

        let lastEvent = null;
        form.addEventListener('submit', e => { lastEvent = e; });

        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        await tick();
        expect(lastEvent.defaultPrevented).toBe(true);
        expect(onSubmit).not.toHaveBeenCalled();
        expect(form.querySelector('[data-error-for="email"]')).not.toBeNull();

        input.value = 'test@example.com';
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        await tick();
        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit.mock.calls[0][0]).toEqual({ email: 'test@example.com' });
    });

    it('passes untracked sibling values as context for cross-field rules', async () => {
        const form = buildForm(`
            <form data-validate>
                <input type="password" name="password" data-rules="required|min:8|confirmed">
                <input type="password" name="password_confirmation">
            </form>`);
        form.submit = vi.fn();
        const password = form.querySelector('input[name="password"]');
        const confirmation = form.querySelector('input[name="password_confirmation"]');
        const onSubmit = vi.fn();

        createFormValidator(form, { debounce: 5, onSubmit });

        password.value = 'longenough1';
        confirmation.value = 'different';
        password.dispatchEvent(new Event('blur'));
        await tick();

        const errorEl = form.querySelector('[data-error-for="password"]');
        expect(errorEl).not.toBeNull();
        expect(errorEl.textContent).toContain('confirmation');

        confirmation.value = 'longenough1';
        password.dispatchEvent(new Event('blur'));
        await tick();

        expect(form.querySelector('[data-error-for="password"]')).toBeNull();

        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        await tick();
        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('initForms/autoInit are idempotent and markers clear on destroy', () => {
        document.body.innerHTML = `
            <form data-validate id="a"><input name="email" data-rules="required"></form>
            <form data-validate id="b"><input name="email" data-rules="required"></form>`;
        const formA = document.getElementById('a');
        const formB = document.getElementById('b');

        const first = initForms();
        expect(first).toHaveLength(2);
        expect(formA._vanillaFormValidator).toBeInstanceOf(VanillaFormValidator);
        expect(formB._vanillaFormValidator).toBeInstanceOf(VanillaFormValidator);

        // Repeated scans must not double-bind.
        expect(initForms()).toHaveLength(0);

        first[0].destroy();
        expect(formA._vanillaFormValidator).toBeUndefined();

        const second = initForms();
        expect(second).toHaveLength(1);
        expect(second[0].form).toBe(formA);
    });

    it('destroy removes field behaviour', async () => {
        const form = buildForm(`
            <form data-validate>
                <input name="email" data-rules="required|email">
            </form>`);
        const input = form.querySelector('input');
        const validator = createFormValidator(form, { debounce: 5 });

        validator.destroy();

        input.dispatchEvent(new Event('blur'));
        await tick();
        expect(input.classList.contains('is-invalid')).toBe(false);
        expect(form.querySelector('[data-error-for="email"]')).toBeNull();
    });

    it('getFieldValue collects arrays for multiple selects', () => {
        const form = buildForm(`
            <form data-validate>
                <select name="tags" multiple data-rules="">
                    <option value="a">A</option>
                    <option value="b">B</option>
                </select>
            </form>`);
        const select = form.querySelector('select');
        const validator = createFormValidator(form);

        select.options[0].selected = true;
        select.options[1].selected = true;
        expect(validator.getFieldValue(select)).toEqual(['a', 'b']);

        select.options[1].selected = false;
        expect(validator.getFieldValue(select)).toEqual(['a']);
    });
});

// ---------------------------------------------------------------------------
// React adapter
// ---------------------------------------------------------------------------
describe('react adapter', () => {
    it('useValidation notifies subscribers with live validating state', async () => {
        const validation = useReactValidation({ rules: { email: 'required|email' } });
        const states = [];
        validation.subscribe(state => states.push(state));

        const promise = validation.validateField('email', 'bad');
        expect(validation.validating).toBe(true);
        await promise;

        expect(validation.validating).toBe(false);
        expect(states[0].validating).toBe(true);
        expect(states[states.length - 1].validating).toBe(false);
        expect(validation.getError('email')).toBeTruthy();
        expect(validation.isTouched('email')).toBe(true);
    });

    it('removes error entries when a field becomes valid (core error shape)', async () => {
        const validation = useReactValidation({ rules: { email: 'required|email' } });

        await validation.validateField('email', 'bad');
        expect(Object.keys(validation.getAllErrors())).toEqual(['email']);

        await validation.validateField('email', 'test@example.com');
        expect(validation.hasError('email')).toBe(false);
        expect(validation.getAllErrors()).toEqual({});
    });

    it('destroy() detaches existing subscribers', async () => {
        const validation = useReactValidation({ rules: { email: 'required|email' } });
        let notifications = 0;
        validation.subscribe(() => { notifications++; });

        await validation.validateField('email', 'bad');
        const afterUse = notifications;

        validation.destroy();
        await validation.validateField('email', 'still-bad');

        expect(notifications).toBe(afterUse);
    });

    it('createFieldProps onBlur wires validation', async () => {
        const validation = useReactValidation({ rules: { email: 'required|email' } });
        const props = createFieldProps(validation, 'email', { mode: 'blur' });

        expect(props.name).toBe('email');
        await props.onBlur({ target: { type: 'text', value: 'nope' } });

        expect(validation.hasError('email')).toBe(true);
    });

    it('ReactValidator emits lifecycle events and supports off()', async () => {
        const validator = new ReactValidator({ rules: { email: 'required|email' }, debounce: 5 });
        const validated = [];
        const unsubscribe = validator.on('validated', data => validated.push(data));

        await validator.validateField('email', 'bad');
        unsubscribe();
        await validator.validateField('email', 'worse');

        expect(validated).toHaveLength(1);
        expect(validated[0].field).toBe('email');
        expect(validated[0].result.valid).toBe(false);

        const allResults = [];
        validator.on('validated:all', ({ result }) => allResults.push(result));
        await validator.validateAll({ email: 'bad' });
        expect(allResults).toHaveLength(1);
        expect(allResults[0].valid).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Vue adapter
// ---------------------------------------------------------------------------
describe('vue adapter', () => {
    it('useValidation exposes a live validating flag and stable errors reference', async () => {
        const validation = useVueValidation({ rules: { email: 'required|email' } });
        const errorsRef = validation.errors;

        // Regression guard: `validating` must be a getter, not a frozen snapshot.
        const descriptor = Object.getOwnPropertyDescriptor(validation, 'validating');
        expect(descriptor && descriptor.get).toBeTruthy();

        const promise = validation.validateField('email', 'bad');
        expect(validation.validating).toBe(true);
        await promise;
        expect(validation.validating).toBe(false);

        // clearErrors mutates in place so external references stay in sync.
        await validation.validateField('email', 'bad');
        expect(validation.errors).toBe(errorsRef);
        expect(errorsRef.email.length).toBeGreaterThan(0);

        validation.clearErrors();
        expect(validation.errors).toBe(errorsRef);
        expect(Object.keys(errorsRef)).toHaveLength(0);
    });

    it('concurrent validations keep validating true until all settle', async () => {
        const validation = useVueValidation({ rules: { email: 'required|email' } });

        const first = validation.validateField('email', 'one@invalid');
        const second = validation.validateField('email', 'two@invalid');
        await Promise.all([first, second]);

        expect(validation.validating).toBe(false);
    });

    it('v-validate fills .validation-error containers and cleans up on unmount', async () => {
        document.body.innerHTML = `
            <div>
                <input name="username">
                <span class="validation-error"></span>
            </div>`;
        const input = document.querySelector('input');
        const container = document.querySelector('.validation-error');

        vValidate.mounted(input, { value: 'required|min:2', modifiers: {} });

        input.value = 'a';
        input.dispatchEvent(new Event('blur'));
        await tick();
        expect(container.textContent).toContain('at least 2 characters');
        expect(input.classList.contains('border-red-500')).toBe(true);

        vValidate.unmounted(input);
        input.value = 'ab';
        input.dispatchEvent(new Event('blur'));
        await tick();
        expect(input.classList.contains('border-green-500')).toBe(false);
    });

    it('v-validate never writes into arbitrary sibling nodes', async () => {
        document.body.innerHTML = `
            <div>
                <input name="username">
                <p class="hint">Keep me intact</p>
            </div>`;
        const input = document.querySelector('input');
        const hint = document.querySelector('.hint');

        vValidate.mounted(input, { value: 'required', modifiers: {} });

        input.dispatchEvent(new Event('blur'));
        await tick();
        expect(hint.textContent).toBe('Keep me intact');
    });

    it('v-validate.live cancels pending debounced validation on unmount', async () => {
        document.body.innerHTML = '<div><input name="username"><span class="validation-error"></span></div>';
        const input = document.querySelector('input');
        const container = document.querySelector('.validation-error');

        vValidate.mounted(input, { value: 'required', modifiers: { live: true } });

        input.dispatchEvent(new Event('input'));
        vValidate.unmounted(input);
        await tick();

        expect(container.textContent).toBe('');
        expect(input.classList.contains('border-red-500')).toBe(false);
    });
});

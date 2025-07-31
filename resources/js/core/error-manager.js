/**
 * Error management with customizable templates and positioning
 */
class ErrorManager {
    constructor(options = {}) {
        this.options = {
            errorTemplate: {
                enabled: true,
                containerClass: 'validation-error text-red-500 text-sm mt-1',
                template: '<div class="{class}" id="{id}" style="display: {display}">{message}</div>',
                position: 'after', // 'before', 'after', 'custom'
                showOn: ['fail'], // 'fail', 'pass', 'both'
            },
            fieldStyling: {
                enabled: true,
                validClass: 'is-valid border-green-500',
                invalidClass: 'is-invalid border-red-500',
                removeClasses: ['is-valid', 'is-invalid', 'border-green-500', 'border-red-500'],
            },
            ...options
        };

        this.errorElements = new Map();
    }

    displayFieldError(field, errors, options = {}) {
        const config = { ...this.options.errorTemplate, ...options };

        if (!config.enabled) return;

        const element = this.findFieldElement(field);
        if (!element) return;

        // Update field styling
        this.updateFieldStyling(element, false);

        // Handle error display
        const errorMessage = Array.isArray(errors) ? errors[0] : errors;
        if (errorMessage && config.showOn.includes('fail')) {
            this.createOrUpdateErrorElement(field, errorMessage, element, config);
        }
    }

    hideFieldError(field) {
        const element = this.findFieldElement(field);
        if (element) {
            this.updateFieldStyling(element, true);
        }

        const errorElement = this.errorElements.get(field);
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    clearFieldErrors(field) {
        this.hideFieldError(field);

        const errorElement = this.errorElements.get(field);
        if (errorElement && errorElement.parentNode) {
            errorElement.parentNode.removeChild(errorElement);
            this.errorElements.delete(field);
        }
    }

    clearAllErrors() {
        for (const field of this.errorElements.keys()) {
            this.clearFieldErrors(field);
        }
    }

    updateFieldStyling(element, isValid) {
        const config = this.options.fieldStyling;
        if (!config.enabled) return;

        // Remove all validation classes
        element.classList.remove(...config.removeClasses);

        // Add appropriate class
        if (isValid && config.validClass) {
            element.classList.add(...config.validClass.split(' '));
        } else if (!isValid && config.invalidClass) {
            element.classList.add(...config.invalidClass.split(' '));
        }
    }

    createOrUpdateErrorElement(field, message, inputElement, config) {
        const errorId = `${field}-error`;
        let errorElement = this.errorElements.get(field) || document.getElementById(errorId);

        if (!errorElement) {
            errorElement = this.createElement(errorId, message, config);
            this.positionErrorElement(errorElement, inputElement, config.position);
            this.errorElements.set(field, errorElement);
        } else {
            this.updateErrorContent(errorElement, message);
            errorElement.style.display = 'block';
        }
    }

    createElement(id, message, config) {
        const template = config.template
            .replace('{class}', config.containerClass)
            .replace('{id}', id)
            .replace('{display}', 'block')
            .replace('{message}', this.escapeHtml(message));

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = template;
        return tempDiv.firstElementChild;
    }

    positionErrorElement(errorElement, inputElement, position) {
        switch (position) {
            case 'before':
                inputElement.parentNode.insertBefore(errorElement, inputElement);
                break;
            case 'after':
                if (inputElement.nextSibling) {
                    inputElement.parentNode.insertBefore(errorElement, inputElement.nextSibling);
                } else {
                    inputElement.parentNode.appendChild(errorElement);
                }
                break;
            case 'custom':
                // For custom positioning, user should handle this via CSS or custom logic
                inputElement.parentNode.appendChild(errorElement);
                break;
            default:
                inputElement.parentNode.appendChild(errorElement);
        }
    }

    updateErrorContent(errorElement, message) {
        if (errorElement.children.length > 0) {
            errorElement.children[0].textContent = message;
        } else {
            errorElement.textContent = message;
        }
    }

    findFieldElement(field) {
        // Try multiple strategies to find the field element
        return document.querySelector(`[name="${field}"]`) ||
               document.querySelector(`#${field}`) ||
               document.querySelector(`[data-field="${field}"]`) ||
               document.querySelector(`[x-model*="${field}"]`);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    updateOptions(options) {
        this.options = { ...this.options, ...options };
    }

    // Template customization methods
    setErrorTemplate(template) {
        this.options.errorTemplate.template = template;
    }

    setErrorClass(className) {
        this.options.errorTemplate.containerClass = className;
    }

    setFieldStyles(validClass, invalidClass) {
        this.options.fieldStyling.validClass = validClass;
        this.options.fieldStyling.invalidClass = invalidClass;
    }
}

export default ErrorManager;

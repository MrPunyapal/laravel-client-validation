import ClientValidator from './core/validator.js';
import alpineIntegration from './integrations/alpine.js';

if (typeof window !== 'undefined') {
    window.LaravelValidator = {
        ClientValidator,
        // Legacy alias for backward compatibility
        Validator: ClientValidator
    };

    if (window.Alpine) {
        alpineIntegration(window.Alpine);
    } else {
        document.addEventListener('alpine:init', () => {
            alpineIntegration(window.Alpine);
        });
    }
}

export { ClientValidator, alpineIntegration };
export default ClientValidator;

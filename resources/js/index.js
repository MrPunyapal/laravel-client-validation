import Validator from './core/validator.js';
import alpineIntegration from './integrations/alpine.js';

if (typeof window !== 'undefined') {
    window.LaravelValidator = Validator;
    
    if (window.Alpine) {
        alpineIntegration(window.Alpine);
    } else {
        document.addEventListener('alpine:init', () => {
            alpineIntegration(window.Alpine);
        });
    }
}

export { Validator, alpineIntegration };
export default Validator;

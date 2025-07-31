<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laravel Client Validation - Demo</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    <script src="https://cdn.tailwindcss.com"></script>
    @clientValidationAssets
</head>
<body class="bg-gray-100 py-8">
    <div class="max-w-4xl mx-auto space-y-8">
        <h1 class="text-3xl font-bold text-center text-gray-800">Laravel Client Validation - Demo</h1>

        <!-- Basic Field Validation -->
        <div class="bg-white p-6 rounded-lg shadow">
            <h2 class="text-xl font-semibold mb-4">1. Basic Field Validation</h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Manual Validation -->
                <div>
                    <label class="block text-sm font-medium mb-2">Manual Validation</label>
                    <input type="email"
                           name="email"
                           x-validate="'required|email'"
                           placeholder="Email address"
                           class="w-full px-3 py-2 border rounded-md">
                    <button onclick="document.querySelector('[name=email]').validate()"
                            class="mt-2 px-4 py-2 bg-blue-500 text-white rounded text-sm">
                        Validate
                    </button>
                </div>

                <!-- Live Validation -->
                <div>
                    <label class="block text-sm font-medium mb-2">Live Validation</label>
                    <input type="text"
                           name="username"
                           x-validate.live="'required|alpha_dash|min:3'"
                           placeholder="Username"
                           class="w-full px-3 py-2 border rounded-md">
                </div>

                <!-- Form Validation -->
                <div>
                    <label class="block text-sm font-medium mb-2">Form Validation</label>
                    <form>
                        <input type="password"
                               name="password"
                               x-validate.form="'required|min:8'"
                               placeholder="Password"
                               class="w-full px-3 py-2 border rounded-md">
                        <button type="submit" class="mt-2 px-4 py-2 bg-green-500 text-white rounded text-sm">
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </div>

        <!-- Alpine.js Form Component -->
        <div class="bg-white p-6 rounded-lg shadow">
            <h2 class="text-xl font-semibold mb-4">2. Complete Form with Alpine.js</h2>

            <div x-data="validateForm({
                name: 'required|string|min:2|max:50',
                email: 'required|email|unique:users,email',
                password: 'required|min:8|confirmed',
                password_confirmation: 'required',
                age: 'nullable|integer|min:18|max:120',
                terms: 'required|accepted'
            }, {
                'name.required': 'Please provide your full name',
                'email.unique': 'This email is already registered',
                'password.confirmed': 'Passwords do not match',
                'terms.accepted': 'You must accept the terms'
            }, {
                name: 'full name',
                email: 'email address',
                age: 'age in years'
            })">
                <form @submit.prevent="submitForm(async (data) => {
                    alert('Form submitted successfully!');
                    console.log('Form data:', data);
                })" class="space-y-4">

                    <!-- Name Field -->
                    <div>
                        <label class="block text-sm font-medium mb-1">Full Name</label>
                        <input type="text"
                               x-model="form.name"
                               @blur="validate('name')"
                               class="w-full px-3 py-2 border rounded-md"
                               :class="hasError('name') ? 'border-red-500 bg-red-50' : 'border-gray-300'">
                        <div x-show="hasError('name')"
                             x-text="getError('name')"
                             class="text-red-500 text-sm mt-1"></div>
                    </div>

                    <!-- Email Field -->
                    <div>
                        <label class="block text-sm font-medium mb-1">Email Address</label>
                        <input type="email"
                               x-model="form.email"
                               @blur="validate('email')"
                               class="w-full px-3 py-2 border rounded-md"
                               :class="hasError('email') ? 'border-red-500 bg-red-50' : 'border-gray-300'">
                        <div x-show="hasError('email')"
                             x-text="getError('email')"
                             class="text-red-500 text-sm mt-1"></div>
                    </div>

                    <!-- Password Fields -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">Password</label>
                            <input type="password"
                                   x-model="form.password"
                                   @blur="validate('password')"
                                   class="w-full px-3 py-2 border rounded-md"
                                   :class="hasError('password') ? 'border-red-500 bg-red-50' : 'border-gray-300'">
                            <div x-show="hasError('password')"
                                 x-text="getError('password')"
                                 class="text-red-500 text-sm mt-1"></div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-1">Confirm Password</label>
                            <input type="password"
                                   x-model="form.password_confirmation"
                                   @blur="validate('password')"
                                   class="w-full px-3 py-2 border rounded-md"
                                   :class="hasError('password') ? 'border-red-500 bg-red-50' : 'border-gray-300'">
                        </div>
                    </div>

                    <!-- Age Field -->
                    <div>
                        <label class="block text-sm font-medium mb-1">Age (Optional)</label>
                        <input type="number"
                               x-model="form.age"
                               @blur="validate('age')"
                               class="w-full px-3 py-2 border rounded-md"
                               :class="hasError('age') ? 'border-red-500 bg-red-50' : 'border-gray-300'">
                        <div x-show="hasError('age')"
                             x-text="getError('age')"
                             class="text-red-500 text-sm mt-1"></div>
                    </div>

                    <!-- Terms Checkbox -->
                    <div>
                        <label class="flex items-center">
                            <input type="checkbox"
                                   x-model="form.terms"
                                   @change="validate('terms')"
                                   class="mr-2">
                            <span class="text-sm">I accept the terms and conditions</span>
                        </label>
                        <div x-show="hasError('terms')"
                             x-text="getError('terms')"
                             class="text-red-500 text-sm mt-1"></div>
                    </div>

                    <!-- Submit Button -->
                    <div class="flex items-center justify-between">
                        <button type="submit"
                                :disabled="!isValid() || validating"
                                class="px-6 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                            <span x-show="!validating">Create Account</span>
                            <span x-show="validating">Validating...</span>
                        </button>

                        <button type="button"
                                @click="clearErrors()"
                                class="px-4 py-2 text-gray-500 hover:text-gray-700">
                            Clear Errors
                        </button>
                    </div>

                    <!-- Form Status -->
                    <div class="text-sm text-gray-600">
                        <div>Form Valid: <span :class="isValid() ? 'text-green-600' : 'text-red-600'" x-text="isValid() ? 'Yes' : 'No'"></span></div>
                        <div>Has Errors: <span :class="hasAnyErrors() ? 'text-red-600' : 'text-green-600'" x-text="hasAnyErrors() ? 'Yes' : 'No'"></span></div>
                    </div>
                </form>
            </div>
        </div>

        <!-- Validation Hooks Demo -->
        <div class="bg-white p-6 rounded-lg shadow">
            <h2 class="text-xl font-semibold mb-4">3. Validation Hooks Demo</h2>

            <div x-data="{
                logs: [],
                init() {
                    this.validator = new window.LaravelValidator.ClientValidator({
                        demo_field: 'required|email|min:5'
                    });

                    this.validator
                        .beforeValidate(ctx => this.addLog('Before validation started'))
                        .afterValidate(ctx => this.addLog('Validation completed'))
                        .onPasses(ctx => this.addLog('✅ Validation passed!'))
                        .onFails(ctx => this.addLog('❌ Validation failed'));
                },

                async validateDemo() {
                    const value = this.$refs.demoInput.value;
                    await this.validator.validateField('demo_field', value);
                },

                addLog(message) {
                    this.logs.unshift(`${new Date().toLocaleTimeString()}: ${message}`);
                    if (this.logs.length > 10) this.logs.pop();
                }
            }">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium mb-2">Demo Input (required|email|min:5)</label>
                        <input x-ref="demoInput"
                               type="email"
                               placeholder="test@example.com"
                               class="w-full px-3 py-2 border rounded-md mb-2">
                        <button @click="validateDemo()"
                                class="px-4 py-2 bg-purple-500 text-white rounded text-sm">
                            Validate with Hooks
                        </button>
                    </div>

                    <div>
                        <h4 class="font-medium mb-2">Validation Logs:</h4>
                        <div class="bg-gray-50 p-3 rounded text-sm h-32 overflow-y-auto">
                            <template x-for="log in logs" :key="log">
                                <div x-text="log" class="mb-1"></div>
                            </template>
                            <div x-show="logs.length === 0" class="text-gray-500">
                                No logs yet. Try validating the input above.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- AJAX Validation Demo -->
        <div class="bg-white p-6 rounded-lg shadow">
            <h2 class="text-xl font-semibold mb-4">4. AJAX Validation Demo</h2>

            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-2">Email (with unique validation)</label>
                    <input type="email"
                           x-validate.live="'required|email|unique:users,email'"
                           placeholder="Check if email exists"
                           class="w-full px-3 py-2 border rounded-md">
                    <p class="text-sm text-gray-600 mt-1">
                        This will make an AJAX request to validate uniqueness
                    </p>
                </div>

                <div>
                    <label class="block text-sm font-medium mb-2">User ID (with exists validation)</label>
                    <input type="number"
                           x-validate.live="'required|exists:users,id'"
                           placeholder="Enter user ID"
                           class="w-full px-3 py-2 border rounded-md">
                    <p class="text-sm text-gray-600 mt-1">
                        This will check if the user ID exists in the database
                    </p>
                </div>
            </div>
        </div>

        <!-- Custom Styling Demo -->
        <div class="bg-white p-6 rounded-lg shadow">
            <h2 class="text-xl font-semibold mb-4">5. Custom Styling Demo</h2>

            <div x-data="{
                init() {
                    // Custom validation configuration
                    window.clientValidationConfig = {
                        fieldStyling: {
                            enabled: true,
                            validClass: 'border-green-500 bg-green-50',
                            invalidClass: 'border-red-500 bg-red-50',
                            removeClasses: ['border-green-500', 'bg-green-50', 'border-red-500', 'bg-red-50']
                        },
                        errorTemplate: {
                            enabled: true,
                            template: '<div class=\"{class}\" id=\"{id}\"><i class=\"text-red-500\">⚠</i> {message}</div>',
                            containerClass: 'text-red-600 text-sm mt-1 font-medium'
                        }
                    };
                }
            }">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">Name (Custom Styled)</label>
                        <input type="text"
                               x-validate.live="'required|string|min:3'"
                               placeholder="Your name"
                               class="w-full px-3 py-2 border rounded-md transition-colors">
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-2">Phone (Custom Error Icon)</label>
                        <input type="tel"
                               x-validate.live="'required|regex:/^[0-9-+()\\s]+$/'"
                               placeholder="+1 (555) 123-4567"
                               class="w-full px-3 py-2 border rounded-md transition-colors">
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Global configuration
        window.clientValidationConfig = {
            ajaxUrl: '/client-validation/validate',
            enableAjax: true,
            debounceMs: 300,
            fieldStyling: {
                enabled: true,
                validClass: 'is-valid border-green-500',
                invalidClass: 'is-invalid border-red-500',
                removeClasses: ['is-valid', 'is-invalid', 'border-green-500', 'border-red-500']
            },
            errorTemplate: {
                enabled: true,
                containerClass: 'validation-error text-red-500 text-sm mt-1',
                position: 'after'
            }
        };

        // Demo event listeners
        document.addEventListener('field:validated', (e) => {
            console.log('Field validated:', e.detail);
        });

        document.addEventListener('form:validated', (e) => {
            console.log('Form validated:', e.detail);
        });

        document.addEventListener('validation:start', (e) => {
            console.log('Validation started:', e.detail);
        });

        document.addEventListener('validation:complete', (e) => {
            console.log('Validation completed:', e.detail);
        });
    </script>
</body>
</html>

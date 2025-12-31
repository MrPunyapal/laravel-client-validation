{{--
==========================================================================
Laravel Client Validation - Blade + Alpine.js Demo
==========================================================================
This demo shows how to use client-side validation with Alpine.js.
Supports both client-side validation and remote (AJAX) validation.
==========================================================================
--}}

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Laravel Client Validation - Alpine.js Demo</title>

    {{-- Tailwind for styling (optional) --}}
    <script src="https://cdn.tailwindcss.com"></script>

    {{-- Alpine.js --}}
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>

    {{-- Include validation assets (adds config + script) --}}
    @clientValidationAssets
</head>
<body class="bg-gray-100 min-h-screen py-8">
    <div class="max-w-4xl mx-auto space-y-8">
        <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-800">Laravel Client Validation</h1>
            <p class="text-gray-600 mt-2">Alpine.js Integration Demo</p>
        </div>

        {{-- ============================================================
             DEMO 1: Simple Field Validation with x-validate directive
             ============================================================ --}}
        <section class="bg-white p-6 rounded-lg shadow">
            <h2 class="text-xl font-semibold mb-4 text-gray-800">
                1. Simple Field Validation (x-validate directive)
            </h2>
            <p class="text-gray-600 text-sm mb-4">
                Use the <code class="bg-gray-100 px-1 rounded">x-validate</code> directive directly on inputs.
                Modifiers: <code>.blur</code> (default), <code>.live</code>, <code>.submit</code>
            </p>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                {{-- Blur validation (default) --}}
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Email (validates on blur)
                    </label>
                    <input type="email"
                           name="demo_email"
                           x-validate="'required|email'"
                           placeholder="Enter your email"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                </div>

                {{-- Live validation (as you type) --}}
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Username (validates live)
                    </label>
                    <input type="text"
                           name="demo_username"
                           x-validate.live="'required|alpha_dash|min:3|max:20'"
                           placeholder="Choose a username"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                </div>

                {{-- Submit validation --}}
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Password (validates on submit)
                    </label>
                    <form>
                        <input type="password"
                               name="demo_password"
                               x-validate.submit="'required|min:8'"
                               placeholder="Enter password"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                        <button type="submit"
                                class="mt-2 w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </section>

        {{-- ============================================================
             DEMO 2: Complete Form with validation() Alpine data component
             ============================================================ --}}
        <section class="bg-white p-6 rounded-lg shadow">
            <h2 class="text-xl font-semibold mb-4 text-gray-800">
                2. Complete Form (validation() component)
            </h2>
            <p class="text-gray-600 text-sm mb-4">
                Use <code class="bg-gray-100 px-1 rounded">x-data="validation({...})"</code> for full form control.
            </p>

            <div x-data="validation({
                rules: {
                    name: 'required|string|min:2|max:50',
                    email: 'required|email',
                    password: 'required|min:8',
                    password_confirmation: 'required|same:password',
                    age: 'nullable|integer|min:18|max:120',
                    website: 'nullable|url',
                    terms: 'accepted'
                },
                messages: {
                    'name.required': 'Please tell us your name',
                    'email.required': 'We need your email address',
                    'password.min': 'Password must be at least 8 characters',
                    'password_confirmation.same': 'Passwords do not match',
                    'terms.accepted': 'You must accept the terms to continue'
                },
                attributes: {
                    name: 'full name',
                    email: 'email address',
                    password_confirmation: 'password confirmation'
                }
            })">
                <form @submit.prevent="submit(async (data) => {
                    alert('Form submitted successfully!\n\n' + JSON.stringify(data, null, 2));
                })" class="space-y-4">

                    {{-- Name --}}
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <input type="text"
                               x-model="form.name"
                               @blur="validate('name')"
                               :class="stateClass('name')"
                               class="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                               placeholder="John Doe">
                        <p x-show="hasError('name')" x-text="error('name')" class="text-red-500 text-sm mt-1"></p>
                    </div>

                    {{-- Email --}}
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                        <input type="email"
                               x-model="form.email"
                               @blur="validate('email')"
                               :class="stateClass('email')"
                               class="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                               placeholder="john@example.com">
                        <p x-show="hasError('email')" x-text="error('email')" class="text-red-500 text-sm mt-1"></p>
                    </div>

                    {{-- Password & Confirmation --}}
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                            <input type="password"
                                   x-model="form.password"
                                   @blur="validate('password')"
                                   :class="stateClass('password')"
                                   class="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                                   placeholder="••••••••">
                            <p x-show="hasError('password')" x-text="error('password')" class="text-red-500 text-sm mt-1"></p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                            <input type="password"
                                   x-model="form.password_confirmation"
                                   @blur="validate('password_confirmation')"
                                   :class="stateClass('password_confirmation')"
                                   class="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                                   placeholder="••••••••">
                            <p x-show="hasError('password_confirmation')" x-text="error('password_confirmation')" class="text-red-500 text-sm mt-1"></p>
                        </div>
                    </div>

                    {{-- Optional Fields --}}
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Age (optional)</label>
                            <input type="number"
                                   x-model="form.age"
                                   @blur="validate('age')"
                                   :class="stateClass('age')"
                                   class="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                                   placeholder="25">
                            <p x-show="hasError('age')" x-text="error('age')" class="text-red-500 text-sm mt-1"></p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Website (optional)</label>
                            <input type="url"
                                   x-model="form.website"
                                   @blur="validate('website')"
                                   :class="stateClass('website')"
                                   class="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                                   placeholder="https://example.com">
                            <p x-show="hasError('website')" x-text="error('website')" class="text-red-500 text-sm mt-1"></p>
                        </div>
                    </div>

                    {{-- Terms --}}
                    <div>
                        <label class="flex items-center">
                            <input type="checkbox"
                                   x-model="form.terms"
                                   @change="validate('terms')"
                                   class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                            <span class="ml-2 text-sm text-gray-600">I accept the terms and conditions *</span>
                        </label>
                        <p x-show="hasError('terms')" x-text="error('terms')" class="text-red-500 text-sm mt-1"></p>
                    </div>

                    {{-- Submit --}}
                    <div class="flex items-center justify-between pt-4">
                        <button type="submit"
                                :disabled="validating"
                                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                            <span x-show="!validating">Create Account</span>
                            <span x-show="validating">Validating...</span>
                        </button>

                        <button type="button"
                                @click="reset()"
                                class="px-4 py-2 text-gray-600 hover:text-gray-800">
                            Reset Form
                        </button>
                    </div>

                    {{-- Debug Info --}}
                    <div class="mt-4 p-4 bg-gray-50 rounded-md text-sm">
                        <div class="grid grid-cols-2 gap-2">
                            <div>Form Valid: <span :class="isValid() ? 'text-green-600 font-semibold' : 'text-red-600'" x-text="isValid() ? 'Yes ✓' : 'No ✗'"></span></div>
                            <div>Has Errors: <span :class="hasErrors() ? 'text-red-600' : 'text-green-600'" x-text="hasErrors() ? 'Yes' : 'No'"></span></div>
                            <div>Validating: <span x-text="validating ? 'Yes' : 'No'"></span></div>
                            <div>Touched: <span x-text="Object.keys(touched).join(', ') || 'None'"></span></div>
                        </div>
                    </div>
                </form>
            </div>
        </section>

        {{-- ============================================================
             DEMO 3: Form with Remote (AJAX) Validation
             ============================================================ --}}
        <section class="bg-white p-6 rounded-lg shadow">
            <h2 class="text-xl font-semibold mb-4 text-gray-800">
                3. Remote Validation (AJAX)
            </h2>
            <p class="text-gray-600 text-sm mb-4">
                Rules like <code class="bg-gray-100 px-1 rounded">unique</code> and <code class="bg-gray-100 px-1 rounded">exists</code>
                are validated via AJAX to the server.
            </p>

            <div x-data="validation({
                rules: {
                    username: 'required|alpha_dash|min:3|unique:users,username',
                    email: 'required|email|unique:users,email'
                },
                messages: {
                    'username.unique': 'This username is already taken',
                    'email.unique': 'This email is already registered'
                }
            })">
                <form @submit.prevent="submit()" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input type="text"
                                   x-model="form.username"
                                   @blur="validate('username')"
                                   :class="stateClass('username')"
                                   class="w-full px-3 py-2 border rounded-md"
                                   placeholder="johndoe">
                            <p x-show="hasError('username')" x-text="error('username')" class="text-red-500 text-sm mt-1"></p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email"
                                   x-model="form.email"
                                   @blur="validate('email')"
                                   :class="stateClass('email')"
                                   class="w-full px-3 py-2 border rounded-md"
                                   placeholder="john@example.com">
                            <p x-show="hasError('email')" x-text="error('email')" class="text-red-500 text-sm mt-1"></p>
                        </div>
                    </div>

                    <p class="text-sm text-gray-500">
                        💡 The <code>unique</code> rule will make an AJAX request to validate against the database.
                    </p>
                </form>
            </div>
        </section>

        {{-- ============================================================
             DEMO 4: Using Rules from FormRequest
             ============================================================ --}}
        @if(isset($validation))
        <section class="bg-white p-6 rounded-lg shadow">
            <h2 class="text-xl font-semibold mb-4 text-gray-800">
                4. Using FormRequest Rules
            </h2>
            <p class="text-gray-600 text-sm mb-4">
                Rules extracted from a Laravel FormRequest class and passed to the view.
            </p>

            <div x-data="@alpineValidation($validation['rules'], $validation['messages'] ?? [], $validation['attributes'] ?? [])">
                {{-- Form fields here --}}
            </div>
        </section>
        @endif

    </div>

    <footer class="text-center py-8 text-gray-500 text-sm">
        Laravel Client Validation &copy; {{ date('Y') }}
    </footer>
</body>
</html>

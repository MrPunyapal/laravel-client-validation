{{--
==========================================================================
Laravel Client Validation - Vanilla JS Demo (No Alpine.js)
==========================================================================
This demo shows how to use client-side validation with just data-* attributes.
No Alpine.js required - perfect for simple Blade templates.
==========================================================================
--}}

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Laravel Client Validation - Vanilla JS Demo</title>

    {{-- Tailwind for styling (optional) --}}
    <script src="https://cdn.tailwindcss.com"></script>

    {{-- Include validation assets (no Alpine.js needed!) --}}
    @clientValidationAssets
</head>
<body class="bg-gray-100 min-h-screen py-8">
    <div class="max-w-4xl mx-auto space-y-8">
        <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-800">Laravel Client Validation</h1>
            <p class="text-gray-600 mt-2">Vanilla JavaScript Demo (No Alpine.js)</p>
        </div>

        {{-- ============================================================
             DEMO 1: Simple Form with data-validate
             ============================================================ --}}
        <section class="bg-white p-6 rounded-lg shadow">
            <h2 class="text-xl font-semibold mb-4 text-gray-800">
                1. Simple Form (data-validate attribute)
            </h2>
            <p class="text-gray-600 text-sm mb-4">
                Add <code class="bg-gray-100 px-1 rounded">data-validate</code> to the form and
                <code class="bg-gray-100 px-1 rounded">data-rules</code> to each input.
            </p>

            <form data-validate class="space-y-4">
                {{-- Email with blur validation (default) --}}
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                    </label>
                    <input type="email"
                           name="email"
                           data-rules="required|email"
                           placeholder="john@example.com"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                </div>

                {{-- Password --}}
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Password
                    </label>
                    <input type="password"
                           name="password"
                           data-rules="required|min:8"
                           data-message="Password must be at least 8 characters"
                           placeholder="••••••••"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                </div>

                <button type="submit"
                        class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Login
                </button>
            </form>
        </section>

        {{-- ============================================================
             DEMO 2: Different Validation Modes
             ============================================================ --}}
        <section class="bg-white p-6 rounded-lg shadow">
            <h2 class="text-xl font-semibold mb-4 text-gray-800">
                2. Validation Modes
            </h2>
            <p class="text-gray-600 text-sm mb-4">
                Use <code class="bg-gray-100 px-1 rounded">data-validate-on</code> to control when validation triggers.
            </p>

            <form data-validate class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {{-- Blur (default) --}}
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Blur Mode (default)
                        </label>
                        <input type="text"
                               name="blur_field"
                               data-rules="required|min:3"
                               data-validate-on="blur"
                               placeholder="Validates on blur"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    </div>

                    {{-- Live (on input) --}}
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Live Mode (as you type)
                        </label>
                        <input type="text"
                               name="live_field"
                               data-rules="required|alpha|min:2"
                               data-validate-on="input"
                               placeholder="Validates as you type"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    </div>

                    {{-- Submit only --}}
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Submit Mode
                        </label>
                        <input type="text"
                               name="submit_field"
                               data-rules="required|numeric"
                               data-validate-on="submit"
                               placeholder="Validates on submit only"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    </div>
                </div>

                <button type="submit"
                        class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                    Submit Form
                </button>
            </form>
        </section>

        {{-- ============================================================
             DEMO 3: Using Blade Directives
             ============================================================ --}}
        <section class="bg-white p-6 rounded-lg shadow">
            <h2 class="text-xl font-semibold mb-4 text-gray-800">
                3. Using Blade Directives
            </h2>
            <p class="text-gray-600 text-sm mb-4">
                Use <code class="bg-gray-100 px-1 rounded">@@rules()</code> directive to generate data attributes.
            </p>

            <form data-validate class="space-y-4">
                {{-- Using @rules directive --}}
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Username (@@rules directive)
                    </label>
                    <input type="text"
                           name="username"
                           @rules('username', 'required|alpha_dash|min:3|max:20', ['mode' => 'input'])
                           placeholder="Choose a username"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>

                {{-- Using @validateLive directive --}}
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Phone (@@validateLive directive)
                    </label>
                    <input type="tel"
                           name="phone"
                           @validateLive('phone', 'required|digits:10')
                           placeholder="10 digit phone number"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>

                {{-- Using @validateBlur directive --}}
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Website (@@validateBlur directive)
                    </label>
                    <input type="url"
                           name="website"
                           @validateBlur('website', 'nullable|url')
                           placeholder="https://example.com"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>

                <button type="submit"
                        class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                    Submit
                </button>
            </form>
        </section>

        {{-- ============================================================
             DEMO 4: Registration Form with All Features
             ============================================================ --}}
        <section class="bg-white p-6 rounded-lg shadow">
            <h2 class="text-xl font-semibold mb-4 text-gray-800">
                4. Complete Registration Form
            </h2>

            <form data-validate id="registration-form" class="space-y-4">
                {{-- Name --}}
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input type="text"
                           name="name"
                           data-rules="required|string|min:2|max:100"
                           data-attribute="full name"
                           placeholder="John Doe"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>

                {{-- Email --}}
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                    <input type="email"
                           name="email"
                           data-rules="required|email"
                           data-validate-on="blur"
                           placeholder="john@example.com"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>

                {{-- Password --}}
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                        <input type="password"
                               name="password"
                               data-rules="required|min:8"
                               data-message="Password must be at least 8 characters long"
                               placeholder="••••••••"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                        <input type="password"
                               name="password_confirmation"
                               data-rules="required|same:password"
                               data-message="Passwords do not match"
                               placeholder="••••••••"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    </div>
                </div>

                {{-- Age --}}
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Age</label>
                    <input type="number"
                           name="age"
                           data-rules="nullable|integer|min:13|max:120"
                           placeholder="25"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>

                {{-- Terms --}}
                <div class="flex items-center">
                    <input type="checkbox"
                           name="terms"
                           data-rules="accepted"
                           data-message="You must accept the terms and conditions"
                           class="h-4 w-4 text-blue-600 border-gray-300 rounded">
                    <label class="ml-2 block text-sm text-gray-700">
                        I accept the terms and conditions *
                    </label>
                </div>

                <div class="flex gap-4">
                    <button type="submit"
                            class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Create Account
                    </button>
                    <button type="reset"
                            class="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                        Reset
                    </button>
                </div>
            </form>
        </section>

        {{-- ============================================================
             DEMO 5: Programmatic Validation
             ============================================================ --}}
        <section class="bg-white p-6 rounded-lg shadow">
            <h2 class="text-xl font-semibold mb-4 text-gray-800">
                5. Programmatic Validation
            </h2>
            <p class="text-gray-600 text-sm mb-4">
                You can also create validators programmatically in JavaScript.
            </p>

            <form id="programmatic-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                    <input type="text"
                           name="api_key"
                           id="api_key"
                           placeholder="Enter your API key"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <div id="api_key_error" class="text-red-500 text-sm mt-1 hidden"></div>
                </div>

                <button type="button"
                        id="validate-btn"
                        class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    Validate Programmatically
                </button>
            </form>

            <script>
                document.addEventListener('DOMContentLoaded', function() {
                    // Create validator programmatically
                    const validator = new window.LaravelClientValidation.Validator({
                        rules: {
                            api_key: 'required|alpha_dash|size:32'
                        },
                        messages: {
                            'api_key.required': 'API key is required',
                            'api_key.size': 'API key must be exactly 32 characters'
                        }
                    });

                    document.getElementById('validate-btn').addEventListener('click', async function() {
                        const input = document.getElementById('api_key');
                        const errorEl = document.getElementById('api_key_error');

                        const result = await validator.validateField('api_key', input.value);

                        if (result.valid) {
                            input.classList.remove('border-red-500');
                            input.classList.add('border-green-500');
                            errorEl.classList.add('hidden');
                            alert('Valid API key!');
                        } else {
                            input.classList.remove('border-green-500');
                            input.classList.add('border-red-500');
                            errorEl.textContent = result.errors[0];
                            errorEl.classList.remove('hidden');
                        }
                    });
                });
            </script>
        </section>

    </div>

    <footer class="text-center py-8 text-gray-500 text-sm">
        Laravel Client Validation &copy; {{ date('Y') }}
    </footer>
</body>
</html>

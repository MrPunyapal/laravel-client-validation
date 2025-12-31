<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laravel Client Validation - Livewire Demo</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    <script src="https://cdn.tailwindcss.com"></script>
    @livewireStyles
    @clientValidationAssets
</head>
<body class="bg-gray-100 py-8">
    <div class="max-w-4xl mx-auto space-y-8">
        <h1 class="text-3xl font-bold text-center text-gray-800">Laravel Client Validation - Livewire Demo</h1>

        <!-- Example 1: Basic Livewire Form with x-wire-validate -->
        <div class="bg-white p-6 rounded-lg shadow">
            <h2 class="text-xl font-semibold mb-4">1. Basic Livewire Form</h2>
            <p class="text-gray-600 mb-4">Using x-wire-validate directive with wire:model</p>

            {{-- In a real app, this would be a Livewire component --}}
            <div wire:id="user-form" class="space-y-4">
                <form wire:submit="save">
                    <!-- Email with blur validation -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium mb-1">Email</label>
                        <input type="email"
                               wire:model="email"
                               x-wire-validate="'required|email'"
                               name="email"
                               placeholder="Enter your email"
                               class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <span class="validation-error text-red-500 text-sm mt-1" data-error="email"></span>
                    </div>

                    <!-- Username with live validation -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium mb-1">Username</label>
                        <input type="text"
                               wire:model.live="username"
                               x-wire-validate.live="'required|alpha_dash|min:3|max:20'"
                               name="username"
                               placeholder="Choose a username"
                               class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <span class="validation-error text-red-500 text-sm mt-1" data-error="username"></span>
                    </div>

                    <!-- Password -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium mb-1">Password</label>
                        <input type="password"
                               wire:model="password"
                               x-wire-validate="'required|min:8'"
                               name="password"
                               placeholder="Enter password"
                               class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <span class="validation-error text-red-500 text-sm mt-1" data-error="password"></span>
                    </div>

                    <!-- Password Confirmation -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium mb-1">Confirm Password</label>
                        <input type="password"
                               wire:model="password_confirmation"
                               x-wire-validate="'required|same:password'"
                               name="password_confirmation"
                               placeholder="Confirm password"
                               class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <span class="validation-error text-red-500 text-sm mt-1" data-error="password_confirmation"></span>
                    </div>

                    <button type="submit" class="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                        Create Account
                    </button>
                </form>
            </div>
        </div>

        <!-- Example 2: Conditional Validation -->
        <div class="bg-white p-6 rounded-lg shadow">
            <h2 class="text-xl font-semibold mb-4">2. Conditional Validation</h2>
            <p class="text-gray-600 mb-4">Fields that depend on other field values</p>

            <div wire:id="conditional-form" class="space-y-4">
                <form>
                    <!-- Role Selection -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium mb-1">Role</label>
                        <select wire:model.live="role"
                                name="role"
                                class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Select a role</option>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="moderator">Moderator</option>
                        </select>
                    </div>

                    <!-- Admin Key - Required if role is admin -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium mb-1">Admin Key</label>
                        <input type="text"
                               wire:model="admin_key"
                               x-wire-validate="'required_if:role,admin'"
                               name="admin_key"
                               placeholder="Required for admin role"
                               class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <span class="validation-error text-red-500 text-sm mt-1" data-error="admin_key"></span>
                    </div>

                    <!-- Moderator Region - Required if role is moderator -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium mb-1">Region</label>
                        <input type="text"
                               wire:model="region"
                               x-wire-validate="'required_if:role,moderator'"
                               name="region"
                               placeholder="Required for moderator role"
                               class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <span class="validation-error text-red-500 text-sm mt-1" data-error="region"></span>
                    </div>
                </form>
            </div>
        </div>

        <!-- Example 3: Advanced Validation Rules -->
        <div class="bg-white p-6 rounded-lg shadow">
            <h2 class="text-xl font-semibold mb-4">3. Advanced Validation</h2>
            <p class="text-gray-600 mb-4">Demonstrating various validation rules</p>

            <div wire:id="advanced-form" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Date -->
                <div>
                    <label class="block text-sm font-medium mb-1">Birth Date</label>
                    <input type="date"
                           wire:model="birth_date"
                           x-wire-validate="'required|date|before:today'"
                           name="birth_date"
                           class="w-full px-3 py-2 border rounded-md">
                    <span class="validation-error text-red-500 text-sm mt-1" data-error="birth_date"></span>
                </div>

                <!-- IP Address -->
                <div>
                    <label class="block text-sm font-medium mb-1">IP Address</label>
                    <input type="text"
                           wire:model="ip_address"
                           x-wire-validate.live="'nullable|ip'"
                           name="ip_address"
                           placeholder="192.168.1.1"
                           class="w-full px-3 py-2 border rounded-md">
                    <span class="validation-error text-red-500 text-sm mt-1" data-error="ip_address"></span>
                </div>

                <!-- MAC Address -->
                <div>
                    <label class="block text-sm font-medium mb-1">MAC Address</label>
                    <input type="text"
                           wire:model="mac_address"
                           x-wire-validate.live="'nullable|mac_address'"
                           name="mac_address"
                           placeholder="00:1A:2B:3C:4D:5E"
                           class="w-full px-3 py-2 border rounded-md">
                    <span class="validation-error text-red-500 text-sm mt-1" data-error="mac_address"></span>
                </div>

                <!-- UUID -->
                <div>
                    <label class="block text-sm font-medium mb-1">UUID</label>
                    <input type="text"
                           wire:model="uuid"
                           x-wire-validate.live="'nullable|uuid'"
                           name="uuid"
                           placeholder="550e8400-e29b-41d4-a716-446655440000"
                           class="w-full px-3 py-2 border rounded-md">
                    <span class="validation-error text-red-500 text-sm mt-1" data-error="uuid"></span>
                </div>

                <!-- Hex Color -->
                <div>
                    <label class="block text-sm font-medium mb-1">Color (Hex)</label>
                    <input type="text"
                           wire:model="color"
                           x-wire-validate.live="'nullable|hex_color'"
                           name="color"
                           placeholder="#FF5733"
                           class="w-full px-3 py-2 border rounded-md">
                    <span class="validation-error text-red-500 text-sm mt-1" data-error="color"></span>
                </div>

                <!-- Timezone -->
                <div>
                    <label class="block text-sm font-medium mb-1">Timezone</label>
                    <input type="text"
                           wire:model="timezone"
                           x-wire-validate.live="'nullable|timezone'"
                           name="timezone"
                           placeholder="America/New_York"
                           class="w-full px-3 py-2 border rounded-md">
                    <span class="validation-error text-red-500 text-sm mt-1" data-error="timezone"></span>
                </div>

                <!-- Decimal -->
                <div>
                    <label class="block text-sm font-medium mb-1">Price (2 decimals)</label>
                    <input type="text"
                           wire:model="price"
                           x-wire-validate.live="'nullable|decimal:2'"
                           name="price"
                           placeholder="19.99"
                           class="w-full px-3 py-2 border rounded-md">
                    <span class="validation-error text-red-500 text-sm mt-1" data-error="price"></span>
                </div>

                <!-- Multiple Of -->
                <div>
                    <label class="block text-sm font-medium mb-1">Quantity (multiple of 5)</label>
                    <input type="number"
                           wire:model="quantity"
                           x-wire-validate.live="'nullable|numeric|multiple_of:5'"
                           name="quantity"
                           placeholder="5, 10, 15..."
                           class="w-full px-3 py-2 border rounded-md">
                    <span class="validation-error text-red-500 text-sm mt-1" data-error="quantity"></span>
                </div>
            </div>
        </div>

        <!-- Example 4: Profile Form with All Fields -->
        <div class="bg-white p-6 rounded-lg shadow">
            <h2 class="text-xl font-semibold mb-4">4. Complete Profile Form</h2>
            <p class="text-gray-600 mb-4">A realistic form example</p>

            <div wire:id="profile-form">
                <form wire:submit="saveProfile" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- First Name -->
                        <div>
                            <label class="block text-sm font-medium mb-1">First Name</label>
                            <input type="text"
                                   wire:model="first_name"
                                   x-wire-validate="'required|alpha|min:2|max:50'"
                                   name="first_name"
                                   class="w-full px-3 py-2 border rounded-md">
                            <span class="validation-error text-red-500 text-sm mt-1" data-error="first_name"></span>
                        </div>

                        <!-- Last Name -->
                        <div>
                            <label class="block text-sm font-medium mb-1">Last Name</label>
                            <input type="text"
                                   wire:model="last_name"
                                   x-wire-validate="'required|alpha|min:2|max:50'"
                                   name="last_name"
                                   class="w-full px-3 py-2 border rounded-md">
                            <span class="validation-error text-red-500 text-sm mt-1" data-error="last_name"></span>
                        </div>
                    </div>

                    <!-- Email -->
                    <div>
                        <label class="block text-sm font-medium mb-1">Email Address</label>
                        <input type="email"
                               wire:model="profile_email"
                               x-wire-validate="'required|email'"
                               name="profile_email"
                               class="w-full px-3 py-2 border rounded-md">
                        <span class="validation-error text-red-500 text-sm mt-1" data-error="profile_email"></span>
                    </div>

                    <!-- Website -->
                    <div>
                        <label class="block text-sm font-medium mb-1">Website</label>
                        <input type="url"
                               wire:model="website"
                               x-wire-validate="'nullable|active_url'"
                               name="website"
                               placeholder="https://example.com"
                               class="w-full px-3 py-2 border rounded-md">
                        <span class="validation-error text-red-500 text-sm mt-1" data-error="website"></span>
                    </div>

                    <!-- Bio (lowercase only) -->
                    <div>
                        <label class="block text-sm font-medium mb-1">Bio (lowercase)</label>
                        <textarea wire:model="bio"
                                  x-wire-validate="'nullable|lowercase|max:500'"
                                  name="bio"
                                  rows="3"
                                  placeholder="Tell us about yourself (lowercase only)"
                                  class="w-full px-3 py-2 border rounded-md"></textarea>
                        <span class="validation-error text-red-500 text-sm mt-1" data-error="bio"></span>
                    </div>

                    <!-- Age -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">Age</label>
                            <input type="number"
                                   wire:model="age"
                                   x-wire-validate="'nullable|integer|between:18,120'"
                                   name="age"
                                   class="w-full px-3 py-2 border rounded-md">
                            <span class="validation-error text-red-500 text-sm mt-1" data-error="age"></span>
                        </div>

                        <!-- Phone -->
                        <div>
                            <label class="block text-sm font-medium mb-1">Phone</label>
                            <input type="tel"
                                   wire:model="phone"
                                   x-wire-validate="'nullable|digits_between:10,15'"
                                   name="phone"
                                   placeholder="1234567890"
                                   class="w-full px-3 py-2 border rounded-md">
                            <span class="validation-error text-red-500 text-sm mt-1" data-error="phone"></span>
                        </div>
                    </div>

                    <!-- Terms -->
                    <div class="flex items-center space-x-2">
                        <input type="checkbox"
                               wire:model="terms"
                               x-wire-validate="'accepted'"
                               name="terms"
                               id="terms"
                               class="rounded border-gray-300">
                        <label for="terms" class="text-sm">I accept the terms and conditions</label>
                    </div>
                    <span class="validation-error text-red-500 text-sm" data-error="terms"></span>

                    <button type="submit" class="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                        Save Profile
                    </button>
                </form>
            </div>
        </div>

        <!-- Validation Modes Reference -->
        <div class="bg-gray-800 text-white p-6 rounded-lg shadow">
            <h2 class="text-xl font-semibold mb-4">📖 Validation Modes Reference</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                    <code class="text-green-400">x-wire-validate="'rules'"</code>
                    <p class="text-gray-300 mt-1">Validates on blur (default)</p>
                </div>
                <div>
                    <code class="text-green-400">x-wire-validate.live="'rules'"</code>
                    <p class="text-gray-300 mt-1">Validates as you type (debounced)</p>
                </div>
                <div>
                    <code class="text-green-400">x-wire-validate.blur="'rules'"</code>
                    <p class="text-gray-300 mt-1">Validates when field loses focus</p>
                </div>
                <div>
                    <code class="text-green-400">wire:model + x-wire-validate</code>
                    <p class="text-gray-300 mt-1">Works seamlessly with Livewire binding</p>
                </div>
            </div>
        </div>

    </div>

    @livewireScripts
</body>
</html>

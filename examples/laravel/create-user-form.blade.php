<!-- resources/views/user/create.blade.php -->
@extends('layouts.app')

@section('content')
<div class="container">
    <h1>Create New User</h1>

    {{-- Include validation assets --}}
    @clientValidationAssets

    <form method="POST" action="{{ route('users.store') }}"
          x-data="userForm"
          @submit.prevent="submitForm">
        @csrf

        <div class="row">
            <div class="col-md-6">
                <div class="form-group">
                    <label for="name">Full Name *</label>
                    <input type="text"
                           class="form-control"
                           id="name"
                           name="name"
                           x-model="form.name"
                           x-validate.live="rules.name"
                           placeholder="Enter your full name">
                    <div x-show="hasError('name')" x-text="getError('name')" class="text-danger"></div>
                </div>

                <div class="form-group">
                    <label for="email">Email Address *</label>
                    <input type="email"
                           class="form-control"
                           id="email"
                           name="email"
                           x-model="form.email"
                           x-validate.live="rules.email"
                           placeholder="user@example.com">
                    <div x-show="hasError('email')" x-text="getError('email')" class="text-danger"></div>
                </div>

                <div class="form-group">
                    <label for="password">Password *</label>
                    <input type="password"
                           class="form-control"
                           id="password"
                           name="password"
                           x-model="form.password"
                           x-validate.live="rules.password"
                           placeholder="Enter password">
                    <div x-show="hasError('password')" x-text="getError('password')" class="text-danger"></div>
                </div>

                <div class="form-group">
                    <label for="password_confirmation">Confirm Password *</label>
                    <input type="password"
                           class="form-control"
                           id="password_confirmation"
                           name="password_confirmation"
                           x-model="form.password_confirmation"
                           x-validate.live="rules.password_confirmation"
                           placeholder="Confirm password">
                    <div x-show="hasError('password_confirmation')" x-text="getError('password_confirmation')" class="text-danger"></div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="form-group">
                    <label for="age">Age *</label>
                    <input type="number"
                           class="form-control"
                           id="age"
                           name="age"
                           x-model="form.age"
                           x-validate.live="rules.age"
                           placeholder="Enter your age">
                    <div x-show="hasError('age')" x-text="getError('age')" class="text-danger"></div>
                </div>

                <div class="form-group">
                    <label for="phone">Phone Number</label>
                    <input type="tel"
                           class="form-control"
                           id="phone"
                           name="phone"
                           x-model="form.phone"
                           x-validate.live="rules.phone"
                           placeholder="1234567890">
                    <div x-show="hasError('phone')" x-text="getError('phone')" class="text-danger"></div>
                </div>

                <div class="form-group">
                    <label for="website">Website</label>
                    <input type="url"
                           class="form-control"
                           id="website"
                           name="website"
                           x-model="form.website"
                           x-validate.live="rules.website"
                           placeholder="https://example.com">
                    <div x-show="hasError('website')" x-text="getError('website')" class="text-danger"></div>
                </div>

                <div class="form-group">
                    <label for="bio">Biography</label>
                    <textarea class="form-control"
                              id="bio"
                              name="bio"
                              x-model="form.bio"
                              x-validate.live="rules.bio"
                              rows="4"
                              placeholder="Tell us about yourself"></textarea>
                    <div x-show="hasError('bio')" x-text="getError('bio')" class="text-danger"></div>
                </div>
            </div>
        </div>

        <div class="form-group form-check">
            <input type="checkbox"
                   class="form-check-input"
                   id="terms"
                   name="terms"
                   x-model="form.terms"
                   x-validate.live="rules.terms"
                   value="1">
            <label class="form-check-label" for="terms">
                I accept the <a href="#" target="_blank">terms and conditions</a> *
            </label>
            <div x-show="hasError('terms')" x-text="getError('terms')" class="text-danger"></div>
        </div>

        <div class="form-group">
            <button type="submit"
                    class="btn btn-primary"
                    :disabled="isValidating || !isValid()">
                <span x-show="isValidating">Creating User...</span>
                <span x-show="!isValidating">Create User</span>
            </button>
            <a href="{{ route('users.index') }}" class="btn btn-secondary">Cancel</a>
        </div>

        <div x-show="isValid() && Object.keys(form).some(key => form[key])" class="alert alert-success">
            All fields are valid! Ready to submit.
        </div>
    </form>
</div>

<script>
    // Initialize Alpine.js component with FormRequest validation
    document.addEventListener('alpine:init', () => {
        Alpine.data('userForm', () => {
            // Get validation data from FormRequest
            const validationData = @json(app('client-validation')->fromRequest(App\Http\Requests\CreateUserRequest::class));

            return {
                ...Alpine.store('validateForm')(
                    validationData.rules,
                    validationData.messages,
                    validationData.attributes
                ),

                // Additional methods specific to user form
                async submitForm(event) {
                    if (await this.validate()) {
                        // If validation passes, submit the actual form
                        event.target.submit();
                    }
                }
            };
        });
    });
</script>
@endsection

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|min:2|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'age' => 'required|integer|min:18|max:120',
            'phone' => 'nullable|regex:/^[0-9]{10,15}$/',
            'website' => 'nullable|url',
            'bio' => 'nullable|string|max:1000',
            'terms' => 'required|accepted',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Please provide your full name.',
            'email.unique' => 'This email address is already registered.',
            'password.confirmed' => 'Password confirmation does not match.',
            'age.min' => 'You must be at least 18 years old.',
            'phone.regex' => 'Please enter a valid phone number (10-15 digits).',
            'terms.accepted' => 'You must accept the terms and conditions.',
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'full name',
            'email' => 'email address',
            'password' => 'password',
            'password_confirmation' => 'password confirmation',
            'age' => 'age',
            'phone' => 'phone number',
            'website' => 'website URL',
            'bio' => 'biography',
            'terms' => 'terms and conditions',
        ];
    }
}

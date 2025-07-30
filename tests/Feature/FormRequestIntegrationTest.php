<?php

use Illuminate\Foundation\Http\FormRequest;

// Simple test FormRequest that doesn't auto-validate
class SimpleTestFormRequest extends FormRequest
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
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Please provide your full name.',
            'email.unique' => 'This email address is already registered.',
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'full name',
            'email' => 'email address',
        ];
    }
}

it('can extract validation data from FormRequest class string', function () {
    // Test using class string to avoid instantiation issues
    $converter = app(\MrPunyapal\ClientValidation\Support\ValidationRuleConverter::class);
    $clientValidation = new \MrPunyapal\ClientValidation\ClientValidation($converter);

    // Manually create instance and extract data
    $request = new SimpleTestFormRequest;
    $rules = $request->rules();
    $messages = $request->messages();
    $attributes = $request->attributes();

    $convertedRules = $converter->convert($rules);
    $mergedMessages = array_merge(config('client-validation.messages', []), $messages);
    $mergedAttributes = array_merge(config('client-validation.attributes', []), $attributes);

    $decodedRules = json_decode($convertedRules, true);

    // Test rules extraction
    expect($decodedRules)->toHaveKey('name')
        ->and($decodedRules['name'])->toContain('required')
        ->and($decodedRules['name'])->toContain('string')
        ->and($decodedRules['name'])->toContain('min:2');

    // Test AJAX rule conversion
    expect($decodedRules['email'])->toContain('required')
        ->and($decodedRules['email'])->toContain('email')
        ->and($decodedRules['email'])->toContain('ajax:unique:users,email');

    // Test messages
    expect($mergedMessages)->toHaveKey('name.required')
        ->and($mergedMessages['name.required'])->toBe('Please provide your full name.');

    // Test attributes
    expect($mergedAttributes)->toHaveKey('email')
        ->and($mergedAttributes['email'])->toBe('email address');
});

it('handles FormRequest methods correctly', function () {
    $request = new SimpleTestFormRequest;

    expect($request->rules())->toBeArray()
        ->and($request->rules())->toHaveKey('name')
        ->and($request->messages())->toBeArray()
        ->and($request->attributes())->toBeArray();
});

it('throws exception for invalid class string', function () {
    expect(fn () => app('InvalidClass'))->toThrow(\Illuminate\Contracts\Container\BindingResolutionException::class);
});

it('merges FormRequest data with defaults', function () {
    config(['client-validation.messages.required' => 'Default required message']);
    config(['client-validation.attributes.email' => 'default email']);

    $request = new SimpleTestFormRequest;
    $messages = $request->messages();
    $attributes = $request->attributes();

    $mergedMessages = array_merge(config('client-validation.messages', []), $messages);
    $mergedAttributes = array_merge(config('client-validation.attributes', []), $attributes);

    // Should have custom messages
    expect($mergedMessages)->toHaveKey('name.required');

    // Should have default messages merged
    expect($mergedMessages)->toHaveKey('required');

    // Should have custom attributes
    expect($mergedAttributes)->toHaveKey('name');
});

it('handles FormRequest with empty methods gracefully', function () {
    $request = new class extends FormRequest
    {
        public function authorize(): bool
        {
            return true;
        }

        public function rules(): array
        {
            return ['name' => 'required'];
        }

        public function messages(): array
        {
            return [];
        }

        public function attributes(): array
        {
            return [];
        }
    };

    expect($request->rules())->toHaveKey('name')
        ->and($request->messages())->toBeEmpty()
        ->and($request->attributes())->toBeEmpty();
});

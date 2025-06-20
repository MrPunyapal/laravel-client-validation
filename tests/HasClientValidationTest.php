<?php

use Illuminate\Routing\Controller;
use MrPunyapal\ClientValidation\Concerns\HasClientValidation;

it('can share validation rules', function () {
    $controller = new class extends Controller {
        use HasClientValidation;

        public function test()
        {
            $this->shareValidationRules('testRules', [
                'name' => 'required|min:2',
                'email' => 'required|email'
            ]);
        }
    };

    // Test that it doesn't throw errors
    expect(fn() => $controller->test())->not->toThrow(Exception::class);
});

it('can share common rules from config', function () {
    config(['client-validation.common_rules.user' => [
        'name' => 'required|string',
        'email' => 'required|email'
    ]]);

    $controller = new class extends Controller {
        use HasClientValidation;

        public function test()
        {
            $this->shareCommonRules('userRules', 'user');
        }
    };

    // Test that it doesn't throw errors
    expect(fn() => $controller->test())->not->toThrow(Exception::class);
});

it('can get common rules from config', function () {
    config(['client-validation.common_rules.test' => [
        'field1' => 'required',
        'field2' => 'email'
    ]]);

    $controller = new class extends Controller {
        use HasClientValidation;

        public function getRules()
        {
            return $this->getCommonRules('test');
        }
    };

    $rules = $controller->getRules();

    expect($rules)->toBe([
        'field1' => 'required',
        'field2' => 'email'
    ]);
});

it('returns empty array for non-existent rules', function () {
    $controller = new class extends Controller {
        use HasClientValidation;

        public function getRules()
        {
            return $this->getCommonRules('non-existent');
        }
    };

    $rules = $controller->getRules();

    expect($rules)->toBe([]);
});

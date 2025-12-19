<?php

use MrPunyapal\ClientValidation\Hooks\ValidationHooks;

describe('ValidationHooks', function () {
    beforeEach(function () {
        $this->hooks = new ValidationHooks();
    });

    it('can register and fire before_validate hook', function () {
        $called = false;
        $this->hooks->beforeValidate(function () use (&$called) {
            $called = true;
        });

        expect($this->hooks->has('before_validate'))->toBeTrue();

        $this->hooks->fire('before_validate');

        expect($called)->toBeTrue();
    });

    it('can register and fire after_validate hook', function () {
        $result = null;
        $this->hooks->afterValidate(function ($data) use (&$result) {
            $result = $data;
        });

        $this->hooks->fire('after_validate', 'test_data');

        expect($result)->toBe('test_data');
    });

    it('can register and fire on_passes hook', function () {
        $passCount = 0;
        $this->hooks->onPasses(function () use (&$passCount) {
            $passCount++;
        });

        $this->hooks->fire('on_passes');
        $this->hooks->fire('on_passes');

        expect($passCount)->toBe(2);
    });

    it('can register and fire on_fails hook', function () {
        $errors = [];
        $this->hooks->onFails(function ($error) use (&$errors) {
            $errors[] = $error;
        });

        $this->hooks->fire('on_fails', 'Error 1');
        $this->hooks->fire('on_fails', 'Error 2');

        expect($errors)->toBe(['Error 1', 'Error 2']);
    });

    it('can register field-level hooks', function () {
        $beforeFieldCalled = false;
        $afterFieldCalled = false;

        $this->hooks->beforeFieldValidate(fn () => $beforeFieldCalled = true);
        $this->hooks->afterFieldValidate(fn () => $afterFieldCalled = true);

        expect($this->hooks->has('before_field_validate'))->toBeTrue()
            ->and($this->hooks->has('after_field_validate'))->toBeTrue();
    });

    it('fires multiple callbacks for same event', function () {
        $results = [];

        $this->hooks->beforeValidate(function () use (&$results) {
            $results[] = 'callback1';
        });
        $this->hooks->beforeValidate(function () use (&$results) {
            $results[] = 'callback2';
        });
        $this->hooks->beforeValidate(function () use (&$results) {
            $results[] = 'callback3';
        });

        $this->hooks->fire('before_validate');

        expect($results)->toHaveCount(3)
            ->and($results)->toBe(['callback1', 'callback2', 'callback3']);
    });

    it('can fire async and collect results', function () {
        $this->hooks->afterValidate(fn () => 'result1');
        $this->hooks->afterValidate(fn () => 'result2');

        $results = $this->hooks->fireAsync('after_validate');

        expect($results)->toBe(['result1', 'result2']);
    });

    it('returns false for has when no hooks registered', function () {
        expect($this->hooks->has('before_validate'))->toBeFalse()
            ->and($this->hooks->has('non_existent'))->toBeFalse();
    });

    it('can clear specific event hooks', function () {
        $this->hooks->beforeValidate(fn () => null);
        $this->hooks->afterValidate(fn () => null);

        expect($this->hooks->has('before_validate'))->toBeTrue();

        $this->hooks->clear('before_validate');

        expect($this->hooks->has('before_validate'))->toBeFalse()
            ->and($this->hooks->has('after_validate'))->toBeTrue();
    });

    it('can clear all hooks', function () {
        $this->hooks->beforeValidate(fn () => null);
        $this->hooks->afterValidate(fn () => null);
        $this->hooks->onPasses(fn () => null);

        $this->hooks->clear();

        expect($this->hooks->has('before_validate'))->toBeFalse()
            ->and($this->hooks->has('after_validate'))->toBeFalse()
            ->and($this->hooks->has('on_passes'))->toBeFalse();
    });

    it('converts to array with hook counts', function () {
        $this->hooks->beforeValidate(fn () => null);
        $this->hooks->beforeValidate(fn () => null);
        $this->hooks->onFails(fn () => null);

        $array = $this->hooks->toArray();

        expect($array['before_validate'])->toBe(2)
            ->and($array['on_fails'])->toBe(1)
            ->and($array['after_validate'])->toBe(0);
    });

    it('handles firing non-existent events gracefully', function () {
        // Should not throw
        $this->hooks->fire('non_existent_event');

        expect(true)->toBeTrue();
    });

    it('passes multiple arguments to callbacks', function () {
        $capturedArgs = [];

        $this->hooks->afterValidate(function (...$args) use (&$capturedArgs) {
            $capturedArgs = $args;
        });

        $this->hooks->fire('after_validate', 'arg1', 'arg2', 'arg3');

        expect($capturedArgs)->toBe(['arg1', 'arg2', 'arg3']);
    });
});

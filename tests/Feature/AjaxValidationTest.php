<?php

use Illuminate\Http\Request;
use MrPunyapal\ClientValidation\Http\Controllers\ValidationController;

it('validates field successfully with valid data', function () {
    $controller = new ValidationController;

    $request = Request::create('/validate', 'POST', [
        'field' => 'email',
        'value' => 'test@example.com',
        'rule' => 'email',
        'parameters' => [],
        'messages' => [],
        'attributes' => [],
    ]);

    $response = $controller->validate($request);
    $data = $response->getData(true);

    expect($response->getStatusCode())->toBe(200)
        ->and($data['valid'])->toBeTrue()
        ->and($data)->not->toHaveKey('message');
});

it('validates field and returns error for invalid data', function () {
    $controller = new ValidationController;

    $request = Request::create('/validate', 'POST', [
        'field' => 'email',
        'value' => 'invalid-email',
        'rule' => 'email',
        'parameters' => [],
        'messages' => [],
        'attributes' => [],
    ]);

    $response = $controller->validate($request);
    $data = $response->getData(true);

    expect($response->getStatusCode())->toBe(200)
        ->and($data['valid'])->toBeFalse()
        ->and($data)->toHaveKey('message')
        ->and($data['message'])->toBeString();
});

it('validates field with parameters', function () {
    $controller = new ValidationController;

    $request = Request::create('/validate', 'POST', [
        'field' => 'name',
        'value' => 'a',
        'rule' => 'min',
        'parameters' => ['3'],
        'messages' => [],
        'attributes' => [],
    ]);

    $response = $controller->validate($request);
    $data = $response->getData(true);

    expect($data['valid'])->toBeFalse()
        ->and($data['message'])->toContain('3');
});

it('handles custom messages', function () {
    $controller = new ValidationController;

    $request = Request::create('/validate', 'POST', [
        'field' => 'email',
        'value' => 'invalid-email',
        'rule' => 'email',
        'parameters' => [],
        'messages' => ['email' => 'Custom email error message'],
        'attributes' => [],
    ]);

    $response = $controller->validate($request);
    $data = $response->getData(true);

    expect($data['valid'])->toBeFalse()
        ->and($data['message'])->toBe('Custom email error message');
});

it('handles custom attributes', function () {
    $controller = new ValidationController;

    $request = Request::create('/validate', 'POST', [
        'field' => 'user_email',
        'value' => 'invalid-email',
        'rule' => 'email',
        'parameters' => [],
        'messages' => [],
        'attributes' => ['user_email' => 'Email Address'],
    ]);

    $response = $controller->validate($request);
    $data = $response->getData(true);

    expect($data['valid'])->toBeFalse()
        ->and($data['message'])->toContain('Email Address');
});

it('returns error for missing required parameters', function () {
    $controller = new ValidationController;

    $request = Request::create('/validate', 'POST', [
        'value' => 'test@example.com',
        'rule' => 'email',
    ]);

    $response = $controller->validate($request);
    $data = $response->getData(true);

    expect($data['valid'])->toBeFalse()
        ->and($data['message'])->toBe('Invalid request');
});

it('handles complex validation rules', function () {
    $controller = new ValidationController;

    $request = Request::create('/validate', 'POST', [
        'field' => 'status',
        'value' => 'invalid',
        'rule' => 'in',
        'parameters' => ['active', 'inactive', 'pending'],
        'messages' => [],
        'attributes' => [],
    ]);

    $response = $controller->validate($request);
    $data = $response->getData(true);

    expect($data['valid'])->toBeFalse()
        ->and($data['message'])->toContain('invalid');
});

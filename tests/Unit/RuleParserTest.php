<?php

use MrPunyapal\ClientValidation\Core\RuleParser;
use MrPunyapal\ClientValidation\Core\RuleData;
use MrPunyapal\ClientValidation\Core\ParsedFieldRules;

describe('Rule Parser', function () {
    beforeEach(function () {
        $this->parser = new RuleParser();
    });

    it('can parse and categorize basic validation rules', function () {
        $rules = [
            'email' => 'required|email|max:255',
            'username' => 'required|unique:users,username|alpha_dash',
            'password' => 'required|min:8|confirmed',
        ];

        $parsed = $this->parser->parse($rules);

        expect($parsed->getField('email'))->toBeInstanceOf(ParsedFieldRules::class);
        expect($parsed->getField('email')->hasClientRules())->toBeTrue();
        expect($parsed->getField('email')->hasServerRules())->toBeFalse();

        expect($parsed->getField('username')->hasClientRules())->toBeTrue();
        expect($parsed->getField('username')->hasServerRules())->toBeTrue();
        expect($parsed->getField('username')->requiresAjax())->toBeTrue();
    });

    it('correctly categorizes client-side rules', function () {
        $fieldRules = $this->parser->parseFieldRules('name', 'required|string|min:2|max:50');

        expect($fieldRules->hasClientRules())->toBeTrue();
        expect($fieldRules->hasServerRules())->toBeFalse();
        expect($fieldRules->requiresAjax())->toBeFalse();

        $clientRules = $fieldRules->toClientRuleStrings();
        expect($clientRules)->toContain('required')
            ->and($clientRules)->toContain('string')
            ->and($clientRules)->toContain('min:2')
            ->and($clientRules)->toContain('max:50');
    });

    it('correctly categorizes server-side rules', function () {
        $fieldRules = $this->parser->parseFieldRules('email', 'required|email|unique:users,email');

        expect($fieldRules->hasClientRules())->toBeTrue();
        expect($fieldRules->hasServerRules())->toBeTrue();
        expect($fieldRules->requiresAjax())->toBeTrue();

        $clientRules = $fieldRules->toClientRuleStrings();
        $serverRules = $fieldRules->toServerRuleStrings();

        expect($clientRules)->toContain('required')
            ->and($clientRules)->toContain('email');
        expect($serverRules)->toContain('unique:users,email');
    });

    it('handles conditional rules', function () {
        $fieldRules = $this->parser->parseFieldRules('phone', 'required_if:contact_method,phone|numeric');

        expect($fieldRules->hasConditionalRules())->toBeTrue();
        expect($fieldRules->requiresAjax())->toBeTrue();
    });

    it('can parse complex rule combinations', function () {
        $rules = [
            'user_id' => 'required|exists:users,id',
            'status' => 'required|in:active,inactive,pending',
            'metadata' => 'nullable|json',
            'tags' => 'array|min:1|max:5',
            'tags.*' => 'string|max:20',
        ];

        $parsed = $this->parser->parse($rules);

        expect($parsed->getField('user_id')->requiresAjax())->toBeTrue();
        expect($parsed->getField('status')->hasClientRules())->toBeTrue();
        expect($parsed->getField('status')->hasServerRules())->toBeFalse();
        expect($parsed->getField('metadata')->hasClientRules())->toBeTrue();
        expect($parsed->getField('tags')->hasClientRules())->toBeTrue();
    });

    it('handles regex rules properly', function () {
        $fieldRules = $this->parser->parseFieldRules('slug', 'required|regex:/^[a-z0-9-]+$/');

        expect($fieldRules->hasClientRules())->toBeTrue();

        $clientRules = $fieldRules->toClientRuleStrings();
        expect($clientRules)->toContain('required')
            ->and($clientRules)->toContain('regex:/^[a-z0-9-]+$/');
    });

    it('can add custom client-side rules', function () {
        $this->parser->addClientSideRule('custom_rule');

        $fieldRules = $this->parser->parseFieldRules('field', 'required|custom_rule:param');

        expect($fieldRules->hasClientRules())->toBeTrue();
        expect($fieldRules->toClientRuleStrings())->toContain('custom_rule:param');
    });

    it('can add custom server-side rules', function () {
        $this->parser->addServerSideRule('complex_validation');

        $fieldRules = $this->parser->parseFieldRules('field', 'required|complex_validation:param');

        expect($fieldRules->hasServerRules())->toBeTrue();
        expect($fieldRules->toServerRuleStrings())->toContain('complex_validation:param');
    });

    it('generates correct JSON output', function () {
        $rules = [
            'name' => 'required|string|min:2',
            'email' => 'required|email|unique:users,email',
        ];

        $parsed = $this->parser->parse($rules);
        $clientRules = $parsed->toClientRules();
        $ajaxRules = $parsed->toAjaxRules();

        expect($clientRules)->toHaveKey('name')
            ->and($clientRules)->toHaveKey('email');

        expect($ajaxRules)->toHaveKey('email')
            ->and($ajaxRules)->not->toHaveKey('name');

        expect($ajaxRules['email'])->toHaveKey('server')
            ->and($ajaxRules['email'])->toHaveKey('client');
    });
});

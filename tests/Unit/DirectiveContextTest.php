<?php

use MrPunyapal\ClientValidation\Core\DirectiveContext;
use MrPunyapal\ClientValidation\Core\ParsedFieldRules;
use MrPunyapal\ClientValidation\Core\RuleData;
use MrPunyapal\ClientValidation\Hooks\ValidationHooks;

describe('DirectiveContext', function () {
    it('can be created with basic field and rules', function () {
        $clientRules = [new RuleData('required', [], 'required')];
        $parsedRules = new ParsedFieldRules('email', $clientRules);

        $context = new DirectiveContext('email', $parsedRules);

        expect($context->getField())->toBe('email')
            ->and($context->getRules())->toBe($parsedRules)
            ->and($context->getOptions())->toBeArray()
            ->and($context->getHooks())->toBeInstanceOf(ValidationHooks::class);
    });

    it('generates blur mode directive by default', function () {
        $clientRules = [new RuleData('required', [], 'required')];
        $parsedRules = new ParsedFieldRules('name', $clientRules);
        $context = new DirectiveContext('name', $parsedRules);

        $directive = $context->toDirectiveString();

        expect($directive)->toBe("x-validate=\"'required'\"");
    });

    it('generates live mode directive', function () {
        $clientRules = [
            new RuleData('required', [], 'required'),
            new RuleData('email', [], 'email'),
        ];
        $parsedRules = new ParsedFieldRules('email', $clientRules);
        $context = new DirectiveContext('email', $parsedRules);

        $directive = $context->toDirectiveString('live');

        expect($directive)->toBe("x-validate.live=\"'required|email'\"");
    });

    it('generates form mode directive', function () {
        $clientRules = [new RuleData('min', ['8'], 'min:8')];
        $parsedRules = new ParsedFieldRules('password', $clientRules);
        $context = new DirectiveContext('password', $parsedRules);

        $directive = $context->toDirectiveString('form');

        expect($directive)->toBe("x-validate.form=\"'min:8'\"");
    });

    it('includes ajax rules when server validation required', function () {
        $clientRules = [new RuleData('required', [], 'required')];
        $serverRules = [new RuleData('unique', ['users', 'email'], 'unique:users,email')];
        $parsedRules = new ParsedFieldRules('email', $clientRules, $serverRules);
        $context = new DirectiveContext('email', $parsedRules);

        $directive = $context->toDirectiveString();

        expect($directive)->toContain('required')
            ->and($directive)->toContain('ajax:unique:users,email');
    });

    it('correctly reports if requires ajax', function () {
        $clientRules = [new RuleData('required', [], 'required')];
        $serverRules = [new RuleData('exists', ['users', 'id'], 'exists:users,id')];
        $parsedRules = new ParsedFieldRules('user_id', $clientRules, $serverRules);
        $context = new DirectiveContext('user_id', $parsedRules);

        expect($context->requiresAjax())->toBeTrue()
            ->and($context->hasClientRules())->toBeTrue();
    });

    it('generates correct client payload', function () {
        $clientRules = [
            new RuleData('required', [], 'required'),
            new RuleData('string', [], 'string'),
        ];
        $serverRules = [new RuleData('unique', ['posts', 'slug'], 'unique:posts,slug')];
        $parsedRules = new ParsedFieldRules('slug', $clientRules, $serverRules);
        $options = ['debounce_ms' => 300];
        $context = new DirectiveContext('slug', $parsedRules, $options);

        $payload = $context->toClientPayload();

        expect($payload)->toHaveKeys(['field', 'client_rules', 'server_rules', 'requires_ajax', 'options'])
            ->and($payload['field'])->toBe('slug')
            ->and($payload['requires_ajax'])->toBeTrue()
            ->and($payload['options']['debounce_ms'])->toBe(300);
    });

    it('uses provided validation hooks', function () {
        $hooks = new ValidationHooks();
        $hooks->beforeValidate(fn () => null);

        $parsedRules = new ParsedFieldRules('test', []);
        $context = new DirectiveContext('test', $parsedRules, [], $hooks);

        expect($context->getHooks())->toBe($hooks)
            ->and($context->getHooks()->has('before_validate'))->toBeTrue();
    });
});

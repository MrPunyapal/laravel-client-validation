<?php

namespace MrPunyapal\ClientValidation\Contracts;

use MrPunyapal\ClientValidation\Core\ParsedRules;

interface RuleParserInterface
{
    public function parse(array $rules): ParsedRules;
    public function parseFieldRules(string $field, $rules): \MrPunyapal\ClientValidation\Core\ParsedFieldRules;
    public function addTransformer(RuleTransformerInterface $transformer): void;
    public function addClientSideRule(string $rule): void;
    public function addServerSideRule(string $rule): void;
}

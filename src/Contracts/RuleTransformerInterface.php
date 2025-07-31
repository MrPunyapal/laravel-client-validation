<?php

namespace MrPunyapal\ClientValidation\Contracts;

use MrPunyapal\ClientValidation\Core\RuleData;

interface RuleTransformerInterface
{
    public function canTransform(RuleData $ruleData): bool;
    public function transform(RuleData $ruleData): array;
    public function getCategory(RuleData $ruleData): string;
}

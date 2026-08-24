<?php

declare(strict_types=1);

namespace MrPunyapal\ClientValidation\Livewire;

use Livewire\ComponentHook;

/**
 * Automatically makes client-side validation available in the browser.
 *
 * For any Livewire component using the WithClientValidation trait, this hook
 * embeds the parsed client-safe rules into the component snapshot memo. The
 * browser adapter reads `snapshot.memo.clientValidation` on component init and
 * binds live validation to all `wire:model` fields without any Blade changes.
 */
class ClientValidationHook extends ComponentHook
{
    public function skip(): bool
    {
        $component = $this->component;

        if (! is_object($component)) {
            return true;
        }

        return ! in_array(WithClientValidation::class, class_uses_recursive($component), true);
    }

    public function dehydrate($context): void
    {
        $payload = $this->component->getClientValidationPayload();

        if ($payload === []) {
            return;
        }

        $context->addMemo('clientValidation', $payload);
    }
}

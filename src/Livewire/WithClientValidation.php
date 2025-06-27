<?php

namespace MrPunyapal\ClientValidation\Livewire;

use MrPunyapal\ClientValidation\Facades\ClientValidation;

trait WithClientValidation
{
    public function getClientRulesProperty()
    {
        $rules = $this->extractRules();
        return ClientValidation::rules($rules);
    }

    public function getClientMessagesProperty()
    {
        $messages = $this->extractMessages();
        return ClientValidation::messages($messages);
    }

    public function getClientAttributesProperty()
    {
        $attributes = $this->extractValidationAttributes();
        return ClientValidation::attributes($attributes);
    }

    protected function extractRules(): array
    {
        return method_exists($this, 'rules')
            ? $this->rules()
            : (property_exists($this, 'rules') ? $this->rules : []);
    }

    protected function extractMessages(): array
    {
        return method_exists($this, 'messages')
            ? $this->messages()
            : (property_exists($this, 'messages') ? $this->messages : []);
    }

    protected function extractValidationAttributes(): array
    {
        return method_exists($this, 'validationAttributes')
            ? $this->validationAttributes()
            : [];
    }
}

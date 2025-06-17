<?php

namespace MrPunyapal\ClientValidation\Livewire;

use MrPunyapal\ClientValidation\Facades\ClientValidation;

trait WithClientValidation
{
    public function getClientRulesProperty()
    {
        $rules = method_exists($this, 'rules') ? $this->rules() : (property_exists($this, 'rules') ? $this->rules : []);

        return ClientValidation::rules($rules);
    }

    public function getClientMessagesProperty()
    {
        $messages = method_exists($this, 'messages') ? $this->messages() : (property_exists($this, 'messages') ? $this->messages : []);

        return json_encode($messages);
    }

    public function getClientAttributesProperty()
    {
        $attributes = method_exists($this, 'validationAttributes') ? $this->validationAttributes() : [];

        return json_encode($attributes);
    }
}

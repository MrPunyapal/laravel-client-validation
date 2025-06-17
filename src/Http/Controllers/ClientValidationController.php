<?php

namespace MrPunyapal\ClientValidation\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use MrPunyapal\ClientValidation\ClientValidation;

class ClientValidationController extends Controller
{
    public function __construct(
        protected ClientValidation $clientValidation
    ) {}

    public function getRules(string $form)
    {
        $rules = $this->clientValidation->getRulesForForm($form);

        return response()->json([
            'rules' => $rules,
        ]);
    }

    public function validate(Request $request)
    {
        $rules = $request->input('rules', []);
        $data = $request->input('data', []);

        $errors = $this->clientValidation->validateData($data, $rules);

        return response()->json([
            'valid' => empty($errors),
            'errors' => $errors,
        ]);
    }
}

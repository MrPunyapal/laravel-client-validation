<?php

namespace MrPunyapal\ClientValidation\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Validator;

class ValidationController extends Controller
{
    public function validate(Request $request)
    {
        $field = $request->input('field');
        $value = $request->input('value');
        $rule = $request->input('rule');
        $parameters = $request->input('parameters', []);

        if (! $field || ! $rule) {
            return response()->json(['valid' => false, 'message' => 'Invalid request']);
        }

        $fullRule = $rule;
        if (! empty($parameters)) {
            $fullRule .= ':'.implode(',', $parameters);
        }

        $validator = Validator::make(
            [$field => $value],
            [$field => $fullRule],
            $request->input('messages', []),
            $request->input('attributes', [])
        );

        if ($validator->fails()) {
            return response()->json([
                'valid' => false,
                'message' => $validator->errors()->first($field),
            ]);
        }

        return response()->json(['valid' => true]);
    }
}

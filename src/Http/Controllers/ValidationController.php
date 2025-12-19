<?php

declare(strict_types=1);

namespace MrPunyapal\ClientValidation\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Validator;

/**
 * Controller for AJAX validation requests.
 *
 * Handles server-side validation for rules that cannot be validated
 * client-side (e.g., unique, exists).
 */
class ValidationController extends Controller
{
    /**
     * Validate a single field via AJAX.
     */
    public function validate(Request $request): JsonResponse
    {
        $field = $request->input('field');
        $value = $request->input('value');
        $rule = $request->input('rule');

        if ($field === null || $rule === null) {
            return response()->json([
                'valid' => false,
                'message' => 'Invalid request: field and rule are required',
            ], 400);
        }

        $parameters = $request->input('parameters', []);
        $fullRule = $this->buildRule($rule, $parameters);

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

    /**
     * Build the full rule string with parameters.
     *
     * @param array<int, string> $parameters
     */
    private function buildRule(string $rule, array $parameters): string
    {
        if ($parameters === []) {
            return $rule;
        }

        return $rule . ':' . implode(',', $parameters);
    }
}

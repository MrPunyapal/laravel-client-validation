<?php

declare(strict_types=1);

namespace MrPunyapal\ClientValidation\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Validator;

/**
 * Controller for AJAX validation requests.
 *
 * Handles server-side validation for rules that cannot be validated
 * client-side (e.g., unique, exists). Supports single field and batch validation.
 */
class ValidationController extends Controller
{
    /**
     * Validate a single field via AJAX.
     */
    public function validate(Request $request): JsonResponse
    {
        if ($this->isRateLimited($request)) {
            return response()->json([
                'valid' => false,
                'message' => 'Too many validation requests. Please try again later.',
            ], 429);
        }

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
     * Validate multiple fields in a single batch request.
     */
    public function validateBatch(Request $request): JsonResponse
    {
        if ($this->isRateLimited($request)) {
            return response()->json([
                'valid' => false,
                'message' => 'Too many validation requests. Please try again later.',
            ], 429);
        }

        /** @var array<int, array{field: string, value: mixed, rule: string, parameters?: array<int, string>}> $validations */
        $validations = $request->input('validations', []);

        if (! is_array($validations) || $validations === []) {
            return response()->json([
                'valid' => false,
                'message' => 'Invalid request: validations array is required',
            ], 400);
        }

        $results = [];
        $allValid = true;

        foreach ($validations as $validation) {
            $field = $validation['field'] ?? null;
            $value = $validation['value'] ?? null;
            $rule = $validation['rule'] ?? null;
            $parameters = $validation['parameters'] ?? [];

            if ($field === null || $rule === null) {
                $results[] = [
                    'field' => $field,
                    'valid' => false,
                    'message' => 'field and rule are required',
                ];
                $allValid = false;

                continue;
            }

            $fullRule = $this->buildRule($rule, $parameters);

            $validator = Validator::make(
                [$field => $value],
                [$field => $fullRule],
                $request->input('messages', []),
                $request->input('attributes', [])
            );

            if ($validator->fails()) {
                $results[] = [
                    'field' => $field,
                    'valid' => false,
                    'message' => $validator->errors()->first($field),
                ];
                $allValid = false;
            } else {
                $results[] = [
                    'field' => $field,
                    'valid' => true,
                    'message' => null,
                ];
            }
        }

        return response()->json([
            'valid' => $allValid,
            'results' => $results,
        ]);
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

    /**
     * Check if the request should be rate limited.
     */
    private function isRateLimited(Request $request): bool
    {
        $maxAttempts = (int) config('client-validation.rate_limit.max_attempts', 60);

        if ($maxAttempts <= 0) {
            return false;
        }

        $key = 'client-validation:' . ($request->ip() ?? 'unknown');
        $decaySeconds = (int) config('client-validation.rate_limit.decay_seconds', 60);

        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            return true;
        }

        RateLimiter::hit($key, $decaySeconds);

        return false;
    }
}

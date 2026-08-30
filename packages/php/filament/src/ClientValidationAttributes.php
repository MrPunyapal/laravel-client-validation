<?php

declare(strict_types=1);

namespace MrPunyapal\ClientValidation\Filament;

use Closure;
use Filament\Forms\Components\Field;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\MarkdownEditor;
use Filament\Forms\Components\RichEditor;
use MrPunyapal\ClientValidation\Core\RuleData;
use MrPunyapal\ClientValidation\Core\RuleParser;
use Stringable;
use WeakMap;

/**
 * Resolves x-validate attributes for native Filament fields at render time.
 *
 * Two sources feed the resolver:
 *  - explicit per-field configuration registered through the clientValidation() macro,
 *    which is stored here in a WeakMap keyed by field instance
 *  - automatic inference from each field's own required state and validation rules,
 *    enabled through ClientValidationPlugin::enableAutoValidation()
 *
 * Everything resolves when Filament renders the field, so rules chained after the
 * macro call (or configured later on the form) are still picked up.
 *
 * Alongside the x-validate attribute, a `name` attribute is emitted with the
 * field's state path. Filament v5 native inputs render without an HTML name, but
 * the Alpine directive — and its sibling-value lookup for rules like `confirmed` —
 * require one to address the field.
 */
final class ClientValidationAttributes
{
    /**
     * @var WeakMap<Field, array{rules: mixed, mode: string|null, enabled: bool}>|null
     */
    private static ?WeakMap $explicit = null;

    private static bool $autoEnabled = false;

    private static string $defaultMode = 'blur';

    /**
     * Fields whose primary rendered element carries no name attribute; the Alpine
     * directive cannot bind there, so automatic inference skips them entirely.
     *
     * @var list<class-string<Field>>
     */
    private const INFERENCE_SKIP_LIST = [
        FileUpload::class,
        MarkdownEditor::class,
        RichEditor::class,
    ];

    /**
     * Record explicit client validation for a field, usually called from the macro.
     */
    public static function record(Field $field, string|array|Closure|null $rules, ?string $mode): void
    {
        self::$explicit ??= new WeakMap; // @phpstan-ignore assign.propertyType

        self::$explicit[$field] = [ // @phpstan-ignore assign.propertyType
            'rules' => $rules,
            'mode' => $mode,
            'enabled' => true,
        ];
    }

    /**
     * Mark a field as explicitly excluded. The entry is kept (not removed) so the
     * render-time resolver never falls through to automatic inference.
     */
    public static function disable(Field $field): void
    {
        self::$explicit ??= new WeakMap; // @phpstan-ignore assign.propertyType

        self::$explicit[$field] = [ // @phpstan-ignore assign.propertyType
            'rules' => null,
            'mode' => null,
            'enabled' => false,
        ];
    }

    /**
     * Apply plugin-wide settings; called whenever a panel boots the plugin.
     */
    public static function configure(bool $autoEnabled, string $defaultMode): void
    {
        self::$autoEnabled = $autoEnabled;
        self::$defaultMode = $defaultMode;
    }

    /**
     * Render-time entry point wired through Field::configureUsing().
     *
     * @return array<string, string>
     */
    public static function resolve(Field $field): array
    {
        if (! self::supportsNativeAttributes($field)) {
            return [];
        }

        if (self::$explicit !== null && isset(self::$explicit[$field])) {
            $explicit = self::$explicit[$field];

            if (! $explicit['enabled']) {
                return [];
            }

            return self::build($field, $explicit['rules'], $explicit['mode']);
        }

        if (! self::$autoEnabled || in_array($field::class, self::INFERENCE_SKIP_LIST, true)) {
            return [];
        }

        return self::build($field);
    }

    /**
     * Build the attributes for a field.
     *
     * @param  string|array<int, string>|Closure|null  $rules  Explicit rules; null triggers inference.
     * @return array<string, string>
     */
    public static function build(Field $field, string|array|Closure|null $rules = null, ?string $mode = null): array
    {
        $resolved = $rules === null
            ? self::inferRulesFromField($field)
            : self::normalizeRules($field->evaluate($rules));

        if ($resolved === null || $resolved === '') {
            return [];
        }

        $modifier = match ($mode ?? self::$defaultMode) {
            'live', 'input' => '.live',
            'submit', 'form' => '.submit',
            default => '',
        };

        $value = "'".str_replace(['\\', "'"], ['\\\\', "\\'"], $resolved)."'";

        $attributes = ["x-validate{$modifier}" => $value];

        // Filament v5 inputs carry no HTML name attribute, but the Alpine
        // x-validate directive (and its sibling lookup) require one to address
        // the field with. Use the state path so it matches wire:model.
        $statePath = self::resolveFieldName($field);

        if ($statePath !== '') {
            $attributes['name'] = $statePath;

            $messages = $field->getValidationMessages();

            if ($messages !== []) {
                $attributes['data-client-validation-messages'] = json_encode(
                    $messages,
                    JSON_THROW_ON_ERROR | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT,
                );
            }

            $attribute = $field->getValidationAttribute();

            if ($attribute !== '') {
                $attributes['data-client-validation-attribute'] = $attribute;
            }
        }

        return $attributes;
    }

    /**
     * Resolve the HTML name attribute for a field. In a rendered form this is
     * the absolute state path (matches wire:model); for unattached fields
     * (e.g. during unit tests) fall back to the field's own state segment.
     */
    private static function resolveFieldName(Field $field): string
    {
        try {
            return (string) $field->getStatePath();
        } catch (\Error) {
            // The field is not attached to a container yet, so the absolute
            // path cannot be built; use the field's own state segment.
            return (string) $field->getStatePath(isAbsolute: false);
        }
    }

    /**
     * Reset all state; primarily a seam for tests.
     */
    public static function reset(): void
    {
        self::$explicit = null;
        self::$autoEnabled = false;
        self::$defaultMode = 'blur';
    }

    /**
     * Native fields qualify unless they are trait-based (those render their own
     * attributes through their views), unnamed, disabled, hidden, or lack support
     * for extra input attributes altogether.
     */
    private static function supportsNativeAttributes(Field $field): bool
    {
        if (! method_exists($field, 'extraInputAttributes')) {
            return false;
        }

        if (method_exists($field, 'withClientValidation')) {
            return false;
        }

        if ($field->getName() === '') {
            return false;
        }

        // Disabled/hidden fields are intentionally not probed here: the state
        // checks consult the owning container (absent for standalone fields),
        // and the runtime is self-limiting anyway since disabled inputs never
        // fire blur/input events.

        return true;
    }

    private static function inferRulesFromField(Field $field): ?string
    {
        /** @var array<int, string|Stringable> $raw */
        $raw = [];

        if ($field->isRequired()) {
            $raw[] = 'required';
        }

        foreach ($field->getValidationRules() as $rule) {
            if (is_string($rule) || $rule instanceof Stringable) {
                $raw[] = $rule;
            }
        }

        if ($raw === []) {
            return null;
        }

        // Only rules the browser can handle become client-side attributes; the
        // parser drops server-only (unique, exists, ...) and unsupported ones.
        $parsed = app(RuleParser::class)->parseFieldRules(
            $field->getName(),
            implode('|', array_map(static fn (string|Stringable $rule): string => (string) $rule, $raw)),
        );

        $clientRules = array_map(
            static fn (RuleData $rule): string => $rule->getString(),
            $parsed->getClientRules(),
        );

        $clientRules = array_values(array_unique($clientRules));

        // Filament marks every field implicitly nullable; a lone nullable adds
        // no client-side behavior, so it is dropped to avoid a no-op directive.
        if ($clientRules === [] || $clientRules === ['nullable']) {
            return null;
        }

        return implode('|', $clientRules);
    }

    /**
     * @param  mixed  $rules  Already-evaluated explicit rules (string, array, or anything else).
     */
    private static function normalizeRules(mixed $rules): ?string
    {
        if (is_array($rules)) {
            $rules = implode('|', array_map(
                static fn (mixed $rule): string => (string) $rule,
                array_values($rules),
            ));
        }

        return is_string($rules) ? trim($rules) : null;
    }
}

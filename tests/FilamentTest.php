<?php

use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Schemas\Schema;
use Livewire\Component;
use MrPunyapal\ClientValidation\Filament\ClientValidationAttributes;
use MrPunyapal\ClientValidation\Filament\ClientValidationPlugin;
use MrPunyapal\ClientValidation\Filament\HasClientValidation;

beforeEach(function () {
    $this->component = new class
    {
        use HasClientValidation;

        public function evaluate($value)
        {
            return is_callable($value) ? $value() : $value;
        }

        public function isRequired(): bool
        {
            return true;
        }

        public function getValidationRules(): array
        {
            return ['required', 'email', 'max:255'];
        }
    };
});

it('has client validation disabled by default', function () {
    expect($this->component->hasClientValidation())->toBeFalse();
});

it('can enable client validation with explicit rules', function () {
    $this->component->clientValidation('required|email');

    expect($this->component->hasClientValidation())->toBeTrue()
        ->and($this->component->getClientValidationRules())->toBe('required|email');
});

it('can enable client validation with closure rules', function () {
    $this->component->clientValidation(fn () => 'required|min:3');

    expect($this->component->getClientValidationRules())->toBe('required|min:3');
});

it('can enable client validation using withClientValidation', function () {
    $this->component->withClientValidation();

    expect($this->component->hasClientValidation())->toBeTrue();
});

it('can disable client validation', function () {
    $this->component->withClientValidation();
    $this->component->withoutClientValidation();

    expect($this->component->hasClientValidation())->toBeFalse()
        ->and($this->component->getClientValidationRules())->toBeNull();
});

it('resolves rules from field when no explicit rules set', function () {
    $this->component->withClientValidation();

    $rules = $this->component->getClientValidationRules();

    expect($rules)->toContain('required')
        ->and($rules)->toContain('email')
        ->and($rules)->toContain('max:255');
});

it('returns blur modifier by default', function () {
    expect($this->component->getClientValidationModifier())->toBe('');
});

it('returns live modifier when set', function () {
    $this->component->clientValidationMode('live');

    expect($this->component->getClientValidationModifier())->toBe('.live');
});

it('returns submit modifier when set', function () {
    $this->component->clientValidationMode('submit');

    expect($this->component->getClientValidationModifier())->toBe('.submit');
});

it('generates validation attributes for Alpine.js', function () {
    $this->component->clientValidation('required|email');

    $attributes = $this->component->getClientValidationAttributes();

    expect($attributes)->toHaveKey('x-validate')
        ->and($attributes['x-validate'])->toBe("'required|email'");
});

it('generates live validation attributes', function () {
    $this->component->clientValidation('required|min:3')->clientValidationMode('live');

    $attributes = $this->component->getClientValidationAttributes();

    expect($attributes)->toHaveKey('x-validate.live')
        ->and($attributes['x-validate.live'])->toBe("'required|min:3'");
});

it('returns empty attributes when disabled', function () {
    $attributes = $this->component->getClientValidationAttributes();

    expect($attributes)->toBe([]);
});

it('supports fluent chaining', function () {
    $result = $this->component
        ->clientValidation('required')
        ->clientValidationMode('live');

    expect($result)->toBe($this->component);
});

beforeEach(function () {
    ClientValidationAttributes::reset();
    ClientValidationPlugin::registerFieldMacros();
    ClientValidationPlugin::registerFieldConfiguration();
});

afterEach(function () {
    ClientValidationAttributes::reset();
});

it('attaches x-validate to native fields through the clientValidation macro', function () {
    $field = TextInput::make('email')->clientValidation('required|email');

    $attributes = $field->getExtraInputAttributes();

    expect($attributes)->toHaveKey('x-validate')
        ->and($attributes['x-validate'])->toBe("'required|email'");
});

it('clientValidation() without rules infers the field own rules', function () {
    $field = TextInput::make('email')
        ->required()
        ->email()
        ->minLength(3)
        ->clientValidation();

    expect($field->getExtraInputAttributes())
        ->toHaveKey('x-validate', "'required|min:3|email'")
        ->toHaveKey('name', 'email');
});

it('clientValidation() without rules skips fields with only the default nullable rule', function () {
    $field = TextInput::make('plain')->clientValidation();

    expect($field->getExtraInputAttributes())->not->toHaveKey('x-validate');
});

it('emits a name attribute so the Alpine directive can bind to name-less inputs', function () {
    $field = TextInput::make('email')->clientValidation('required|email');

    expect($field->getExtraInputAttributes())->toHaveKey('name', 'email');
});

it('emits Filament validation messages and attributes for the Alpine adapter', function () {
    $field = TextInput::make('email')
        ->label('Email address')
        ->required()
        ->email()
        ->validationAttribute('email address')
        ->validationMessages([
            'required' => 'Please provide your :attribute.',
            'email' => 'Please provide a valid :attribute.',
        ])
        ->clientValidation();

    $attributes = $field->getExtraInputAttributes();

    expect($attributes)
        ->toHaveKey('data-client-validation-messages')
        ->toHaveKey('data-client-validation-attribute', 'email address')
        ->and(json_decode($attributes['data-client-validation-messages'], true, 512, JSON_THROW_ON_ERROR))
        ->toBe([
            'required' => 'Please provide your :attribute.',
            'email' => 'Please provide a valid :attribute.',
        ]);
});

it('emits the absolute state path as name inside a schema container', function () {
    $component = new class extends Component implements HasForms
    {
        use InteractsWithForms;

        public ?array $data = [];

        public function form(Schema $form): Schema
        {
            return $form
                ->statePath('data')
                ->schema([
                    TextInput::make('email')->clientValidation('required|email'),
                ]);
        }
    };

    $schema = $component->form(Schema::make($component));

    $field = $schema->getComponent('email');

    expect($field->getExtraInputAttributes())->toHaveKey('name', 'data.email');
});

it('auto mode also adds the name attribute', function () {
    ClientValidationAttributes::configure(autoEnabled: true, defaultMode: 'blur');

    $field = TextInput::make('email')->rules(['required', 'email']);

    expect($field->getExtraInputAttributes())->toHaveKey('name', 'email');
});

it('does not add a name attribute when no client rules resolve', function () {
    $field = TextInput::make('email');

    expect($field->getExtraInputAttributes())->not->toHaveKey('name')
        ->and($field->getExtraInputAttributes())->not->toHaveKey('x-validate');
});

it('preserves extra input attributes already set on the field', function () {
    $field = TextInput::make('email')
        ->extraInputAttributes(['data-test' => 'keep'])
        ->clientValidation('required');

    $attributes = $field->getExtraInputAttributes();

    expect($attributes)->toHaveKey('data-test', 'keep')
        ->and($attributes)->toHaveKey('x-validate');
});

it('evaluates closure rules at render time, not call time', function () {

    $strict = false;

    $field = TextInput::make('name')->clientValidation(function () use (&$strict) {
        return $strict ? 'required|min:3' : 'nullable';
    });

    expect($field->getExtraInputAttributes())->toHaveKey('x-validate', "'nullable'");

    $strict = true;

    expect($field->getExtraInputAttributes())->toHaveKey('x-validate', "'required|min:3'");
});

it('accepts array rules through the macro', function () {

    $field = TextInput::make('name')->clientValidation(['required', 'min:3']);

    expect($field->getExtraInputAttributes())->toHaveKey('x-validate', "'required|min:3'");
});

it('removes attributes again via withoutClientValidation', function () {

    $field = TextInput::make('email')->clientValidation('required|email')->withoutClientValidation();

    expect($field->getExtraInputAttributes())->not->toHaveKey('x-validate');
});

it('withoutClientValidation suppresses auto inference too', function () {
    ClientValidationAttributes::configure(autoEnabled: true, defaultMode: 'blur');

    $field = TextInput::make('email')->rules(['required', 'email'])->withoutClientValidation();

    expect($field->getExtraInputAttributes())->not->toHaveKey('x-validate');
});

it('auto mode infers client rules from a native field', function () {
    ClientValidationAttributes::configure(autoEnabled: true, defaultMode: 'blur');

    $field = TextInput::make('email')->rules(['email', 'max:255'])->required();

    expect($field->getExtraInputAttributes())->toHaveKey('x-validate', "'required|email|max:255'");
});

it('auto mode drops server-only rules like unique', function () {
    ClientValidationAttributes::configure(autoEnabled: true, defaultMode: 'blur');

    $field = TextInput::make('email')->rules(['required', 'email', 'unique:users,email']);

    $attributes = $field->getExtraInputAttributes();

    expect($attributes)->toHaveKey('x-validate')
        ->and($attributes['x-validate'])->not->toContain('unique');
});

it('auto mode uses the plugin validation mode as suffix', function () {
    ClientValidationAttributes::configure(autoEnabled: true, defaultMode: 'live');

    $field = TextInput::make('name')->rules(['required']);

    $attributes = $field->getExtraInputAttributes();

    expect($attributes)->toHaveKey('x-validate.live')
        ->and($attributes['x-validate.live'])->toContain('required');
});

it('auto mode is off by default', function () {

    $field = TextInput::make('name')->rules(['required']);

    expect($field->getExtraInputAttributes())->not->toHaveKey('x-validate');
});

it('auto mode skips editors and uploads whose element carries no name', function () {
    ClientValidationAttributes::configure(autoEnabled: true, defaultMode: 'blur');

    $richEditor = RichEditor::make('content')->rules(['required']);

    expect($richEditor->getExtraInputAttributes())->not->toHaveKey('x-validate');
});

it('explicit macro rules win over auto inference without duplication', function () {
    ClientValidationAttributes::configure(autoEnabled: true, defaultMode: 'blur');

    $field = TextInput::make('email')->rules(['required', 'max:5'])->clientValidation('email');

    $attributes = $field->getExtraInputAttributes();

    $validateKeys = array_filter(array_keys($attributes), fn (string $key) => str_starts_with($key, 'x-validate'));

    expect($validateKeys)->toBe(['x-validate'])
        ->and($attributes['x-validate'])->toBe("'email'");
});

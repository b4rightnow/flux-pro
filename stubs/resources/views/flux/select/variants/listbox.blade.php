@props([
    'name' => $attributes->whereStartsWith('wire:model')->first(),
    'selectedSuffix' => null,
    'placeholder' => null,
    'searchable' => null,
    'indicator' => null,
    'clearable' => null,
    'invalid' => null,
    'button' => null, // Deprecated...
    'trigger' => null,
    'search' => null, // Slot forwarding...
    'empty' => null, // Slot forwarding...
    'clear' => null,
    'close' => null,
    'size' => null,
])

@php
$invalid ??= ($name && $errors->has($name));

$class= Flux::classes()
    ->add('w-full');

$trigger ??= $button;
@endphp

<ui-select
    clear="{{ $clear ?? 'close esc select' }}"
    @if ($close) close="{{ $close }}" @endif
    {{ $attributes->class($class)->merge(['filter' => true]) }}
    data-flux-control
    data-flux-select
>
    <?php if ($trigger): ?> {{ $trigger }} <?php else: ?>
        <flux:select.button :$placeholder :$invalid :$size :$clearable :suffix="$selectedSuffix" />
    <?php endif; ?>

    <flux:options :$search :$searchable :$indicator :$empty>
        {{ $slot}}
    </flux:options>
</ui-select>

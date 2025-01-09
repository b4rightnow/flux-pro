@aware([ 'variant' ])

@props([
    'variant' => 'check',
])

@php
$variant = Flux::componentExists('select.indicator.variants.' . $variant) ? $variant : 'check';
@endphp

<flux:delegate-component :component="'select.indicator.variants.' . $variant">{{ $slot }}</flux:delegate-component>

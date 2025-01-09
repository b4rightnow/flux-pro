@props([
    'src' => null,
    'size' => 'base',
])

@php
$classes = Flux::classes()
    ->add('overflow-hidden')
    ->add(match ($size) {
        'base' => 'size-10 rounded',
        'sm' => 'size-8 rounded',
        'xs' => 'size-6 rounded',
    });
@endphp

<div {{ $attributes->class($classes) }} data-flux-avatar>
    <img src="{{ $src }}" alt="" />
</div>


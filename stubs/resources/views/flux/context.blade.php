@props([
    'position' => 'bottom end',
])

<ui-context position="{{ $position }}" {{ $attributes }} data-flux-context>
    {{ $slot }}
</ui-context>

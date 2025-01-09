@php
$attributes = $attributes->merge([
    'variant' => 'subtle',
    'class' => '-mr-1 [[data-flux-input]:has(input:placeholder-shown)_&]:hidden',
    'square' => true,
    'size' => null,
]);
@endphp

<flux:button
    :$attributes
    :size="$size === 'sm' ? 'xs' : 'sm'"
    x-on:click="$el.closest('[data-flux-input]').querySelector('input').value = ''; $el.closest('[data-flux-input]').querySelector('input').dispatchEvent(new Event('input', { bubbles: false })); $el.closest('[data-flux-input]').querySelector('input').focus()"
    tabindex="-1"
    aria-label="Clear input"
>
    <flux:icon.x-mark variant="micro" />
</flux:button>

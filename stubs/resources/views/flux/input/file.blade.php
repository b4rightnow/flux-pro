@php
extract(Flux::forwardedAttributes($attributes, [
    'name',
    'multiple',
    'size',
]));
@endphp

@props([
    'name' => $attributes->whereStartsWith('wire:model')->first(),
    'multiple' => null,
    'size' => null,
])

@php
$classes = Flux::classes()
    ->add('w-full flex items-center gap-4')
    ;

[ $styleAttributes, $attributes ] = Flux::splitAttributes($attributes);
@endphp

<div
    {{ $styleAttributes->class($classes) }}
    data-flux-input-file
    wire:ignore
    tabindex="0"
    x-data {{-- This is here to "scope" the x-ref references inside this component from interfering with others outside... --}}
    x-on:click.prevent.stop="$refs.input.click()"
    x-on:keydown.enter.prevent.stop="$refs.input.click()"
    x-on:keydown.space.prevent.stop
    x-on:keyup.space.prevent.stop="$refs.input.click()"
    x-on:change="$refs.name.textContent = $event.target.files[1] ? ($event.target.files.length + ' {!! __('files') !!}') : ($event.target.files[0]?.name || '{!! __('No file chosen') !!}')"
>
    <input
        x-ref="input"
        x-on:click.stop {{-- Without this, the parent element's click listener will ".prevent" the file input from being clicked... --}}
        type="file"
        class="sr-only"
        tabindex="-1"
        {{ $attributes }} {{ $multiple ? 'multiple' : '' }} {{ $name ? 'name="'.$name.'"' : '' }}
    >

    <flux:button as="div" class="cursor-pointer" :$size aria-hidden="true">
        <?php if ($multiple) : ?>
            {!! __('Choose files') !!}
        <?php else : ?>
            {!! __('Choose file') !!}
        <?php endif; ?>
    </flux:button>

    <div x-ref="name" class="cursor-default select-none truncate whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400 font-medium" aria-hidden="true">
        {!! __('No file chosen') !!}
    </div>
</div>

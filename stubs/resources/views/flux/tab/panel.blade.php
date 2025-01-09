@php
    $classes = Flux::classes()
        ->add('hidden data-[selected]:block pt-8')
    ;
@endphp

<div {{ $attributes->class($classes) }} data-flux-tab-panel>
    {{ $slot }}
</div>

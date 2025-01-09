@props([
    'name' => $attributes->whereStartsWith('wire:model')->first(),
])

@php
$classes = Flux::classes()
    ->add('group h-5 w-8 relative inline-flex items-center outline-offset-2')
    ->add('rounded-full')
    ->add('transition')
    ->add('bg-zinc-800/15 [&[disabled]]:bg-zinc-800/10 dark:bg-transparent dark:border dark:border-white/20 dark:[&[disabled]]:border-white/10')
    ->add([
        'data-[checked]:bg-zinc-800 data-[checked]:dark:bg-white/20',
        '[&[disabled]]:data-[checked]:bg-zinc-500 [&[disabled]]:data-[checked]:dark:bg-white/10',
        'data-[checked]:border-0',
    ])
    ;

$indicatorClasses = Flux::classes()
    ->add('size-3.5')
    ->add('rounded-full')
    ->add('transition translate-x-[3px] dark:translate-x-[2px]')
    ->add('bg-white [[disabled]_&]:bg-white/90 dark:[[disabled]_&]:bg-white/50')
    ->add([
        'group-data-[checked]:translate-x-[15px]',
        'group-data-[checked]:bg-white group-data-[checked]:dark:bg-white',
    ]);
@endphp

<flux:with-reversed-inline-field :$attributes>
    <ui-switch {{ $attributes->class($classes) }} data-flux-control data-flux-switch>
        <span class="{{ \Illuminate\Support\Arr::toCssClasses($indicatorClasses) }}"></span>
    </ui-switch>
</flux:with-reversed-inline-field>

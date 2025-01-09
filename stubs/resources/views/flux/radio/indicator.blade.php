
@php
$classes = Flux::classes()
    ->add('shrink-0 size-[1.125rem] rounded-full')
    ->add('text-sm text-zinc-700 dark:text-zinc-800')
    ->add('shadow-sm [ui-radio[disabled]_&]:shadow-none [ui-radio[data-checked]_&]:shadow-none indeterminate:shadown-none')
    ->add('flex justify-center items-center [ui-radio[data-checked]_&>div]:block')
    ->add([
        'border',
        'border-zinc-300 dark:border-white/10',
        '[ui-radio[disabled]_&]:border-zinc-200 dark:[ui-radio[disabled]_&]:border-white/5',
        '[ui-radio[data-checked]_&]:border-transparent data-[indeterminate]:border-transparent',
        '[ui-radio[disabled]_&]:[ui-radio[data-checked]_&]:border-transparent data-[indeterminate]:border-transparent',
    ])
    ->add([
        'bg-white dark:bg-white/10',
        'dark:[ui-radio[disabled]_&]:bg-white/5',
        '[ui-radio[data-checked]_&]:bg-zinc-800 dark:[ui-radio[data-checked]_&]:bg-white',
        '[ui-radio[disabled][data-checked]_&]:bg-zinc-500 dark:[ui-radio[disabled][data-checked]_&]:bg-white/60',
        '[ui-radio[data-checked]_&]:hover:bg-zinc-800 dark:[ui-radio[data-checked]_&]:hover:bg-white',
        '[ui-radio[data-checked]_&]:focus:bg-zinc-800 dark:[ui-radio[data-checked]_&]:focus:bg-white',
    ])
    ;
@endphp

<div {{ $attributes->class($classes) }}>
    <div class="hidden size-2 rounded-full bg-white dark:bg-zinc-800"></div>
</div>


@php
$classes = Flux::classes()
    ->add('shrink-0 size-[1.125rem] rounded-[.3rem] flex justify-center items-center')
    ->add('text-sm text-zinc-700 dark:text-zinc-800')
    ->add('shadow-sm [ui-checkbox[disabled]_&]:shadow-none [ui-checkbox[data-checked]_&]:shadow-none [ui-checkbox[data-indeterminate]_&]:shadow-none')
    ->add('[ui-checkbox[data-checked]:not([data-indeterminate])_&>svg:first-child]:block [ui-checkbox[data-indeterminate]_&>svg:last-child]:block')
    ->add([
        'border',
        'border-zinc-300 dark:border-white/10',
        '[ui-checkbox[disabled]_&]:border-zinc-200 dark:[ui-checkbox[disabled]_&]:border-white/5',
        '[ui-checkbox[data-checked]_&]:border-transparent [ui-checkbox[data-indeterminate]_&]:border-transparent',
        '[ui-checkbox[disabled][data-checked]_&]::border-transparent [ui-checkbox[data-indeterminate]_&]:border-transparent',
    ])
    ->add([
        'bg-white dark:bg-white/10',
        'dark:[ui-checkbox[disabled]_&]:bg-white/5',
        '[ui-checkbox[data-checked]_&]:bg-zinc-800 dark:[ui-checkbox[data-checked]_&]:bg-white',
        '[ui-checkbox[disabled][data-checked]_&]:bg-zinc-500 dark:[ui-checkbox[disabled][data-checked]_&]:bg-white/60',
        '[ui-checkbox[data-checked]:hover_&]:bg-zinc-800 dark:[ui-checkbox[data-checked]:hover_&]:bg-white',
        '[ui-checkbox[data-checked]_&]:focus:bg-zinc-800 dark:[ui-checkbox[data-checked]_&]:focus:bg-white',
        '[ui-checkbox[data-indeterminate]_&]:bg-zinc-800 dark:[ui-checkbox[data-indeterminate]_&]:bg-white',
        '[ui-checkbox[data-indeterminate]_&]:hover:bg-zinc-800 dark:[ui-checkbox[data-indeterminate]_&]:hover:bg-white',
        '[ui-checkbox[data-indeterminate]_&]:focus:bg-zinc-800 dark:[ui-checkbox[data-indeterminate]_&]:focus:bg-white',
    ])
    ;
@endphp

<div {{ $attributes->class($classes) }}>
    <flux:icon.check variant="micro" class="hidden text-white dark:text-zinc-800" />
    <flux:icon.minus variant="micro" class="hidden text-white dark:text-zinc-800" />
</div>

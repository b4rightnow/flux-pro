
@php
$classes = Flux::classes()
    ->add('shrink-0 size-[1.125rem] rounded-[.3rem] flex justify-center items-center')
    ->add('text-sm text-zinc-700 dark:text-zinc-800')
    ->add('[ui-option[data-selected]_&>svg:first-child]:block')
    ->add([
        'border',
        'border-zinc-300 dark:border-white/10',
        '[ui-option[disabled]_&]:border-zinc-200 dark:[ui-option[disabled]_&]:border-white/5',
        '[ui-option[data-selected]_&]:border-transparent',
        '[ui-option[disabled][data-selected]_&]::border-transparent',
    ])
    ->add([
        'bg-white dark:bg-white/10',
        'dark:[ui-option[disabled]_&]:bg-white/5',
        '[ui-option[data-selected]_&]:bg-zinc-800 dark:[ui-option[data-selected]_&]:bg-white',
        '[ui-option[disabled][data-selected]_&]:bg-zinc-500 dark:[ui-option[disabled][data-selected]_&]:bg-white/60',
        '[ui-option[data-selected]:hover_&]:bg-zinc-800 dark:[ui-option[data-selected]:hover_&]:bg-white',
        '[ui-option[data-selected]_&]:focus:bg-zinc-800 dark:[ui-option[data-selected]_&]:focus:bg-white',
    ])
    ;
@endphp

<div {{ $attributes->class($classes) }}>
    <flux:icon.check variant="micro" class="hidden text-white dark:text-zinc-800" />
    <flux:icon.minus variant="micro" class="hidden text-white dark:text-zinc-800" />
</div>

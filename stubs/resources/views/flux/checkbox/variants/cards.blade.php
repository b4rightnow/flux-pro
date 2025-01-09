@aware([ 'indicator' ])

@props([
    'description' => null,
    'indicator' => true,
    'label' => null,
    'icon' => null,
])

@php
$classes = Flux::classes()
    ->add('flex justify-between gap-3 flex-1 p-4')
    ->add('rounded-lg shadow-sm')
    ->add('bg-white hover:bg-zinc-50 data-[checked]:bg-zinc-50')
    ->add('dark:bg-white/10 dark:hover:bg-white/15 dark:data-[checked]:bg-white/15')
    ->add('border border-zinc-800/15 data-[checked]:border-zinc-800')
    ->add('dark:border-white/10 dark:data-[checked]:border-white')
    ->add('[&[disabled]]:opacity-50 dark:[&[disabled]]:opacity-75 [&[disabled]]:cursor-default [&[disabled]]:pointer-events-none')
    ;
@endphp

{{-- We have to put tabindex="-1" here because otherwise, Livewire requests will wipe out tabindex state, --}}
{{-- even with durable attributes for some reason... --}}
{{-- We have to put "data-flux-field" so that a single box can be disabled without "disabling" the group field label... --}}
<ui-checkbox {{ $attributes->class($classes) }} data-flux-control data-flux-checkbox-cards tabindex="-1" data-flux-field>
    <?php if ($label): ?>
        <div class="flex-1 flex gap-2">
            <?php if ($icon): ?>
                <flux:icon :icon="$icon" variant="micro" class="inline-block mt-0.5 text-zinc-400 [ui-checkbox[data-checked]_&]:text-zinc-800 dark:[ui-checkbox[data-checked]_&]:text-white" />
            <?php endif; ?>

            <div class="flex-1">
                <flux:heading>{{ $label ?? $slot }}</flux:heading>

                <?php if ($description): ?>
                    <flux:subheading size="sm">{{ $description }}</flux:subheading>
                <?php endif; ?>
            </div>
        </div>

        <flux:checkbox.indicator />
    <?php else: ?>
        {{ $slot }}
    <?php endif; ?>
</ui-checkbox>

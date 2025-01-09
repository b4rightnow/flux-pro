@aware([ 'variant' ])

@props([
    'iconVariant' => 'outline',
    'iconTrailing' => null,
    'badgeColor' => null,
    'variant' => null,
    'iconDot' => null,
    'badge' => null,
    'icon' => null,
])

@php
// Button should be a square if it has no text contents...
$square ??= $slot->isEmpty();

// Size-up icons in square/icon-only buttons...
$iconClasses = Flux::classes($square ? '!size-5' : '!size-4');

$classes = Flux::classes()
    ->add('h-10 lg:h-8 relative flex items-center gap-3 rounded-lg')
    ->add($square ? '!px-2.5' : '')
    ->add('py-0 text-left w-full px-3 my-px border-zinc-200')
    ->add('text-zinc-500 dark:text-white/80 hover:text-zinc-800 hover:dark:text-white')
    ->add('hover:bg-zinc-100 hover:dark:bg-white/10')
    ->add(match ($variant) {
        'outline' => 'data-[current]:text-zinc-800 data-[current]:dark:text-zinc-100 data-[current]:bg-white data-[current]:dark:bg-white/10 data-[current]:border data-[current]:border-zinc-200 data-[current]:dark:border-white/10 data-[current]:shadow-sm',
        default => 'data-[current]:text-zinc-800 data-[current]:dark:text-zinc-100 data-[current]:bg-zinc-800/5 data-[current]:dark:bg-white/10',
    })
    ;
@endphp

<flux:button-or-link :attributes="$attributes->class($classes)" data-flux-navlist-item>
    <?php if ($icon): ?>
        <div class="relative">
            <flux:icon :$icon :variant="$iconVariant" class="{!! $iconClasses !!}" />

            <?php if ($iconDot): ?>
                <div class="absolute top-[-2px] right-[-2px]">
                    <div class="size-[6px] rounded-full bg-zinc-500 dark:bg-zinc-400"></div>
                </div>
            <?php endif; ?>
        </div>
    <?php endif; ?>

    <?php if ($slot->isNotEmpty()): ?>
        <div class="flex-1 text-sm font-medium leading-none whitespace-nowrap [[data-nav-footer]_&]:hidden [[data-nav-sidebar]_[data-nav-footer]_&]:block" data-content>{{ $slot }}</div>
    <?php endif; ?>

    <?php if ($iconTrailing): ?>
        <flux:icon :icon="$iconTrailing" :variant="$iconVariant" class="!size-4" />
    <?php endif; ?>

    <?php if ($badge): ?>
        <flux:navlist.badge :color="$badgeColor">{{ $badge }}</flux:navlist.badge>
    <?php endif; ?>
</flux:button-or-link>

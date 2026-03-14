<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue';
import { Primitive, type PrimitiveProps } from 'radix-vue';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-surface-card transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-foreground text-surface-base hover:bg-foreground/90',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        outline: 'border border-border bg-surface-card hover:bg-surface-base',
        secondary: 'bg-surface-base text-foreground hover:bg-surface-base/80',
        ghost: 'hover:bg-surface-base hover:text-foreground',
        link: 'text-foreground underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

interface Props extends PrimitiveProps {
  variant?: VariantProps<typeof buttonVariants>['variant'];
  size?: VariantProps<typeof buttonVariants>['size'];
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button'
});

const delegatedProps = computed(() => {
  const { class: _, variant: _variant, size: _size, ...delegated } = props;
  return delegated;
});
</script>

<template>
  <Primitive
    v-bind="delegatedProps"
    :class="cn(buttonVariants({ variant, size }), props.class)"
  >
    <slot />
  </Primitive>
</template>

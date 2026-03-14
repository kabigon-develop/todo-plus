import { cva, type VariantProps } from 'class-variance-authority';

export const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-foreground text-surface-base',
        success: 'border-transparent bg-[--priority-low-bg] text-[--priority-low-text]',
        warning: 'border-transparent bg-[--priority-medium-bg] text-[--priority-medium-text]',
        destructive: 'border-transparent bg-[--priority-high-bg] text-[--priority-high-text]',
        info: 'border-transparent bg-primary-muted text-primary-text',
        secondary: 'border-transparent bg-surface-base text-foreground',
        high: 'border-transparent bg-[--priority-high-bg] text-[--priority-high-text]',
        medium: 'border-transparent bg-[--priority-medium-bg] text-[--priority-medium-text]',
        low: 'border-transparent bg-[--priority-low-bg] text-[--priority-low-text]'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;
export { default as Badge } from './Badge.vue';

import { cva, type VariantProps } from 'class-variance-authority';

export const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-foreground text-surface-base',
        success: 'border-transparent bg-emerald-100 text-emerald-700',
        warning: 'border-transparent bg-amber-100 text-amber-700',
        destructive: 'border-transparent bg-red-100 text-red-700',
        info: 'border-transparent bg-sky-100 text-sky-700',
        secondary: 'border-transparent bg-surface-base text-foreground',
        // priority variants — placeholder, will be implemented in Task 2
        high: 'border-transparent bg-red-100 text-red-700',
        medium: 'border-transparent bg-amber-100 text-amber-700',
        low: 'border-transparent bg-emerald-100 text-emerald-700'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;
export { default as Badge } from './Badge.vue';

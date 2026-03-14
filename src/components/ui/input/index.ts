import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]): string {
  return twMerge(clsx(inputs));
}

export function getInputClass(opts: { error?: boolean; class?: string }): string {
  const base =
    'flex h-10 w-full rounded-md border bg-surface-card px-3 py-2 text-sm text-foreground ring-offset-surface-card file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

  const stateClasses = opts.error
    ? 'border-red-400 focus-visible:ring-red-400'
    : 'border-border focus-visible:ring-border-focus';

  return cn(base, stateClasses, opts.class);
}

export { default as Input } from './Input.vue';

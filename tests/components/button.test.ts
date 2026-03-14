import { describe, it, expect } from 'vitest';
import { buttonVariants } from '../../src/components/ui/button/index';

describe('COMP-01: buttonVariants', () => {
  it('default variant contains bg-primary and text-white', () => {
    const classes = buttonVariants({ variant: 'default' });
    expect(classes).toContain('bg-primary');
    expect(classes).not.toContain('bg-foreground');
  });

  it('default variant contains font-semibold and hover:bg-primary-hover', () => {
    const classes = buttonVariants({ variant: 'default' });
    expect(classes).toContain('font-semibold');
    expect(classes).toContain('hover:bg-primary-hover');
  });

  it('outline variant contains border-primary and text-primary-text', () => {
    const classes = buttonVariants({ variant: 'outline' });
    expect(classes).toContain('border-primary');
    expect(classes).toContain('text-primary-text');
  });
});

import { describe, it, expect } from 'vitest';
import { badgeVariants } from '../../src/components/ui/badge/index';

describe('COMP-02: badgeVariants', () => {
  it('high variant contains --priority-high-bg and --priority-high-text', () => {
    const classes = badgeVariants({ variant: 'high' });
    expect(classes).toContain('--priority-high-bg');
    expect(classes).toContain('--priority-high-text');
  });

  it('medium variant contains --priority-medium-bg', () => {
    const classes = badgeVariants({ variant: 'medium' });
    expect(classes).toContain('--priority-medium-bg');
  });

  it('low variant contains --priority-low-bg', () => {
    const classes = badgeVariants({ variant: 'low' });
    expect(classes).toContain('--priority-low-bg');
  });

  it('success variant does not contain emerald', () => {
    const classes = badgeVariants({ variant: 'success' });
    expect(classes).not.toContain('emerald');
  });

  it('warning variant does not contain amber-100', () => {
    const classes = badgeVariants({ variant: 'warning' });
    expect(classes).not.toContain('amber-100');
  });

  it('destructive variant does not contain red-100', () => {
    const classes = badgeVariants({ variant: 'destructive' });
    expect(classes).not.toContain('red-100');
  });

  it('info variant does not contain sky-100', () => {
    const classes = badgeVariants({ variant: 'info' });
    expect(classes).not.toContain('sky-100');
  });
});

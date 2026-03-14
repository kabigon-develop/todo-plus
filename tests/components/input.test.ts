import { describe, it, expect } from 'vitest';
import { getInputClass } from '../../src/components/ui/input/index';

describe('COMP-05: getInputClass', () => {
  it('without error: contains border-border and ring-border-focus', () => {
    const classes = getInputClass({ error: false });
    expect(classes).toContain('border-border');
    expect(classes).toContain('ring-border-focus');
  });

  it('without error (default): contains ring-border-focus', () => {
    const classes = getInputClass({});
    expect(classes).toContain('ring-border-focus');
  });

  it('with error=true: contains border-red-400', () => {
    const classes = getInputClass({ error: true });
    expect(classes).toContain('border-red-400');
  });

  it('with error=true: contains focus-visible:ring-red-400', () => {
    const classes = getInputClass({ error: true });
    expect(classes).toContain('ring-red-400');
  });

  it('with error=true: does not contain border-border', () => {
    const classes = getInputClass({ error: true });
    expect(classes).not.toContain('border-border');
  });
});

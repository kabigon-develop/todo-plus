import { describe, it, expect } from 'vitest';
import { getDialogContentClass, getDialogOverlayClass } from '../../src/components/ui/dialog/index';

describe('COMP-04: dialog class helpers', () => {
  it('content contains bottom-0', () => {
    const classes = getDialogContentClass();
    expect(classes).toContain('bottom-0');
  });

  it('content contains rounded-t-xl', () => {
    const classes = getDialogContentClass();
    expect(classes).toContain('rounded-t-xl');
  });

  it('content contains slide-in-from-bottom', () => {
    const classes = getDialogContentClass();
    expect(classes).toContain('slide-in-from-bottom');
  });

  it('content contains slide-out-to-bottom', () => {
    const classes = getDialogContentClass();
    expect(classes).toContain('slide-out-to-bottom');
  });

  it('content does not contain top-1/2', () => {
    const classes = getDialogContentClass();
    expect(classes).not.toContain('top-1/2');
  });

  it('content does not contain -translate-y-1/2', () => {
    const classes = getDialogContentClass();
    expect(classes).not.toContain('-translate-y-1/2');
  });

  it('overlay contains backdrop-blur-md', () => {
    const classes = getDialogOverlayClass();
    expect(classes).toContain('backdrop-blur-md');
  });

  it('overlay contains fade-in-0', () => {
    const classes = getDialogOverlayClass();
    expect(classes).toContain('fade-in-0');
  });
});

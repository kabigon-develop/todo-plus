import { describe, it, expect } from 'vitest';
import { getTriggerClass } from '../../src/components/ui/tabs/index';

describe('COMP-03: getTriggerClass', () => {
  it('contains after:bg-primary', () => {
    const classes = getTriggerClass();
    expect(classes).toContain('after:bg-primary');
  });

  it('contains data-[state=active]:after:opacity-100', () => {
    const classes = getTriggerClass();
    expect(classes).toContain('data-[state=active]:after:opacity-100');
  });

  it('contains data-[state=active]:text-primary-text', () => {
    const classes = getTriggerClass();
    expect(classes).toContain('data-[state=active]:text-primary-text');
  });

  it('contains data-[state=active]:font-semibold', () => {
    const classes = getTriggerClass();
    expect(classes).toContain('data-[state=active]:font-semibold');
  });

  it('does not contain data-[state=active]:bg-surface-card', () => {
    const classes = getTriggerClass();
    expect(classes).not.toContain('data-[state=active]:bg-surface-card');
  });

  it('contains after:opacity-0', () => {
    const classes = getTriggerClass();
    expect(classes).toContain('after:opacity-0');
  });
});

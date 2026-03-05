import { describe, expect, it } from 'vitest';
import type { Idea, Todo } from '../../src/stores/types';
import {
  buildCalendarWeeks,
  buildMonthlyDashboard,
  getDailyMetricMax,
  shiftMonth
} from '../../src/lib/dashboard';

const localIso = (year: number, month1: number, day: number, hour = 0, minute = 0) =>
  new Date(year, month1 - 1, day, hour, minute, 0, 0).toISOString();

const todo = (overrides: Partial<Todo>): Todo => ({
  id: 't-1',
  title: 'todo',
  description: '',
  completed: false,
  priority: 'medium',
  dueDate: '',
  tags: [],
  createdAt: localIso(2026, 3, 1),
  updatedAt: localIso(2026, 3, 1),
  ...overrides
});

const idea = (overrides: Partial<Idea>): Idea => ({
  id: 'i-1',
  title: 'idea',
  description: '',
  status: 'idea',
  priority: 'medium',
  tags: [],
  order: 0,
  createdAt: localIso(2026, 3, 1),
  updatedAt: localIso(2026, 3, 1),
  ...overrides
});

describe('buildMonthlyDashboard', () => {
  it('counts created and updated metrics for todos and ideas', () => {
    const result = buildMonthlyDashboard(
      [todo({ id: 't-1', createdAt: localIso(2026, 3, 2, 9, 30), updatedAt: localIso(2026, 3, 2, 11, 15) })],
      [idea({ id: 'i-1', createdAt: localIso(2026, 3, 2, 10, 0), updatedAt: localIso(2026, 3, 2, 18, 45) })],
      new Date(2026, 2, 15)
    );

    const row = result.dailyRows.find((item) => item.day === '2026-03-02');
    expect(row).toBeTruthy();
    expect(row).toMatchObject({
      todoCreated: 1,
      todoUpdated: 1,
      ideaCreated: 1,
      ideaUpdated: 1
    });

    expect(result.monthlyTotals).toEqual({
      todoCreated: 1,
      todoUpdated: 1,
      ideaCreated: 1,
      ideaUpdated: 1
    });
  });

  it('only includes records inside the current month', () => {
    const result = buildMonthlyDashboard(
      [
        todo({ id: 't-in', createdAt: localIso(2026, 3, 5), updatedAt: localIso(2026, 3, 10) }),
        todo({ id: 't-out', createdAt: localIso(2026, 2, 28), updatedAt: localIso(2026, 4, 1) })
      ],
      [],
      new Date(2026, 2, 8)
    );

    expect(result.monthlyTotals).toEqual({
      todoCreated: 1,
      todoUpdated: 1,
      ideaCreated: 0,
      ideaUpdated: 0
    });
  });

  it('handles local day boundaries correctly', () => {
    const result = buildMonthlyDashboard(
      [
        todo({ id: 't-1', createdAt: localIso(2026, 3, 31, 23, 59), updatedAt: localIso(2026, 3, 31, 23, 59) }),
        todo({ id: 't-2', createdAt: localIso(2026, 4, 1, 0, 1), updatedAt: localIso(2026, 4, 1, 0, 1) })
      ],
      [],
      new Date(2026, 2, 15)
    );

    const march31 = result.dailyRows.find((item) => item.day === '2026-03-31');
    expect(march31?.todoCreated).toBe(1);
    expect(march31?.todoUpdated).toBe(1);
    expect(result.monthlyTotals.todoCreated).toBe(1);
    expect(result.monthlyTotals.todoUpdated).toBe(1);
  });

  it('ignores invalid date strings safely', () => {
    const result = buildMonthlyDashboard(
      [todo({ id: 't-1', createdAt: 'invalid-date', updatedAt: 'still-invalid' })],
      [idea({ id: 'i-1', createdAt: 'bad', updatedAt: 'bad-2' })],
      new Date(2026, 2, 15)
    );

    expect(result.monthlyTotals).toEqual({
      todoCreated: 0,
      todoUpdated: 0,
      ideaCreated: 0,
      ideaUpdated: 0
    });
  });

  it('returns full month with zero values for empty input', () => {
    const result = buildMonthlyDashboard([], [], new Date(2026, 1, 15));

    expect(result.dailyRows).toHaveLength(28);
    expect(result.dailyRows[0]?.day).toBe('2026-02-01');
    expect(result.dailyRows[27]?.day).toBe('2026-02-28');
    expect(result.monthlyTotals).toEqual({
      todoCreated: 0,
      todoUpdated: 0,
      ideaCreated: 0,
      ideaUpdated: 0
    });
  });

  it('shifts month cursor while keeping first day of month', () => {
    const from = new Date(2026, 2, 1);
    const prev = shiftMonth(from, -1);
    const next = shiftMonth(from, 1);

    expect(prev.getFullYear()).toBe(2026);
    expect(prev.getMonth()).toBe(1);
    expect(prev.getDate()).toBe(1);
    expect(next.getFullYear()).toBe(2026);
    expect(next.getMonth()).toBe(3);
    expect(next.getDate()).toBe(1);
  });

  it('computes max daily metric for mini bars with safe minimum', () => {
    const result = buildMonthlyDashboard(
      [
        todo({ id: 't-1', createdAt: localIso(2026, 3, 2), updatedAt: localIso(2026, 3, 2) }),
        todo({ id: 't-2', createdAt: localIso(2026, 3, 2), updatedAt: localIso(2026, 3, 2) })
      ],
      [idea({ id: 'i-1', createdAt: localIso(2026, 3, 3), updatedAt: localIso(2026, 3, 3) })],
      new Date(2026, 2, 15)
    );

    expect(getDailyMetricMax(result.dailyRows)).toBe(2);
    expect(getDailyMetricMax([])).toBe(1);
  });

  it('builds monday-first calendar weeks with leading and trailing empty cells', () => {
    const result = buildMonthlyDashboard([], [], new Date(2026, 2, 15));
    const weeks = buildCalendarWeeks(result.dailyRows, new Date(2026, 2, 1));

    expect(weeks).toHaveLength(6);
    expect(weeks[0]).toHaveLength(7);
    expect(weeks[0][0]).toBeNull();
    expect(weeks[0][6]?.day).toBe('2026-03-01');
    expect(weeks[5][6]).toBeNull();
  });
});

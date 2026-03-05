import type { Idea, Todo } from '@/stores/types';

export interface DashboardDailyRow {
  day: string;
  todoCreated: number;
  todoUpdated: number;
  ideaCreated: number;
  ideaUpdated: number;
}

export interface DashboardMonthlyTotals {
  todoCreated: number;
  todoUpdated: number;
  ideaCreated: number;
  ideaUpdated: number;
}

export interface DashboardMonthlyData {
  monthKey: string;
  dailyRows: DashboardDailyRow[];
  monthlyTotals: DashboardMonthlyTotals;
}

export type DashboardCalendarCell = DashboardDailyRow | null;

export const shiftMonth = (cursor: Date, delta: number) =>
  new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1);

export const getDailyMetricMax = (rows: DashboardDailyRow[]) => {
  const max = rows.reduce((acc, row) => {
    const rowMax = Math.max(
      row.todoCreated,
      row.todoUpdated,
      row.ideaCreated,
      row.ideaUpdated
    );
    return Math.max(acc, rowMax);
  }, 0);

  return Math.max(max, 1);
};

export const buildCalendarWeeks = (
  dailyRows: DashboardDailyRow[],
  cursor: Date
): DashboardCalendarCell[][] => {
  const jsWeekday = new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay();
  const leading = (jsWeekday + 6) % 7;
  const cells: DashboardCalendarCell[] = [...Array(leading).fill(null), ...dailyRows];
  const trailing = (7 - (cells.length % 7)) % 7;
  cells.push(...Array(trailing).fill(null));

  const weeks: DashboardCalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
};

const toLocalDayKey = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const buildDayKeysInMonth = (now: Date) => {
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const keys: string[] = [];
  const cursor = new Date(firstDay);

  while (cursor <= lastDay) {
    const year = cursor.getFullYear();
    const month = String(cursor.getMonth() + 1).padStart(2, '0');
    const day = String(cursor.getDate()).padStart(2, '0');
    keys.push(`${year}-${month}-${day}`);
    cursor.setDate(cursor.getDate() + 1);
  }

  return keys;
};

const emptyTotals = (): DashboardMonthlyTotals => ({
  todoCreated: 0,
  todoUpdated: 0,
  ideaCreated: 0,
  ideaUpdated: 0
});

export const buildMonthlyDashboard = (
  todos: Todo[],
  ideas: Idea[],
  now: Date = new Date()
): DashboardMonthlyData => {
  const dayKeys = buildDayKeysInMonth(now);
  const monthKey = dayKeys[0]?.slice(0, 7) ?? '';
  const byDay = new Map<string, DashboardDailyRow>(
    dayKeys.map((day) => [
      day,
      {
        day,
        todoCreated: 0,
        todoUpdated: 0,
        ideaCreated: 0,
        ideaUpdated: 0
      }
    ])
  );

  todos.forEach((item) => {
    const createdDay = toLocalDayKey(item.createdAt);
    const updatedDay = toLocalDayKey(item.updatedAt);
    const createdRow = byDay.get(createdDay);
    const updatedRow = byDay.get(updatedDay);
    if (createdRow) createdRow.todoCreated += 1;
    if (updatedRow) updatedRow.todoUpdated += 1;
  });

  ideas.forEach((item) => {
    const createdDay = toLocalDayKey(item.createdAt);
    const updatedDay = toLocalDayKey(item.updatedAt);
    const createdRow = byDay.get(createdDay);
    const updatedRow = byDay.get(updatedDay);
    if (createdRow) createdRow.ideaCreated += 1;
    if (updatedRow) updatedRow.ideaUpdated += 1;
  });

  const dailyRows = dayKeys.map((day) => byDay.get(day)!);
  const monthlyTotals = dailyRows.reduce<DashboardMonthlyTotals>((acc, row) => {
    acc.todoCreated += row.todoCreated;
    acc.todoUpdated += row.todoUpdated;
    acc.ideaCreated += row.ideaCreated;
    acc.ideaUpdated += row.ideaUpdated;
    return acc;
  }, emptyTotals());

  return {
    monthKey,
    dailyRows,
    monthlyTotals
  };
};

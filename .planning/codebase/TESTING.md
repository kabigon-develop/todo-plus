# Testing Patterns

**Analysis Date:** 2026-03-13

## Test Framework

**Runner:**
- Vitest 0.34.6
- Config: `vite.config.ts` (embedded test configuration)

**Assertion Library:**
- Built-in Vitest assertions (from `expect`)

**Run Commands:**
```bash
npm test              # Run all tests once
npm run test:watch   # Watch mode
# Coverage not configured
```

## Test File Organization

**Location:**
- Co-located in `tests/` directory at project root (not co-located with source)
- Mirror structure to source: `tests/stores/` for store tests, `tests/lib/` for utility tests

**Naming:**
- Pattern: `<feature>.spec.ts` (e.g., `todo.spec.ts`, `idea.spec.ts`, `dashboard.spec.ts`)

**Structure:**
```
tests/
├── setup.ts           # Global setup and teardown
├── stores/
│   ├── todo.spec.ts
│   └── idea.spec.ts
└── lib/
    └── dashboard.spec.ts
```

## Test Structure

**Suite Organization:**
```typescript
import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useTodoStore } from '../../src/stores/todo';

describe('todo store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('adds and updates a todo', () => {
    // test body
  });
});
```

**Patterns:**
- `describe()` wraps related test cases by feature
- `beforeEach()` creates fresh Pinia instance for each test (isolation)
- `it()` defines individual test cases with descriptive names
- Tests use descriptive strings: "adds and updates a todo" not "test 1"

## Mocking

**Framework:** Vitest built-in mocking (no external mocking library detected)

**Patterns:**
- **localStorage mocking:** Implemented in `tests/setup.ts` with `MemoryStorage` class
  ```typescript
  class MemoryStorage {
    private map = new Map<string, string>();
    getItem(key: string) { return this.map.has(key) ? this.map.get(key)! : null; }
    setItem(key: string, value: string) { this.map.set(key, value); }
    removeItem(key: string) { this.map.delete(key); }
    key(index: number) { return Array.from(this.map.keys())[index] ?? null; }
    get length() { return this.map.size; }
    clear() { this.map.clear(); }
  }
  ```
- **Setup/teardown:** `beforeEach` creates fresh storage, `afterEach` clears it
- **Store isolation:** Each test gets fresh Pinia instance via `setActivePinia(createPinia())`

**What to Mock:**
- localStorage (critical for store persistence)
- Pinia stores (create fresh instance per test)

**What NOT to Mock:**
- Pure utility functions (e.g., `buildMonthlyDashboard`) tested directly
- Date functions called with explicit test dates
- No mocking of Date.now() or dates; pass `now` parameter to functions

## Fixtures and Factories

**Test Data:**
Factory pattern used in `tests/lib/dashboard.spec.ts`:
```typescript
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
```

**Location:**
- Defined at top of test file with spreads for easy override
- Factories take optional `overrides` parameter for customization

## Coverage

**Requirements:** Not enforced (no coverage configuration found)

**View Coverage:**
- Not configured (no coverage script in `package.json`)

## Test Types

**Unit Tests:**
- Scope: Individual store methods and utility functions
- Approach: Direct function calls with known inputs, assertions on state/output
- Example from `tests/stores/todo.spec.ts`: Test `addTodo`, `updateTodo`, `toggleTodo` in isolation

**Integration Tests:**
- Scope: Store-to-store interactions
- Approach: Multiple stores instantiated in single test
- Example from `tests/stores/idea.spec.ts`: `convertToTodo` test uses both `useIdeaStore` and `useTodoStore`
  ```typescript
  it('converts execute idea into todo once', () => {
    const ideaStore = useIdeaStore();
    const todoStore = useTodoStore();
    const id = ideaStore.addIdea({ title: 'Ship v1', priority: 'high', tags: ['release'] });

    ideaStore.moveIdeaStep(id, 'next');
    ideaStore.moveIdeaStep(id, 'next');

    const createdTodoId = ideaStore.convertToTodo(id, todoStore);
    expect(createdTodoId).toBeTruthy();
    expect(todoStore.todos).toHaveLength(1);

    const secondTry = ideaStore.convertToTodo(id, todoStore);
    expect(secondTry).toBeNull();
    expect(todoStore.todos).toHaveLength(1);
  });
  ```

**E2E Tests:**
- Not implemented (no E2E framework detected)

## Common Patterns

**Async Testing:**
- No async tests currently present
- All tests are synchronous (state mutations are synchronous)

**Error Testing:**
- Defensive operations tested: `convertToTodo` returns `null` for invalid conditions
  ```typescript
  const secondTry = ideaStore.convertToTodo(id, todoStore);
  expect(secondTry).toBeNull();
  ```
- Try-catch error recovery tested indirectly (storage hydration in setup)

**Assertion patterns:**
- `expect(store.todos).toHaveLength(1)` - array length
- `expect(store.todos[0].title).toBe('Write MVP')` - exact value
- `expect(store.filteredTodos.map((item) => item.title)).toEqual(['Alpha task'])` - array content
- `expect(store.todos.every((item) => item.completed)).toBe(true)` - all items match condition
- `expect(row).toMatchObject({ todoCreated: 1, ... })` - partial object match
- `expect(result.monthlyTotals).toEqual({ ... })` - entire object equality

## Global Setup

**Setup file:** `tests/setup.ts` (specified in `vite.config.ts`)

**Responsibilities:**
1. Create `MemoryStorage` class that simulates localStorage API
2. `beforeEach`: Conditionally assign `MemoryStorage` to `globalThis.localStorage` (only if not already set)
3. `afterEach`: Clear localStorage between tests

**Pattern:**
```typescript
beforeEach(() => {
  if (!(globalThis as any).localStorage) {
    (globalThis as any).localStorage = new MemoryStorage();
  }
});

afterEach(() => {
  localStorage.clear();
});
```

---

*Testing analysis: 2026-03-13*

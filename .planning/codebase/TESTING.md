# 测试模式

**分析日期:** 2026-03-14

## 测试框架

**运行器:**
- Vitest `^0.34.6`
- 配置：使用 `vite.config.ts` 中的内嵌测试配置
- TypeScript 全局类型：`types: ["vitest/globals"]` 在 `tsconfig.app.json`

**断言库:**
- Vitest 内置 expect 接口（`expect()` 函数）

**运行命令:**
```bash
npm run test              # 运行所有测试一次
npm run test:watch       # 监听模式
```

**依赖:**
- `@vue/test-utils` `^2.4.5` - Vue 组件测试
- `jsdom` `^24.0.0` - DOM 环境模拟

## 测试文件组织

**位置:**
- 测试文件存放在 `tests/` 目录（分离模式）
- 结构映射源代码组织：
  - `tests/stores/` - Store 测试
  - `tests/lib/` - 工具库测试

**命名约定:**
- 测试文件名：`{源文件名}.spec.ts`
- 例如：`tests/stores/todo.spec.ts` 对应 `src/stores/todo.ts`

**文件结构:**
```
tests/
├── setup.ts              # 全局设置（localStorage mock）
├── stores/
│   ├── todo.spec.ts      # todo store 测试
│   └── idea.spec.ts      # idea store 测试
└── lib/
    └── dashboard.spec.ts # dashboard 工具库测试
```

## 测试结构

**Suite 组织:**
```typescript
import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useTodoStore } from '../../src/stores/todo';

describe('todo store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('adds and updates a todo', () => {
    const store = useTodoStore();
    // 测试逻辑
  });
});
```

**模式:**

1. **Pinia Store 测试初始化:**
   - 每个测试前调用 `beforeEach()` 创建新的 Pinia 实例
   - 使用 `setActivePinia(createPinia())` 确保 Store 隔离
   - 防止测试之间的状态污染

2. **Setup 和 Teardown:**
   - beforeEach：创建新的 Pinia 实例和清空存储
   - afterEach：在全局设置文件中由 `localStorage.clear()` 处理

3. **断言模式:**
   - `expect(store.todos).toHaveLength(1)` - 数组长度
   - `expect(store.todos[0].title).toBe('Write MVP')` - 精确值
   - `expect(store.filteredTodos.map((item) => item.title)).toEqual(['Alpha task'])` - 数组内容
   - `expect(row).toMatchObject({ todoCreated: 1, ... })` - 部分对象匹配

## Mocking

**框架:**
- Vitest 内置 mock 功能
- localStorage 通过 `tests/setup.ts` 中的 `MemoryStorage` 类模拟

**模式:**

1. **localStorage Mock（`tests/setup.ts`）:**
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

beforeEach(() => {
  if (!(globalThis as any).localStorage) {
    (globalThis as any).localStorage = new MemoryStorage();
  }
});

afterEach(() => {
  localStorage.clear();
});
```

2. **Store 隔离:**
   - 每个测试获得全新的 Pinia 实例

3. **跨 Store 测试:**
   - 同一测试中实例化多个 Store（例如 `idea.spec.ts` 中的转换测试）
```typescript
it('converts execute idea into todo once', () => {
  const ideaStore = useIdeaStore();
  const todoStore = useTodoStore();
  // 两个 Store 在同一个新的 Pinia 实例中
});
```

**不需要 Mock 的原因:**
- Store 使用内存存储，通过 Pinia 实例管理隔离
- 不涉及外部 API 调用或异步操作
- 所有操作都是同步的

## Fixture 和工厂函数

**测试数据工厂（`tests/lib/dashboard.spec.ts`）:**
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

**使用方式:**
- 创建基础对象：`todo()` 或 `idea()`
- 覆盖特定属性：`todo({ id: 't-1', createdAt: localIso(2026, 3, 2, 9, 30) })`
- 支持完全自定义：`overrides` 参数允许任意属性覆盖

**位置:**
- Fixture 定义在每个测试文件的顶部
- 作为本地辅助函数供该测试文件使用

## 覆盖率

**要求:** 未强制要求测试覆盖率目标

**查看覆盖率:**
```bash
npm run test -- --coverage
```

**当前测试覆盖:**
- Store 逻辑：所有主要 action 和 getter 有对应测试
- 工具库：`dashboard.ts` 的所有关键函数有完整测试
- 组件：暂未发现组件级别的测试

## 测试类型

**单元测试:**
- 作用域：单个 Store 或工具函数
- 方法：直接调用函数，验证返回值和状态变化
- 例子（`tests/stores/todo.spec.ts`，54 行）：
  - 测试 1：添加和更新任务
  - 测试 2：按状态和搜索文本过滤
  - 测试 3：批量完成和批量删除

**集成测试:**
- 作用域：多个 Store 的协作
- 例子（`tests/stores/idea.spec.ts`，51 行）：
  - 测试想法的下一步/上一步移动
  - 测试拖放重排序
  - 测试创意转换为任务的完整流程
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

**端到端测试:**
- 未实现（未检测到 Cypress/Playwright）

## 常见测试模式

**异步测试:**
- 当前未使用（所有 Store action 为同步）
- 如需异步测试使用：
```typescript
it('handles async operation', async () => {
  const result = await someAsyncFunction();
  expect(result).toBeDefined();
});
```

**错误测试:**
- 边界条件通过传递无效数据验证
- 例子（`tests/lib/dashboard.spec.ts`）：
```typescript
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
```

**状态验证:**
- 通过直接检查 Store 属性验证状态变化
```typescript
it('filters by status and search text', () => {
  const store = useTodoStore();
  store.addTodo({ title: 'Alpha task', priority: 'low', tags: [] });
  const id = store.addTodo({ title: 'Beta task', priority: 'medium', tags: [] });
  store.toggleTodo(id);

  store.setFilter('active');
  expect(store.filteredTodos.map((item) => item.title)).toEqual(['Alpha task']);

  store.setFilter('all');
  store.setSearch('beta');
  expect(store.filteredTodos.map((item) => item.title)).toEqual(['Beta task']);
});
```

## 测试文件概览

**`tests/stores/todo.spec.ts`（54 行）:**
- 测试 todo store 的核心功能
- 覆盖添加、更新、删除、过滤和批量操作

**`tests/stores/idea.spec.ts`（51 行）:**
- 测试 idea store 的工作流
- 覆盖想法移动、拖放重排序和任务转换

**`tests/lib/dashboard.spec.ts`（165 行）:**
- 测试仪表板数据构建逻辑
- 覆盖指标计算、日期处理、日历周生成
- 测试 8 个用例，包括边界情况

---

*测试分析：2026-03-14*

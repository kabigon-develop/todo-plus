# 编码约定

**分析日期:** 2026-03-14

## 命名规范

**文件名:**
- Vue 组件：PascalCase（例如 `Button.vue`, `Card.vue`, `FormDialog.vue`）
- Store 文件：camelCase（例如 `todo.ts`, `idea.ts`, `types.ts`, `ui.ts`）
- 工具函数：camelCase（例如 `utils.ts`, `dashboard.ts`）
- 目录：kebab-case（例如 `components/ui/`, `components/forms/`）
- 测试文件：`.spec.ts` 后缀（例如 `todo.spec.ts`, `dashboard.spec.ts`）

**函数名:**
- 使用 camelCase（例如 `useTodoStore()`, `buildMonthlyDashboard()`, `toLocalDayKey()`, `resetTodoForm()`, `splitTags()`）
- Pinia Store 函数前缀 `use<Feature>`（例如 `useTodoStore()`, `useIdeaStore()`, `useUiStore()`）
- 事件处理函数前缀 `on` 或 `handle`（例如 `onDragStart()`, `onDropLane()`, `onMounted()`）
- 表单相关前缀：`validate<Form>()`, `submit<Form>()`, `reset<Form>()`（例如 `validateTodoForm()`, `submitTodoForm()`, `resetTodoForm()`）
- Store action 动词+名词模式（例如 `addTodo()`, `updateTodo()`, `removeTodo()`, `moveIdeaDrag()`, `convertToTodo()`, `setFilter()`, `setSearch()`）
- 工具函数简洁清晰（例如 `getDailyMetricMax()`, `buildCalendarWeeks()`）

**变量名:**
- State 变量使用 camelCase（例如 `todos`, `selectedIds`, `filter`, `search`, `draggedIdeaId`, `activeTab`）
- Boolean 变量使用 `is<Feature>` 或直接布尔名（例如 `hasSelected`, `showFloatingLegend`）
- 常量使用 UPPER_SNAKE_CASE（例如 `STORAGE_KEY`, `lanes`）
- 响应式对象使用描述性名称（例如 `todoForm`, `ideaForm`, `barColorClass`）
- 响应式 ref 不加 `Ref` 后缀（例如 `dialogOpen`, `editingTodoId`, `dashboardCursor`）

**类型名:**
- Interface 使用 PascalCase（例如 `Todo`, `Idea`, `TodoState`, `IdeaState`, `DashboardMonthlyData`）
- Type 别名使用 PascalCase（例如 `Priority`, `TodoFilter`, `IdeaStatus`, `DialogType`, `MainTab`）
- 属性名使用 camelCase（例如 `createdAt`, `updatedAt`, `dueDate`, `convertedTodoId`, `todoCreated`, `ideaUpdated`）

## 代码风格

**格式化工具:**
- Tailwind CSS 3.4.3 用于样式
- class-variance-authority (CVA) 定义组件变量（例如 `buttonVariants` 在 `Button.vue`）
- `cn()` 工具函数合并 CSS 类（定义在 `src/lib/utils.ts`）

**Tailwind 配置:**
- 自定义颜色在 `tailwind.config.js` 中定义：`ink`, `mist`, `mint`, `amber`
- 使用标准 Tailwind 颜色：slate, red, emerald, orange, white 等
- 响应式前缀：`md:`, `lg:`, `sm:` 用于媒体查询

**TypeScript:**
- 严格模式：`strict: true` 在 `tsconfig.app.json`
- 模块解析：`Bundler` 模式
- 路径别名：`@/*` → `src/*`
- 类型导入使用 `import type` 关键字

## 导入组织

**顺序:**
1. Vue 核心库（`vue`）
2. 第三方库（`pinia`, `lucide-vue-next`, `class-variance-authority` 等）
3. UI 组件（`@/components/ui/*`）
4. 业务组件（`@/components/forms/*`）
5. Store（`@/stores/*`）
6. 工具库（`@/lib/*`）
7. 类型导入（`import type`）

**路径别名:**
- 所有导入使用 `@/` 别名，不使用相对路径
- 例如：`import { useTodoStore } from '@/stores/todo'`

**示例（来自 `src/App.vue`）:**
```typescript
import { computed, onMounted, reactive, ref } from 'vue';
import { Minus, Plus } from 'lucide-vue-next';
import { Badge } from '@/components/ui/badge';
import { buildMonthlyDashboard, getDailyMetricMax, shiftMonth } from '@/lib/dashboard';
import { useIdeaStore } from '@/stores/idea';
import type { Idea, Priority } from '@/stores/types';
```

## 错误处理

**模式:**
- Store 的 `hydrate()` 方法使用 try-catch 处理 JSON 解析失败
- 失败时调用 `this.$reset()` 重置状态
- 日期验证通过 `Number.isNaN(date.getTime())` 检查
- 防御性 null 检查：`if (!target) return;` 在修改前
- 可选链和默认值：`parsed.todos ?? []`

**Store 持久化示例（`src/stores/todo.ts`）:**
```typescript
hydrate() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as TodoState;
    this.todos = parsed.todos ?? [];
    this.selectedIds = parsed.selectedIds ?? [];
    this.filter = parsed.filter ?? 'all';
    this.search = parsed.search ?? '';
  } catch {
    this.$reset();
  }
}

persist() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      todos: this.todos,
      selectedIds: this.selectedIds,
      filter: this.filter,
      search: this.search
    })
  );
}
```

**日期验证示例（`src/lib/dashboard.ts`）:**
```typescript
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
```

**表单验证（`src/App.vue`）:**
```typescript
const validateTodoForm = () => {
  todoErrors.title = '';
  if (!todoForm.title.trim()) {
    todoErrors.title = '请输入任务标题';
    return false;
  }
  return true;
};
```

## 日志记录

**框架:** 未使用专门日志框架，基于浏览器 console

**模式:**
- 代码库中未观察到显式日志语句
- 依赖 Vue DevTools 和浏览器控制台进行调试

## 注释

**风格:**
- 注释使用很少
- 代码通过清晰的命名和类型注解实现自文档化
- 复杂逻辑通过函数提取提高可读性

## 函数设计

**规模:**
- Store action：5-15 行代码
- 工具函数：10-50 行代码
- 组件辅助函数：3-10 行代码

**参数:**
- 使用对象参数封装多个相关选项
- 例子（`src/stores/todo.ts`）：
```typescript
addTodo(payload: {
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
  tags: string[];
})
```

- Store action 接收 ID 和可选的 patch 对象
- 例子：`updateTodo(todoId: string, patch: Partial<Omit<Todo, 'id' | 'createdAt'>>)`

**返回值:**
- Action 返回创建的 ID（例如 `addTodo()` 返回 `todo.id`）
- 条件操作返回 ID 或 null（例如 `convertToTodo()` 返回 `todoId | null`）
- Getter 返回计算数组或对象（例如 `filteredTodos: Todo[]`）
- 工具函数返回特定类型

## 模块设计

**导出模式:**
- Pinia Store 使用 `defineStore()` 导出
- UI 组件通过 barrel 文件导出（`components/ui/button/index.ts`）
- 工具函数直接命名导出
- 类型在 `types.ts` 中集中导出

**Barrel 文件结构:**
```typescript
// src/components/ui/button/index.ts
import Button from './Button.vue';
export { Button };
```

**Store 结构:**
- State 通过工厂函数初始化：`const defaultState = (): TodoState => ({ ... })`
- Getter 用于计算/过滤数据
- Action 用于修改和持久化
- 所有修改 action 都调用 `persist()`

**组件到 Store 通信:**
```typescript
// 在组件中获取 Store
const todoStore = useTodoStore();
const ideaStore = useIdeaStore();
const uiStore = useUiStore();

// onMounted 时恢复状态
onMounted(() => {
  todoStore.hydrate();
  ideaStore.hydrate();
});
```

---

*约定分析：2026-03-14*

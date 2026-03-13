# 架构

**分析日期:** 2026-03-14

## 模式概览

**整体:** 单页应用 (SPA) - Vue 3 + Pinia 状态管理 + localStorage 持久化

**关键特征:**
- 前端组件化架构，使用 Vue 3 Composition API + `<script setup>`
- 集中式状态管理通过 Pinia 全局存储
- 浏览器本地存储作为数据层（无后端/数据库）
- 基于 UI 库 (Radix Vue) 的可组合组件设计
- Tailwind CSS + shadcn-vue 风格的样式系统
- 三个主标签页 (Todo、Idea 看板、Dashboard)

## 层级

**表现层 (Presentation/Components):**
- 位置: `src/components/`、`src/App.vue`
- 包含: Vue SFC 组件（`.vue` 文件）
- 职责: UI 渲染、用户交互、表单验证 UI
- 依赖: Pinia 存储、UI 组件库、Radix Vue、样式工具
- 被使用: 主应用 (`App.vue`) 和组件组合

**状态管理层 (State Management):**
- 位置: `src/stores/`
- 包含: 三个 Pinia 存储模块 (`todo.ts`, `idea.ts`, `ui.ts`)
- 职责:
  - 数据状态维护 (todos、ideas、UI 状态)
  - localStorage 同步 (hydrate/persist)
  - 业务逻辑操作 (CRUD、拖拽、转换)
  - getter 过滤与派生状态
- 依赖: Vue Composition API、localStorage API、类型定义
- 被使用: 所有组件通过 `use*Store()` 访问

**数据模型层 (Data Types):**
- 位置: `src/stores/types.ts`
- 包含: TypeScript 类型定义与接口
- 职责: 定义 `Todo`、`Idea`、`Priority` 等数据结构
- 被使用: 存储、组件、工具函数

**工具/计算层 (Utilities & Analytics):**
- 位置: `src/lib/`
- 包含: `dashboard.ts` (月度统计计算)、`utils.ts` (样式工具)
- 职责:
  - `dashboard.ts`: 从 todos/ideas 聚合每日、每月指标；构建日历周
  - `utils.ts`: Tailwind class 合并工具 (`cn` 函数)
- 依赖: 数据类型、Date API
- 被使用: 组件用于计算 UI 数据

**入口层 (Application Entry):**
- 位置: `src/main.ts`、`src/App.vue`、`index.html`
- 职责:
  - 初始化 Vue 应用
  - 挂载 Pinia
  - 根组件渲染
- 依赖: Vue、Pinia

## 数据流

**用户交互 → 状态更新 → UI 重新渲染:**

1. 用户在 `App.vue` 中与 UI 交互（点击按钮、输入表单）
2. 组件调用存储的 actions（如 `todoStore.addTodo()`）
3. 存储 action 修改状态并调用 `persist()`
4. `persist()` 将状态写入 localStorage
5. Pinia 通知所有订阅者状态变化
6. 组件重新计算 computed 值，模板重新渲染

**示例流程 - 新增任务:**
```
用户填表 → validateTodoForm() → submitTodoForm()
→ todoStore.addTodo() → todos 数组更新
→ persist() 到 localStorage → App.vue filteredTodos computed 更新
→ 模板 v-for 重新渲染
```

**示例流程 - 想法看板拖拽:**
```
dragstart 事件 → onDragStart() 记录 draggedIdeaId
→ drop 事件 → onDropLane() 调用 ideaStore.moveIdeaDrag()
→ 目标 lane 的 idea 重新排序 → persist() → byStatus getter 重新计算
→ 看板视图更新
```

**示例流程 - Dashboard 月度统计:**
```
dashboardCursor 变化 (月份导航)
→ dashboardData computed 触发 buildMonthlyDashboard()
→ 遍历所有 todos/ideas，按本地日期分组计数
→ 返回 DashboardMonthlyData (dailyRows、monthlyTotals)
→ calendarWeeks computed 调用 buildCalendarWeeks()
→ 构建 7 列周数组 → 模板渲染日历网格和柱状图
```

**状态管理:**
- 应用状态 100% 存储在 Pinia 中（`useTodoStore`, `useIdeaStore`, `useUiStore`）
- 无组件级别的 ref/reactive 用于持久化数据（除了表单临时状态）
- localStorage 是唯一持久化层；应用启动时通过 `hydrate()` 恢复状态
- 每次操作都显式调用 `persist()` 保证数据同步

## 关键抽象

**Todo 实体:**
- 位置: `src/stores/types.ts` (类型定义)、`src/stores/todo.ts` (逻辑)
- 职责: 表示可完成的任务
- 属性: id、title、description、completed、priority、dueDate、tags、createdAt、updatedAt
- 操作: CRUD、批量操作、过滤、搜索
- 持久化: localStorage 键 `'todo-plus:todos'`

**Idea 实体 (Kanban 看板):**
- 位置: `src/stores/types.ts`、`src/stores/idea.ts`
- 职责: 表示想法/概念，在三个阶段（idea → evaluate → execute）流转
- 状态流: idea (想法) → evaluate (评估) → execute (执行)
- 操作: CRUD、阶段转移、拖拽排序、转为 Todo
- 特殊: 一个 idea 可转为 todo，通过 `convertedTodoId` 跟踪
- 持久化: localStorage 键 `'todo-plus:ideas'`

**UI 状态:**
- 位置: `src/stores/ui.ts`
- 职责: 管理主应用 UI 状态
- 当前: 活跃 tab (`activeTab: 'todo' | 'idea' | 'dashboard'`)
- 操作: `setTab()` 切换标签页

**Dashboard 数据结构:**
- 位置: `src/lib/dashboard.ts`
- 职责: 聚合月度统计数据
- 包含:
  - `DailyRow`: 每日四个指标 (todoCreated, todoUpdated, ideaCreated, ideaUpdated)
  - `MonthlyTotals`: 月度总计
  - `CalendarWeeks`: 日历周格式（用于 7 列网格）
- 函数:
  - `buildMonthlyDashboard()`: 核心计算函数
  - `buildCalendarWeeks()`: 转换为日历周
  - `getDailyMetricMax()`: 获取最大值用于柱状图高度计算
  - `shiftMonth()`: 月份导航

## 入口点

**应用入口 (`src/main.ts`):**
- 位置: `src/main.ts`
- 触发: 浏览器加载 `index.html`
- 职责:
  - 创建 Vue 应用实例
  - 注册 Pinia
  - 挂载到 DOM (#app)

**根组件 (`src/App.vue`):**
- 位置: `src/App.vue`
- 触发: main.ts 挂载
- 职责:
  - 管理三个主 tab（任务、想法、Dashboard）
  - 管理对话框生命周期（新增/编辑表单）
  - 协调 Todo 和 Idea 存储的交互
  - 处理表单验证和提交
  - 计算聚合 UI 数据（filteredTodos、byStatus、dashboardData）

**主要生命周期:**
```typescript
onMounted() {
  todoStore.hydrate();      // 从 localStorage 恢复 todos
  ideaStore.hydrate();      // 从 localStorage 恢复 ideas
}
```

## 错误处理

**策略:** 防守式编程 + 静默失败

**模式:**

1. **存储 hydrate 中的错误捕获:**
```typescript
try {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  const parsed = JSON.parse(raw);
  this.todos = parsed.todos ?? [];
} catch {
  this.$reset();  // 恢复默认状态
}
```

2. **表单验证:** 组件级验证后再调用存储
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

3. **操作保护:** 检查目标存在性再操作
```typescript
updateTodo(todoId: string, patch) {
  const target = this.todos.find(item => item.id === todoId);
  if (!target) return;  // 静默返回
  Object.assign(target, patch);
}
```

## 跨切面关注点

**日志:**
- 当前: 无集中日志系统
- 调试: 通过浏览器 DevTools 检查 Pinia 状态

**验证:**
- 表单级验证: `validateTodoForm()`, `validateIdeaForm()` (App.vue 中)
- 数据约束: 类型系统强制 (TypeScript)
- 边界检查: Kanban lane 变更时检查索引范围

**认证:**
- 无认证系统（纯本地应用）

**时间戳:**
- 所有实体都有 `createdAt` 和 `updatedAt`（ISO 8601 string）
- Dashboard 使用本地时区解析日期：`toLocalDayKey()` 函数
- 注意：跨越月份边界的统计基于本地时区，不同时区可能出现偏差

---

*架构分析: 2026-03-14*

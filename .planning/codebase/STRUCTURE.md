# 代码库结构

**分析日期:** 2026-03-14

## 目录布局

```
todo-plus/
├── src/                          # 应用源代码
│   ├── main.ts                  # 应用入口，创建 Vue 应用和 Pinia
│   ├── App.vue                  # 根组件，管理三个主 tab 和业务逻辑
│   ├── style.css                # 全局样式
│   ├── components/              # 可复用组件
│   │   ├── ui/                  # UI 基础组件库（Radix Vue + Tailwind）
│   │   │   ├── tabs/            # 标签页组件
│   │   │   ├── card/            # 卡片容器
│   │   │   ├── button/          # 按钮
│   │   │   ├── input/           # 输入框
│   │   │   ├── checkbox/        # 复选框
│   │   │   ├── dialog/          # 对话框
│   │   │   ├── select/          # 选择框
│   │   │   └── badge/           # 标签徽章
│   │   └── forms/               # 表单组件（域特定逻辑）
│   │       ├── FormDialog.vue   # 通用表单对话框容器
│   │       ├── TodoFormFields.vue    # Todo 表单字段
│   │       └── IdeaFormFields.vue    # Idea 表单字段
│   ├── stores/                  # Pinia 全局状态管理
│   │   ├── types.ts             # 共享类型定义
│   │   ├── todo.ts              # Todo 存储（CRUD + 过滤）
│   │   ├── idea.ts              # Idea 存储（Kanban 逻辑）
│   │   └── ui.ts                # UI 状态存储
│   ├── lib/                     # 工具函数与计算逻辑
│   │   ├── utils.ts             # CSS 样式工具 (cn 函数)
│   │   └── dashboard.ts         # 月度统计和日历构建
│   └── views/                   # 保留目录（当前空）
├── tests/                       # Vitest 单元测试
│   ├── setup.ts                 # 测试环境配置
│   ├── stores/                  # 存储单元测试
│   │   ├── todo.spec.ts         # Todo 存储测试
│   │   └── idea.spec.ts         # Idea 存储测试
│   └── lib/                     # 工具函数测试
│       └── dashboard.spec.ts    # Dashboard 计算测试
├── docs/                        # 文档
│   ├── plans/                   # 项目规划文档
│   └── todo-plus-regression-checklist.md
├── scripts/                     # 构建和工具脚本
│   └── mcp-smoke.mjs            # 烟测脚本
├── public/                      # 静态资源
├── dist/                        # 构建输出（生成）
├── .codex/                      # IDE 配置
├── .planning/                   # GSD 规划文档
│   └── codebase/                # 架构分析文档
├── index.html                   # HTML 入口
├── vite.config.ts               # Vite 构建配置
├── tsconfig.json                # TypeScript 总配置
├── tsconfig.app.json            # 应用 TS 配置
├── tsconfig.node.json           # Node 工具 TS 配置
├── tailwind.config.js           # Tailwind CSS 配置
├── postcss.config.js            # PostCSS 配置
├── package.json                 # 项目依赖与脚本
├── package-lock.json            # 依赖锁定文件
└── .gitignore                   # Git 忽略文件
```

## 目录用途

**`src/`:**
- 用途: 所有应用源代码
- 包含: Vue 组件、Pinia 存储、工具函数
- 关键文件: `main.ts` (入口)、`App.vue` (根组件)

**`src/components/`:**
- 用途: Vue 单文件组件库
- 包含: UI 基础组件和业务表单组件
- 结构: 按功能分类（ui 库、表单）

**`src/components/ui/`:**
- 用途: 可复用 UI 基础组件库
- 包含: 8 个子目录，每个一个组件家族
- 模式: 每个目录包含 `[ComponentName].vue` + `index.ts` (导出)
- 来源: Radix Vue 原语包装 + Tailwind CSS 样式

**`src/components/forms/`:**
- 用途: 表单相关组件（域特定逻辑）
- 包含:
  - `FormDialog.vue`: 通用对话框容器（无业务逻辑）
  - `TodoFormFields.vue`: Todo 表单字段和验证
  - `IdeaFormFields.vue`: Idea 表单字段和验证
- 模式: 接收 props (form 对象、验证错误、选项列表)，通过 v-model 绑定

**`src/stores/`:**
- 用途: Pinia 全局状态存储
- 包含:
  - `types.ts`: 所有数据类型和接口定义
  - `todo.ts`: Todo 实体 + 业务逻辑 (defineStore)
  - `idea.ts`: Idea 实体 + Kanban 拖拽逻辑 (defineStore)
  - `ui.ts`: UI 状态 (当前活跃 tab)
- 模式: 每个 store 有 state、getters、actions；所有 mutation 后调用 `persist()`

**`src/lib/`:**
- 用途: 工具函数与计算逻辑
- 包含:
  - `utils.ts`: `cn()` 函数，合并 Tailwind class (clsx + tailwind-merge)
  - `dashboard.ts`: 月度统计计算和日历构建
- 被使用: App.vue 计算属性、存储操作

**`tests/`:**
- 用途: Vitest 单元测试
- 包含:
  - `setup.ts`: 测试环境初始化（全局 API）
  - `stores/*.spec.ts`: 存储逻辑单元测试
  - `lib/*.spec.ts`: 工具函数单元测试
- 命名: `*.spec.ts` 后缀

**`public/`:**
- 用途: 静态资源
- 包含: favicon、图片等（原封不动复制到 dist）

**`.planning/codebase/`:**
- 用途: GSD 生成的代码库分析文档
- 包含: ARCHITECTURE.md、STRUCTURE.md、CONVENTIONS.md 等

## 关键文件位置

**入口点:**
- `index.html`: HTML 根页面，引入 `<div id="app">` 和 `src/main.ts`
- `src/main.ts`: 创建 Vue 应用、注册 Pinia、挂载根组件

**配置:**
- `vite.config.ts`: 构建工具配置（Vue 3 插件、`@/` 别名、测试环境）
- `tsconfig.json`: TypeScript 主配置（引用 app 和 node 配置）
- `tsconfig.app.json`: 应用代码 TS 配置（ES2020、DOM lib）
- `tailwind.config.js`: Tailwind CSS 主题和扩展配置
- `postcss.config.js`: PostCSS 插件配置（tailwindcss、autoprefixer）

**核心逻辑:**
- `src/App.vue`: 主应用逻辑（593 行）
  - 三个主 tab (任务、想法、Dashboard)
  - 对话框生命周期管理（新增/编辑 Todo/Idea）
  - 表单状态和验证
  - 计算属性（聚合 UI 数据、过滤、月度统计）
- `src/stores/todo.ts`: Todo CRUD + 过滤搜索逻辑
  - 状态: todos、selectedIds、filter、search
  - getter: `filteredTodos` (综合过滤)
  - actions: addTodo、updateTodo、removeTodo、toggleTodo、toggleSelection、bulkCompleteSelected 等
- `src/stores/idea.ts`: Idea CRUD + Kanban 拖拽逻辑
  - 状态: ideas
  - getter: `byStatus` (按状态分类)
  - actions: addIdea、moveIdeaStep、moveIdeaDrag、convertToTodo 等
- `src/lib/dashboard.ts`: 月度统计数据构建
  - `buildMonthlyDashboard()`: 主计算函数
  - `buildCalendarWeeks()`: 转换为日历周
  - `getDailyMetricMax()`: 柱状图高度计算

**测试:**
- `tests/setup.ts`: Vitest 环境配置
- `tests/stores/todo.spec.ts`: Todo 存储测试（CRUD、过滤、批量操作）
- `tests/stores/idea.spec.ts`: Idea 存储测试
- `tests/lib/dashboard.spec.ts`: Dashboard 计算逻辑测试

## 命名约定

**文件:**
- Vue 单文件组件: PascalCase.vue
  - 示例: `TodoFormFields.vue`, `FormDialog.vue`, `Button.vue`
- TypeScript 模块: camelCase.ts
  - 示例: `dashboard.ts`, `utils.ts`, `todo.ts`
- 特殊文件: camelCase.ts
  - 示例: `types.ts`, `setup.ts`

**目录:**
- 功能目录: camelCase (小写)
  - 示例: `components`, `stores`, `lib`, `forms`, `ui`
- UI 组件族: camelCase (小写)
  - 示例: `tabs`, `button`, `dialog`, `select`

**代码内部:**
- 函数名: camelCase
  - 示例: `validateTodoForm()`, `buildMonthlyDashboard()`, `splitTags()`
- 变量名: camelCase
  - 示例: `todoStore`, `filteredTodos`, `dailyRows`, `draggedIdeaId`
- 常量: UPPER_SNAKE_CASE
  - 示例: `STORAGE_KEY = 'todo-plus:todos'`
- 类型名: PascalCase
  - 示例: `Todo`, `Idea`, `Priority`, `DashboardMonthlyData`
- 枚举值/联合类型: camelCase (小写)
  - 示例: `'active'`, `'completed'`, `'idea'`, `'evaluate'`, `'execute'`

## 新代码添加位置指南

**新功能/业务逻辑:**
- 主要逻辑: `src/stores/` - 创建新的 defineStore 或扩展现有 store
  - 示例: 新增 `src/stores/project.ts` 用于项目管理功能
- 类型定义: `src/stores/types.ts` - 添加新的 interface/type
- 工具函数: `src/lib/` - 计算密集或可复用的逻辑
  - 示例: `src/lib/filtering.ts` 用于高级过滤

**新 UI 组件家族:**
- 创建目录: `src/components/ui/[componentName]/`
- 文件结构:
  ```
  src/components/ui/[componentName]/
  ├── [ComponentName].vue       # 组件实现
  └── index.ts                  # 导出: export * from './[ComponentName].vue'
  ```
- 模式: 从 Radix Vue 基础原语开始，添加 Tailwind 样式

**新表单组件:**
- 位置: `src/components/forms/`
- 命名: `[Domain]FormFields.vue` (如 `TodoFormFields.vue`)
- 模式: 接收 props (form 对象、errors 对象、选项列表)
- 与 `FormDialog.vue` 组合使用

**共享工具函数:**
- 位置: `src/lib/utils.ts`
- 示例: 样式合并、日期格式化等通用助手

**业务域特定工具:**
- 新文件: `src/lib/[domain].ts`
- 示例: `src/lib/filtering.ts` 用于过滤逻辑

**测试文件:**
- 位置: `tests/` 镜像源代码结构
- 命名: 源文件名 + `.spec.ts`
- 示例: `src/stores/todo.ts` → `tests/stores/todo.spec.ts`

## 特殊目录

**`src/views/`:**
- 用途: 保留目录（当前空）
- 未来用于: 若需要多路由架构，放置路由页面组件

**`dist/`:**
- 用途: 构建输出目录
- 生成: `npm run build` 生成
- 提交: 否（在 .gitignore 中）

**`node_modules/`:**
- 用途: npm 依赖包目录
- 生成: `npm install` 生成
- 提交: 否（在 .gitignore 中）

**`.planning/`:**
- 用途: GSD 规划文档
- 包含: `codebase/` (架构分析)、其他规划文档

**`.codex/`:**
- 用途: IDE 配置目录
- 包含: `environments/` 子目录

## 路径别名

**配置位置:** `vite.config.ts` + `tsconfig.app.json`

**现有别名:**
- `@/` → `src/` (相对项目根)

**使用示例:**
```typescript
// ✓ 推荐：使用 @ 别名
import { useUiStore } from '@/stores/ui';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/button/Button.vue';
import type { Todo } from '@/stores/types';

// ✗ 避免：相对路径
import { cn } from '../../../lib/utils';
```

所有导入都使用 `@/` 前缀，避免相对路径导致的脆弱性。

---

*结构分析: 2026-03-14*

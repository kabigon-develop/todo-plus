# Idea Board Todo 设计文档

日期：2026-02-08  
技术栈：Vue 3 + TypeScript + Vite + Tailwind CSS + Pinia

## 1. 目标
构建一个“新想法 Todo”页面，保留进阶 Todo 功能，并新增 Idea Board（想法 -> 评估 -> 执行）能力。

## 2. 页面结构
- 单页双视图（Tab 切换）：`Todo` / `Idea Board`
- 统一顶部导航
- 移动端优先：小屏纵向布局，大屏三列看板

## 3. 功能范围
### 3.1 Todo（进阶基线）
- 新增、编辑、删除
- 完成/未完成切换
- 筛选（全部/进行中/已完成）
- 搜索（标题与描述）
- 优先级（low/medium/high）
- 截止日期
- 批量操作（批量完成、批量删除）
- 本地持久化

### 3.2 Idea Board（新增）
- 三列：`idea`、`evaluate`、`execute`
- 卡片支持：标题、描述、标签、优先级、创建时间、更新时间
- 列间流转：
  - 拖拽
  - 按钮（上一步/下一步）
- 弱联动：`execute` 列卡片支持“一键转 Todo”；转换后两边独立

## 4. 数据模型
### Todo
- `id: string`
- `title: string`
- `description?: string`
- `completed: boolean`
- `priority: 'low' | 'medium' | 'high'`
- `dueDate?: string`
- `tags: string[]`
- `createdAt: string`
- `updatedAt: string`

### Idea
- `id: string`
- `title: string`
- `description?: string`
- `status: 'idea' | 'evaluate' | 'execute'`
- `priority: 'low' | 'medium' | 'high'`
- `tags: string[]`
- `order: number`
- `convertedTodoId?: string`
- `createdAt: string`
- `updatedAt: string`

## 5. 状态管理与持久化
- Pinia store：
  - `useTodoStore`
  - `useIdeaStore`
  - `useUiStore`（当前 tab、提示等）
- 使用 `localStorage` 分 store 存储
- 启动时 `hydrate`
- 状态变化后防抖写入（300ms）
- 解析失败回退默认状态

## 6. 关键交互
- Idea 卡片拖拽跨列时更新 `status + order`
- 按钮流转时插入目标列尾部
- 仅 `execute` 列显示“转为 Todo”
- 转换逻辑幂等：已有 `convertedTodoId` 不重复转换

## 7. 错误处理
- 表单校验：标题必填、长度限制、日期格式校验
- 存储错误：容错回退，不阻断页面
- 拖拽失败：回滚快照 + 提示

## 8. 测试策略
- Store 单元测试：Todo CRUD/筛选/批量；Idea 流转/排序/转换；持久化
- 组件测试：表单校验、筛选栏、流转按钮、转换按钮条件
- E2E 主路径：创建 Idea -> 流转到 execute -> 转 Todo -> 完成 Todo

## 9. 实施顺序
1. 初始化项目与 Tailwind/Pinia
2. 实现 Todo 进阶功能
3. 实现 Idea Board 三列与双流转
4. 实现弱联动与持久化
5. 补齐测试与验收

## 10. 已知约束
- 当前目录不是 git 仓库，本次无法执行文档 commit

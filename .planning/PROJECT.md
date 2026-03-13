# todo-plus UI 现代化改造

## What This Is

对现有 todo-plus 应用进行全面 UI 现代化改造。该应用是一个基于 Vue 3 + Pinia + localStorage 的单页 Todo/Idea/Dashboard 管理工具，目标是将其视觉风格提升至现代化水准：明亮卡片风设计语言、青绿配色系统、流畅动效、深色/浅色双主题支持、响应式布局。

## Core Value

在不改动任何业务逻辑和数据层的前提下，让每一位用户打开应用的第一眼就感受到精致与专业。

## Requirements

### Validated

- ✓ Todo 增删改查（含优先级、标签、截止日期）— existing
- ✓ Idea 看板（Kanban，三列拖拽排序，执行转 Todo）— existing
- ✓ 月度 Dashboard（日历热力图、指标统计）— existing
- ✓ localStorage 持久化 — existing
- ✓ Radix Vue + Tailwind CSS 样式体系 — existing

### Active

- [ ] 明亮卡片风设计语言（白/浅灰背景、圆角卡片、阴影层次）
- [ ] 青绿（Teal/Cyan）主色调设计系统（CSS 变量 Token）
- [ ] 深色/浅色主题切换（用户可手动切换，localStorage 记忆）
- [ ] 流畅动效系统（卡片悬停、内容入场、标签页切换过渡）
- [ ] 响应式布局（桌面端 + 移动端）
- [ ] 全局排版与间距规范（字号阶梯、行高、间距 Scale）
- [ ] Todo 卡片重设计（优先级色块、标签胶囊、截止日期标记）
- [ ] Idea 看板重设计（列标题、卡片悬停、拖拽视觉反馈）
- [ ] Dashboard 重设计（热力图色阶、指标卡片、日历美化）
- [ ] 对话框/表单重设计（新建/编辑弹层、输入框聚焦态）
- [ ] 导航 Tab 重设计（活动态指示器动画、图标对齐）

### Out of Scope

- 后端/数据库集成 — 保持纯前端 localStorage 架构
- 业务逻辑修改 — 仅改外观，不改行为
- 新功能开发 — 专注 UI 改造，不新增功能
- 设计系统文档站 — 本次不建 Storybook/设计站

## Context

**现有技术栈：** Vue 3 (Composition API + `<script setup>`)、Pinia、Tailwind CSS v3、Radix Vue、class-variance-authority、TypeScript、Vite。

**现有代码结构：**
- `src/App.vue` — 主容器，包含三个标签页（Todo/Idea/Dashboard），约 400 行，包含大量内联样式类
- `src/components/` — 少量 UI 原子组件（Button、Input 等 shadcn-vue 风格）
- `src/stores/` — todo.ts、idea.ts、ui.ts 三个 Pinia 存储
- `src/lib/` — dashboard.ts 计算逻辑、utils.ts（cn 函数）

**改造策略：** 优先通过 CSS 变量（Design Tokens）统一色彩/间距，然后逐页面重写 Tailwind 类，配合 CSS transition/animation 实现动效。深色模式通过 `class="dark"` 在 `<html>` 上切换，配合 Tailwind `dark:` 变体。

## Constraints

- **技术栈**: 沿用现有 Vue 3 + Tailwind CSS + Radix Vue，不引入额外 UI 框架
- **数据层**: 不修改 `src/stores/` 和 `src/lib/` 的任何逻辑
- **兼容性**: 现代浏览器（Chrome/Safari/Firefox 最新版），不需要 IE 兼容

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 保留 Tailwind CSS，不换 CSS-in-JS | 现有代码全部基于 Tailwind，迁移成本过高 | — Pending |
| 使用 CSS 变量作为 Design Token | 支持运行时主题切换（深色/浅色）而不重新编译 | — Pending |
| 青绿主色用 teal-500 (#14b8a6) 作为锚点 | 与 Linear 风格对齐，清爽专注 | — Pending |
| 深色模式通过 `dark` class 而非 `prefers-color-scheme` | 用户可手动切换，覆盖系统偏好 | — Pending |

---
*Last updated: 2026-03-14 after initialization*

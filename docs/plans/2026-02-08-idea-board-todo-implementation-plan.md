# Idea Board Todo Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在 Vue3 + Tailwind + Pinia 项目中实现进阶 Todo 与 Idea Board（弱联动、拖拽+按钮流转）。

**Architecture:** 使用 Pinia 拆分 `todo` / `idea` / `ui` 三个 store；页面采用单页双视图（Tab）。通过 store 统一处理持久化、转换逻辑与排序，组件仅负责展示与交互事件。

**Tech Stack:** Vue 3, TypeScript, Vite, Tailwind CSS, Pinia, Vitest, Vue Test Utils

---

### Task 1: 初始化项目骨架

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig*.json`, `index.html`
- Create: `src/main.ts`, `src/App.vue`, `src/style.css`

**Step 1: 写最小 smoke 测试（失败）**
- Test: `tests/smoke/app.spec.ts`

**Step 2: 运行测试确认失败**
- Run: `npm test -- tests/smoke/app.spec.ts`

**Step 3: 写最小实现通过测试**

**Step 4: 运行测试确认通过**

### Task 2: Todo Store（TDD）

**Files:**
- Create: `src/stores/todo.ts`
- Test: `tests/stores/todo.spec.ts`

**Step 1: 先写失败测试（CRUD / 搜索筛选 / 批量）**

**Step 2: 跑测试确认红灯**

**Step 3: 最小实现**

**Step 4: 跑测试确认绿灯**

### Task 3: Idea Store（TDD）

**Files:**
- Create: `src/stores/idea.ts`
- Test: `tests/stores/idea.spec.ts`

**Step 1: 先写失败测试（创建、流转、重排、转换幂等）**

**Step 2: 跑测试确认红灯**

**Step 3: 最小实现**

**Step 4: 跑测试确认绿灯**

### Task 4: 视图与组件

**Files:**
- Create/Modify: `src/components/*`, `src/views/*`, `src/App.vue`
- Test: `tests/components/*.spec.ts`

**Step 1: 先写失败组件测试（Tab、按钮流转、转换按钮条件）**

**Step 2: 跑测试确认红灯**

**Step 3: 最小实现并接入 Tailwind**

**Step 4: 跑测试确认绿灯**

### Task 5: 持久化与回归

**Files:**
- Modify: `src/stores/*.ts`
- Test: `tests/stores/persistence.spec.ts`

**Step 1: 写失败测试（hydrate / 容错）**

**Step 2: 跑测试确认红灯**

**Step 3: 最小实现**

**Step 4: 全量测试**
- Run: `npm test`

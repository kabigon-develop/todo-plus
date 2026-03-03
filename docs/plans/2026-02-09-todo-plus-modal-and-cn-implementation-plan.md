# Todo Plus 弹窗与中文化 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 Todo/Idea 的新增与编辑改为弹窗形式，修复 Todo 编辑仅改标题问题，并统一中文文案（保留 Todo Plus）。

**Architecture:** 采用 shadcn-vue `Dialog` 作为统一弹窗容器，业务表单在 `App.vue` 管理临时状态并调用 Pinia store 更新。

**Tech Stack:** Vue3 + TypeScript + shadcn-vue + Pinia + Vitest

---

### Task 1: 新增 Dialog 组件族与 FormDialog 复用壳
### Task 2: App 页面改为弹窗新增/编辑（Todo + Idea）
### Task 3: 文案中文化（除 Todo Plus）
### Task 4: 回归验证（test/build）

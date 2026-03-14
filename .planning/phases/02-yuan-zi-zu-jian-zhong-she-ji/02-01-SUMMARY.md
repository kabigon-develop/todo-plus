---
phase: 02-yuan-zi-zu-jian-zhong-she-ji
plan: "01"
subsystem: ui

tags: [vue, cva, tailwindcss, css-tokens, radix-vue, vitest, tailwindcss-animate]

# Dependency graph
requires:
  - phase: 01-token
    provides: CSS Token 定义（--color-primary, --border-focus, --priority-* 等）已注册到 tailwind.config.js

provides:
  - Button CVA 迁移至 bg-primary/text-white/font-semibold，outline 变体含 border-primary text-primary-text
  - Badge 新增 high/medium/low priority 变体（CSS arbitrary value --priority-*-bg/text），状态变体消除硬编码 Tailwind 调色板类
  - Input 新增 error prop，error 态显示 border-red-400 + ring-red-400
  - Checkbox checked 态迁移至 bg-primary/border-primary/text-white
  - style.css 新增 priority soft-bg CSS Token（6 个 :root + 6 个 .dark）
  - CVA 函数提取为独立 index.ts 模块（可在 node 环境被 vitest 直接 import）
  - 三个 tests/components/ 测试文件（15 个断言全绿）
  - tailwindcss-animate 注册到 tailwind.config.js plugins

affects:
  - 03-dong-hua 阶段（使用 tailwindcss-animate + data-state CSS 选择器驱动动效）
  - 04-kan-ban 阶段（Badge priority 变体将用于任务优先级显示）

# Tech tracking
tech-stack:
  added:
    - tailwindcss-animate（已在 package.json 中，本次注册到 tailwind.config.js plugins）
  patterns:
    - CVA 函数双写模式：Button.vue/Badge.vue 内部保留 cva() 用于 Vue 渲染，index.ts 导出同名函数供 node 环境测试
    - CSS arbitrary value 模式：Tailwind 类 bg-[--priority-high-bg] 引用 CSS 变量实现主题自适应
    - Input error prop 模式：单 boolean prop 驱动 cn() 条件分支，error 态覆盖 border/ring 颜色

key-files:
  created:
    - tests/components/button.test.ts
    - tests/components/badge.test.ts
    - tests/components/input.test.ts
  modified:
    - src/components/ui/button/Button.vue
    - src/components/ui/button/index.ts
    - src/components/ui/badge/Badge.vue
    - src/components/ui/badge/index.ts
    - src/components/ui/input/Input.vue
    - src/components/ui/input/index.ts
    - src/components/ui/checkbox/Checkbox.vue
    - src/style.css
    - tailwind.config.js

key-decisions:
  - "Button default variant 最终值：bg-primary text-white font-semibold hover:bg-primary-hover（阶段 1 过渡值 bg-foreground 正式替换）"
  - "Badge 状态变体（success/warning/destructive/info）复用 priority token：success→low-bg, warning→medium-bg, destructive→high-bg, info→primary-muted"
  - "CVA 函数双写而非从 .vue 文件 import：避免 vitest node 环境下 Vue SFC 解析问题"
  - "Checkbox 加入 transition-colors duration-150 提升勾选体验（Claude's Discretion）"
  - "getInputClass() 直接导出函数（非 cva），因为 Input 只有两种状态，不需要多维度 variant"

patterns-established:
  - "CVA 双写模式：组件文件内部 cva + index.ts 导出供测试，两者类字符串保持同步"
  - "CSS Token arbitrary value：bg-[--priority-high-bg] 语法连接 CSS 变量与 Tailwind 工具类"
  - "TDD 流程：先写断言新值的测试（RED）→ 迁移组件（GREEN）→ 不需要 refactor"

requirements-completed: [COMP-01, COMP-02, COMP-05]

# Metrics
duration: ~20min
completed: 2026-03-14
---

# Phase 2 Plan 01: 原子组件重设计 Summary

**Button/Badge/Input/Checkbox 四组件迁移至语义化 CSS Token，Badge 新增 priority 变体，建立基于 CVA 函数提取的 node 环境测试，tailwindcss-animate 注册完成**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-03-14T22:00:00Z
- **Completed:** 2026-03-14T22:20:00Z
- **Tasks:** 3（含 TDD RED+GREEN 流程）
- **Files modified:** 11

## Accomplishments

- Button default/outline variant 完成迁移，使用 teal 主色语义 token，无硬编码调色板类
- Badge 新增 high/medium/low priority 变体，所有状态变体迁移至 CSS arbitrary value（--priority-*-bg/text）
- Input 新增 error prop，Select.vue focus token 验证无遗漏
- Checkbox checked 态迁移至 bg-primary，视觉一致性达成
- 建立 tests/components/ 测试基础设施：15 个 CVA 类名断言，全量 35 个测试全绿

## Task Commits

每个 task 独立提交：

1. **Task 1: Wave 0 基础设施（TDD RED）** - `03b8cf4` (test)
2. **Task 2: Button/Badge/Checkbox 迁移（TDD GREEN）** - `3e1c517` (feat)
3. **Task 3: Input error prop + Select 验证（TDD GREEN）** - `8dafc67` (feat)

## Files Created/Modified

- `src/components/ui/button/Button.vue` - default/outline variant 迁移至 bg-primary/border-primary
- `src/components/ui/button/index.ts` - 导出 buttonVariants 函数供 node 测试
- `src/components/ui/badge/Badge.vue` - 新增 priority 变体，状态变体迁移至 CSS Token
- `src/components/ui/badge/index.ts` - 导出 badgeVariants 函数供 node 测试
- `src/components/ui/input/Input.vue` - 新增 error prop，条件分支 border/ring 颜色
- `src/components/ui/input/index.ts` - 导出 getInputClass() 函数供 node 测试
- `src/components/ui/checkbox/Checkbox.vue` - checked 态迁移至 bg-primary + transition-colors
- `src/style.css` - 新增 --priority-high/medium/low-bg/text tokens（:root + .dark）
- `tailwind.config.js` - 新增 tailwindcss-animate plugin
- `tests/components/button.test.ts` - COMP-01 CVA 类名断言（3 tests）
- `tests/components/badge.test.ts` - COMP-02 priority 变体和无硬编码断言（7 tests）
- `tests/components/input.test.ts` - COMP-05 error/focus 类名断言（5 tests）

## Decisions Made

- Button default variant 最终值为 `bg-primary text-white font-semibold hover:bg-primary-hover`，正式替换阶段 1 过渡值 `bg-foreground`
- Badge 状态变体复用 priority token（success→low-bg, warning→medium-bg, destructive→high-bg），减少 token 数量
- CVA 函数双写（组件内 + index.ts）：避免 vitest node 环境解析 Vue SFC 的 import 问题
- Checkbox 加入 `transition-colors duration-150`，提升勾选过渡体验（Claude's Discretion，计划允许）

## Deviations from Plan

None — 计划执行精确，所有接口定义均在 PLAN.md interfaces 块中预先锁定，无需架构级决策。

## Issues Encountered

None — 测试基础设施（vitest node 环境）已在阶段 1 验证可用，本次直接复用。

## User Setup Required

None — 无需外部服务配置。

## Next Phase Readiness

- tailwindcss-animate 已注册，阶段 3 动画阶段可直接使用 data-state CSS 选择器驱动 Radix Vue 组件动效
- Badge priority 变体就绪，阶段 4 Kanban 任务卡片可直接使用 `<Badge variant="high" />` 等
- 四组件测试覆盖建立，后续改动有回归保护

---
*Phase: 02-yuan-zi-zu-jian-zhong-she-ji*
*Completed: 2026-03-14*

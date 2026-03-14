---
phase: 2
slug: yuan-zi-zu-jian-zhong-she-ji
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 0.34.6 |
| **Config file** | `vite.config.ts`（test.environment: 'node'） |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

**架构说明：** Phase 2 是纯类名/样式变更。测试策略为直接测试 CVA 函数输出（无需 mount 组件），避免 jsdom 24 + Vue 3 + vitest 0.34.6 已知不兼容问题。CVA 变体函数需在 Wave 0 提取为独立模块。

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-W0 | 01 | W0 | COMP-01~05 | setup | `npx vitest run` | ❌ W0 | ⬜ pending |
| 02-01-01 | 01 | 1 | COMP-01 | unit（CVA 类名） | `npx vitest run tests/components/button.test.ts` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | COMP-02 | unit（CVA 类名） | `npx vitest run tests/components/badge.test.ts` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | COMP-05 | unit（CVA 类名） | `npx vitest run tests/components/input.test.ts` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 2 | COMP-03 | unit（CVA 类名） | `npx vitest run tests/components/tabs.test.ts` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 2 | COMP-04 | unit（CVA 类名） | `npx vitest run tests/components/dialog.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/components/button.test.ts` — COMP-01 Button variant 类名断言（需先提取 CVA 函数）
- [ ] `tests/components/badge.test.ts` — COMP-02 Badge priority 变体断言
- [ ] `tests/components/tabs.test.ts` — COMP-03 TabsTrigger active 类名断言
- [ ] `tests/components/dialog.test.ts` — COMP-04 Dialog 动效类名断言
- [ ] `tests/components/input.test.ts` — COMP-05 Input focus/error 类名断言
- [ ] 各组件 CVA 函数提取为独立模块（如 `Button.vue` → 同目录 `index.ts` 导出 `buttonVariants`）
- [ ] `tailwind.config.js` 补充 `require('tailwindcss-animate')` 插件注册

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Button 深色/浅色模式视觉正确 | COMP-01 | CSS 变量运行时渲染，无法在 node 环境断言视觉 | 切换主题，检查 Button teal 背景和白色文字 |
| Tab 滑动指示器动画流畅 | COMP-03 | CSS 动画需浏览器运行 | 点击不同 Tab，观察底部指示器滑动效果 |
| Dialog 从底部滑入/毛玻璃背景 | COMP-04 | CSS 动画 + backdrop-blur 需浏览器 | 打开 Dialog，观察入场动画和背景模糊 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

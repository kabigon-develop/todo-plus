---
phase: 1
slug: token
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^0.34.6 |
| **Config file** | vite.config.ts（test 字段） |
| **Quick run command** | `npx vitest run tests/stores/ui.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/stores/ui.test.ts`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 0 | TOKEN-03 | unit | `npx vitest run tests/stores/ui.test.ts` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | TOKEN-01 | manual | `npx vite build && grep -r 'surface-base' dist/` | N/A | ⬜ pending |
| 1-01-03 | 01 | 1 | TOKEN-02 | manual | `npx vite build` | N/A | ⬜ pending |
| 1-02-01 | 02 | 1 | TOKEN-03 | unit | `npx vitest run tests/stores/ui.test.ts` | ❌ W0 | ⬜ pending |
| 1-02-02 | 02 | 1 | TOKEN-03 | unit | `npx vitest run tests/stores/ui.test.ts` | ❌ W0 | ⬜ pending |
| 1-02-03 | 02 | 2 | TOKEN-01, TOKEN-02 | manual | 视觉验证（浏览器） | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/stores/ui.test.ts` — 覆盖 TOKEN-03：theme 初始状态、toggleTheme、hydrateTheme、localStorage 读写
- [ ] `tests/stores/ui.test.ts` — 验证 toggleTheme 调用后 `document.documentElement.classList` 包含 'dark'（需 @vitest-environment jsdom 注释）

*注意：vite.config.ts 当前 test environment 为 'node'，ui.test.ts 顶部需添加 `// @vitest-environment jsdom` 注释以启用 DOM API。*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| CSS 变量在 :root/.dark 中正确定义 | TOKEN-01 | CSS 无法 unit test | 打开 DevTools → Elements → :root 检查变量值 |
| Tailwind 类名生成正确（bg-primary 等） | TOKEN-02 | 构建产物检查 | `npx vite build` 后检查 dist/assets/*.css 包含 `.bg-primary` |
| 无白色闪烁（刷新深色模式） | TOKEN-03 | 视觉验证 | 设置深色 → 刷新页面 → 无白色闪烁 |
| 主色 token 值正确 + WCAG 对比度 | TOKEN-04 | 对比度工具验证 | 浏览器 DevTools Accessibility 检查 |
| 切换按钮图标（Sun/Moon）正确显示 | TOKEN-03 | 视觉验证 | 点击切换按钮，图标跟随主题变化 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

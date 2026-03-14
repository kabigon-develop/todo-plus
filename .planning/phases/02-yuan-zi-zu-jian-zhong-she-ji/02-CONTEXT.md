# Phase 2: 原子组件重设计 - Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

<domain>
## Phase Boundary

重设计并迁移 Button、Badge、Input、Checkbox、Select、Tab、Dialog 等原子 UI 组件：消除所有硬编码颜色类，替换为语义化 CSS Token，并叠加 Tab 滑动指示器和 Dialog 入场动画。不涉及页面级布局改造（Phase 3 负责）。

</domain>

<decisions>
## Implementation Decisions

### Button 主色方案
- `default` variant 迁移至 `bg-primary`（teal-500 #14b8a6）
- 文字使用 `text-white font-semibold`（加粗满足 WCAG AA 大字/粗体 3:1 阈值）
- `outline` variant 使用 `border-primary text-primary-text`（teal 边框 + teal-700 文字）
- hover 态仅颜色加深（`hover:bg-primary-hover`），不添加缩放或阴影变化

### Tab 滑动指示器
- 活动 Tab 底部显示 2-3px 青绿实线指示器
- 实现方式：CSS 伪元素方案（`data-[state=active]:after`），无需 JS 位置追踪
- 保留现有 `TabsList` 胶囊形背景（`bg-surface-base`），仅在活动项加底部指示线
- 活动标签文字：`text-primary-text`（teal-700）+ `font-semibold`；非活动标签：`text-muted`

### Dialog 入场动效
- 弹层从底部滑入（`translateY(100%) → translateY(0)`），关闭时反向退出
- 背景遮罩：`backdrop-blur-md`（约 8-12px）+ `bg-overlay/60~80%` 半透明
- 动画时长：快速 150-200ms，使用 ease-out 缓动
- 实现：Radix Dialog `data-[state=open]` / `data-[state=closed]` CSS 选择器驱动（禁止外层包裹 Vue `<Transition>`）

### 选中态颜色
- Checkbox 勾选态：`bg-primary`（teal-500）填充 + 白色勾选图标（替换现有 `bg-foreground`）
- Select / Checkbox 空闲边框：保持 `border-border`（灰色），teal 仅用于 checked / focus-visible 态
- Badge 优先级变体（high/medium/low）：保持"淡色背景 + 深色文字"风格，使用 CSS Token 替换硬编码（`bg-[--priority-high]` 等）
- Badge 状态变体（warning/success/destructive/info）同步迁移至 CSS Token

### Claude's Discretion
- Select 组件的具体实现细节（已有 Radix SelectRoot/Trigger）
- Input 的错误态样式（空闲/focus 已定义，error 态 Claude 决定）
- 各组件圆角半径微调（在现有 `rounded-md` / `rounded-sm` 基础上根据视觉判断）
- Checkbox 过渡动画（勾选时 scale 或 opacity 细节）

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Button.vue`: CVA-based，6 个 variant（default/destructive/outline/secondary/ghost/link），已使用语义化 token（`border-border`、`ring-border-focus`）；仅需修改 `default` 和 `outline` 的颜色值
- `Badge.vue`: CVA-based，6 个 variant；状态变体已标注 `/* 阶段 2 COMP-02 迁移 */` 注释，明确等待迁移
- `TabsList.vue` + `TabsTrigger.vue`: Radix-based，活动态通过 `data-[state=active]` CSS hook 控制，CSS 伪元素方案可直接接入
- `DialogContent.vue`: 已使用 `--overlay` token 和 `bg-surface-elevated`，需添加 keyframes 动画
- `Input.vue`: 已完全使用语义化 token（`border-border`、`focus-visible:ring-border-focus`）— 只需验证无遗漏
- `Checkbox.vue`: `data-[state=checked]:bg-foreground` → 替换为 `data-[state=checked]:bg-primary data-[state=checked]:border-primary`

### Established Patterns
- 所有组件使用 CVA（class-variance-authority）管理变体类
- Radix Vue 原语：动效通过 `data-[state=*]` CSS 选择器驱动，**禁止** Vue `<Transition>` 包裹 Radix 组件
- 语义化 token 已在 Phase 1 建立（`bg-primary`、`text-primary-text`、`border-border`、`bg-surface-*` 等）

### Integration Points
- `src/style.css` 的 `:root` 和 `.dark` 块提供所有 Token（由 Phase 1 完成）
- `tailwind.config.js` 已将 Token 注册为 Tailwind 工具类（由 Phase 1 完成）
- Checkbox、Dialog、Select 被 App.vue 页面层直接调用

</code_context>

<specifics>
## Specific Ideas

- Tab 指示器参考 Linear 顶部导航、GitHub 仓库标签页风格：底部细线 + 切换时平滑过渡
- Dialog 参考 iOS Sheet 弹出感：快速从底部升起，背景毛玻璃，关闭时快速退出不拖泥带水
- Button 主色方案与大多数现代 SaaS（Linear、Vercel）一致：品牌色作为主按钮背景

</specifics>

<deferred>
## Deferred Ideas

无 — 讨论内容均在 Phase 2 范围内。

</deferred>

---

*Phase: 02-yuan-zi-zu-jian-zhong-she-ji*
*Context gathered: 2026-03-14*

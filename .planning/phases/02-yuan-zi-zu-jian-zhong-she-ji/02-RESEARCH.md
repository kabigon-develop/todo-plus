# Phase 02: 原子组件重设计 - Research

**Researched:** 2026-03-14
**Domain:** Vue 3 + Radix Vue + Tailwind CSS 组件迁移与动效
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Button 主色方案**
- `default` variant 迁移至 `bg-primary`（teal-500 #14b8a6）
- 文字使用 `text-white font-semibold`（加粗满足 WCAG AA 大字/粗体 3:1 阈值）
- `outline` variant 使用 `border-primary text-primary-text`（teal 边框 + teal-700 文字）
- hover 态仅颜色加深（`hover:bg-primary-hover`），不添加缩放或阴影变化

**Tab 滑动指示器**
- 活动 Tab 底部显示 2-3px 青绿实线指示器
- 实现方式：CSS 伪元素方案（`data-[state=active]:after`），无需 JS 位置追踪
- 保留现有 `TabsList` 胶囊形背景（`bg-surface-base`），仅在活动项加底部指示线
- 活动标签文字：`text-primary-text`（teal-700）+ `font-semibold`；非活动标签：`text-muted`

**Dialog 入场动效**
- 弹层从底部滑入（`translateY(100%) → translateY(0)`），关闭时反向退出
- 背景遮罩：`backdrop-blur-md`（约 8-12px）+ `bg-overlay/60~80%` 半透明
- 动画时长：快速 150-200ms，使用 ease-out 缓动
- 实现：Radix Dialog `data-[state=open]` / `data-[state=closed]` CSS 选择器驱动（禁止外层包裹 Vue `<Transition>`）

**选中态颜色**
- Checkbox 勾选态：`bg-primary`（teal-500）填充 + 白色勾选图标（替换现有 `bg-foreground`）
- Select / Checkbox 空闲边框：保持 `border-border`（灰色），teal 仅用于 checked / focus-visible 态
- Badge 优先级变体（high/medium/low）：保持"淡色背景 + 深色文字"风格，使用 CSS Token 替换硬编码（`bg-[--priority-high]` 等）
- Badge 状态变体（warning/success/destructive/info）同步迁移至 CSS Token

### Claude's Discretion
- Select 组件的具体实现细节（已有 Radix SelectRoot/Trigger）
- Input 的错误态样式（空闲/focus 已定义，error 态 Claude 决定）
- 各组件圆角半径微调（在现有 `rounded-md` / `rounded-sm` 基础上根据视觉判断）
- Checkbox 过渡动画（勾选时 scale 或 opacity 细节）

### Deferred Ideas (OUT OF SCOPE)
无 — 讨论内容均在 Phase 2 范围内。
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| COMP-01 | Button 组件 CVA variants 迁移至语义化 token（消除硬编码 slate-* 颜色） | Button.vue 当前 `default` 为 `bg-foreground`，需改为 `bg-primary text-white font-semibold hover:bg-primary-hover`；`outline` 需加 `text-primary-text` |
| COMP-02 | Badge/Tag 组件迁移至语义化 token，支持优先级色彩变体 | Badge.vue 4 个变体已有 `/* 阶段 2 COMP-02 迁移 */` 注释；需新增 `high/medium/low` priority 变体并用 CSS arbitrary value `bg-[color:var(--priority-high)]` 或 Tailwind token 类 |
| COMP-03 | Tab 导航重设计（青绿滑动指示器动画、图标对齐、活动态样式） | TabsTrigger.vue 已有 `data-[state=active]` hook；添加 `relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary data-[state=active]:after:content-['']` 伪元素 |
| COMP-04 | Dialog/弹层重设计（backdrop blur、slide-up 入场动画、圆角卡片样式） | DialogContent.vue 需要：① @keyframes slideUp/slideDown；② DialogOverlay 加 `backdrop-blur-md`；③ DialogContent 位置改为底部对齐 |
| COMP-05 | 输入框/表单组件重设计（聚焦态青绿边框、错误态样式、一致间距） | Input.vue 已用 `focus-visible:ring-border-focus`（teal）—验证无遗漏；新增 error 态 prop；Select.vue 同步验证 |
</phase_requirements>

---

## Summary

Phase 2 的工作是精确外科手术式的 CSS/类名迁移，不涉及组件逻辑变动。Phase 1 已建立完整的 CSS Token 系统和 Tailwind 工具类注册，所有语义化 token（`bg-primary`、`text-primary-text`、`border-border` 等）均可直接使用。

六个组件中，Input 和 Select 基础上已大量使用语义化 token，工作量最小；Button 和 Checkbox 有明确的单点颜色替换；Badge 需新增变体行；Tab 和 Dialog 需叠加动效相关的 CSS 类/keyframe。

**关键技术约束：** Radix Vue 的 Dialog 和 Tabs 必须用 `data-[state=*]` CSS 选择器驱动动画，禁止包裹 Vue `<Transition>`——因为 Radix 内部通过 `data-state` 管理挂载/卸载生命周期，外层 `<Transition>` 会干扰这一机制导致退出动画无法播放。

**Primary recommendation:** 按组件独立迁移，每个组件一个 Task，顺序：Button → Badge → Checkbox → Input/Select → Tab → Dialog。

---

## Standard Stack

### Core（已在项目中，无需新增安装）

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| radix-vue | ^1.9.17 | 无障碍原语，管理 data-state 动效 | 项目已使用，提供 data-state hook |
| class-variance-authority | ^0.7.1 | CVA 变体管理 | 项目已使用，所有组件已基于 CVA |
| tailwindcss | ^3.4.3 | 工具类 CSS | 项目已使用，token 已注册 |
| tailwindcss-animate | ^1.0.7 | Tailwind 动画工具类 | **已安装但当前未被使用**，可为 Dialog/Tab 提供 animate-* 类 |

### 已建立的 CSS Token（Phase 1 产出，直接使用）

| Token 类 | CSS 变量 | 浅色值 | 深色值 | 用途 |
|---------|---------|--------|--------|------|
| `bg-primary` | `--color-primary` | #14b8a6 | #2dd4bf | Button default 背景 |
| `hover:bg-primary-hover` | `--color-primary-hover` | #0d9488 | #14b8a6 | Button hover 态 |
| `text-white` / `text-primary-fg` | `--color-primary-fg` | #ffffff | #042f2e | Button default 文字 |
| `text-primary-text` | `--color-primary-text` | #0f766e | #2dd4bf | outline/link 文字 |
| `border-primary` | `--color-primary` | #14b8a6 | #2dd4bf | outline 边框 |
| `bg-primary-muted` | `--color-primary-muted` | #ccfbf1 | #134e4a | Badge priority 背景 |
| `text-primary-text` | `--color-primary-text` | #0f766e | #2dd4bf | Badge priority 文字 |
| `bg-[--priority-high]` | `--priority-high` | #ef4444 | #ef4444 | Badge high priority |
| `bg-[--priority-medium]` | `--priority-medium` | #f59e0b | #f59e0b | Badge medium priority |
| `bg-[--priority-low]` | `--priority-low` | #22c55e | #22c55e | Badge low priority |
| `border-focus` | `--border-focus` | #14b8a6 | #2dd4bf | Input/Select 聚焦边框 |

**注意：** `priority-*` 颜色在 Tailwind 中已注册为 `priority.high/medium/low`，但 Badge 变体需要同时控制背景和文字（需要淡色背景），建议用 Tailwind 的 opacity modifier 如 `bg-priority-high/15` 或用 CSS arbitrary value `bg-[color-mix(in srgb, var(--priority-high) 15%, transparent)]`。

**更简洁方案：** 直接定义 `--priority-high-bg` 等软背景 token 加入 style.css，或在 Badge 变体中用 hardcoded 软色（如 `bg-red-100 dark:bg-red-950`）——但 CONTEXT.md 指定用 CSS Token，故推荐在 style.css 增加 `--priority-*-bg` 和 `--priority-*-text` token 对（见 Architecture Patterns 章节）。

---

## Architecture Patterns

### Recommended Project Structure（无变动，沿用现有）

```
src/components/ui/
├── button/Button.vue        # CVA 变体颜色替换
├── badge/Badge.vue          # CVA 新增 priority 变体 + 迁移硬编码
├── tabs/TabsList.vue        # 保持不变
├── tabs/TabsTrigger.vue     # 添加 after: 伪元素指示器类
├── tabs/TabsContent.vue     # 不变
├── dialog/DialogContent.vue # 位置/动效改造
├── input/Input.vue          # 验证 + 新增 error prop
├── checkbox/Checkbox.vue    # data-[state=checked] 颜色替换
└── select/Select.vue        # 验证 + focus token 确认
src/style.css               # 可能新增 priority soft-bg token + @keyframes
```

### Pattern 1: CVA 变体颜色替换（Button、Checkbox）

**What:** 只修改 `cva(...)` 中对应 variant 的 Tailwind 类字符串，不改结构
**When to use:** 目标颜色已有 token 工具类时

```typescript
// Source: 项目现有 Button.vue 模式
// 修改前
default: 'bg-foreground text-surface-base hover:bg-foreground/90',
outline: 'border border-border bg-surface-card hover:bg-surface-base',

// 修改后
default: 'bg-primary text-white font-semibold hover:bg-primary-hover',
outline: 'border border-primary bg-surface-card text-primary-text hover:bg-primary-muted',
```

### Pattern 2: Radix Vue data-state CSS 动效（Dialog、Checkbox、Tab）

**What:** 直接在 Radix 原语组件的 `:class` 中使用 `data-[state=*]:` 前缀变体
**When to use:** 所有 Radix Vue 组件的状态驱动样式

```html
<!-- Source: https://www.radix-vue.com/guides/animation -->
<!-- Dialog slide-from-bottom: 在 style.css 定义 @keyframes -->

<!-- DialogOverlay: backdrop blur 遮罩 -->
<DialogOverlay class="fixed inset-0 z-50 bg-[--overlay] backdrop-blur-md
  data-[state=open]:animate-overlayShow
  data-[state=closed]:animate-overlayHide" />

<!-- DialogContent: 从底部滑入，不再 top-1/2 -translate-y-1/2 -->
<DialogContent
  :class="cn('fixed bottom-0 left-1/2 z-50 w-[95vw] max-w-lg -translate-x-1/2
    rounded-t-xl border-t border-border bg-surface-elevated p-6 shadow-lg
    data-[state=open]:animate-slideUp
    data-[state=closed]:animate-slideDown',
    props.class)"
>
```

```css
/* style.css — @keyframes 定义 */
/* Source: Radix Vue animation guide pattern */
@keyframes overlayShow {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes overlayHide {
  from { opacity: 1; }
  to   { opacity: 0; }
}

@keyframes slideUp {
  from { transform: translateX(-50%) translateY(100%); opacity: 0; }
  to   { transform: translateX(-50%) translateY(0);    opacity: 1; }
}

@keyframes slideDown {
  from { transform: translateX(-50%) translateY(0);    opacity: 1; }
  to   { transform: translateX(-50%) translateY(100%); opacity: 0; }
}
```

**注意：** Dialog 当前位置为 `left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2`（居中弹出）。改为底部滑入需将定位改为 `bottom-0 left-1/2 -translate-x-1/2`，圆角改为 `rounded-t-xl`（仅顶部圆角）。同时需在 tailwind.config.js `theme.extend.animation` + `theme.extend.keyframes` 中注册这些动画，或用 `animate-[overlayShow_150ms_ease-out]` arbitrary animation 语法。

### Pattern 3: tailwind.config.js 注册自定义动画

**What:** 将 @keyframes 和 animation shorthand 注册为 Tailwind 工具类，避免 arbitrary value 过长
**When to use:** 有多个组件复用同一动画时

```javascript
// tailwind.config.js
theme: {
  extend: {
    animation: {
      'overlayShow':  'overlayShow 150ms ease-out',
      'overlayHide':  'overlayHide 150ms ease-in',
      'slideUp':      'slideUp 200ms ease-out',
      'slideDown':    'slideDown 150ms ease-in',
    },
    keyframes: {
      overlayShow: {
        from: { opacity: '0' },
        to:   { opacity: '1' },
      },
      overlayHide: {
        from: { opacity: '1' },
        to:   { opacity: '0' },
      },
      slideUp: {
        from: { transform: 'translateX(-50%) translateY(100%)', opacity: '0' },
        to:   { transform: 'translateX(-50%) translateY(0)',    opacity: '1' },
      },
      slideDown: {
        from: { transform: 'translateX(-50%) translateY(0)',    opacity: '1' },
        to:   { transform: 'translateX(-50%) translateY(100%)', opacity: '0' },
      },
    },
  }
}
```

### Pattern 4: CSS 伪元素 Tab 底部指示器

**What:** 利用 Tailwind `after:` 前缀 + `data-[state=active]:` 前缀叠加，为活动 Tab 渲染底部线条
**When to use:** 需要 CSS-only 滑动指示器，无 JS 位置追踪

```html
<!-- Source: Tailwind CSS arbitrary variants 文档 -->
<!-- TabsTrigger.vue 修改后 -->
<TabsTrigger
  v-bind="forwarded"
  :class="cn(
    // 基础样式
    'relative inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5',
    'text-sm font-medium text-muted',
    'ring-offset-surface-card transition-all',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    // 伪元素底部线条（始终存在，默认透明）
    'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5',
    'after:rounded-full after:bg-primary after:transition-opacity after:duration-200',
    'after:opacity-0',
    // 活动态：线条显示 + 文字样式
    'data-[state=active]:text-primary-text data-[state=active]:font-semibold',
    'data-[state=active]:after:opacity-100',
    props.class
  )"
>
  <slot />
</TabsTrigger>
```

**设计决策说明：** CONTEXT.md 说"底部指示器 + 切换时平滑过渡"，用 `opacity` 过渡比 `translateX` 滑动更简单可靠（无需追踪元素位置），且视觉效果已符合需求描述。若需要真正的"滑动"效果，则必须引入 JS（MotionOne 或 GSAP），但 CONTEXT.md 明确指定"无需 JS 位置追踪"，故 opacity 方案为正确选择。同时移除现有 `rounded-sm`（胶囊背景样式），活动态不再有背景色块，仅有底部线条 + 文字颜色变化。

**关于 TabsList：** 现有 `rounded-md bg-surface-base p-1` 胶囊背景保留，活动 Tab 不再有 `bg-surface-card shadow-sm`（移除 `data-[state=active]:bg-surface-card data-[state=active]:shadow-sm`）。

### Pattern 5: Badge priority 软色变体

**What:** 新增 `high/medium/low` 三个 priority 变体，淡色背景 + 深色文字
**When to use:** COMP-02 优先级色彩变体需求

```css
/* 方案 A（推荐）：在 style.css 新增 soft bg token */
:root {
  --priority-high-bg:   rgba(239, 68, 68, 0.12);   /* red-500/12 */
  --priority-high-text: #dc2626;                     /* red-600 */
  --priority-medium-bg: rgba(245, 158, 11, 0.12);   /* amber-500/12 */
  --priority-medium-text: #d97706;                   /* amber-600 */
  --priority-low-bg:    rgba(34, 197, 94, 0.12);    /* green-500/12 */
  --priority-low-text:  #16a34a;                     /* green-600 */
}
.dark {
  --priority-high-bg:   rgba(239, 68, 68, 0.18);
  --priority-high-text: #f87171;   /* red-400 深色下更亮 */
  --priority-medium-bg: rgba(245, 158, 11, 0.18);
  --priority-medium-text: #fbbf24; /* amber-400 */
  --priority-low-bg:    rgba(34, 197, 94, 0.18);
  --priority-low-text:  #4ade80;   /* green-400 */
}
```

```typescript
// Badge.vue CVA 新增 priority 变体（方案 A）
const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:     'border-transparent bg-foreground text-surface-base',
        secondary:   'border-transparent bg-surface-base text-foreground',
        // 状态变体 → 迁移至 CSS Token（移除硬编码 Tailwind 颜色）
        success:     'border-transparent bg-[--priority-low-bg] text-[--priority-low-text]',
        warning:     'border-transparent bg-[--priority-medium-bg] text-[--priority-medium-text]',
        destructive: 'border-transparent bg-[--priority-high-bg] text-[--priority-high-text]',
        info:        'border-transparent bg-primary-muted text-primary-text',
        // 新增 priority 变体
        high:        'border-transparent bg-[--priority-high-bg] text-[--priority-high-text]',
        medium:      'border-transparent bg-[--priority-medium-bg] text-[--priority-medium-text]',
        low:         'border-transparent bg-[--priority-low-bg] text-[--priority-low-text]',
      }
    },
    defaultVariants: { variant: 'default' }
  }
);
```

### Pattern 6: Input error 态（Claude's Discretion）

**What:** 为 Input 新增 `error` prop，显示红色边框
**Implementation:**

```html
<!-- Input.vue — 新增 error prop -->
<script setup lang="ts">
const props = defineProps<{
  class?: HTMLAttributes['class'];
  error?: boolean;
}>();
</script>

<template>
  <input
    v-model="modelValue"
    :class="cn(
      'flex h-10 w-full rounded-md border bg-surface-card px-3 py-2 text-sm text-foreground ...',
      // 正常态
      !props.error && 'border-border focus-visible:ring-border-focus',
      // 错误态
      props.error  && 'border-red-400 focus-visible:ring-red-400',
      $props.class
    )"
  />
</template>
```

### Anti-Patterns to Avoid

- **禁止 Vue `<Transition>` 包裹 Radix 组件：** Radix Vue 的 Dialog/Popover/Tooltip 内部通过 `data-state` 管理卸载时机（挂起卸载等待动画播完），Vue `<Transition>` 会与之产生竞态，导致退出动画丢失或组件提前卸载。
- **禁止 hardcoded Tailwind 调色板颜色：** 如 `bg-emerald-100 text-emerald-700`，无法响应深色模式 CSS Token 切换。
- **禁止 JS 计算 Tab 指示器位置：** 会引入响应式副作用、resize 监听复杂度，而 CSS 伪元素方案已满足需求。
- **避免在 DialogContent 上使用 `top-1/2 -translate-y-1/2`（底部滑入时）：** 定位原点不同导致 translateY 动画方向错误。

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 无障碍焦点管理 | 自定义 focus trap | Radix Vue Dialog（已内置） | Dialog 关闭时自动返回焦点，键盘导航完整 |
| 多变体类管理 | 手写 if/else 类名 | CVA（已使用） | 类型安全、可组合、无重复逻辑 |
| 深色/浅色主题下颜色切换 | 用 JS 判断 isDark 传入不同类 | CSS Token + Tailwind class | 零 JS，切换瞬时，无 FOUT |
| CSS 类合并去重 | 手写覆盖逻辑 | `cn()` = `clsx + tailwind-merge` | 正确处理 Tailwind 类冲突 |
| 退出动画期间保持 DOM | forceMount + v-show | Radix 内置 data-state 悬挂卸载 | 不需要 forceMount，CSS animation 自动处理 |

**Key insight:** Radix Vue 的 `data-state` 机制本身就是专为 CSS 动画设计的——它会等待 CSS 动画播完才真正卸载 DOM，所以不需要任何额外的 JS 控制卸载时机。

---

## Common Pitfalls

### Pitfall 1: Dialog 定位与 translateY 动画冲突

**What goes wrong:** 当 DialogContent 使用 `top-1/2 -translate-y-1/2`（垂直居中）时，添加 `translateY(100%)` 的滑入动画方向不对（初始状态是"向下移出视口的一半高度位置再向下 100%"，而非屏幕底部）。
**Why it happens:** `transform` 属性是叠加的，但 Tailwind 的 `translate-y-*` 和 keyframe 里的 `translateY` 是同一属性，会覆盖。
**How to avoid:** 底部滑入方案必须同步更改定位为 `bottom-0`，移除 `-translate-y-1/2`，keyframe 的 `from` 直接从 `translateX(-50%) translateY(100%)` 开始。

### Pitfall 2: Tailwind arbitrary value 中 CSS 变量语法

**What goes wrong:** `bg-[--priority-high-bg]` 无法直接使用，Tailwind arbitrary value 中需要 `var()` 包裹才能生效。
**Why it happens:** Tailwind v3 arbitrary value 解析规则：`bg-[<value>]` 中如果 `<value>` 是 CSS 变量名（以 `--` 开头），Tailwind 会自动包裹为 `var(--priority-high-bg)`——**实际上 Tailwind v3.3+ 支持直接写 `bg-[--priority-high-bg]`**（无需手动 `var()`）。
**How to avoid:** 确认项目 Tailwind 版本（当前 ^3.4.3），直接用 `bg-[--priority-high-bg]` 语法。如有疑虑，显式写 `bg-[color:var(--priority-high-bg)]`。

### Pitfall 3: scoped 样式无法命中 Radix Portal 内容

**What goes wrong:** 在 Vue SFC 中用 `<style scoped>` 为 Dialog/Select 内容写样式，样式不生效——因为 Radix Portal 将内容传送到 `<body>` 下，脱离了组件 scope。
**Why it happens:** Scoped styles 添加 `data-v-xxxx` attribute selector，Portal 内的元素没有该 attribute。
**How to avoid:** Phase 2 的动效通过 `:class` 绑定 Tailwind 工具类（无 scoped 问题），@keyframes 写在 `style.css` 全局文件中（已验证有效）。

### Pitfall 4: tailwindcss-animate 与手写 keyframes 冲突

**What goes wrong:** 项目已安装 `tailwindcss-animate`（^1.0.7），它已预定义了 `animate-in/out`、`slide-in-from-bottom` 等工具类，若同时在 tailwind.config.js 定义同名动画会产生覆盖。
**Why it happens:** tailwindcss-animate 注册的 animate 类名可能与自定义名冲突。
**How to avoid:** 优先尝试使用 `tailwindcss-animate` 提供的类（`data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=open]:duration-200`），减少手写 keyframes 数量。仅在行为不满足需求时才手写。

### Pitfall 5: CVA variant 字符串中 `after:` 伪元素 content 为空时不显示

**What goes wrong:** CSS `::after` 伪元素需要 `content` 属性才能渲染，即使内容为空也需要 `content: ''`。
**Why it happens:** 浏览器对无 `content` 的伪元素不渲染。
**How to avoid:** 在 TabsTrigger 的基础类中加 `after:content-['']`（Tailwind 工具类），确保伪元素始终存在。

---

## Code Examples

Verified patterns from official sources:

### tailwindcss-animate 提供的 Dialog 动画类（优先尝试）

```html
<!-- Source: tailwindcss-animate README / radix-vue docs -->
<!-- DialogOverlay -->
<DialogOverlay class="fixed inset-0 z-50 bg-[--overlay] backdrop-blur-md
  data-[state=open]:animate-in data-[state=open]:fade-in-0
  data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />

<!-- DialogContent (底部滑入) -->
<DialogContent class="fixed bottom-0 left-1/2 z-50 -translate-x-1/2 w-[95vw] max-w-lg
  rounded-t-xl border-t border-border bg-surface-elevated p-6 shadow-lg
  data-[state=open]:animate-in  data-[state=open]:slide-in-from-bottom  data-[state=open]:duration-200
  data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=closed]:duration-150" />
```

### Tab 指示器完整实现

```html
<!-- Source: Tailwind arbitrary variants 文档 + Radix Vue data-state 文档 -->
<TabsTrigger
  v-bind="forwarded"
  :class="cn(
    'relative inline-flex items-center justify-center whitespace-nowrap rounded-none px-3 py-1.5',
    'text-sm font-medium text-muted transition-all',
    'ring-offset-surface-card',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5',
    'after:content-[\'\'] after:rounded-full after:bg-primary',
    'after:opacity-0 after:transition-opacity after:duration-200',
    'data-[state=active]:text-primary-text data-[state=active]:font-semibold',
    'data-[state=active]:after:opacity-100',
    props.class
  )"
>
  <slot />
</TabsTrigger>
```

### Checkbox primary 颜色

```html
<!-- Source: Radix Vue Checkbox data-state 文档 -->
<CheckboxRoot
  v-bind="forwarded"
  :class="cn(
    'peer h-4 w-4 shrink-0 rounded-sm border border-border',
    'ring-offset-surface-card',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'transition-colors duration-150',
    'data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-white',
    props.class
  )"
>
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| 硬编码 Tailwind 调色板（`bg-emerald-100`） | CSS Token + arbitrary value（`bg-[--priority-low-bg]`） | 主题切换时自动响应 |
| Vue `<Transition>` 控制弹层动画 | Radix data-state + CSS keyframes/tailwindcss-animate | 无冲突，退出动画正常播放 |
| 位置计算 JS Tab 指示器 | CSS `::after` 伪元素 + opacity 过渡 | 零 JS，无 resize 监听 |
| `data-[state=active]:bg-surface-card shadow-sm`（胶囊背景） | `data-[state=active]:text-primary-text font-semibold + after:指示线` | 视觉更现代，对齐 Linear/GitHub 风格 |

**Deprecated/outdated（在本 phase 中替换）:**
- `bg-emerald-100 text-emerald-700`（Badge 状态变体）：替换为 CSS Token
- `bg-foreground text-surface-base`（Button default）：替换为 `bg-primary text-white font-semibold`
- `data-[state=checked]:bg-foreground`（Checkbox）：替换为 `data-[state=checked]:bg-primary`
- `top-1/2 -translate-y-1/2`（DialogContent 居中定位）：改为底部 `bottom-0` 定位

---

## Open Questions

1. **tailwindcss-animate `slide-in-from-bottom` 是否需要额外配置**
   - What we know: 已安装 `tailwindcss-animate@^1.0.7`，它提供 `slide-in-from-bottom-*` 等类
   - What's unclear: 项目中 `tailwind.config.js` plugins 数组当前只有 `forms`，未引入 `tailwindcss-animate`
   - Recommendation: Task 执行时先在 tailwind.config.js 的 `plugins` 数组加入 `require('tailwindcss-animate')`，再验证类名生效；若不生效退而使用手写 keyframes

2. **Badge `info` 变体对应 priority token 的选择**
   - What we know: `info` 语义为"信息/提示"，原来是 sky 蓝色；项目 token 中无 `--color-info`
   - What's unclear: 是否用 `bg-primary-muted text-primary-text`（复用 teal token）或保留 sky 蓝
   - Recommendation: 复用 `bg-primary-muted text-primary-text`，保持 teal 品牌色一致性，无需新增 token

---

## Validation Architecture

> nyquist_validation: true — 包含此章节

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 0.34.6 |
| Config file | `vite.config.ts`（test.environment: 'node'） |
| Quick run command | `npx vitest run tests/` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| COMP-01 | Button default variant 使用 bg-primary，outline 使用 border-primary text-primary-text | unit（类名断言） | `npx vitest run tests/components/button.test.ts -t COMP-01` | ❌ Wave 0 |
| COMP-02 | Badge priority 变体（high/medium/low）输出正确 token 类 | unit（类名断言） | `npx vitest run tests/components/badge.test.ts -t COMP-02` | ❌ Wave 0 |
| COMP-03 | TabsTrigger active 时包含 after: 指示器类 + text-primary-text | unit（类名断言） | `npx vitest run tests/components/tabs.test.ts -t COMP-03` | ❌ Wave 0 |
| COMP-04 | DialogContent 包含 animate-in slide-in-from-bottom 类；DialogOverlay 包含 backdrop-blur | unit（类名断言） | `npx vitest run tests/components/dialog.test.ts -t COMP-04` | ❌ Wave 0 |
| COMP-05 | Input focus 态有 ring-border-focus；error prop 时有红色边框类 | unit（类名断言） | `npx vitest run tests/components/input.test.ts -t COMP-05` | ❌ Wave 0 |

**类名断言测试说明：** Phase 2 是纯类名/样式变更，不涉及逻辑。测试策略为：mount 组件（或直接调用 CVA 函数），断言输出类名包含/不包含特定 token 类。由于 Vitest 配置 `environment: 'node'`，Vue SFC 组件 mount 需要 `@vue/test-utils` + jsdom，但项目已知 jsdom 24 + Vue 3 + vitest 0.34.6 有不兼容问题（STATE.md 记录）。

**替代测试方案（推荐）：** 直接 import CVA 函数并断言字符串输出，无需 mount 组件，可在 node 环境运行：

```typescript
// tests/components/button.test.ts
import { describe, it, expect } from 'vitest';
// 将 buttonVariants 从 Button.vue 中提取为独立文件，或直接测试输出字符串
import { buttonVariants } from '../../src/components/ui/button/Button.vue';

it('COMP-01: default variant 包含 bg-primary', () => {
  const classes = buttonVariants({ variant: 'default' });
  expect(classes).toContain('bg-primary');
  expect(classes).not.toContain('bg-foreground');
});
```

**Wave 0 注意：** CVA 变体函数目前定义在 `.vue` 文件的 `<script setup>` 内部，无法直接从外部 import。可选方案：① 将 variants 提取到同目录的 `index.ts` 文件；② 接受测试覆盖仅为手动视觉验证（manual-only）。推荐方案①，但属于 Task 执行层决定，不在研究范畴。

### Sampling Rate

- **Per task commit:** `npx vitest run`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/components/button.test.ts` — COMP-01 Button variant 类名断言
- [ ] `tests/components/badge.test.ts` — COMP-02 Badge priority 变体断言
- [ ] `tests/components/tabs.test.ts` — COMP-03 TabsTrigger active 类名断言
- [ ] `tests/components/dialog.test.ts` — COMP-04 Dialog 动效类名断言
- [ ] `tests/components/input.test.ts` — COMP-05 Input error/focus 类名断言
- [ ] CVA 函数是否需要提取为独立模块以支持 node 环境测试 — 由 Wave 0 Task 决定

---

## Sources

### Primary (HIGH confidence)
- Radix Vue 官方文档 animation guide (https://www.radix-vue.com/guides/animation) — data-state 动效模式
- Tailwind CSS 官方文档 (https://tailwindcss.com/docs/hover-focus-and-other-states) — arbitrary variants + after: pseudo-element 语法
- 项目源码（Button.vue、Badge.vue、TabsTrigger.vue、DialogContent.vue、Input.vue、Checkbox.vue、Select.vue）— 确认当前状态
- 项目 style.css + tailwind.config.js — 确认可用 token 和注册工具类

### Secondary (MEDIUM confidence)
- tailwindcss-animate 库（安装于项目）— slide-in-from-bottom 等预制类，待验证 plugin 是否已在 config 中注册
- WebSearch: Radix Vue data-state + CSS keyframes 模式（与官方文档一致，提升为 HIGH）

### Tertiary (LOW confidence)
- Badge priority soft-bg token 的具体颜色值（rgba 透明度）— 基于视觉判断，实施时可微调

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — 项目技术栈已固定，无新依赖引入
- Architecture: HIGH — Radix Vue data-state 模式已官方文档确认，CVA 迁移模式已在现有组件中验证
- Pitfalls: HIGH — 来自项目 STATE.md 明确记录（Radix Vue `<Transition>` 禁用）+ 官方文档 scoped 样式警告

**Research date:** 2026-03-14
**Valid until:** 2026-04-13（Tailwind 3.x / Radix Vue 1.x 稳定版，30 天有效）

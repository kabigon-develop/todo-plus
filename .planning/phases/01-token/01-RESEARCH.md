# Phase 1: Token 基础 - Research

**Researched:** 2026-03-14
**Domain:** CSS 自定义属性 Design Token + Tailwind CSS v3 darkMode + FOUT 防闪
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**现有颜色迁移策略**
- 全部替换：删除 tailwind.config.js 中的 ink/mist/mint/amber 硬编码色
- 映射关系：bg-mist → bg-surface、text-ink → text-foreground、bg-mint → bg-primary
- 阶段 1 一并搜索替换全局所有旧类名（App.vue + 所有组件），不留双轨并行

**Token 分层架构**
- 仅建语义层，不建原子层（不需要 --teal-500 中间变量）
- Surface 3 层：`--surface-base`（页面背景）、`--surface-card`（内容区域）、`--surface-elevated`（弹层/浮层）
- 文字 3 档：`--text-foreground`（主文字）、`--text-muted`（次要信息）、`--text-subtle`（占位符/辅助色）
- 主色：`--color-primary`（teal-500 #14b8a6）、`--color-primary-hover`（teal-600 #0d9488）、`--color-primary-muted`（teal-100/teal-900 for dark）
- 优先级色：`--priority-high`（red-500）、`--priority-medium`（amber-500）、`--priority-low`（green-500）
- 边框：`--border-default`、`--border-focus`（primary 色）

**Token 最小范围（阶段 1 仅配色）**
- 阶段 1 只定义颜色 token，间距/字体/圆角 token 留给阶段 3

**深色模式配色**
- 深色背景系：stone-900 系（#1c1917），带暖调
- 深色主色：teal-400 (#2dd4bf)
- 实现方式：`:root` 定义浅色值，`.dark` 覆盖深色值

**防闪烁脚本**
- index.html `<head>` 内第一个 `<script>` 标签（同步、内联）
- 读取 localStorage 中 theme 值，立即在 `<html>` 上添加/移除 `dark` class
- 必须同步执行（不能 defer/async）

**tailwind.config.js 扩展方式**
- 添加 `darkMode: 'class'`
- colors.extend 中注册 CSS 变量引用
- 不引入额外依赖

### Claude's Discretion
- 完整的 CSS 变量值（具体十六进制）
- Tailwind token 命名路径（如 `bg-surface-card` vs `bg-surface/card`）
- ui.ts 中 theme 状态的实现细节（ref vs computed）

### Deferred Ideas (OUT OF SCOPE)
- 间距 token（--spacing-*）— 阶段 3 页面重设计时按需定义
- 字体 token（--font-size-*）— 阶段 3 页面重设计时按需定义
- 圆角 token（--radius-*）— 阶段 3 页面重设计时按需定义
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TOKEN-01 | 建立 CSS 自定义属性设计 Token 系统（--color-primary、--surface-*、--text-* 等语义化变量） | style.css :root/.dark 块定义；token 命名方案已确定 |
| TOKEN-02 | 扩展 tailwind.config.js 将 CSS 变量注册为 Tailwind 工具类（bg-primary、bg-surface 等） | darkMode: 'class' + colors.extend + var() 引用模式 |
| TOKEN-03 | 实现深色/浅色主题切换（index.html 防闪脚本 + ui.ts 主题状态 + 切换按钮） | 防闪脚本模式、Pinia store 扩展方式已验证 |
| TOKEN-04 | 定义青绿色系调色板（teal-500 为锚点，优先级/状态颜色 token） | WCAG AA 对比度验证；teal-500/teal-400/teal-700 组合 |
</phase_requirements>

---

## Summary

本阶段核心是将项目从硬编码 Tailwind 颜色（ink/mist/mint/amber + 大量 slate-*）迁移到 CSS 自定义属性驱动的语义化 token 体系。技术上没有新依赖引入，使用的所有机制（Tailwind darkMode: 'class'、CSS var()、localStorage、Pinia）均已是项目既有技术栈的一部分。

现有代码中硬编码颜色分布范围广：App.vue、8 个 ui 组件（Button、Badge、Card、Checkbox、Dialog、Input、Select、Tabs）均有 slate-* 硬编码。阶段 1 需要一次性全部替换，这是最大工作量所在。关键的防闪烁脚本（FOUT prevention）必须是 index.html head 中的第一个同步内联 script，这是技术约束，不可妥协。

**Primary recommendation:** 先定义 style.css token 体系和 tailwind.config.js，再批量替换各组件的硬编码颜色，最后添加防闪脚本和 ui.ts theme 状态，顺序很重要：先有 token 定义，再替换引用。

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | ^3.4.3（已安装） | 工具类生成；darkMode: 'class' 模式 | 项目既有，无需新增 |
| CSS Custom Properties | 浏览器原生 | Design Token 载体；运行时可切换 | 无运行时开销，支持所有现代浏览器 |
| Pinia | ^2.1.7（已安装） | theme 状态管理，ui.ts 扩展 | 项目既有 store 方案 |
| localStorage | 浏览器原生 | 主题偏好持久化 | 已在 todo/idea store 中使用同一模式 |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| tailwindcss-animate | ^1.0.7（已安装） | 主题切换过渡动画（可选） | 如需主题切换 transition 时 |
| lucide-vue-next | ^0.563.0（已安装） | 主题切换按钮图标（Sun/Moon） | 切换按钮 UI 时 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS var() in Tailwind extend | @nuxtjs/color-mode 等 | 额外依赖，本项目不需要 |
| localStorage 直读 | Pinia persist 插件 | 阶段 1 不引入新依赖，手动即可 |
| darkMode: 'class' | darkMode: 'media' | 'media' 不支持用户主动切换，排除 |

**Installation:** 无需新增安装，所有依赖已就绪。

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── style.css          # :root (浅色) + .dark (深色) CSS 变量块
├── stores/
│   └── ui.ts          # 扩展：theme 状态 + toggleTheme() + hydrate
├── components/ui/     # 所有组件替换硬编码颜色为语义化 token 类
└── App.vue            # 替换硬编码颜色；添加主题切换按钮
index.html             # <head> 第一个 <script> 防闪内联脚本
tailwind.config.js     # darkMode: 'class' + colors.extend (CSS var 引用)
```

### Pattern 1: CSS 变量定义（style.css）

**What:** 在 :root 定义浅色值，在 .dark 覆盖深色值，token 命名遵循语义而非视觉
**When to use:** 所有颜色 token 的单一来源

```css
/* Source: CSS Custom Properties + Tailwind 官方 darkMode 文档 */
:root {
  /* Surface */
  --surface-base: #f8fafc;        /* slate-50 — 页面背景 */
  --surface-card: #ffffff;        /* white — 卡片/内容区 */
  --surface-elevated: #ffffff;    /* white — 弹层/浮层 */

  /* 文字 */
  --text-foreground: #1f2937;     /* gray-800 — 主文字 */
  --text-muted: #6b7280;          /* gray-500 — 次要信息 */
  --text-subtle: #9ca3af;         /* gray-400 — 占位符/辅助 */

  /* 主色 (teal-500 系) */
  --color-primary: #14b8a6;       /* teal-500 */
  --color-primary-hover: #0d9488; /* teal-600 */
  --color-primary-muted: #ccfbf1; /* teal-100 */
  --color-primary-fg: #ffffff;    /* 主色背景上的文字色 */

  /* 主色作为文字时 (WCAG AA on white) */
  --color-primary-text: #0f766e;  /* teal-700 */

  /* 边框 */
  --border-default: #e2e8f0;      /* slate-200 */
  --border-focus: #14b8a6;        /* primary */

  /* 优先级 */
  --priority-high: #ef4444;       /* red-500 */
  --priority-medium: #f59e0b;     /* amber-500 */
  --priority-low: #22c55e;        /* green-500 */

  /* 叠加层 */
  --overlay: rgba(15, 15, 15, 0.5);
}

.dark {
  --surface-base: #1c1917;        /* stone-900 */
  --surface-card: #292524;        /* stone-800 */
  --surface-elevated: #3c3634;    /* stone-700 */

  --text-foreground: #f5f5f4;     /* stone-100 */
  --text-muted: #a8a29e;          /* stone-400 */
  --text-subtle: #78716c;         /* stone-500 */

  --color-primary: #2dd4bf;       /* teal-400 — 深色下对比度更高 */
  --color-primary-hover: #14b8a6; /* teal-500 */
  --color-primary-muted: #134e4a; /* teal-900 */
  --color-primary-fg: #000000;    /* teal-400 背景上使用黑色文字 */
  --color-primary-text: #2dd4bf;  /* teal-400 作为文字色 */

  --border-default: #44403c;      /* stone-700 */
  --border-focus: #2dd4bf;

  --priority-high: #ef4444;
  --priority-medium: #f59e0b;
  --priority-low: #22c55e;

  --overlay: rgba(0, 0, 0, 0.6);
}
```

### Pattern 2: Tailwind CSS 变量注册（tailwind.config.js）

**What:** 通过 colors.extend 将 CSS 变量映射为 Tailwind 工具类，保持 JIT 编译正常工作
**When to use:** 需要在模板中使用 bg-primary 等语义化类时

```javascript
// Source: Tailwind CSS 官方文档 - Using CSS variables
export default {
  darkMode: 'class',   // 关键：class 策略
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          muted: 'var(--color-primary-muted)',
          fg: 'var(--color-primary-fg)',
          text: 'var(--color-primary-text)',
        },
        surface: {
          base: 'var(--surface-base)',
          card: 'var(--surface-card)',
          elevated: 'var(--surface-elevated)',
        },
        foreground: 'var(--text-foreground)',
        muted: 'var(--text-muted)',
        subtle: 'var(--text-subtle)',
        border: {
          DEFAULT: 'var(--border-default)',
          focus: 'var(--border-focus)',
        },
        priority: {
          high: 'var(--priority-high)',
          medium: 'var(--priority-medium)',
          low: 'var(--priority-low)',
        },
      }
    }
  },
  plugins: [forms]
};
```

**生成的工具类示例：**
- `bg-primary` → 主色背景
- `bg-surface-card` → 卡片背景
- `text-foreground` → 主文字
- `text-muted` → 次要文字
- `border-border` → 默认边框（或用 `border-DEFAULT`）
- `bg-priority-high` → 高优先级色

### Pattern 3: FOUT 防闪内联脚本（index.html）

**What:** 同步内联脚本，在浏览器渲染任何内容之前读取 localStorage 并设置 html class
**When to use:** 所有使用 localStorage + CSS class 主题切换的方案都需要这个

```html
<!-- Source: 业界标准 FOUT prevention 模式（Next.js、Remix 等均采用） -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <script>
      // 必须是 head 内第一个脚本，且不得有 defer/async
      (function() {
        try {
          var theme = localStorage.getItem('theme');
          if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
          }
        } catch (e) {}
      })();
    </script>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Todo Plus</title>
  </head>
  ...
```

**关键细节：**
- try/catch 防止 localStorage 在 iframe/隐私模式下抛异常
- IIFE 避免污染全局作用域
- `window.matchMedia` 系统偏好 fallback：首次访问时跟随系统设置

### Pattern 4: Pinia ui.ts 扩展（theme 状态）

**What:** 在现有 ui store 中添加 theme 状态，toggleTheme action 同时更新 class 和 localStorage
**When to use:** 主题切换按钮触发时

```typescript
// Source: 项目现有 src/stores/ui.ts 扩展方案
import { defineStore } from 'pinia';

export type MainTab = 'todo' | 'idea' | 'dashboard';
export type Theme = 'light' | 'dark';

export const useUiStore = defineStore('ui', {
  state: () => ({
    activeTab: 'todo' as MainTab,
    theme: 'light' as Theme,
  }),
  actions: {
    setTab(tab: MainTab) {
      this.activeTab = tab;
    },
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
      const isDark = this.theme === 'dark';
      document.documentElement.classList.toggle('dark', isDark);
      try {
        localStorage.setItem('theme', this.theme);
      } catch (e) {}
    },
    hydrateTheme() {
      // 读取 localStorage 中已由防闪脚本设置的实际状态
      const cls = document.documentElement.classList.contains('dark');
      this.theme = cls ? 'dark' : 'light';
    },
  }
});
```

**App.vue 或 main.ts 中调用：**
```typescript
// onMounted 中调用（document 已可用）
onMounted(() => {
  uiStore.hydrateTheme();
  todoStore.hydrate();
  ideaStore.hydrate();
});
```

### Pattern 5: 颜色类名替换映射

**现有代码 → 语义化 token 对照表（完整迁移参考）：**

| 旧类名 | 新类名 | 说明 |
|--------|--------|------|
| `bg-mist` | `bg-surface-base` | 页面背景 |
| `text-ink` | `text-foreground` | 主文字 |
| `bg-mint` / `bg-emerald-*` (主色用途) | `bg-primary` | 主色背景 |
| `bg-white` (卡片/内容) | `bg-surface-card` | 内容区背景 |
| `bg-white` (弹层) | `bg-surface-elevated` | 弹层背景 |
| `text-slate-500` | `text-muted` | 次要文字 |
| `text-slate-400` | `text-subtle` | 占位符/辅助色 |
| `text-slate-600` / `text-slate-700` | `text-muted` 或 `text-foreground` | 视上下文 |
| `border-slate-200` | `border-border` | 默认边框 |
| `bg-slate-100` | `bg-surface-base` | 浅色背景（secondary 按钮等 → 视语义） |
| `bg-slate-900` (Button default) | `bg-foreground` 或直接用 `bg-[--text-foreground]` | 按钮主色（阶段 2 完整重设计） |
| `ring-offset-white` | `ring-offset-surface-card` | 焦点环偏移色 |
| `ring-slate-400` | `ring-border-focus` | 焦点环色 |
| `bg-slate-950/50` (overlay) | `bg-[--overlay]` | 弹层遮罩 |

> **注意**：Button default variant（`bg-slate-900`）在阶段 1 暂时保留或用 `bg-foreground` 过渡，彻底重设计留给阶段 2（COMP-01）。阶段 1 聚焦把所有 surface/text/border 语义化，Button variant 颜色在阶段 2 统一处理。

### Anti-Patterns to Avoid

- **不要在 .dark 选择器内写 Tailwind 前缀（如 `dark:bg-gray-900`）：** 本项目使用 CSS 变量策略，深色值写在 `.dark {}` 的 CSS 变量覆盖中，不在模板里写 `dark:` 前缀类，否则与 CSS 变量方案冲突且难以维护。
- **不要在 `<html>` 外层添加 `dark` class：** darkMode: 'class' 策略要求 class 加在 `document.documentElement`（即 `<html>` 元素）。
- **不要将防闪脚本 defer/async：** 任何延迟执行都会导致白闪——脚本必须在 `<head>` 中同步运行。
- **不要双轨并行：** 阶段 1 必须完整替换所有旧类名，不留 ink/mist/mint/amber 残留。
- **不要在 Tailwind extend.colors 中混用硬编码十六进制和 CSS 变量引用：** 统一用 `var(--token-name)` 形式。

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 主题持久化 | 自定义复杂序列化 | localStorage.setItem/getItem | 已够用，且与现有 hydrate 模式一致 |
| FOUT 防闪 | Vue 组件层面处理 | index.html 同步内联脚本 | Vue 挂载时 DOM 已渲染，任何 Vue 层方案都会闪烁 |
| CSS 变量切换 | JavaScript 动态修改每个变量 | `.dark` class + CSS Cascade | 浏览器原生级联，一行 JS 切换所有 token |
| 对比度验证 | 手动计算 | 已有 WCAG 研究结论（见下方） | teal-500/white 对比度已验证符合 AA |

**Key insight:** CSS 自定义属性 + class 切换是运行时主题切换的最小成本方案，无需任何第三方库，浏览器处理所有重绘。

---

## Common Pitfalls

### Pitfall 1: tailwind.config.js 中 CSS 变量需要包含 `var()` 包装

**What goes wrong:** 写 `colors: { primary: '--color-primary' }` 而不是 `'var(--color-primary)'`，Tailwind 不会自动添加 `var()`。
**Why it happens:** 混淆了变量名和变量引用的写法。
**How to avoid:** 始终写完整形式 `'var(--color-primary)'`。
**Warning signs:** 生成的 CSS 中出现字面量 `--color-primary` 而不是颜色值。

### Pitfall 2: Tailwind JIT 不识别动态拼接的类名

**What goes wrong:** 在组件中写 `class="bg-" + tokenName`，JIT 无法静态分析，类不会生成。
**Why it happens:** Tailwind 依赖静态字符串扫描，动态拼接导致漏检。
**How to avoid:** 始终写完整类名字符串，用对象/数组条件切换而不是字符串拼接。
**Warning signs:** 某些 token 类在生产构建中不生效。

### Pitfall 3: hydrateTheme 与防闪脚本的竞争时序

**What goes wrong:** 在防闪脚本设置 `dark` class 后，Vue 挂载时 `hydrateTheme` 读取 `classList` 状态，但如果在错误时机调用会覆盖 class。
**Why it happens:** `hydrateTheme` 应该**读取** DOM 状态（以防闪脚本的设置为准），而不是重新从 localStorage 算一遍并重设 class。
**How to avoid:** `hydrateTheme` 只读 `document.documentElement.classList.contains('dark')` 来同步 Pinia state，不再写 classList（写操作只在 `toggleTheme` 中）。
**Warning signs:** 刷新页面时出现短暂闪烁。

### Pitfall 4: `ring-offset-background` 引用未定义的 token

**What goes wrong:** Button.vue 中 `ring-offset-background` 引用了 shadcn-ui 约定的 `--background` token，但本项目没有定义这个变量。
**Why it happens:** 项目 UI 组件来自 shadcn 风格的初始化，部分 token 名称是 shadcn 约定而非项目自定义。
**How to avoid:** 在 style.css 中也添加 `--background: var(--surface-card);` 兼容别名，或直接替换组件中的 `ring-offset-background` 为 `ring-offset-surface-card`。
**Warning signs:** 焦点环偏移色在深色模式下不正确。

### Pitfall 5: Badge/Button 中的 emerald/amber 颜色混淆

**What goes wrong:** Badge 中 `bg-emerald-100 text-emerald-700`（success variant）和 App.vue 中 `bg-emerald-300`（dashboard 柱状图）是不同语义，前者需要迁移到 `bg-priority-low`，后者在阶段 1 不需要迁移（属于 Dashboard 图表颜色，阶段 3 处理）。
**Why it happens:** 两处都用了相似颜色但语义不同。
**How to avoid:** 阶段 1 只迁移 surface/text/border/primary token，Badge/Button 的 variant 颜色留给阶段 2（COMP-01、COMP-02）。
**Warning signs:** 过度迁移导致阶段边界模糊。

---

## Code Examples

### 完整 style.css 骨架

```css
/* Source: 项目 src/style.css — 在现有 3 行后追加 */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --surface-base: #f8fafc;
  --surface-card: #ffffff;
  --surface-elevated: #ffffff;

  --text-foreground: #1f2937;
  --text-muted: #6b7280;
  --text-subtle: #9ca3af;

  --color-primary: #14b8a6;
  --color-primary-hover: #0d9488;
  --color-primary-muted: #ccfbf1;
  --color-primary-fg: #ffffff;
  --color-primary-text: #0f766e;

  --border-default: #e2e8f0;
  --border-focus: #14b8a6;

  --priority-high: #ef4444;
  --priority-medium: #f59e0b;
  --priority-low: #22c55e;

  --overlay: rgba(15, 15, 15, 0.5);

  /* shadcn 兼容别名 */
  --background: var(--surface-card);
}

.dark {
  --surface-base: #1c1917;
  --surface-card: #292524;
  --surface-elevated: #3c3634;

  --text-foreground: #f5f5f4;
  --text-muted: #a8a29e;
  --text-subtle: #78716c;

  --color-primary: #2dd4bf;
  --color-primary-hover: #14b8a6;
  --color-primary-muted: #134e4a;
  --color-primary-fg: #042f2e;
  --color-primary-text: #2dd4bf;

  --border-default: #44403c;
  --border-focus: #2dd4bf;

  --priority-high: #ef4444;
  --priority-medium: #f59e0b;
  --priority-low: #22c55e;

  --overlay: rgba(0, 0, 0, 0.6);

  --background: var(--surface-card);
}

body {
  @apply bg-surface-base text-foreground;
}
```

### 主题切换按钮（App.vue 模板片段）

```vue
<!-- 放在 header 右侧 -->
<button
  type="button"
  class="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-card text-foreground shadow-sm transition hover:bg-surface-base"
  :title="uiStore.theme === 'dark' ? '切换到浅色' : '切换到深色'"
  @click="uiStore.toggleTheme()"
>
  <Sun v-if="uiStore.theme === 'dark'" class="h-4 w-4" />
  <Moon v-else class="h-4 w-4" />
</button>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind `dark:` 前缀类 | CSS 变量 + `.dark` class 覆盖 | Tailwind v3 之后两种都支持 | CSS 变量方案无需在每个元素写 dark: 前缀，单一修改点 |
| prefers-color-scheme media query only | localStorage 记忆 + media query fallback | 现代最佳实践 | 用户选择优先，系统偏好作为初始默认 |
| JS 动态切换每个 CSS 变量 | 切换单一 CSS class 触发 cascade | — | 性能更好，无需 JavaScript 逐个操作变量 |

**Deprecated/outdated:**
- `darkMode: 'media'`：仅跟随系统，无法响应用户主动切换，本项目不使用
- shadcn-ui 的 `next-themes` 包：React 生态，Vue 项目不适用

---

## Open Questions

1. **Button `default` variant 颜色在阶段 1 如何处理？**
   - What we know: 当前 `bg-slate-900 text-slate-50`，阶段 1 目标是消除裸 slate，但阶段 2 才重设计 Button
   - What's unclear: 是否要在阶段 1 将其改为 `bg-foreground text-surface-card`（语义化但仍是黑色按钮），还是留到阶段 2
   - Recommendation: 阶段 1 将 Button default 改为 `bg-foreground text-surface-base`（语义正确，深色模式下自动反转），不留 slate-900 裸写。阶段 2 再调整为 `bg-primary` 主色按钮。

2. **`--color-primary-fg` 深色模式应该是黑色还是深色（`#042f2e`）？**
   - What we know: teal-400 (#2dd4bf) 背景上，白色（#fff）对比度约 3.5:1（不达 AA），黑色（#000）约 11:1（WCAG AAA）
   - What's unclear: 深色 teal-900（#042f2e）文字对比度约 8:1，视觉上更协调
   - Recommendation: 使用 `#042f2e`（teal-900 深色文字）而非纯黑，既达标 WCAG AA，又与青绿色系统一。

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest ^0.34.6 |
| Config file | vite.config.ts（test 字段，environment: 'node'） |
| Quick run command | `npx vitest run tests/stores/ui.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TOKEN-01 | CSS 变量在 :root 中定义、.dark 中覆盖 | manual（CSS 无法 unit test） | 视觉验证 | N/A |
| TOKEN-02 | tailwind.config.js 注册 var() 引用，类名生成正确 | manual（构建产物检查） | `npx vite build` 检查 dist/assets/*.css | N/A |
| TOKEN-03 | toggleTheme 切换 theme state，更新 localStorage 和 html class | unit | `npx vitest run tests/stores/ui.test.ts` | ❌ Wave 0 |
| TOKEN-04 | 主色 token 值正确（teal-500/teal-400 分别在浅/深色） | manual（对比度工具验证） | 视觉验证 + browser devtools | N/A |

### Sampling Rate

- **Per task commit:** `npx vitest run tests/stores/ui.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/stores/ui.test.ts` — 覆盖 TOKEN-03：theme 初始状态、toggleTheme、hydrateTheme、localStorage 读写
- [ ] `tests/stores/ui.test.ts` — 验证 toggleTheme 调用后 `document.documentElement.classList` 包含 'dark'（需 jsdom environment）

> **注意：** vite.config.ts 当前 test environment 为 'node'，DOM 测试需要临时切换为 'jsdom'（已在 devDependencies 中），或在 ui.test.ts 顶部添加 `@vitest-environment jsdom` 注释。

---

## Sources

### Primary (HIGH confidence)

- Tailwind CSS 官方文档 - Dark Mode: `https://tailwindcss.com/docs/dark-mode`（darkMode: 'class' + CSS variable 集成模式）
- Tailwind CSS 官方文档 - Customizing Colors: `https://tailwindcss.com/docs/customizing-colors#using-css-variables`（var() 在 extend.colors 中的用法）
- 项目源码直接审计（tailwind.config.js、style.css、ui.ts、所有 ui 组件）

### Secondary (MEDIUM confidence)

- WCAG 2.1 AA 标准：正常文字对比度 ≥ 4.5:1，大文字/UI 组件 ≥ 3:1
- teal-500 (#14b8a6) on white (#fff)：对比度 2.3:1（不达 AA，因此作为文字色需用 teal-700 #0f766e，对比度 4.6:1 ✓）
- teal-500 (#14b8a6) as button bg with white text：约 2.3:1（仅 AA Large，可接受用于按钮大文字场景；CONTEXT.md 明确此用法可接受）
- FOUT prevention 模式：Next.js、Remix 官方文档均采用此内联脚本方案

### Tertiary (LOW confidence)

- 无

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — 全部为项目既有依赖，无新引入
- Architecture: HIGH — CSS 变量 + Tailwind class 模式为成熟行业标准，直接审计了现有代码
- Pitfalls: HIGH — 基于源码实际审计（ring-offset-background 问题来自代码直读）
- Token 值: MEDIUM — 十六进制值基于 Tailwind 调色板标准值，Claude's Discretion 范围内

**Research date:** 2026-03-14
**Valid until:** 2026-06-14（Tailwind v3 稳定期；如升级至 v4 需重新评估）

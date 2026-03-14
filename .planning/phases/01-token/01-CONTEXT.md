# Phase 1: Token 基础 - Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

<domain>
## Phase Boundary

建立完整的 CSS 变量设计 Token 系统，将现有 4 个硬编码颜色（ink/mist/mint/amber）迁移至语义化 token，实现无闪烁的深色/浅色主题切换。不涉及任何组件视觉改造（留给阶段 2-3），不涉及间距/字体 token（留给阶段 3）。

阶段 1 完成后视觉上变化极小，但 token 基础设施就位，后续所有阶段都依赖它。

</domain>

<decisions>
## Implementation Decisions

### 现有颜色迁移策略
- 全部替换：删除 tailwind.config.js 中的 ink/mist/mint/amber 硬编码色
- 映射关系：bg-mist → bg-surface、text-ink → text-foreground、bg-mint → bg-primary
- 阶段 1 一并搜索替换全局所有旧类名（App.vue + 所有组件），不留双轨并行

### Token 分层架构
- 仅建语义层，不建原子层（不需要 --teal-500 中间变量）
- Surface 3 层：`--surface-base`（页面背景）、`--surface-card`（内容区域）、`--surface-elevated`（弹层/浮层）
- 文字 3 档：`--text-foreground`（主文字）、`--text-muted`（次要信息）、`--text-subtle`（占位符/辅助色）
- 主色：`--color-primary`（teal-500 #14b8a6）、`--color-primary-hover`（teal-600 #0d9488）、`--color-primary-muted`（teal-100/teal-900 for dark）
- 优先级色：`--priority-high`（red-500）、`--priority-medium`（amber-500）、`--priority-low`（green-500）
- 边框：`--border-default`、`--border-focus`（primary 色）

### Token 最小范围（阶段 1 仅配色）
- 阶段 1 只定义颜色 token，间距/字体/圆角 token 留给阶段 3 页面重设计时按需定义
- 这样阶段 1 工作量可控，不过早过度工程

### 深色模式配色
- 深色背景系：stone-900 系（#1c1917），带暖调，类似 Notion Dark，比纯灰更柔和
- 深色主色：teal-400 (#2dd4bf)，比 teal-500 亮一级，深色背景对比度更高，符合 WCAG AA
- 实现方式：`:root` 定义浅色值，`.dark` 覆盖深色值

### 防闪烁脚本
- index.html `<head>` 内第一个 `<script>` 标签（同步、内联）
- 读取 localStorage 中 theme 值，立即在 `<html>` 上添加/移除 `dark` class
- 必须同步执行（不能 defer/async），避免 FOUT

### tailwind.config.js 扩展方式
- 添加 `darkMode: 'class'`
- colors.extend 中注册：`primary: 'var(--color-primary)'`、`surface: { base: '...', card: '...', elevated: '...' }` 等
- 不引入额外依赖

### Claude's Discretion
- 完整的 CSS 变量值（具体十六进制）
- Tailwind token 命名路径（如 `bg-surface-card` vs `bg-surface/card`）
- ui.ts 中 theme 状态的实现细节（ref vs computed）

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/stores/ui.ts`：目前仅有 `activeTab`，需要扩展加入 `theme: 'light' | 'dark'` 状态和 `toggleTheme()` action
- `src/style.css`：极简（3 行 Tailwind 指令 + 1 条 body 样式），是注入 CSS 变量 `:root`/`.dark` 块的理想位置
- `tailwind.config.js`：已有 4 色需全部替换，添加 `darkMode: 'class'`

### Established Patterns
- 现有颜色使用 Tailwind extend.colors 硬编码——改为 CSS 变量后机制不变，只是值变为 `var(--token-name)`
- CVA 组件（Button、Badge 等）使用这些颜色类——阶段 1 完成颜色替换后，这些组件自动获得语义化类名

### Integration Points
- `index.html`：在 `<head>` 最顶部添加防闪烁内联脚本
- `src/main.ts` 或 `App.vue`：初始化时从 localStorage 恢复主题，或在 ui.ts hydrate 时设置

</code_context>

<specifics>
## Specific Ideas

- 深色背景用石板暖灰（stone-900 系），类似 Notion Dark，不要冷灰——用户更喜欢温暖的感觉
- 深色主色用 teal-400，浅色用 teal-500——两个模式下都符合 WCAG AA 对比度
- Token 只建颜色层，间距留给后续，保持阶段 1 轻量可控

</specifics>

<deferred>
## Deferred Ideas

- 间距 token（--spacing-*）— 阶段 3 页面重设计时按需定义
- 字体 token（--font-size-*）— 阶段 3 页面重设计时按需定义
- 圆角 token（--radius-*）— 阶段 3 页面重设计时按需定义

</deferred>

---

*Phase: 01-token*
*Context gathered: 2026-03-14*

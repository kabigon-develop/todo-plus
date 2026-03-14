# 项目研究总结

**项目：** todo-plus UI 现代化改造
**领域：** Vue 3 单页生产力应用视觉改造（Todo / Kanban / Dashboard）
**研究日期：** 2026-03-14
**综合置信度：** HIGH

## 执行摘要

todo-plus 是一个功能完整但视觉粗糙的 Vue 3 + Pinia + Radix Vue 单页应用。四项并行研究一致表明：**正确的改造路径是先建立 Design Token 基础，再迁移原子组件，再重构页面，最后叠加动效**——任何跳步都会引发难以维护的技术债。现有代码库约有 80–100 处硬编码 `slate-*`、`bg-white` 颜色类，必须通过 CSS 变量语义化 Token 统一替换，而非逐一添加 `dark:` 变体。

推荐的核心决策已在 `PROJECT.md` 中锁定：青绿主色 `teal-500 (#14b8a6)`，`darkMode: 'class'` 策略，CSS 变量作为 Design Token，localStorage 记忆主题偏好。研究验证了这些决策的技术可行性，并补充了实现细节：深色模式必须在 Vue 挂载之前通过 `index.html` 内联脚本防闪烁；动效需区分 Vue `<Transition>` 场景与 Radix Vue `data-state` 属性场景，混用会引发 ARIA 状态冲突。

最大风险集中在三个点：**FOUT（主题加载闪白）**、**Radix Vue 动画与 Vue Transition 冲突**、**硬编码颜色的批量替换遗漏**。这三点均有明确的预防方案，且必须在 Phase 1 的 Token 基础阶段就完成防御性部署，不可推迟。

---

## 关键发现

### 技术栈（来自 STACK.md）

现有栈完全适合本次改造，无需引入新库。核心工具链稳定成熟，改造风险可控。

**核心技术：**
- **Tailwind CSS v3 + `darkMode: 'class'`**：通过在 `tailwind.config.js` 中扩展 `extend.colors` 注册 CSS 变量别名，可在模板中直接使用 `bg-surface`、`text-primary` 等语义类，运行时自动响应主题切换。`tailwindcss-animate` 已安装，直接用于 Radix Vue 弹层动效，无需引入额外动画库。
- **CSS 变量（Design Tokens）**：在 `src/style.css` 的 `:root` / `.dark` 块中集中定义，覆盖颜色、圆角、阴影、动画时长、缓动曲线。一次切换 `.dark` class，全局生效，无需 Vue 重渲染。
- **CVA（class-variance-authority）**：已在 `Button.vue`、`Badge.vue` 中正确使用，迁移至语义 Token 只需替换 CVA 字符串中的硬编码颜色——不改架构，只改值。
- **Vue 3 `<Transition>` / `<TransitionGroup>`**：用于列表卡片入场/离场，Tab 内容切换用 CSS `data-state` 选择器而非 Vue Transition 包裹，避免与 Radix Vue ARIA 状态冲突。
- **`useTheme` composable（新建）或扩展 `ui.ts` store**：模块级单例 `ref` 在 Vue 挂载后负责主题状态管理；`index.html` 内联脚本负责首帧防闪烁。

**不引入：**
- 额外动画库（@vueuse/motion、animejs、@formkit/auto-animate）——tailwindcss-animate 已覆盖所有需求
- 新 UI 框架或组件库
- 后端/数据库

---

### 功能特性（来自 FEATURES.md）

**必须有（Table Stakes）：**
- Todo 卡片左侧 4px 优先级色条（红/琥珀/青绿）——视觉优先级扫描
- 悬停显示操作按钮（`group-hover`）——消除永久显示的 30+ 按钮噪音
- Kanban 列差异化背景色（蓝/琥珀/青绿各 5% 透明度）——告别同质化白列
- Dashboard 热力图色阶替换文字标注——颜色深度表达活跃度，悬停显示明细
- 空状态设计（Todo 空、过滤空、Kanban 列空各一套）
- 对话框背景虚化（`backdrop-filter: blur(4px)`）+ 入场动画
- 导航 Tab 活动指示器（`data-[state=active]` 底部线条动效）

**应该有（Differentiators）：**
- 逾期任务脉冲红点（`animate-pulse`）
- 完成任务勾选动画（checkbox 微交互）
- Kanban 拖拽放置区高亮（`ring-2 ring-teal-400 ring-inset`）
- 指标卡片图标 + 趋势方向箭头
- 月历"今日"单元格高亮 + "最活跃日"标记

**推迟至 v2+：**
- 标签芯片输入框（现有文本输入加提示文字即可）
- 月度对比迷你折线图（需要 SVG chart 工作量）
- Tab 上的逾期任务数角标
- 完成率进度环（SVG stroke-dashoffset）

**需要消灭的反模式（已识别）：**
- 永远可见的编辑/删除/完成按钮 → `group-hover` 隐藏
- 日历格子内文字标注（`任新:`、`任活:`）→ 热力图颜色
- 桌面端浮动图例面板 → 内联图例一行
- 月份导航独立 Card → 合并入标题行
- `无描述` 占位文字 → 不显示或极淡的破折号

---

### 架构方案（来自 ARCHITECTURE.md）

设计系统在单个 `src/style.css` 文件中集中定义，通过 `tailwind.config.js` `extend` 注册语义别名，由 CVA 在组件层消费。这种三层结构（CSS 变量 → Tailwind 别名 → CVA 变体）将主题切换的影响范围限制在 `style.css` 一个文件，组件模板无需任何修改即可自动响应。

**主要组件职责：**
1. **`src/style.css`** — Token 唯一来源：`:root` 浅色 + `.dark` 深色覆盖 + 动画关键帧 + base reset
2. **`tailwind.config.js`** — Token 桥接层：将 CSS 变量映射为可用的 Tailwind 类名（`bg-primary`、`text-text-muted`、`shadow-card` 等）
3. **`src/stores/ui.ts`（扩展）** — 主题状态管理：`theme` 字段 + `setTheme`/`initTheme` action；`index.html` 内联脚本负责首屏防闪
4. **`src/components/ui/**`** — 原子组件层：用语义 Token 替换硬编码颜色，CVA 变体增加优先级/标签等新 variant
5. **`src/components/features/**`（新建目录）** — 从 `App.vue` 拆出的业务组件：`TodoCard.vue`、`IdeaCard.vue`、`DashboardCalendar.vue`，减小 App.vue 体积
6. **`index.html`（修改）** — `<head>` 内第一个 `<script>` 块，同步读 localStorage 设置 `.dark` class，防止首帧闪白

**Token 命名规范：**
- 颜色：`--color-<role>[-<variant>]`（语义名，非视觉名：`surface` 非 `white`）
- 背景面：`--surface-app`、`--surface-base`、`--surface-subtle`
- 文字：`--text-primary`、`--text-secondary`、`--text-muted`
- 边框：`--border-base`、`--border-strong`、`--border-focus`
- 主色：`--color-primary`（teal-500）/ `--color-primary-hover`（teal-600）/ `--color-primary-muted`（浅色 teal-200 / 深色 teal-900）
- 动画：`--duration-fast`（150ms）/ `--duration-base`（200ms）/ `--duration-slow`（350ms）+ 缓动曲线变量

---

### 关键陷阱（来自 PITFALLS.md）

研究共识别 26 个风险点，其中需要在 Phase 1 就采取预防措施的最高优先级如下：

1. **FOUT 主题加载闪白（Pitfall 1）** — 在 `index.html` `<head>` 最前部添加内联同步脚本（约 5 行），读 localStorage 并立即设置 `<html class="dark">`。Vue 代码任何部分都无法提前到此时机。若忽略，所有深色模式用户每次刷新都看到白色闪烁。

2. **硬编码颜色批量遗漏导致深色模式局部失效（Pitfall 3）** — `App.vue` 和所有 UI 组件约有 80–100 处 `bg-white`、`text-slate-*`、`border-slate-*`。必须先建立 Token 体系，通过一次语义化替换统一处理，而不是逐一添加 `dark:` 对应类。漏掉任何一处都会导致深色模式下出现高对比刺眼色块。

3. **Radix Vue Dialog 动效冲突（Pitfall 11）** — `DialogContent` 已有 Radix 内置的 `data-[state=open/closed]` 动画钩子。在其外层再套 Vue `<Transition>` 会导致双重动画或过早卸载。**规则：Radix Vue 弹层/下拉只用 CSS `data-state` 选择器驱动动效，绝不包裹 Vue Transition。**

4. **Tab 切换动效破坏 ARIA 状态（Pitfall 9）** — 在 `<TabsContent>` 外加 Vue `<Transition>` 会导致 `aria-hidden` 与视觉可见性不同步。正确做法：用 Tailwind `data-[state=active]:animate-in data-[state=inactive]:hidden` 直接作用于 `TabsContent`，Radix 保持对可见性的完全控制。

5. **teal-500 作为文本色对比度不足（Pitfall 4）** — `teal-500 (#14b8a6)` 在白色背景上对比度约 2.9:1，不达 WCAG AA（需 4.5:1）。作为按钮背景色（白字在上）可用，作为文本色必须改用 `teal-700`。Token 设计时即需区分 `--color-primary`（背景用）与 `--color-primary-text`（文字用，teal-700/teal-300）。

---

## 路线图建议

基于四份研究的综合分析，建议 4 个阶段，顺序严格不可颠倒：

### 阶段一：Token 基础
**理由：** CSS 变量 Token 是所有后续工作的前提条件。没有语义别名，组件迁移就是在盲目堆砌 `dark:` 类。这是最低风险、影响最广的阶段，任何错误都不影响视觉效果（Token 初始值与原有颜色等价）。
**交付物：**
- `style.css` 完整 `:root` + `.dark` Token 块（颜色 + 圆角 + 阴影 + 动画变量）
- `tailwind.config.js` 语义别名注册（`bg-primary`、`text-text-muted` 等全集）
- `index.html` FOUT 防闪脚本（Pitfall 1 防御）
- `ui.ts` store 扩展：`theme` 状态 + `setTheme`/`initTheme`
- App.vue 加入主题切换按钮（`aria-label` 必须，Pitfall 23 防御）
- `--color-focus-ring` token 定义（Pitfall 22 防御）
- `ring-offset-background` 修复（Pitfall 7 防御）

**避免的陷阱：** Pitfall 1（FOUT）、Pitfall 2（darkMode 配置缺失）、Pitfall 3（硬编码颜色）、Pitfall 4（teal 对比度）、Pitfall 5（JIT 扫描不到 CSS 变量）、Pitfall 7（ring-offset 未定义）、Pitfall 22（焦点环对比度）

**研究标记：** 无需额外研究，所有模式均为标准 Tailwind v3 官方用法，置信度 HIGH。

---

### 阶段二：原子组件迁移
**理由：** 原子组件是 Token 的直接消费层，也是 Page 层的视觉词汇基础。在 Page 重构之前建立一致的组件语言，可以保证 Phase 3 只需专注布局逻辑，不必同时处理颜色和交互态。CVA 的隔离性使每个组件可以独立迭代、独立验证。
**交付物（推荐顺序）：**
1. `Button.vue` — 语义 Token 替换 + CVA `computed` 缓存（Pitfall 20 防御）
2. `Input.vue` — teal 聚焦环 + 语义边框 Token
3. `Badge.vue` — 新增 `priority_high/medium/low`、`tag` 变体
4. `Card.vue` — Token 替换边框/阴影/背景
5. `TabsList.vue` + `TabsTrigger.vue` — `data-[state=active]` 底部线条指示器
6. `DialogContent.vue` + `DialogOverlay.vue` — `tailwindcss-animate` 入场/离场动效（Pitfall 11 防御：只用 data-state，不用 Vue Transition）
7. `Checkbox.vue`、`Select.vue` — Token 替换
8. 建立组件变体快照测试基线（Pitfall 24 防御）

**避免的陷阱：** Pitfall 9（Tab ARIA）、Pitfall 11（Dialog 双动画）、Pitfall 20（CVA 重计算）、Pitfall 21（Radix DOM 结构破坏）、Pitfall 24（无视觉基线）

**研究标记：** 无需额外研究。CVA + Radix Vue data-state 模式已充分文档化，置信度 HIGH。

---

### 阶段三：页面级重设计
**理由：** `App.vue`（~400 行）是最复杂的改动区域，混合了三个完整页面的逻辑和样式。此时 Token 和组件已稳定，Page 层只需替换内联类并拆出子组件，不必同时解决颜色决策。按视觉影响从高到低排序：Todo 列表（最常用）→ 导航/Header → Kanban → Dashboard。
**交付物（推荐顺序）：**
1. **Header + 导航 Tab 重设计**：teal 品牌色、活动标签指示器动效、移动端底部导航
2. **Todo 列表重设计**：拆出 `TodoCard.vue`；优先级左边框；hover 显示按钮；完成勾选动画；空状态；逾期脉冲点
3. **Idea 看板重设计**：拆出 `IdeaCard.vue`；列差异化背景；拖拽放置区高亮（Pitfall 16 防御：dragover 用 `transition: none`）；修复已知拖拽竞态后再加动效（Pitfall 17）
4. **Dashboard 重设计**：拆出 `HeatmapCell.vue`；热力图 5 阶色梯；指标卡片图标+趋势；月份导航内联；移动端备用布局（Pitfall 13：7 列网格不可在移动端压缩，需单独设计）
5. **对话框/表单重设计**：背景虚化；输入框聚焦态；优先级按钮组（替换下拉）
6. `min-h-screen` → `min-h-[100dvh]`（Pitfall 14，全局修复）

**避免的陷阱：** Pitfall 6（Tailwind base 污染 Portal）、Pitfall 12（Kanban 卡片按钮行移动端换行）、Pitfall 13（Dashboard 日历移动端）、Pitfall 14（iOS Safari viewport）、Pitfall 15（Firefox 拖拽 ghost）、Pitfall 16（拖拽高亮动画延迟）、Pitfall 17（竞态条件）

**研究标记：** Kanban 拖拽改造需要关注已有竞态 bug（CONCERNS.md 已记录）；建议在看板重设计开始前先修复竞态，再叠加视觉改造。Dashboard 移动端布局需要独立规划，7 列网格无法简单压缩。

---

### 阶段四：动效系统
**理由：** 动效是纯粹的增量叠加，不影响任何业务逻辑和布局结构。放在最后可以避免动效状态干扰前三个阶段的调试，也确保在组件和页面稳定之后不会因重构而丢失动效代码。
**交付物：**
1. `style.css` 全局关键帧注册（fade-in、slide-up、slide-in-right、scale-in、heatmap-pulse）
2. `tailwind.config.js` 动画 utility 注册
3. Todo/Idea 卡片列表 `<TransitionGroup>`（Pitfall 8 防御：leaving 元素 `position: absolute`）
4. Tab 内容淡入切换（`data-[state=active]:animate-fade-in`）
5. 卡片 hover 上浮效果（`transition: transform box-shadow`，不用 `will-change`，Pitfall 10 防御）
6. `@media (prefers-reduced-motion)` 全局关闭动画
7. 删除 Dashboard 浮动图例的 `backdrop-blur`（替换为实色半透明，Pitfall 19 防御）

**避免的陷阱：** Pitfall 8（TransitionGroup 布局抖动）、Pitfall 10（will-change 层爆炸）、Pitfall 18（日历 30+ 格子同步动画）、Pitfall 19（backdrop-blur 重绘）

**研究标记：** 无需额外研究，所有动效均为标准 CSS transition/animation，置信度 HIGH。

---

### 阶段排序总结

```
阶段一（Token 基础）→ 阶段二（原子组件）→ 阶段三（页面重设计）→ 阶段四（动效系统）
    全局            独立隔离             复杂高风险              纯增量
```

**为什么不能跳步：**
- 跳过阶段一直接改组件：没有语义 Token，每个颜色改动都要同时维护浅色和深色两套值
- 跳过阶段二直接改页面：App.vue 既要解决布局又要解决颜色决策，同时引入两类 bug
- 提前加动效：动效状态会掩盖组件迁移引入的布局问题，难以定位根因

---

## 置信度评估

| 研究领域 | 置信度 | 说明 |
|--------|--------|------|
| 技术栈 | HIGH | 基于 Tailwind v3 官方文档 + 现有代码库直接检查，模式成熟稳定 |
| 功能特性 | HIGH | 基于 Linear/Todoist/Things 3 稳定设计模式 + App.vue 直接代码审计 |
| 架构设计 | HIGH | 基于现有 CVA 用法 + tailwind.config.js 直接检查，无推断成分 |
| 陷阱识别 | HIGH | 17/26 个陷阱由代码直接审计发现；对比度比率和渲染行为为 MEDIUM |

**综合置信度：HIGH**

### 待解决的不确定点

- **WCAG 对比度精确值（Pitfall 4）**：`teal-500` 在白色背景上的 2.9:1 比率基于训练知识中的 WCAG 公式计算，实施时建议用 WebAIM 对比度检查器在线验证确切数值。
- **Radix Vue 当前版本 API**：研究基于训练知识（截至 2025年8月），`data-[state=active]` 属性选择器在 Radix Vue v1 中已确认，但建议实施前核对当前版本文档。
- **`backdrop-blur` 性能影响（Pitfall 19）**：具体帧率下降程度因设备而异，建议在目标设备上实测，浮动图例改造可能不是首要性能瓶颈。
- **Kanban 拖拽竞态修复范围**：CONCERNS.md 记录了已知 bug，但修复复杂度未被本次研究估算，建议在阶段三开始前单独评估修复成本。

---

## 信息来源

### 主要来源（HIGH 置信度）
- `src/App.vue` 直接代码审计（约 400 行内联样式完整阅读）— 现有状态基线
- `src/components/ui/**` 组件代码审计 — CVA 用法、Token 使用现状
- `tailwind.config.js` 直接检查 — 现有扩展色彩配置
- Tailwind CSS v3 暗色模式文档: https://tailwindcss.com/docs/dark-mode — 官方文档
- Tailwind CSS v3 自定义颜色文档: https://tailwindcss.com/docs/customizing-colors — 官方文档
- Vue 3 Transition/TransitionGroup 文档: https://vuejs.org/guide/built-ins/transition.html — 官方文档
- CVA (class-variance-authority) 文档: https://cva.style/docs — 官方文档
- Tailwind teal 色板精确 hex 值 — 来自 Tailwind CSS 源码（确定性数值）

### 次要来源（MEDIUM 置信度）
- Radix Vue Dialog 文档（训练知识，截至 2025年8月）— `data-state` 动画钩子
- Radix Vue Tabs 文档（训练知识）— `data-[state=active]` 选择器
- Linear / Todoist / Things 3 设计系统（训练知识）— 功能模式参考
- `tailwindcss-animate` 插件: https://github.com/jamiebuilds/tailwindcss-animate — 已在项目中安装确认

### 参考来源（LOW 置信度，需实施时验证）
- WCAG 2.1 对比度比率计算（Pitfall 4）— 需用在线工具验证精确值
- `backdrop-blur` 渲染性能影响（Pitfall 19）— 设备相关，需实测

---
*研究完成：2026-03-14*
*可以开始路线图规划：是*

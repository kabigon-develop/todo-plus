# Features Research: Modern Productivity UI Patterns

**Domain:** Todo / Kanban / Analytics productivity app (single-page, Vue 3 + Tailwind)
**Researched:** 2026-03-14
**Confidence:** MEDIUM — Based on training knowledge of Linear, Notion, Todoist, Things 3 design systems (cutoff Aug 2025). WebSearch unavailable. Core patterns are stable and well-established; specific version details may drift.

---

## Current State Baseline (from App.vue audit)

The existing app is fully functional but visually unfinished:

- Header: `bg-gradient-to-r from-slate-900 to-slate-700` — dark gradient, no teal brand color
- Todo items: flat `Card` with `grid md:grid-cols-12`, three action buttons visible at all times
- Kanban cards: `border-slate-200 bg-slate-50` — light gray, no hover state
- Dashboard metric cards: bare `<p>` labels above bold numbers, no visual hierarchy
- Calendar cells: `min-h-[140px]` fixed height with raw text labels (`任新:`, `任活:`)
- Tabs: default Radix Vue styling, no custom active indicator
- Dialogs: standard Radix Vue sheet, no backdrop blur enhancement
- No dark mode, no animation, no empty states

---

## Todo List Patterns

### Table Stakes

| Pattern | Why Expected | Complexity | Current State |
|---------|-------------|------------|---------------|
| Color-coded priority left border | Users need instant priority scanning without reading labels | Low | Missing — uses Badge only |
| Checkbox with completion animation | Satisfying micro-interaction signals task done | Low | Plain Radix Checkbox, no animation |
| Completed item visual dimming | Separates active from done list at a glance | Low | `line-through text-slate-400` on title only — partial |
| Tag chips (pill shape, subtle bg) | Tags as pills with colored bg feel more structured than text | Low | `Badge variant="info"` — functional, not premium |
| Due date badge with urgency color | Past due = red, today = amber, future = neutral | Low | `Badge variant="secondary"` — no urgency coloring |
| Hover-reveal action buttons | Keeps list clean; buttons appear on row hover | Medium | Three buttons always visible — cluttered |
| Row hover background lift | Subtle bg shift signals interactivity | Low | No hover state on Card |

**Recommended Todo item layout (description):**

```
┌──────────────────────────────────────────────────────────────┐
│ ▌  [☐]  Task Title                          [Edit] [Delete]  │
│ ▌        Short description text              ← hover reveals │
│ ▌        [高] [截止 2026-03-20] [tag1] [tag2]               │
└──────────────────────────────────────────────────────────────┘
  ↑
  4px colored left border: red=high, amber=medium, teal=low
```

- Left border: `border-l-4 border-red-500` (high) / `border-amber-400` (medium) / `border-teal-400` (low)
- Checkbox toggles completion (replaces separate "完成" button)
- Action buttons (`编辑`, `删除`) hidden by default, shown on `group-hover`
- "完成" button eliminated — checkbox IS the completion action
- Priority badge can be dropped if left border conveys priority (less noise)

### Differentiators

| Pattern | Value Proposition | Complexity | Notes |
|---------|------------------|------------|-------|
| Overdue pulsing red dot | Urgency at a glance without scanning dates | Low | `animate-pulse` on a red dot next to due date |
| Smooth completion strikethrough | `transition-all duration-300` on line-through + opacity | Low | CSS transition on `.completed` class |
| Bulk selection checkbox hover area | Full row click-area for checkbox via invisible overlay | Low | Wider hit target, not just the 16px box |
| Tag color consistency | Same tag always same hue (hash-based color) | Medium | Deterministic color from tag string hash |

### Anti-features for Todo List

See "Anti-patterns to Avoid" section.

---

## Kanban Board Patterns

### Table Stakes

| Pattern | Why Expected | Complexity | Current State |
|---------|-------------|------------|---------------|
| Column header with item count badge | Users need to see column load without counting | Low | Missing — just text label |
| Card hover shadow elevation | `hover:shadow-md hover:-translate-y-0.5` signals draggability | Low | No hover state |
| Drag handle icon (⠿) | Explicit grab affordance vs implicit full-card drag | Low | No drag handle, implicit drag on whole card |
| Drop zone highlight on drag-over | Active drop zone gets colored border/bg | Low | No visual feedback currently |
| Drag ghost opacity reduction | Original card dims to 40% while being dragged | Low | Native browser drag, no custom styling |
| Column accent color per status | Each column has distinct subtle tinted bg | Low | All columns identical `bg-white` Card |

**Recommended Kanban column layout (description):**

```
┌─────────────────────────────┐
│ ● 想法            [5 items] │  ← accent dot + count badge
│─────────────────────────────│
│ ┌─────────────────────────┐ │
│ │ ⠿  Card Title           │ │  ← ⠿ = drag handle (GripVertical icon)
│ │    Description...       │ │
│ │    [高] [tag]           │ │
│ │    [编辑] [下一步→]      │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

Column color system:
- 想法 (idea): `bg-blue-50/40` header, `border-blue-100` accent
- 评估 (evaluate): `bg-amber-50/40` header, `border-amber-100` accent
- 执行 (execute): `bg-teal-50/40` header, `border-teal-100` accent

Drop zone active state: `ring-2 ring-teal-400 ring-inset bg-teal-50/20`

### Differentiators

| Pattern | Value Proposition | Complexity | Notes |
|---------|------------------|------------|-------|
| Card flip animation on status move | Delightful feedback when using "下一步" button | Medium | `rotateY(360deg)` briefly on moveIdeaStep |
| "转为任务" button only shown on hover in execute column | Reduces noise in other columns | Low | `group-hover:visible` |
| Column drop target glow | Pulsing border when card is being dragged over | Low | CSS animation on dragover state |
| Converted idea stamp | `已转任务` shown as a diagonal ribbon/corner badge | Low | More visually distinct than flat badge |

### Anti-features for Kanban

See "Anti-patterns to Avoid" section.

---

## Dashboard/Analytics Patterns

### Table Stakes

| Pattern | Why Expected | Complexity | Current State |
|---------|-------------|------------|---------------|
| Metric cards with icon + trend | Numbers alone feel cold; icon = context, trend = story | Low | Bare number, no icon, no trend |
| Color-coded metric cards per category | Todo metrics = teal family, Idea metrics = purple/orange | Low | All cards identical white |
| Calendar heatmap with color intensity | Standard pattern from GitHub — color depth = activity level | Medium | Has mini-bars in cells, not color heatmap |
| Month navigation in header, not separate Card | Navigation controls belong to the heading context | Low | Separate Card for nav buttons |
| Day cell tooltip on hover | Show exact numbers without cluttering cell | Low | Numbers shown as text in cell always |
| "Today" cell highlight | Orientation in the calendar | Low | Missing |
| Legend inline with chart, not floating panel | Floating panels are a mobile workaround | Low | Has floating toggle panel on desktop |

**Recommended metric card layout (description):**

```
┌────────────────────────┐
│  ✓ 任务新增            │
│                        │
│  24         ↑ 12%      │
│  vs last month         │
└────────────────────────┘
```

- Icon top-left (e.g., `CheckCircle2` for todo, `Lightbulb` for idea)
- Big number with `text-3xl font-bold`
- Subtle trend indicator: green up arrow or gray dash for no change
- Card uses left border color: teal for todo-related, amber for idea-related

**Recommended calendar cell (simplified heatmap):**

Current cell has too much text (`任新:`, `任活:`, etc.) crammed into 140px height.

Replace with:
```
┌──────────┐
│ 14       │  ← day number
│          │
│  ████    │  ← single stacked bar or heatmap bg-teal-100..500
│  ░░░░    │
└──────────┘
```

Background color intensity based on total daily activity:
- 0 events: `bg-white`
- 1-2: `bg-teal-50`
- 3-5: `bg-teal-100`
- 6-10: `bg-teal-200`
- 11+: `bg-teal-300`

Tooltip on hover shows the breakdown (todoCreated, todoUpdated, etc.).

### Differentiators

| Pattern | Value Proposition | Complexity | Notes |
|---------|------------------|------------|-------|
| Animated number counter on tab switch | Numbers count up when dashboard becomes visible | Medium | `@vueuse/core` useTransition or manual rAF loop |
| Month-over-month sparkline | Tiny 7-day line chart in metric card | High | Requires SVG/canvas — defer to later phase |
| "Best day" highlight | One cell highlighted as peak activity day | Low | Find max-activity cell, add teal ring |
| Completion rate progress ring | Circle progress showing % of todos completed this month | Medium | SVG `stroke-dashoffset` technique |

### Anti-features for Dashboard

See "Anti-patterns to Avoid" section.

---

## Dialog & Form Patterns

### Table Stakes

| Pattern | Why Expected | Complexity | Current State |
|---------|-------------|------------|---------------|
| Backdrop blur on modal overlay | Creates depth, premium feel | Low | Standard Radix dialog overlay, no blur |
| Input focus ring in brand color | `focus:ring-teal-500` consistent with design system | Low | Default Radix styling |
| Field label above input (not placeholder-only) | Accessibility + readability when field has content | Low | Uses label+input pattern — already good |
| Dialog entrance animation | Slide-up + fade in (not jarring pop) | Low | Default Radix animation |
| Primary action button in brand color | Save/submit button = teal, not generic blue/black | Low | Default Button variant |
| Error message in red below field | Inline validation, not alert banners | Low | Has `todoErrors.title` display — check styling |
| Character counter for description | Prevents overly long entries, shows limit | Low | Missing |

**Backdrop blur implementation:**

```css
/* Radix Dialog overlay */
.dialog-overlay {
  background: rgb(0 0 0 / 0.4);
  backdrop-filter: blur(4px);
}
```

**Dialog entrance animation:**

```css
/* Radix dialog content data-state */
[data-state="open"] {
  animation: dialogIn 200ms cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes dialogIn {
  from { opacity: 0; transform: translateY(8px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
```

### Differentiators

| Pattern | Value Proposition | Complexity | Notes |
|---------|------------------|------------|-------|
| Tag input with inline chip removal | Type tag, press Enter, chip appears with ×; more intuitive than comma-separated string | High | Requires input UX overhaul — defer |
| Priority selector as visual button group | Three colored buttons (低/中/高) vs dropdown | Low | Much faster to use, visually clear |
| Due date picker with quick options | "Today", "Tomorrow", "+7 days" shortcuts above calendar | Medium | Reduces friction for common cases |

### Anti-features for Dialog

See "Anti-patterns to Avoid" section.

---

## Navigation Patterns

### Table Stakes

| Pattern | Why Expected | Complexity | Current State |
|---------|-------------|------------|---------------|
| Active tab underline/pill indicator with transition | Sliding indicator is the industry standard (Linear, Notion) | Low | Default Radix TabsList — no custom indicator |
| Icon + text in tabs | Icons aid quick recognition, text aids clarity | Low | Text-only tabs currently |
| Tab bar with subtle bottom border | Separates nav from content without heavy line | Low | May be present via Radix default |
| Smooth indicator slide animation | `transition: left 200ms ease` — indicator follows active tab | Medium | Custom implementation required |

**Recommended tab layout:**

```
┌──────────────────────────────────────────────────┐
│  [✓ 任务]  [💡 想法看板]  [📊 Dashboard]         │
│   ───────                                        │  ← sliding underline, teal color
└──────────────────────────────────────────────────┘
```

Implementation approach: Radix Vue Tabs with `data-[state=active]` targeting:

```css
[data-state="active"] {
  color: theme('colors.teal.600');
  border-bottom: 2px solid theme('colors.teal.500');
}
```

Or overlay indicator div that animates `left` and `width` via JS measurement.

### Differentiators

| Pattern | Value Proposition | Complexity | Notes |
|---------|------------------|------------|-------|
| Icon-only tab on mobile (collapse text) | More room on small screens | Low | `hidden sm:inline` on text |
| Notification dot on tab | Show count of overdue todos on 任务 tab | Medium | Requires computed count in uiStore |
| Page title in header changes per tab | `Todo Plus — 任务` vs `Todo Plus — Dashboard` | Low | Browser tab title, not just visual header |

### Anti-features for Navigation

See "Anti-patterns to Avoid" section.

---

## Empty States

### Table Stakes

| Pattern | Why Expected | Complexity | Current State |
|---------|-------------|------------|---------------|
| Illustration or icon for empty list | Raw "no items" text feels like a bug | Low | No empty state at all |
| Encouraging copy (not "No data") | "还没有任务，点击新增开始" feels supportive | Low | Missing |
| CTA button in empty state | Direct path to create first item | Low | Missing |

**Recommended empty state structure:**

```
┌──────────────────────────────────────────────────┐
│                                                  │
│              [  ✓ icon, large, teal  ]           │
│                                                  │
│              还没有任务                           │
│              点击下方按钮，添加你的第一个任务      │
│                                                  │
│              [ + 新增任务 ]                       │
│                                                  │
└──────────────────────────────────────────────────┘
```

Three empty states needed:
1. Todo list empty (no todos at all)
2. Todo list filtered empty (search/filter returns nothing — different message)
3. Kanban column empty ("还没有想法，拖拽卡片到这里")

Dashboard empty state (no data for selected month): Show greyed-out calendar grid with "本月暂无数据" overlay.

### Differentiators

| Pattern | Value Proposition | Complexity | Notes |
|---------|------------------|------------|-------|
| Animated entrance when first item added | Empty → first item: gentle slide-in animation | Low | Vue `<transition>` on the list |
| Contextual empty state per filter | "没有已完成的任务" vs "没有进行中的任务" — different icons | Low | Computed message based on `todoStore.filter` |

---

## Anti-patterns to Avoid

### Critical Anti-patterns

#### 1. Always-Visible Action Buttons

**What:** Showing Edit/Delete/Complete buttons as permanent UI elements on every row.
**Why bad:** Creates visual noise proportional to list length. 10 todos = 30 buttons visible. Users must parse them even when not needed.
**Current state:** App.vue lines 353-356 — three buttons always visible per todo item.
**Instead:** Use `group-hover` pattern. Buttons appear on row hover. On mobile, use a `...` overflow menu or long-press.

#### 2. Text Labels as Data Indicators

**What:** Showing `任新:`, `任活:` as text labels in calendar cells.
**Why bad:** Calendar cells are small. Text labels eat space and require reading rather than pattern recognition.
**Current state:** App.vue lines 459-463 — raw text in every calendar cell.
**Instead:** Color intensity heatmap for at-a-glance pattern. Tooltip or click-expand for exact numbers.

#### 3. Floating Legend Panel (Desktop)

**What:** A floating `position: fixed` panel on the right side showing color legend.
**Why bad:** It competes with page content, looks disconnected, and the toggle mechanism adds cognitive load.
**Current state:** App.vue lines 520-558 — `fixed right-4 top-1/2` legend panel.
**Instead:** Inline legend below the calendar (one line, 4 color swatches + labels). Always visible, no interaction needed.

#### 4. Separate Navigation Card for Month Controls

**What:** Month navigation (上月/下月) in its own full-width Card separate from the month label.
**Why bad:** Creates unnecessary vertical space usage. Month label and nav are the same semantic unit.
**Current state:** App.vue lines 411-420 — separate Card with nav buttons.
**Instead:** Combine into single header row: `← 2026年3月 →` inline.

#### 5. Generic Dark Gradient Header

**What:** `bg-gradient-to-r from-slate-900 to-slate-700` as app header.
**Why bad:** Slate-900 to slate-700 gradient is a generic 2020-era "tech app" look. No brand personality.
**Current state:** App.vue line 297.
**Instead:** White/light header with teal accent elements, or a soft teal gradient (`from-teal-600 to-cyan-500`). The PROJECT.md specifies teal as primary color.

### Moderate Anti-patterns

#### 6. Separate "完成" Button Alongside Checkbox

**What:** A dedicated "完成"/"取消完成" button that duplicates checkbox functionality.
**Why bad:** Two ways to do the same thing confuses the affordance. Is the checkbox decorative?
**Current state:** App.vue line 353 — `toggleTodo` button + `toggleSelection` checkbox both exist.
**Instead:** Checkbox IS the completion control. Remove the "完成" button. Selection (for bulk ops) via long-click or a dedicated selection mode.

#### 7. Priority Badge Redundancy With Border Color

**What:** Showing both a colored left border AND a priority Badge label (高/中/低).
**Why bad:** Redundant information doubles visual noise.
**Instead:** Choose one signal. Left border for passive scanning (no text needed). Badge only if there's no border.

#### 8. "无描述" Placeholder Text

**What:** Showing `无描述` when description is empty.
**Why bad:** Looks like a fallback error message, not intentional design. Empty descriptions are normal.
**Current state:** App.vue line 345 — `{{ item.description || '无描述' }}`.
**Instead:** Simply render nothing (or a very faint `—`) when description is absent. Don't call attention to missing data.

#### 9. Flat, Undifferentiated Kanban Columns

**What:** All three Kanban columns have identical white background and slate border.
**Why bad:** At a glance, the three columns look identical. Status is only distinguishable by reading the header label.
**Instead:** Each column has a distinct subtle tinted background (blue/amber/teal at 5-10% opacity) plus a color accent in the header.

### Minor Anti-patterns

#### 10. Cramped Calendar Cells With Fixed Min-Height

**What:** `min-h-[140px]` forces tall cells even with sparse data.
**Why bad:** Wastes space, and the content inside still looks cramped.
**Instead:** Remove min-height. Use `aspect-square` or let content define height. With heatmap approach, cells are compact squares.

#### 11. Tag Comma-Separated String Input

**What:** Tags entered as comma-separated string in a text field.
**Why bad:** Users forget the format, accidentally add spaces, can't see existing tags clearly.
**Current state:** TodoFormFields.vue presumably renders a plain text input for tags.
**Instead (simple fix):** Keep the text input but add a helper text "用逗号分隔，如：工作, 紧急". For differentiator-tier: chip input.

#### 12. Filter and Search in a Card Container

**What:** The search/filter toolbar is wrapped in a `Card` component with `p-4` padding.
**Why bad:** Creates a "box inside a box" visual — the full page is already a card context.
**Instead:** A lighter toolbar row with just a subtle `border-b` separator, no card boxing.

---

## MVP Recommendation

**Phase order for UI overhaul:**

Priority 1 — Highest impact, lowest risk:
1. Design token setup (CSS variables for teal palette + spacing + dark mode skeleton)
2. Todo item redesign (left border priority, hover-reveal buttons, completion animation)
3. Header + navigation tabs (teal brand color, sliding active indicator)

Priority 2 — Core views:
4. Kanban column differentiation (tinted column backgrounds, drag feedback)
5. Dashboard metric cards (icons, teal/amber color coding)
6. Calendar heatmap (replace text labels with color intensity)

Priority 3 — Polish layer:
7. Dialog improvements (backdrop blur, entrance animation)
8. Empty states (all three contexts)
9. Dark mode implementation

**Features to defer past MVP:**
- Tag chip input (high complexity, existing text approach works)
- Month-over-month sparklines (requires SVG chart work)
- Completion rate progress ring (nice-to-have, not expected)
- Notification dots on tabs (adds complexity to uiStore)

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Todo item patterns | HIGH | Industry-standard patterns, Observable in Linear/Todoist since 2022 |
| Kanban patterns | HIGH | Stable pattern set, Observable in Trello/Linear/Notion for 5+ years |
| Dashboard heatmap | MEDIUM | GitHub-style heatmap is widely adopted; specific metric card layouts vary |
| Dialog patterns | HIGH | Backdrop blur + entrance animations are universal in modern design systems |
| Navigation tab sliding indicator | HIGH | Linear, Notion both use this; Radix Vue supports via `data-state` |
| Empty states | HIGH | All major apps have these; specific copy/icon choices are project-specific |

## Sources

- Training knowledge of Linear app (linear.app) UI patterns — knowledge cutoff Aug 2025 — HIGH confidence on stable patterns
- Training knowledge of Things 3 (macOS) visual design — HIGH confidence, app design stable
- Training knowledge of Todoist UI design system — HIGH confidence, patterns stable since 2021 redesign
- Training knowledge of Notion UI patterns — MEDIUM confidence (Notion evolves frequently)
- Existing App.vue code audit (this codebase) — HIGH confidence, direct observation
- Radix Vue Tabs docs (training knowledge) — `data-[state=active]` attribute targeting confirmed — MEDIUM confidence (verify current API)

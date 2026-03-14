# Architecture Research: Design System for Vue 3 + Tailwind

**Project:** todo-plus UI 现代化改造
**Researched:** 2026-03-14
**Confidence:** HIGH (based on direct codebase inspection + established Tailwind v3 / CVA patterns)

---

## Token Architecture

### Naming Convention

Use a three-tier hierarchy: **category → role → scale**.

```
--color-<role>[-<variant>]      # semantic color tokens
--surface-<role>                # background surfaces
--text-<role>                   # text/foreground tokens
--border-<role>                 # border tokens
--radius-<scale>                # corner radius scale
--shadow-<scale>                # elevation / box-shadow scale
--space-<n>                     # spacing overrides (rarely needed, use Tailwind scale)
--duration-<name>               # animation duration tokens
--ease-<name>                   # easing curve tokens
```

### Full Token Set (Light Theme Defaults)

```css
/* src/style.css — :root block */
:root {
  /* === Primary / Brand (Teal) === */
  --color-primary:         #14b8a6;   /* teal-500 — anchor */
  --color-primary-hover:   #0d9488;   /* teal-600 */
  --color-primary-muted:   #99f6e4;   /* teal-200 — pill backgrounds */
  --color-primary-fg:      #ffffff;   /* text on primary bg */

  /* === Semantic Status === */
  --color-success:         #10b981;   /* emerald-500 */
  --color-success-muted:   #d1fae5;   /* emerald-100 */
  --color-warning:         #f59e0b;   /* amber-500 */
  --color-warning-muted:   #fef3c7;   /* amber-100 */
  --color-danger:          #ef4444;   /* red-500 */
  --color-danger-muted:    #fee2e2;   /* red-100 */
  --color-info:            #0ea5e9;   /* sky-500 */
  --color-info-muted:      #e0f2fe;   /* sky-100 */

  /* === Priority (Todo cards) === */
  --color-priority-high:   var(--color-danger);
  --color-priority-medium: var(--color-warning);
  --color-priority-low:    #94a3b8;   /* slate-400 */

  /* === Surfaces (backgrounds) === */
  --surface-app:           #f8fafc;   /* slate-50 — page background */
  --surface-base:          #ffffff;   /* card / modal backgrounds */
  --surface-subtle:        #f1f5f9;   /* slate-100 — tab list, input bg */
  --surface-raised:        #ffffff;   /* same as base but with shadow */
  --surface-overlay:       rgba(15, 23, 42, 0.5); /* dialog backdrop */

  /* === Text === */
  --text-primary:          #0f172a;   /* slate-900 */
  --text-secondary:        #475569;   /* slate-600 */
  --text-muted:            #94a3b8;   /* slate-400 — placeholders */
  --text-on-primary:       #ffffff;

  /* === Borders === */
  --border-base:           #e2e8f0;   /* slate-200 */
  --border-strong:         #94a3b8;   /* slate-400 — focused inputs */
  --border-focus:          var(--color-primary);

  /* === Radius === */
  --radius-sm:             0.25rem;   /* 4px  — badges, chips */
  --radius-md:             0.5rem;    /* 8px  — inputs, buttons */
  --radius-lg:             0.75rem;   /* 12px — cards */
  --radius-xl:             1rem;      /* 16px — dialogs */
  --radius-full:           9999px;    /* pills */

  /* === Shadows (elevation) === */
  --shadow-sm:   0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md:   0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07);
  --shadow-lg:   0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05);
  --shadow-xl:   0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.05);

  /* === Animation === */
  --duration-fast:    150ms;
  --duration-base:    200ms;
  --duration-slow:    350ms;
  --duration-enter:   300ms;
  --ease-default:     cubic-bezier(0.4, 0, 0.2, 1);  /* ease-in-out */
  --ease-spring:      cubic-bezier(0.34, 1.56, 0.64, 1); /* overshoot */
  --ease-out:         cubic-bezier(0, 0, 0.2, 1);
}
```

### Dark Theme Overrides

```css
/* src/style.css — .dark block */
.dark {
  --surface-app:      #0f172a;   /* slate-900 */
  --surface-base:     #1e293b;   /* slate-800 */
  --surface-subtle:   #334155;   /* slate-700 */
  --surface-raised:   #1e293b;
  --surface-overlay:  rgba(0, 0, 0, 0.7);

  --text-primary:     #f1f5f9;   /* slate-100 */
  --text-secondary:   #94a3b8;   /* slate-400 */
  --text-muted:       #64748b;   /* slate-500 */

  --border-base:      #334155;   /* slate-700 */
  --border-strong:    #475569;   /* slate-600 */

  --color-primary-muted: #134e4a; /* teal-900 — dark pill backgrounds */

  --shadow-sm:  0 1px 2px 0 rgb(0 0 0 / 0.3);
  --shadow-md:  0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3);
  --shadow-lg:  0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.3);
  --shadow-xl:  0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.3);
}
```

**Why this approach:** CSS variables resolve at runtime, so toggling `.dark` on `<html>` instantly switches all derived Tailwind utilities and inline usages without recompilation. The teal-500 anchor (`#14b8a6`) aligns with the project decision documented in `PROJECT.md`.

---

## Tailwind Config Extension

### How to Wire CSS Variables into Tailwind

Tailwind v3 supports `var()` references in `tailwind.config.js` color values. The key is wrapping the value in an arrow function so Tailwind's opacity modifier (`bg-primary/50`) also works via the `<alpha-value>` placeholder:

```js
// tailwind.config.js
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        /* Keep existing semantic colors as aliases */
        ink:  'var(--text-primary)',
        mist: 'var(--surface-app)',
        mint: 'var(--color-success)',
        amber: 'var(--color-warning)',

        /* New semantic token aliases */
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover:   'var(--color-primary-hover)',
          muted:   'var(--color-primary-muted)',
          fg:      'var(--color-primary-fg)',
        },
        surface: {
          app:     'var(--surface-app)',
          base:    'var(--surface-base)',
          subtle:  'var(--surface-subtle)',
          raised:  'var(--surface-raised)',
        },
        text: {
          primary:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted:     'var(--text-muted)',
        },
        border: {
          base:   'var(--border-base)',
          strong: 'var(--border-strong)',
          focus:  'var(--border-focus)',
        },
        status: {
          success:        'var(--color-success)',
          'success-muted':'var(--color-success-muted)',
          warning:        'var(--color-warning)',
          'warning-muted':'var(--color-warning-muted)',
          danger:         'var(--color-danger)',
          'danger-muted': 'var(--color-danger-muted)',
          info:           'var(--color-info)',
          'info-muted':   'var(--color-info-muted)',
        },
      },
      borderRadius: {
        sm:   'var(--radius-sm)',
        md:   'var(--radius-md)',
        lg:   'var(--radius-lg)',
        xl:   'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        sm:  'var(--shadow-sm)',
        md:  'var(--shadow-md)',
        card:'var(--shadow-md)',
        lg:  'var(--shadow-lg)',
        xl:  'var(--shadow-xl)',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        base: 'var(--duration-base)',
        slow: 'var(--duration-slow)',
      },
      transitionTimingFunction: {
        DEFAULT: 'var(--ease-default)',
        spring:  'var(--ease-spring)',
        'ease-out': 'var(--ease-out)',
      },
    },
  },
  plugins: [forms],
};
```

**Resulting Tailwind classes available:**
- `bg-primary`, `text-primary`, `border-primary`
- `bg-surface-base`, `bg-surface-subtle`, `bg-surface-app`
- `text-text-primary`, `text-text-muted`
- `border-border-base`, `border-border-focus`
- `shadow-card`, `rounded-lg`, `rounded-xl`
- `duration-fast`, `duration-base`, `duration-slow`

**Constraint:** Because values use `var()` strings (not raw HSL), Tailwind's opacity modifier (`bg-primary/50`) will NOT work unless you use the `({ opacityValue }) =>` function form. For this project, opacity modifiers are not needed on brand colors — the muted variants (e.g., `--color-primary-muted`) serve that role. This is an acceptable trade-off.

---

## Dark Mode Strategy

### Recommendation: `darkMode: 'class'`

The project has already decided this in `PROJECT.md` (documented under Key Decisions). This is the correct choice. Rationale:

| Concern | `class` strategy | `media` strategy |
|---------|-----------------|-----------------|
| User can override system preference | Yes | No |
| localStorage persistence possible | Yes | No |
| SSR hydration mismatch risk | Low (add class before render) | None |
| Implementation complexity | Low | Minimal |
| Tailwind v3 support | Full | Full |

### Implementation Pattern

The theme toggle lives in `src/stores/ui.ts` (extend the existing store rather than creating a new one):

```typescript
// src/stores/ui.ts — extend existing UiStore
state: () => ({
  activeTab: 'todo' as MainTab,
  theme: (localStorage.getItem('todo-plus:theme') ?? 'light') as 'light' | 'dark',
}),
actions: {
  setTab(tab: MainTab) { this.activeTab = tab; },
  setTheme(theme: 'light' | 'dark') {
    this.theme = theme;
    localStorage.setItem('todo-plus:theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  },
  initTheme() {
    document.documentElement.classList.toggle('dark', this.theme === 'dark');
  },
}
```

Call `uiStore.initTheme()` inside `onMounted` in `App.vue` alongside the existing hydrate calls.

**Flash-of-wrong-theme prevention:** Add an inline `<script>` at the top of `index.html` `<head>` that applies the class synchronously before Vue loads:

```html
<!-- index.html — before </head> -->
<script>
  (function() {
    var t = localStorage.getItem('todo-plus:theme');
    if (t === 'dark') document.documentElement.classList.add('dark');
  })();
</script>
```

This is the only logic that should live outside Vue.

---

## Global CSS Structure

### File Layout

```
src/
  style.css          ← THE single source of truth for tokens + base styles
  main.ts            ← imports style.css (already does this)
```

All CSS tokens go in `style.css`. No new CSS files should be created. Component `<style>` blocks should be used only for:
1. CSS properties that Tailwind cannot express (e.g., complex `clip-path`, SVG animations)
2. Radix Vue state-based selectors that CVA cannot handle (rarely needed)

### style.css Structure

```css
/* 1. Tailwind directives */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 2. Token definitions (CSS variables) */
:root { /* light tokens — full set */ }
.dark { /* dark overrides only */ }

/* 3. Base element resets */
@layer base {
  html { @apply antialiased; }
  body { @apply bg-surface-app text-text-primary; }
  * { @apply border-border-base; }
}

/* 4. Global animation keyframes */
@layer utilities {
  @keyframes fade-in  { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slide-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slide-in-right { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  @keyframes heatmap-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.7; } }
}
```

**Why `@layer utilities` for keyframes:** Placing keyframes in a Tailwind layer prevents them from being purged by the content scanner and keeps them co-located with the utility classes that reference them.

**Do NOT use:** `<style scoped>` for tokens, theme variables, or animation keyframes. These are global concerns and scoped styles would be silently ignored when applied to Radix Vue portal content (dialogs, dropdowns) which renders outside the component's DOM subtree.

---

## Component Variant Patterns

### CVA Pattern (Current)

The codebase already uses CVA correctly in `Button.vue` and `Badge.vue`. The migration to design tokens involves replacing hardcoded Tailwind color names with the new semantic aliases.

### Button Migration Example

```typescript
// src/components/ui/button/Button.vue
const buttonVariants = cva(
  // Base: replace slate-* with semantic token aliases
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:     'bg-primary text-primary-fg hover:bg-primary-hover shadow-sm',
        destructive: 'bg-status-danger text-white hover:bg-red-600',
        outline:     'border border-border-base bg-surface-base hover:bg-surface-subtle text-text-primary',
        secondary:   'bg-surface-subtle text-text-primary hover:bg-slate-200',
        ghost:       'hover:bg-surface-subtle hover:text-text-primary',
        link:        'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm:      'h-9 rounded-md px-3',
        lg:      'h-11 rounded-md px-8',
        icon:    'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);
```

### New Variant Patterns Needed

#### Badge — Priority Variant

```typescript
// Add to existing badgeVariants in Badge.vue
variant: {
  // ... existing variants ...
  priority_high:   'border-transparent bg-status-danger-muted text-red-700 dark:text-red-400',
  priority_medium: 'border-transparent bg-status-warning-muted text-amber-700 dark:text-amber-400',
  priority_low:    'border-transparent bg-surface-subtle text-text-muted',
  tag:             'border-transparent bg-primary-muted text-teal-700 dark:text-teal-300',
}
```

#### Kanban Card

```typescript
// New component: src/components/ui/card/KanbanCard.vue
const kanbanCardVariants = cva(
  'rounded-lg border bg-surface-base p-3 shadow-sm transition-all duration-base cursor-grab active:cursor-grabbing',
  {
    variants: {
      state: {
        default:   'border-border-base hover:shadow-md hover:-translate-y-0.5',
        dragging:  'border-primary shadow-lg rotate-1 opacity-80 scale-105',
        dragover:  'border-primary border-dashed bg-primary-muted/30',
      },
    },
    defaultVariants: { state: 'default' },
  }
);
```

#### Dashboard Heatmap Cell

```typescript
// Inline CVA in dashboard section of App.vue, or extracted component
const heatmapCellVariants = cva(
  'rounded-sm transition-colors duration-fast',
  {
    variants: {
      intensity: {
        0: 'bg-surface-subtle',
        1: 'bg-primary-muted/40',
        2: 'bg-primary-muted/70',
        3: 'bg-primary/50',
        4: 'bg-primary',
      },
    },
    defaultVariants: { intensity: 0 },
  }
);
```

### CVA + Radix Vue Integration

Radix Vue components use `data-[state=*]` attributes for interactive states. CVA and Tailwind's `data-[]` arbitrary variant syntax work together:

```typescript
// TabsTrigger.vue — updated to use semantic tokens
cn(
  'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all duration-base',
  'text-text-secondary hover:text-text-primary',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
  'disabled:pointer-events-none disabled:opacity-50',
  'data-[state=active]:bg-surface-base data-[state=active]:text-text-primary data-[state=active]:shadow-sm',
  props.class
)
```

The `data-[state=active]:` prefix is Tailwind v3 arbitrary variant syntax — no plugin needed. This is how Radix Vue active states map to Tailwind classes.

**DialogContent note:** The dialog portal renders outside `#app` into `document.body`. Since dark mode class is on `<html>`, not `#app`, Tailwind's `dark:` prefix works correctly for portal content.

---

## Animation System

### Keyframe Registration

All keyframes go in `style.css` (see Global CSS Structure section). Register corresponding utilities in `tailwind.config.js`:

```js
// tailwind.config.js — inside theme.extend
animation: {
  'fade-in':        'fade-in var(--duration-enter) var(--ease-out) both',
  'slide-up':       'slide-up var(--duration-enter) var(--ease-spring) both',
  'slide-in-right': 'slide-in-right var(--duration-base) var(--ease-out) both',
  'scale-in':       'scale-in var(--duration-base) var(--ease-spring) both',
  'heatmap-pulse':  'heatmap-pulse 2s ease-in-out infinite',
},
keyframes: {
  'fade-in': {
    from: { opacity: '0' },
    to:   { opacity: '1' },
  },
  'slide-up': {
    from: { opacity: '0', transform: 'translateY(8px)' },
    to:   { opacity: '1', transform: 'translateY(0)' },
  },
  'slide-in-right': {
    from: { opacity: '0', transform: 'translateX(12px)' },
    to:   { opacity: '1', transform: 'translateX(0)' },
  },
  'scale-in': {
    from: { opacity: '0', transform: 'scale(0.95)' },
    to:   { opacity: '1', transform: 'scale(1)' },
  },
  'heatmap-pulse': {
    '0%,100%': { opacity: '1' },
    '50%':     { opacity: '0.7' },
  },
},
```

**Note:** `tailwindcss-animate` is already installed (`package.json`). It provides `animate-in`, `animate-out`, `fade-in-*`, `zoom-in-*` etc. These can be used directly for Radix Vue dialog/dropdown transitions without custom keyframes. Use `tailwindcss-animate` for Radix Vue portal transitions; use custom keyframes for card entry and tab switch animations.

### Usage Patterns

```html
<!-- Card entry animation (v-for lists) -->
<div class="animate-slide-up" style="animation-delay: calc(var(--index) * 40ms)">

<!-- Dialog open/close via tailwindcss-animate + Radix Vue data attributes -->
<DialogContent class="data-[state=open]:animate-in data-[state=closed]:animate-out
                      data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0
                      data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95">

<!-- Tab content transition -->
<TabsContent class="data-[state=active]:animate-fade-in">

<!-- Hover transitions on cards (CSS transition, not animation) -->
<div class="transition-all duration-base hover:shadow-md hover:-translate-y-0.5">
```

### Reduced Motion

```css
/* style.css — in @layer base */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Implementation Order

### Phase 1 — Token Foundation (Safest Start)

**Files touched:** `src/style.css`, `tailwind.config.js`, `index.html`
**Risk:** Very low. No component logic changes.

Steps:
1. Add `:root` token block to `style.css`
2. Add `.dark` override block to `style.css`
3. Extend `tailwind.config.js` with semantic aliases (set `darkMode: 'class'`)
4. Add flash-prevention script to `index.html`
5. Extend `src/stores/ui.ts` with `theme` state + `setTheme`/`initTheme` actions
6. Call `uiStore.initTheme()` in `App.vue`'s `onMounted`
7. Add theme toggle button to App.vue header

**Validation:** Application renders identically to before (tokens resolve to same colors). Toggle works. localStorage persists preference.

### Phase 2 — Atomic Component Migration

**Files touched:** `src/components/ui/**`
**Risk:** Low. Each component is self-contained.

Order within this phase:
1. `Button.vue` — replace `slate-*` classes with semantic aliases
2. `Input.vue` — replace `slate-*` classes; add `:focus` teal ring
3. `Badge.vue` — add `priority_high`, `priority_medium`, `priority_low`, `tag` variants
4. `Card.vue` — replace border/shadow/bg classes with tokens
5. `TabsList.vue` + `TabsTrigger.vue` — replace `slate-*` with tokens; add active indicator animation
6. `DialogContent.vue` + `DialogOverlay` — replace with token classes; add `tailwindcss-animate` transitions
7. `Checkbox.vue` + `Select.vue` — replace `slate-*` with tokens

**Validation:** Each component looks correct in both light and dark mode. Stagger updates to keep each PR small.

### Phase 3 — Page-Level Redesign

**Files touched:** `src/App.vue` (large file, ~400 lines)
**Risk:** Medium. Inline classes throughout.

Order within this phase:
1. Navigation / Tab bar (header area) — smallest surface
2. Todo list + Todo card — highest visual impact, most used
3. Idea Kanban — drag/drop visual states, new KanbanCard component
4. Dashboard — heatmap color scale, metric cards

**Approach:** Work section-by-section within `App.vue`. Extract sections into sub-components (`TodoCard.vue`, `IdeaCard.vue`, `DashboardCalendar.vue`) to reduce the size of `App.vue` and scope changes.

### Phase 4 — Animation Layer

**Files touched:** `style.css` (keyframes), `tailwind.config.js` (animation utils), individual components
**Risk:** Low. Purely additive. No existing styles removed.

Steps:
1. Register keyframes and animation utilities in config
2. Add `tailwindcss-animate` usage to Dialog (already installed, just apply classes)
3. Add card entry animations to Todo/Idea lists
4. Add Tab content fade transition
5. Add hover lift effect to cards
6. Add reduced-motion media query

### Why This Order

```
Tokens first  →  Components second  →  Pages third  →  Animations last
   (global)          (isolated)          (complex)        (polish)
```

- Tokens must exist before any semantic Tailwind class (`bg-primary`) is used
- Atomic components establish the visual vocabulary before pages use it
- Pages are the riskiest area (large, complex, business-adjacent) — work on them after the vocabulary is stable
- Animations are purely additive — no existing functionality depends on them

**Do not start with pages.** The existing `App.vue` hardcodes `slate-*` colors everywhere. Trying to add dark mode there before tokens are defined will create a maintenance nightmare of `dark:bg-slate-800` entries that then need to be replaced again in Phase 3.

---

## Component/Folder Structure for Design System Additions

```
src/
  style.css                      ← tokens + base + keyframes (single file)
  tailwind.config.js             ← semantic aliases, animation registration
  index.html                     ← flash-prevention script

  stores/
    ui.ts                        ← extend with theme state + actions

  components/
    ui/
      button/Button.vue          ← migrate to semantic tokens (existing)
      badge/Badge.vue            ← add priority/tag variants (existing)
      card/
        Card.vue                 ← migrate to tokens (existing)
        KanbanCard.vue           ← NEW: draggable kanban card with state variants
      input/Input.vue            ← migrate to tokens + teal focus ring
      tabs/
        TabsList.vue             ← migrate to tokens
        TabsTrigger.vue          ← migrate + active indicator
        TabsContent.vue          ← add entry animation
      dialog/
        DialogContent.vue        ← migrate + scale-in animation
        DialogOverlay.vue        ← migrate to --surface-overlay token
      checkbox/Checkbox.vue      ← migrate to tokens
      select/Select.vue          ← migrate to tokens

    features/                    ← NEW directory for extracted page sections
      todo/
        TodoCard.vue             ← NEW: extracted from App.vue
      idea/
        IdeaCard.vue             ← NEW: extracted from App.vue
      dashboard/
        HeatmapCell.vue          ← NEW: extracted from App.vue
```

The `components/features/` directory keeps extracted page sections separate from generic UI primitives. This mirrors the existing `components/ui/` pattern and keeps `App.vue` manageable.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Token naming convention | HIGH | Based on Tailwind v3 docs patterns + shadcn-vue conventions already in use |
| Tailwind config extension | HIGH | Direct codebase inspection of existing `tailwind.config.js` |
| Dark mode strategy | HIGH | Already decided in PROJECT.md; `class` strategy is standard Tailwind v3 pattern |
| CVA variant migration | HIGH | Existing CVA usage in Button.vue and Badge.vue confirmed correct pattern |
| Radix Vue integration | HIGH | Tailwind `data-[state=*]` variants confirmed working with Radix Vue v1 |
| Animation system | MEDIUM | `tailwindcss-animate` installed, keyframe approach is standard Tailwind v3 |
| Implementation order | HIGH | Risk-ordered based on codebase complexity analysis |

---

*Researched: 2026-03-14*

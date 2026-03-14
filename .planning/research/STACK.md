# Stack Research: Vue 3 UI Modernization

**Project:** todo-plus
**Researched:** 2026-03-14
**Confidence:** HIGH (Tailwind v3 + Vue 3 APIs are stable and well-documented; patterns below are from official docs and established community practice)

---

## Theme Switching Strategy

### Approach: `darkMode: 'class'` + CSS Variables on `:root` / `.dark`

Tailwind v3 supports two dark mode strategies: `media` (follows OS preference) and `class` (manual toggle via a class on `<html>`). **Use `class` strategy.** The PROJECT.md already mandates this — it allows user-controlled switching stored in localStorage, which overrides the OS preference.

**Tailwind config (one line change needed):**

```js
// tailwind.config.js
export default {
  darkMode: 'class',   // <-- add this
  // ...
}
```

**CSS variable definitions in `src/style.css`:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Surfaces */
    --color-bg:          #f8fafc;   /* mist — page background */
    --color-surface:     #ffffff;   /* card background */
    --color-surface-2:   #f1f5f9;   /* elevated surface, sidebar */
    --color-border:      #e2e8f0;   /* slate-200 */

    /* Text */
    --color-text:        #0f172a;   /* slate-900 */
    --color-text-muted:  #64748b;   /* slate-500 */
    --color-text-subtle: #94a3b8;   /* slate-400 */

    /* Primary — Teal */
    --color-primary:     #14b8a6;   /* teal-500 */
    --color-primary-hover: #0d9488; /* teal-600 */
    --color-primary-subtle: #ccfbf1; /* teal-100 */
    --color-primary-text: #0f766e;  /* teal-700 — on light bg */

    /* Semantic */
    --color-danger:      #ef4444;   /* red-500 */
    --color-warning:     #f59e0b;   /* amber-500 */
    --color-success:     #10b981;   /* emerald-500 */

    /* Shadow */
    --shadow-card:       0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07);
    --shadow-dialog:     0 20px 60px -10px rgb(0 0 0 / 0.15);
  }

  .dark {
    --color-bg:          #0f172a;   /* slate-900 */
    --color-surface:     #1e293b;   /* slate-800 */
    --color-surface-2:   #293548;   /* slate-750 approx */
    --color-border:      #334155;   /* slate-700 */

    --color-text:        #f1f5f9;   /* slate-100 */
    --color-text-muted:  #94a3b8;   /* slate-400 */
    --color-text-subtle: #64748b;   /* slate-500 */

    --color-primary:     #2dd4bf;   /* teal-400 — brighter on dark */
    --color-primary-hover: #14b8a6; /* teal-500 */
    --color-primary-subtle: #134e4a; /* teal-950 */
    --color-primary-text: #5eead4;  /* teal-300 */

    --shadow-card:       0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3);
    --shadow-dialog:     0 20px 60px -10px rgb(0 0 0 / 0.5);
  }
}
```

**Vue 3 composable for theme management (add to `src/stores/ui.ts` or a new `useTheme.ts`):**

```typescript
// src/composables/useTheme.ts
import { ref, watchEffect } from 'vue';

type Theme = 'light' | 'dark';
const STORAGE_KEY = 'todo-plus:theme';

const theme = ref<Theme>(
  (localStorage.getItem(STORAGE_KEY) as Theme) ?? 'light'
);

export function useTheme() {
  watchEffect(() => {
    document.documentElement.classList.toggle('dark', theme.value === 'dark');
    localStorage.setItem(STORAGE_KEY, theme.value);
  });

  function toggle() {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
  }

  return { theme, toggle };
}
```

Call `useTheme()` once in `App.vue` `<script setup>` to activate the watcher. All children that call `useTheme()` share the same module-level `ref` because Vue's module system is a singleton per page.

**Why this approach over alternatives:**

- `prefers-color-scheme` media query alone cannot be overridden by the user without JS — rejected by project requirements.
- Storing dark class on `<body>` instead of `<html>` breaks Tailwind's `dark:` selectors in some Radix Vue portals (dialogs render as direct children of `<body>` — these still need the class on `<html>` to inherit). **Always use `<html>`.**
- `color-scheme: dark` CSS property should also be set to get native browser UI elements (scrollbars, inputs) to follow theme: add `color-scheme: dark` inside the `.dark` block.

---

## Design Token Architecture

### Pattern: CSS Variables registered in Tailwind `extend`

The tokens defined in `:root` / `.dark` must be referenced from Tailwind utility classes via `extend.colors` using `var(--...)` syntax. This allows writing `bg-surface`, `text-primary`, etc. as regular Tailwind classes while the actual value is resolved at runtime from the CSS variable.

**`tailwind.config.js` full replacement:**

```js
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Semantic tokens (use these everywhere in components)
        bg:            'var(--color-bg)',
        surface:       'var(--color-surface)',
        'surface-2':   'var(--color-surface-2)',
        border:        'var(--color-border)',
        text:          'var(--color-text)',
        'text-muted':  'var(--color-text-muted)',
        'text-subtle': 'var(--color-text-subtle)',
        primary:       'var(--color-primary)',
        'primary-hover':  'var(--color-primary-hover)',
        'primary-subtle': 'var(--color-primary-subtle)',
        'primary-text':   'var(--color-primary-text)',
        danger:        'var(--color-danger)',
        warning:       'var(--color-warning)',
        success:       'var(--color-success)',
      },
      boxShadow: {
        card:   'var(--shadow-card)',
        dialog: 'var(--shadow-dialog)',
      },
      borderRadius: {
        card: '0.75rem',   /* 12px — card corner radius */
        pill: '9999px',    /* tag/badge capsule */
      },
    }
  },
  plugins: [forms]
};
```

**Usage in components (after this config):**

```html
<!-- Before (hardcoded palette) -->
<div class="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">

<!-- After (semantic tokens, automatically handles dark) -->
<div class="bg-surface text-text">
```

**Naming convention rules:**

1. Token names are semantic, not visual: `surface` not `white`, `text-muted` not `gray-500`.
2. Prefix with category: `text-*`, `bg-*` are Tailwind prefixes; tokens are bare nouns (`surface`, `primary`) that get the Tailwind prefix at usage: `bg-surface`, `text-primary`.
3. No token for every spacing value — use Tailwind's default spacing scale (`p-4`, `gap-3`) for layout. Tokens are only for colors and shadows that need to flip between themes.

**CVA component variant update pattern** (for `Button.vue` and siblings):

```typescript
// Replace hardcoded slate/white with semantic tokens
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:     'bg-primary text-white hover:bg-primary-hover',
        destructive: 'bg-danger text-white hover:opacity-90',
        outline:     'border border-border bg-surface hover:bg-surface-2 text-text',
        secondary:   'bg-surface-2 text-text hover:bg-border',
        ghost:       'hover:bg-surface-2 text-text-muted hover:text-text',
        link:        'text-primary underline-offset-4 hover:underline',
      },
      // ... size variants unchanged
    }
  }
);
```

---

## Animation & Transition Patterns

### Vue 3 `<Transition>` and `<TransitionGroup>`

Vue 3's built-in `<Transition>` component is the correct tool. Do not reach for third-party animation libraries (Motion for Vue, GSAP) for the transitions described in this project — they add bundle weight for effects achievable with pure CSS transitions.

**Pattern 1: Tab content fade-slide (enter from right)**

```vue
<!-- In App.vue around each TabsContent -->
<Transition name="tab-slide" mode="out-in">
  <div :key="uiStore.activeTab">
    <!-- tab content -->
  </div>
</Transition>
```

```css
/* src/style.css */
.tab-slide-enter-active,
.tab-slide-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}
.tab-slide-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.tab-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
```

`mode="out-in"` is mandatory here: it waits for the leaving element to fully exit before the entering element starts, preventing two full-height panels occupying space simultaneously.

**Pattern 2: Todo list item enter/leave (`<TransitionGroup>`)**

```vue
<TransitionGroup name="list-item" tag="ul" class="space-y-2">
  <li v-for="todo in filteredTodos" :key="todo.id">
    <!-- card -->
  </li>
</TransitionGroup>
```

```css
.list-item-enter-active {
  transition: opacity 220ms ease, transform 220ms ease;
}
.list-item-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
  /* must be positioned to allow layout collapse */
  position: absolute;
  width: 100%;
}
.list-item-enter-from {
  opacity: 0;
  transform: translateX(-8px);
}
.list-item-leave-to {
  opacity: 0;
  transform: translateX(8px) scale(0.97);
}
.list-item-move {
  transition: transform 300ms ease;
}
```

The `position: absolute` on `leave-active` is the most critical non-obvious requirement: without it, leaving items hold their layout space during the animation, causing a jarring layout jump.

**Pattern 3: Dialog enter/exit (scale up from center)**

```vue
<Transition name="dialog-scale">
  <div v-if="dialogOpen" class="...dialog panel...">
```

```css
.dialog-scale-enter-active,
.dialog-scale-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}
.dialog-scale-enter-from,
.dialog-scale-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(4px);
}
```

Radix Vue's `DialogContent` already has its own internal transition via `data-state` attributes. When using Radix Vue's Dialog, apply CSS targeting `[data-state="open"]` / `[data-state="closed"]` instead of wrapping with Vue `<Transition>`:

```css
/* Radix Vue dialog animation via data-state */
[data-radix-dialog-content] {
  transition: opacity 200ms ease, transform 200ms ease;
}
[data-radix-dialog-content][data-state="closed"] {
  opacity: 0;
  transform: scale(0.95) translateY(4px);
  pointer-events: none;
}
[data-radix-dialog-content][data-state="open"] {
  opacity: 1;
  transform: scale(1) translateY(0);
}
```

**Pattern 4: Card hover lift (pure CSS, no Vue transition needed)**

```css
/* On card elements */
.card-hover {
  transition: box-shadow 200ms ease, transform 200ms ease;
}
.card-hover:hover {
  box-shadow: var(--shadow-dialog);
  transform: translateY(-1px);
}
```

Or as a Tailwind utility: add to `@layer utilities` in `style.css`:

```css
@layer utilities {
  .card-hover {
    @apply transition-[box-shadow,transform] duration-200 ease-out;
    @apply hover:-translate-y-px hover:shadow-dialog;
  }
}
```

**`tailwindcss-animate` plugin** (already installed): use it for Kanban drag-placeholder animations where JS-driven class toggling is common. The plugin provides `animate-in`, `fade-in`, `slide-in-from-top-2` etc. These are additive (CSS animation, one-shot) — appropriate for appear-once effects like the drag ghost.

**Performance rule:** Always use `transform` and `opacity` for animations. Never animate `height`, `width`, `top`, `left`, `margin`, or `padding` — these trigger layout recalculation and cause jank on low-end devices.

---

## Responsive Layout Approach

### Breakpoint strategy for a dashboard app

This is a desktop-primary app (single-page todo/kanban/dashboard). The responsive requirement is "desktop + mobile", not a mobile-first product. Use Tailwind's default breakpoints:

| Breakpoint | Width  | Usage |
|------------|--------|-------|
| (base)     | < 640px | Mobile single-column stack |
| `sm`       | 640px  | Not needed for this app |
| `md`       | 768px  | Tablet: two-column possible |
| `lg`       | 1024px | Desktop: full layout unlocks |
| `xl`       | 1280px | Wide: increase content max-width |

**App shell layout:**

```html
<!-- App.vue outer wrapper -->
<div class="min-h-screen bg-bg">
  <!-- Navigation bar: full-width, fixed height -->
  <header class="h-14 border-b border-border bg-surface px-4 flex items-center">
    <!-- logo + tab triggers + theme toggle -->
  </header>

  <!-- Content area: centered, max-width capped -->
  <main class="mx-auto max-w-5xl px-4 py-6 lg:px-8">
    <!-- tab content -->
  </main>
</div>
```

**Kanban three-column layout:**

```html
<!-- Mobile: stacked columns (scroll vertically through lanes) -->
<!-- Desktop: side-by-side columns -->
<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
  <div v-for="lane in lanes" class="...">
```

**Todo list layout:**

```html
<!-- Mobile: full width list -->
<!-- Desktop: list with a sidebar filter panel -->
<div class="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
  <aside class="hidden lg:block"><!-- filters --></aside>
  <section><!-- todo cards --></section>
</div>
```

**Dashboard calendar grid:**

The existing dashboard uses a 7-column calendar grid. Keep this structure:

```html
<div class="grid grid-cols-7 gap-1 text-xs">
  <!-- day cells -->
</div>
```

On mobile (< lg), the calendar heatmap should still render as 7 columns but with smaller cells. Use `text-[10px]` and `p-0.5` at base, `text-xs p-1` at `md:`.

**Navigation tabs on mobile:**

On mobile, the three main tabs should use bottom navigation bar rather than top tabs. This is a UX improvement:

```html
<!-- Mobile: fixed bottom nav -->
<nav class="fixed bottom-0 inset-x-0 bg-surface border-t border-border lg:hidden">
  <div class="grid grid-cols-3 h-16">
    <!-- tab triggers -->
  </div>
</nav>

<!-- Desktop: top tab strip in header -->
<nav class="hidden lg:flex gap-1">
  <!-- tab triggers -->
</nav>
```

---

## Color System (Teal/Cyan)

### Primary palette: Teal anchored at `teal-500` (#14b8a6)

Tailwind's `teal` palette (exact hex values):

| Token | Tailwind Name | Hex | Use |
|-------|---------------|-----|-----|
| `teal-50`  | `#f0fdfa` | Page tint on hover states |
| `teal-100` | `#ccfbf1` | Light primary-subtle (badges, tag bg) |
| `teal-200` | `#99f6e4` | Heatmap step 2 |
| `teal-300` | `#5eead4` | primary-text on dark bg |
| `teal-400` | `#2dd4bf` | primary on dark theme |
| **`teal-500`** | `#14b8a6` | **Primary anchor — buttons, active indicators** |
| `teal-600` | `#0d9488` | primary-hover |
| `teal-700` | `#0f766e` | primary-text on light bg |
| `teal-800` | `#115e59` | Deep accent |
| `teal-900` | `#134e4a` | primary-subtle on dark theme |
| `teal-950` | `#042f2e` | Darkest — rarely used |

### Heatmap color scale (Dashboard calendar)

The dashboard's daily activity heatmap needs a 5-step color scale:

| Activity level | Light mode | Dark mode | CSS variable |
|----------------|------------|-----------|--------------|
| 0 (none)  | `#f1f5f9` (slate-100) | `#1e293b` (slate-800) | `--heat-0` |
| 1 (low)   | `#99f6e4` (teal-200)  | `#134e4a` (teal-900)  | `--heat-1` |
| 2 (mid-low) | `#2dd4bf` (teal-400) | `#0f766e` (teal-700)  | `--heat-2` |
| 3 (mid-high) | `#14b8a6` (teal-500) | `#0d9488` (teal-600)  | `--heat-3` |
| 4 (high)  | `#0f766e` (teal-700)  | `#2dd4bf` (teal-400)  | `--heat-4` |

Add these to the `:root` / `.dark` blocks in `style.css` alongside the other tokens.

### Priority color mapping

The app has three priority levels. Use semantic colors, not pure Tailwind palette classes inline:

| Priority | Color | Tailwind | Hex |
|----------|-------|----------|-----|
| high | Red | `red-500` | `#ef4444` |
| medium | Amber | `amber-500` | `#f59e0b` |
| low | Slate | `slate-400` | `#94a3b8` |

Define these as additional CSS variables:

```css
:root {
  --color-priority-high:   #ef4444;
  --color-priority-medium: #f59e0b;
  --color-priority-low:    #94a3b8;
}
```

Add to Tailwind config:

```js
colors: {
  'priority-high':   'var(--color-priority-high)',
  'priority-medium': 'var(--color-priority-medium)',
  'priority-low':    'var(--color-priority-low)',
}
```

### Tag capsule (badge) design

Tags use `primary-subtle` background with `primary-text` text:

```html
<span class="inline-flex items-center rounded-pill bg-primary-subtle text-primary-text px-2 py-0.5 text-xs font-medium">
  {{ tag }}
</span>
```

This automatically flips between light (`teal-100` bg / `teal-700` text) and dark (`teal-950` bg / `teal-300` text) via the CSS variables.

---

## What NOT to Do

### 1. Do not use `dark:` Tailwind variants as the primary theming mechanism

**Wrong:**
```html
<div class="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700">
```

**Why wrong:** Every element requires double class lists. With 400 lines of existing `App.vue` and shadcn-style components, this doubles the maintenance surface. One dark variant change requires finding all occurrences.

**Right:** Use semantic CSS variable tokens. `dark:` variants are acceptable only for one-off exceptions that don't warrant a new token (max 5% of usages).

### 2. Do not animate `height: auto` with CSS transitions

**Wrong:**
```css
.accordion {
  height: 0;
  transition: height 300ms ease;
}
.accordion.open {
  height: auto;  /* does not animate */
}
```

**Why wrong:** CSS cannot interpolate to `height: auto`. The transition silently no-ops.

**Right:** Use `max-height` with a generous ceiling, or use Vue's `<Transition>` with JS hooks (`@enter` / `@leave`) to measure and set explicit pixel heights, or use `grid-template-rows: 0fr` → `1fr` (modern browsers only, which this project targets).

### 3. Do not add a separate animation library for basic transitions

**Wrong:** Installing `@vueuse/motion`, `animejs`, or `@formkit/auto-animate` for tab switching and list enter/leave.

**Why wrong:** `tailwindcss-animate` is already installed. Vue's `<Transition>` + CSS covers all described effects. Additional libraries add 10–40 KB gzipped.

**Exception:** If the project later adds complex path-following animations or scroll-triggered sequences, `@vueuse/motion` (built on popmotion) is the appropriate Vue 3 native choice.

### 4. Do not store the theme in Pinia state

**Wrong:** Adding `theme: 'light' | 'dark'` to `useUiStore` and syncing to localStorage through Pinia's persist plugin.

**Why wrong:** The theme class must be applied to `<html>` on initial page load BEFORE Vue mounts, to prevent flash of wrong theme (FOWT). Pinia initializes after Vue mounts. The pattern is: read localStorage in a plain composable, apply the class synchronously, then Vue picks up the already-correct state.

**Right:** Use the `useTheme` composable shown above. Optionally expose `theme` as a `readonly` for display purposes, but the source of truth is the `<html>` class.

### 5. Do not use `@apply` extensively in component `.vue` files

**Wrong:**
```css
/* inside <style scoped> */
.my-card {
  @apply bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 border border-slate-200;
}
```

**Why wrong:** Defeats Tailwind's JIT purging reliability, creates a non-standard abstraction layer, makes it harder to see what a component looks like by reading the template, and the Tailwind LSP autocomplete stops working in `@apply` blocks in most editors.

**Right:** Keep classes inline in the template. If a class combination is reused, extract it as a component prop variant via `cva()`, which is already used in this project.

### 6. Do not forget `ring-offset-color` for focus rings in dark mode

Focus rings (Tailwind's `focus-visible:ring-2`) render against a white offset ring by default. In dark mode the offset ring stays white, creating a visible white halo.

**Fix:** Add `ring-offset-bg` as a global base style:

```css
@layer base {
  * {
    --tw-ring-offset-color: var(--color-bg);
  }
}
```

Or explicitly on interactive elements: `focus-visible:ring-offset-bg`.

---

## Sources

- Tailwind CSS v3 dark mode docs: https://tailwindcss.com/docs/dark-mode (HIGH confidence — official)
- Tailwind CSS v3 custom properties/theme config: https://tailwindcss.com/docs/customizing-colors (HIGH confidence — official)
- Vue 3 Transition component: https://vuejs.org/guide/built-ins/transition.html (HIGH confidence — official)
- Vue 3 TransitionGroup: https://vuejs.org/guide/built-ins/transition-group.html (HIGH confidence — official)
- Radix Vue Dialog data-state animations: https://www.radix-vue.com/components/dialog.html (MEDIUM confidence — official Radix Vue docs, verified pattern)
- CVA (class-variance-authority) docs: https://cva.style/docs (HIGH confidence — official)
- Teal color hex values: Tailwind CSS default palette (HIGH confidence — deterministic from Tailwind source)
- `tailwindcss-animate` plugin: https://github.com/jamiebuilds/tailwindcss-animate (HIGH confidence — already installed in this project)

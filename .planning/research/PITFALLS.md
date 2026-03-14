# Pitfalls Research: UI Modernization for Vue 3 + Tailwind

**Domain:** Visual refresh of a Vue 3 + Pinia + Radix Vue SPA (no backend)
**Researched:** 2026-03-14
**Overall confidence:** HIGH (codebase fully read; patterns verified against Radix Vue / Tailwind v3 source behavior; web search unavailable, training-data claims are flagged)

---

## Theme Switching Pitfalls

### Pitfall 1: Flash of Wrong Theme (FOUT) on Page Load

**What goes wrong:**
The `index.html` currently has no `dark` class on `<html>` at parse time. Vue mounts asynchronously — `main.ts` runs, creates Pinia, mounts `App`, then `onMounted` fires in the UI store. By that point the browser has already painted at least one frame without the `dark` class. On dark-theme preference, users see a white flash before the class is applied.

**Why it happens in this project specifically:**
`src/main.ts` calls `app.mount('#app')` synchronously, but localStorage reads happen inside Vue's reactive lifecycle. The `dark` class must be on `<html>` *before* the first paint, which means it cannot come from Vue code — it must come from a `<script>` block in `index.html` that runs synchronously during HTML parsing.

**Prevention:**
Add a blocking inline script in `index.html` `<head>` (before any stylesheet) that reads localStorage and sets the class immediately:

```html
<!-- index.html <head>, BEFORE any <link> or stylesheet -->
<script>
  (function () {
    var saved = localStorage.getItem('todo-plus:theme');
    if (saved === 'dark' ||
        (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  })();
</script>
```

The Tailwind `dark:` variant relies on `.dark` being on `<html>` (class strategy). The inline script must use the **exact same localStorage key** that the UI store will use — a mismatch is a silent bug.

**Warning signs:**
- White flash visible on hard reload in a dark-theme browser
- `uiStore.theme` not persisted between page loads
- `dark` class appears only after the first reactive tick

**Phase:** Dark mode implementation phase (before any `dark:` Tailwind classes are added)

---

### Pitfall 2: Dark Mode Applied to `<body>` or App Root Instead of `<html>`

**What goes wrong:**
Tailwind's `dark:` variant uses `html.dark` as the selector (when `darkMode: 'class'` is configured). Applying the `dark` class to `<body>`, `#app`, or `<main>` will make all Tailwind `dark:` variants silently not apply. Every `dark:bg-*` class appears to do nothing.

**Why it happens in this project:**
The current `useUiStore` only tracks `activeTab`. When a `theme` field is added, the toggle action will naturally `document.documentElement.classList.toggle('dark')` — but a developer may mistakenly use `document.body` or `this.$el` instead.

**Prevention:**
Always toggle on `document.documentElement` (the `<html>` element), never `document.body`. Verify `tailwind.config.js` explicitly declares `darkMode: 'class'` — without this Tailwind v3 defaults to media query strategy and the class toggle has no effect at all.

```js
// tailwind.config.js
export default {
  darkMode: 'class',   // REQUIRED — currently absent from this project's config
  content: ['./index.html', './src/**/*.{vue,ts}'],
  // ...
}
```

**Warning signs:**
- `dark:` utilities compile without error but have no visual effect
- Browser DevTools shows class applied, but computed styles unchanged
- No `darkMode` key in `tailwind.config.js`

**Phase:** Dark mode implementation phase

---

### Pitfall 3: Hardcoded `slate-*` Colors Not Overridden for Dark Mode

**What goes wrong:**
The entire existing codebase uses concrete Tailwind palette classes (`bg-white`, `text-slate-500`, `border-slate-200`, `bg-slate-50`, etc.) directly in component templates and CVA variant strings. Dark mode additions require adding `dark:` counterparts to *every single one* of these. Missing even one creates a contrast failure (e.g., `text-slate-500` on `dark:bg-slate-900` may pass WCAG but `bg-white` without `dark:bg-slate-800` leaves a blinding white card).

**Why it happens in this project:**
There are roughly 80–100 distinct color class occurrences across `App.vue`, `Button.vue`, `Badge.vue`, `Checkbox.vue`, `DialogContent.vue`, `TabsTrigger.vue`, and the form components. The CVA variant objects in `Button.vue` and `Badge.vue` contain hardcoded light-theme colors with no `dark:` prefix. Adding dark support by patching each call site is error-prone and incomplete.

**Prevention:**
Introduce CSS custom properties as semantic design tokens *before* writing any `dark:` classes. Map Tailwind color values to tokens:

```css
/* style.css */
:root {
  --color-surface:      theme('colors.white');
  --color-surface-muted: theme('colors.slate.50');
  --color-border:       theme('colors.slate.200');
  --color-text-primary: theme('colors.slate.900');
  --color-text-muted:   theme('colors.slate.500');
  --color-brand:        theme('colors.teal.500');
}
.dark {
  --color-surface:      theme('colors.slate.900');
  --color-surface-muted: theme('colors.slate.800');
  --color-border:       theme('colors.slate.700');
  --color-text-primary: theme('colors.slate.50');
  --color-text-muted:   theme('colors.slate.400');
  --color-brand:        theme('colors.teal.400');
}
```

Then update CVA strings and template classes to use these tokens via Tailwind's arbitrary value syntax (`bg-[var(--color-surface)]`) or by extending the theme. This is one refactor pass rather than hunting through every `dark:` combination.

**Warning signs:**
- Running `grep -r "bg-white" src/` returns hits inside CVA strings
- Badge and Button variants have no `dark:` prefixed classes
- Dashboard calendar cells use `bg-white` and `bg-slate-50/80` directly

**Phase:** Design token / CSS variable foundation phase (must precede dark mode)

---

### Pitfall 4: Color Contrast Failures with Teal Brand Color

**What goes wrong:**
The chosen brand anchor `teal-500` (`#14b8a6`) on a white background has a contrast ratio of approximately 2.9:1 — failing WCAG AA (4.5:1 for normal text, 3:1 for large text). Using it as button text or label text on white cards will fail accessibility audits.

**Prevention:**
Use `teal-500` as a *background* for interactive elements (with white text on top: contrast ~4.5:1), not as colored text on a light surface. For text usage, shift to `teal-700` (`#0f766e`) which achieves ~5.5:1 on white. Document this in the design token file.

**Warning signs:**
- `text-teal-500` class used on light backgrounds
- No contrast check step in design token definition

**Phase:** Design token phase

---

## CSS Variable / Tailwind Conflicts

### Pitfall 5: CSS Variables Not Recognized by Tailwind's JIT Content Scanner

**What goes wrong:**
Tailwind's JIT compiler scans files listed in `content` and generates only the classes it finds as complete strings. CSS variable values set at runtime (e.g., `var(--color-brand)`) are not class strings — Tailwind will not generate utilities for them unless they are registered in `tailwind.config.js` or used with Tailwind's arbitrary value syntax in a scannable file.

**Why it happens in this project:**
`tailwind.config.js` currently extends the theme with named colors (`ink`, `mist`, `mint`, `amber`). When transitioning to CSS variable tokens, if the variables are only referenced in JavaScript/TypeScript at runtime (e.g., computed color classes assembled dynamically), the JIT scanner will not see them.

**Prevention (two valid strategies):**

Strategy A — Extend Tailwind config to reference CSS variables:
```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      surface: 'var(--color-surface)',
      'surface-muted': 'var(--color-surface-muted)',
      border: 'var(--color-border)',
      brand: 'var(--color-brand)',
    }
  }
}
```
Then write `bg-surface`, `text-brand` etc. as literal class strings in templates.

Strategy B — Use arbitrary values with safelist:
Add dynamically constructed classes to the Tailwind `safelist` array, or use them as complete string literals in template files so JIT can scan them.

**The critical rule:** Never construct Tailwind class names by string concatenation at runtime (e.g., `` `bg-${color}` ``). This is already partially violated in `App.vue` via `barColorClass` object — those classes must be complete strings (they currently are, which is correct).

**Warning signs:**
- Classes appear in source but are missing from the compiled CSS output
- Styles work in dev (full CSS) but break in production build (purged)
- Any template that builds class names with template literals

**Phase:** Design token foundation phase

---

### Pitfall 6: `@tailwind base` Reset Conflicts with Radix Vue Portal Styles

**What goes wrong:**
Tailwind's `@tailwind base` layer includes Preflight (a CSS reset based on modern-normalize). Radix Vue renders `DialogContent` and `TooltipContent` into a `<DialogPortal>` that appends to `document.body` outside the `#app` container. Preflight resets applied to the entire document affect these portal elements. Custom base styles (e.g., `body { @apply bg-mist text-ink; }`) may bleed into dialog overlays unexpectedly.

**Prevention:**
Keep all `@layer base` additions scoped to semantically appropriate elements. Avoid setting font or color on `body` when those styles should only apply to the app container. Instead set them on `#app` or `<main>`. Alternatively, ensure portal-rendered Radix components explicitly set their own background and text colors.

**Warning signs:**
- Dialog content inherits unexpected background from body styles
- Font size or line-height inside dialogs differs from the rest of the app
- `bg-mist text-ink` visible in dialog overlay

**Phase:** Design token / base styles phase

---

### Pitfall 7: `ring-offset-background` Token Used Without Definition

**What goes wrong:**
`Button.vue` uses `ring-offset-background` in its base class string. This is a Tailwind CSS variable reference (`--tw-ring-offset-color: var(--background)`). Without defining `--background` as a CSS variable, the ring offset color is undefined, falling back to transparent. This is a latent bug in the existing code that will become visible once the base layer is touched.

**Prevention:**
Either replace `ring-offset-background` with a concrete color (`ring-offset-white dark:ring-offset-slate-900`) or define `--background` as part of the CSS variable token system.

**Warning signs:**
- Focus rings on buttons have invisible or incorrect offset color
- No `--background` variable defined in `style.css`

**Phase:** Design token foundation phase (catch during token audit)

---

## Animation & Transition Pitfalls

### Pitfall 8: Vue `<Transition>` on `v-if` Causes Layout Thrash When Lists Re-render

**What goes wrong:**
Wrapping list items (todo cards, idea Kanban cards) in `<TransitionGroup>` causes Vue to apply `v-enter-active` / `v-leave-active` classes during the animation. If leave animations use `position: absolute` (required for smooth FLIP animations), other elements shift immediately — creating a jump before the animation completes. If they don't use `position: absolute`, leaving elements occupy space until the transition ends, causing layout thrash.

**Why it happens in this project:**
The todo list in `App.vue` renders `<li>` items with `v-for`. Adding `<TransitionGroup name="todo-list">` and animating `opacity` + `transform` on enter/leave without the FLIP technique will cause items below a deleted card to jump to their final position before the leaving card finishes fading.

**Prevention:**
Use `<TransitionGroup>` with `move-class` for the FLIP technique. Leaving elements must be `position: absolute` during leave so they do not affect document flow:

```css
.todo-list-leave-active {
  position: absolute;  /* REQUIRED for FLIP — remove from flow */
  width: 100%;
}
.todo-list-move {
  transition: transform 0.3s ease;
}
```

For Kanban cards, test drag-drop interactions specifically: `<TransitionGroup>` `move` transitions conflict with HTML5 drag-and-drop ghost positioning if the card list is mid-animation when a drop occurs.

**Warning signs:**
- Cards visibly jump or snap to position during delete
- Kanban lane heights flicker during moves
- Drop targets misalign when a transition is in progress

**Phase:** Animation system phase

---

### Pitfall 9: Tab Switch Transitions Interfere with Radix Tabs Aria State

**What goes wrong:**
Radix Vue's `TabsContent` manages `aria-hidden` and `data-state` attributes for accessibility. Adding a CSS `<Transition>` around the `TabsContent` slot — or animating `opacity: 0` during leave — can leave the tab content visible (opacity > 0) while Radix has already set `aria-hidden="true"`, creating a state where content is visually present but inaccessible to screen readers. The reverse also occurs: enter animations delay content becoming visible while `aria-hidden` is already `false`.

**Prevention:**
Do not wrap `<TabsContent>` in an additional `<Transition>`. Instead, animate using Tailwind's `data-[state=active]:` and `data-[state=inactive]:` selectors directly on `TabsContent`:

```html
<TabsContent
  value="todo"
  class="data-[state=inactive]:hidden data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-200"
>
```

This keeps Radix in control of visibility while CSS handles the animation. Do not use `overflow: hidden` on transitioning tabs or it will clip absolutely-positioned Radix tooltips/dropdowns.

**Warning signs:**
- Content visible during tab switch but screen reader reads it as hidden
- `data-state="inactive"` tab content briefly flashes during transitions
- Tabs flicker when switching rapidly (transition not cancelled)

**Phase:** Navigation and tab redesign phase

---

### Pitfall 10: `will-change` Applied Too Broadly Causes Compositing Layer Explosion

**What goes wrong:**
Adding `will-change: transform` or `will-change: opacity` to elements that are not actively animating forces the browser to promote them to separate GPU compositing layers *persistently*. With 30–50 visible todo cards and 3 Kanban columns, applying `will-change` to the card hover state via a static Tailwind class creates 30–50 permanent GPU layers, consuming video memory and causing scrolling jank on lower-end devices.

**Prevention:**
Apply `will-change` only during active animation via JavaScript, not via permanent CSS classes. In Tailwind, use `hover:` variants only for `transform` and `transition` — do not add `hover:will-change-transform` as a permanent class. For card hover effects, a CSS `transition: transform 0.2s, box-shadow 0.2s` without `will-change` is sufficient for 60fps on modern hardware.

```css
/* Correct: transition without will-change */
.card { transition: transform 0.15s ease, box-shadow 0.15s ease; }

/* Incorrect: permanent will-change on many elements */
.card { will-change: transform; } /* Do NOT do this */
```

**Warning signs:**
- DevTools Layers panel shows 40+ compositing layers for the todo list
- Scrolling performance degrades after adding hover animations
- Memory usage increases significantly on the Dashboard calendar (28+ cells)

**Phase:** Animation system phase

---

### Pitfall 11: Dialog Open/Close Transition Conflicts with `DialogPortal` Unmounting

**What goes wrong:**
Radix Vue's `DialogContent` is conditionally rendered via a `v-if` controlled by the `open` prop. When `open` becomes `false`, Radix immediately unmounts the portal content (after its built-in `data-[state=closed]` transition). If a custom Vue `<Transition>` wraps `<DialogContent>`, the Vue transition's `leave` phase and Radix's own close animation fire simultaneously, causing a double-animation flash or a premature unmount that cuts the animation short.

**Why it happens in this project:**
`FormDialog.vue` passes `open` directly to the Radix `<Dialog>` component. Radix Vue's `DialogContent` already has built-in CSS transition hooks via `data-[state=open]` and `data-[state=closed]` data attributes. Adding Vue transitions on top creates a conflict.

**Prevention:**
Use Radix's built-in data attribute animation hooks exclusively for dialog enter/leave:

```css
/* Use data attributes, not Vue transition classes */
[data-radix-dialog-content][data-state='open'] {
  animation: dialogIn 0.2s ease;
}
[data-radix-dialog-content][data-state='closed'] {
  animation: dialogOut 0.15s ease;
}
```

Do not add a Vue `<Transition>` wrapper around `<DialogContent>`.

**Warning signs:**
- Dialog snaps closed without animation despite CSS being present
- Dialog plays two different close animations simultaneously
- `data-state` attribute changes but animation doesn't trigger

**Phase:** Dialog redesign phase

---

## Responsive Retrofit Pitfalls

### Pitfall 12: Kanban Board Three-Column Grid Breaks on Mobile

**What goes wrong:**
The Idea Kanban uses `class="grid gap-3 lg:grid-cols-3"` — meaning it's already a single column below `lg` (1024px). However, individual Kanban cards have fixed-width flex layouts for their button rows (`flex flex-wrap gap-2`). On narrow screens, the four action buttons ("上一步", "下一步", "编辑", "转为任务") wrap onto multiple lines but the card padding assumes wider context. Cards become taller and harder to use on mobile.

**Prevention:**
When retrofitting mobile, test each component breakpoint independently. For Kanban cards, use `grid` for the button area with `grid-cols-2` at mobile and `flex` at `sm:` and above. Ensure the lane container has a minimum width that triggers horizontal scroll before collapsing below usable card size.

**Warning signs:**
- Buttons in Kanban cards wrap to 3 or 4 rows on iPhone-sized screens
- Cards in collapsed single-column view are taller than viewport
- Touch targets smaller than 44px (iOS minimum)

**Phase:** Responsive layout phase

---

### Pitfall 13: Dashboard Calendar Grid Is Fixed at 7 Columns and Cannot Adapt to Mobile

**What goes wrong:**
The Dashboard calendar uses `grid-cols-7` unconditionally. At 375px viewport, each cell is ~48px wide with `min-h-[140px]`. This renders the calendar completely unusable on mobile — 7 tiny columns with invisible text. The mini bar charts (`w-2`) become invisible at this scale.

The current code also renders a `lg:hidden` legend card and a `hidden lg:flex` floating legend separately, meaning there are two implementations of the same data — a maintenance liability during restyling.

**Prevention:**
For the calendar, provide two distinct layouts: the 7-column grid for `md:` and above, and a vertical list view (one row per day) for mobile. Do not attempt to make the 7-column grid "work" at 375px — it cannot. The data presentation model must change, not just the spacing. Factor this into phase planning as a non-trivial responsive task.

Consolidate the duplicate legend into a single component with responsive show/hide.

**Warning signs:**
- Calendar cells have `overflow-hidden` but content still clips
- Text inside cells becomes `text-[7px]` — illegible
- Two separate legend implementations diverge during restyling

**Phase:** Responsive layout phase (Dashboard is the hardest screen)

---

### Pitfall 14: `min-h-screen` on `<main>` Prevents Proper Mobile Scroll Behavior

**What goes wrong:**
`App.vue` uses `min-h-screen` on `<main>`. On mobile browsers (iOS Safari especially), `100vh` does not account for the address bar height, causing the content area to be taller than the visible viewport. This causes double scrollbars (body scroll + main scroll) or content being cut off behind the address bar.

**Prevention:**
Replace `min-h-screen` with `min-h-[100dvh]` (dynamic viewport height) or use CSS `min-height: 100svh` (small viewport height). `dvh` is supported in all modern browsers targeted by this project.

**Warning signs:**
- iOS Safari shows content cut off at the bottom
- Page scrolls twice (body and main)
- Fixed bottom elements appear behind the browser toolbar

**Phase:** Responsive layout phase (fix early, it affects all screens)

---

## Drag-and-Drop Style Pitfalls

### Pitfall 15: HTML5 Drag Ghost Image Does Not Respect Custom Card Styles

**What goes wrong:**
The existing Kanban uses native HTML5 drag-and-drop (`draggable="true"`, `@dragstart`, `@drop`). The browser-generated drag ghost image is a snapshot of the element's rendered appearance at drag-start time. After restyling (new rounded corners, shadows, teal accents), the ghost will correctly reflect the new appearance — *but* if the card uses `backdrop-blur`, gradients, or `backdrop-filter`, some browsers (particularly Firefox) render the ghost without filter effects, creating a visual mismatch.

**Prevention:**
After restyling, test drag behavior in Firefox specifically. If ghost rendering is unacceptable, use `event.dataTransfer.setDragImage()` with a custom element to control the ghost appearance. Alternatively, switch from native HTML5 drag to a pointer-events based drag library (though this is out of scope per project constraints).

**Warning signs:**
- Ghost image appears without box shadow or blur effects in Firefox
- Ghost image has wrong background color if CSS variable tokens are used
- Ghost is transparent or invisible on some platforms

**Phase:** Kanban redesign phase

---

### Pitfall 16: Drag Over Style Conflicts with Transition Animations on Lane Cards

**What goes wrong:**
A common pattern for drop target feedback is adding a `dragover` class to the lane card while an item is being dragged over it. If the lane Card component has a CSS `transition` on `border-color` or `background-color` (added during restyling for hover effects), the dragover state color change will also animate — creating a slow color fade when the user expects instant visual feedback during drag.

**Prevention:**
Use separate CSS classes for drag state that bypass transitions:

```css
.lane-drag-over {
  /* Override transition for instant drag feedback */
  transition: none !important;
  background-color: var(--color-surface-accent);
  border-color: var(--color-brand);
}
```

Track `isDragOver` state per lane in the component and apply the class conditionally. Currently `App.vue` only tracks `draggedIdeaId` globally — a `dragEnter`/`dragLeave` handler per lane is needed for visual feedback.

**Warning signs:**
- Drop zone highlight fades in slowly during active drag (looks like lag)
- Drop zone does not visually respond until transition completes
- Lane borders animate during rapid drag movements between lanes

**Phase:** Kanban redesign phase

---

### Pitfall 17: Existing Drag Race Condition Amplified by Animation State

**What goes wrong:**
`CONCERNS.md` documents an existing bug: "After dragging ideas between lanes rapidly, order values may become inconsistent." Adding animations to the Kanban cards means that during a rapid drag sequence, animated cards may be mid-transition when the store updates their position. Vue's reactivity will update the DOM, but CSS transitions will interpolate from the *current animated position*, not the expected start position — causing cards to appear to teleport or slide from wrong positions.

**Prevention:**
Do not animate Kanban card `top`/`left`/`transform` values that change during drag operations. Limit animations to: opacity on enter/leave, `box-shadow` on hover, and `scale` on drag-start. Avoid `<TransitionGroup>` on Kanban lists if the existing drag race condition has not been fixed first. The animation amplifies the visual impact of the data bug.

**Warning signs:**
- Cards slide to wrong positions after rapid drag operations
- Undo visible "snap" movement when animation resolves after store update
- `<TransitionGroup>` `move` animation fires when it should not

**Phase:** Kanban redesign phase — note dependency on drag bug fix in CONCERNS.md

---

## Performance Pitfalls

### Pitfall 18: Dashboard Calendar Renders 28–35 Animated Cells Simultaneously

**What goes wrong:**
The Dashboard calendar renders between 28 and 35 `<div>` cells (4–5 weeks × 7 days). If each cell has hover animations (scale, shadow, color), background gradients for heatmap intensity, and entering via `<TransitionGroup>` on month navigation, the browser must animate 30+ elements simultaneously. On low-end devices this causes dropped frames during month navigation.

**Prevention:**
- Animate the calendar *container* on month change (single element fade/slide), not individual cells
- Use CSS `opacity` only for cell enter — avoid `transform: scale()` on each cell
- Heatmap intensity should use CSS `background-color` with a CSS variable (single paint per change), not individual inline `background` style objects that bypass Tailwind's JIT
- The existing `miniBarHeight` uses inline `:style="{ height: ... }"` — this is correct and efficient; keep it

**Warning signs:**
- Month navigation causes a frame rate drop visible in DevTools Performance tab
- `<TransitionGroup>` applied to individual calendar cells
- Each cell has multiple separate `transition` properties

**Phase:** Dashboard redesign phase

---

### Pitfall 19: `backdrop-blur` on Floating Legend Causes Continuous Repaint

**What goes wrong:**
The floating legend on the Dashboard uses `bg-white/95 backdrop-blur`. `backdrop-blur` triggers a compositing layer and forces the browser to continuously repaint the area behind the element as it scrolls. In a long list view, this is a known performance issue — the blur must sample the pixels behind it on every scroll frame.

**Prevention:**
Replace `backdrop-blur` with a solid semi-transparent background and a subtle border:

```html
<!-- Instead of bg-white/95 backdrop-blur -->
class="bg-white/98 border border-slate-200/60 shadow-lg"
```

This eliminates the continuous repaint while maintaining the visual intent of "floating above content."

**Warning signs:**
- DevTools Performance shows "Recalculate Style" or "Paint" triggered on every scroll
- Layer count increases when legend is visible
- Scroll jank when the floating legend overlaps a list

**Phase:** Dashboard redesign phase

---

### Pitfall 20: CVA Class String Recalculation on Every Render

**What goes wrong:**
`Button.vue` and `Badge.vue` call `cn(buttonVariants({ variant, size }), props.class)` in the template expression. This runs on every render. `cva()` is cheap but not free — `cn()` from `clsx` + `tailwind-merge` has a measurable cost when called in a list of 50+ items (50 todo cards × multiple badges each = 100–200 CVA calls per render cycle).

**Prevention:**
Memoize the variant computation with `computed`:

```typescript
// In Button.vue
const resolvedClass = computed(() =>
  cn(buttonVariants({ variant: props.variant, size: props.size }), props.class)
);
```

This is a low-effort, high-impact fix that should be applied to all CVA components before the animation refactor.

**Warning signs:**
- Vue DevTools shows Button component re-rendering more than expected
- `cn()` function appears in profiler flamegraph for list renders

**Phase:** Component foundation phase (apply before list animations)

---

## Accessibility Pitfalls

### Pitfall 21: Restyling Radix Vue Components Without Preserving `data-state` and ARIA Hooks

**What goes wrong:**
Radix Vue components communicate state to assistive technologies via `data-*` attributes and ARIA attributes that it manages automatically. When restyling, developers sometimes add wrapper elements (`<div class="my-wrapper">`) around Radix primitives, which breaks the expected DOM structure. Specifically:

- Wrapping `<CheckboxRoot>` in a `<div>` breaks `<label>` association
- Wrapping `<TabsTrigger>` in a `<span>` breaks the `role="tab"` parent-child relationship
- Adding `pointer-events-none` overlay divs on top of interactive Radix elements blocks keyboard events

**Why it happens in this project:**
The `Checkbox.vue`, `TabsTrigger.vue`, and `DialogContent.vue` all wrap Radix primitives with custom classes via the `cn()` pattern — this is the **correct** approach. The risk is when the redesign phase adds structural wrapper elements to change layout without understanding that Radix's ARIA depends on its DOM tree shape.

**Prevention:**
Style through the `class` prop (via `cn()`), not through DOM structure changes. Never add wrapper elements between a Radix primitive and its expected parent/child. Test with keyboard-only navigation after every structural change: Tab, Enter, Space, Escape must all work on dialogs, checkboxes, and tabs.

**Warning signs:**
- `<label>` click no longer toggles checkbox
- Tab key does not navigate between tab triggers
- Escape does not close dialog after adding wrapper div to DialogContent

**Phase:** All component redesign phases — must be verified as exit criterion

---

### Pitfall 22: `focus-visible` Rings Removed or Made Invisible During Color Scheme Changes

**What goes wrong:**
All existing Radix-based components use `focus-visible:ring-2 focus-visible:ring-slate-400`. When switching to a teal brand color system, developers may replace `ring-slate-400` with `ring-teal-500` without checking contrast. On a white background, `ring-teal-500` has insufficient contrast against `bg-teal-50` (active button backgrounds). On dark mode, `ring-teal-500` on `bg-slate-900` has ~3:1 contrast ratio — below WCAG AA for focus indicators (3:1 is the minimum; some interpretations require 3:1 against both background and adjacent colors).

**Prevention:**
Use `ring-teal-600` (not `ring-teal-500`) for focus rings on light backgrounds. In dark mode, use `ring-teal-400`. Define focus ring color as a CSS variable:

```css
:root { --color-focus-ring: theme('colors.teal.600'); }
.dark { --color-focus-ring: theme('colors.teal.400'); }
```

Then update all components to `focus-visible:ring-[var(--color-focus-ring)]`.

**Warning signs:**
- Focus ring invisible on active/hover state backgrounds
- Keyboard-navigating between components loses visual focus indicator
- DevTools Accessibility audit flags low-contrast focus indicators

**Phase:** Design token phase (define focus color as a token before restyling components)

---

### Pitfall 23: `aria-label` and Accessible Names Lost When Icon-Only Buttons Are Added

**What goes wrong:**
The Dashboard's floating legend toggle uses `<button>` with a `<Minus>` or `<Plus>` icon and a `:title` attribute. `title` is not a reliable accessible name for screen readers (it is only surfaced on hover). If icon-only buttons are added during the redesign (e.g., a theme toggle with a sun/moon icon, or the legend toggle), they must have `aria-label` for screen reader support.

**Prevention:**
Any button containing only an icon (no visible text) must have `aria-label`:

```html
<button type="button" :aria-label="showFloatingLegend ? '收起图例' : '展开图例'">
  <Minus v-if="showFloatingLegend" />
  <Plus v-else />
</button>
```

Remove `:title` — it is redundant with `aria-label` and creates a tooltip on desktop hover that may conflict with custom tooltip components.

**Warning signs:**
- Icon-only buttons have only `:title` and no `aria-label`
- Screen reader announces "button" with no name
- Theme toggle button has no accessible label

**Phase:** All phases that introduce icon-only interactive elements

---

## Testing & Regression Pitfalls

### Pitfall 24: No Snapshot or Visual Baseline Means Style Regressions Are Invisible

**What goes wrong:**
The existing test suite covers store logic and dashboard calculations (unit tests only). There are zero component tests, zero visual tests, and zero E2E tests (confirmed in `CONCERNS.md`). During a visual refactor, the most common regressions are:

- A class removed from a component inadvertently changes layout
- A CVA variant renamed in `Button.vue` breaks all call sites silently (TypeScript catches variant name changes but not visual output)
- A `dark:` class missing from one component creates a contrast failure only visible in dark mode

**Prevention:**
Before beginning any UI changes, establish a regression baseline using one of:

1. **Playwright visual snapshots** — cheap, catches pixel-level regressions, runs in CI
2. **@vue/test-utils component tests** with snapshot serialization — already has `@vue/test-utils` installed

At minimum, write component tests for the three CVA components (`Button`, `Badge`, `Checkbox`) that assert the rendered class strings for each variant. These tests catch silent variant renames or class removals:

```typescript
// tests/components/button.spec.ts
it('renders destructive variant with correct classes', () => {
  const wrapper = mount(Button, { props: { variant: 'destructive' } });
  expect(wrapper.classes()).toContain('bg-red-500');
});
```

**Warning signs:**
- No test file in `tests/components/`
- Visual changes deployed without visual diff review
- A variant in `Badge.vue` or `Button.vue` renamed without TypeScript error at call sites

**Phase:** Foundation phase — establish baseline before first style change

---

### Pitfall 25: Dark Mode Not Tested in Automated Tests

**What goes wrong:**
Dark mode behavior cannot be tested by the existing unit tests because they run in jsdom without a real DOM. The `dark` class on `<html>` is a CSS concern — unit tests verify JS logic, not CSS application. The `dark:` Tailwind variants are compiled CSS; if the class is applied incorrectly, no unit test will catch it.

**Prevention:**
Use Playwright E2E tests with explicit dark mode setup:

```typescript
// tests/e2e/dark-mode.spec.ts
test('applies dark class to html on theme toggle', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="theme-toggle"]');
  const htmlClass = await page.evaluate(() => document.documentElement.className);
  expect(htmlClass).toContain('dark');
});

test('no flash of light theme in dark mode', async ({ page }) => {
  // Set dark in localStorage before navigation
  await page.addInitScript(() => localStorage.setItem('todo-plus:theme', 'dark'));
  await page.goto('/');
  // Take screenshot immediately — should not show white flash
  await expect(page).toHaveScreenshot('dark-initial-load.png');
});
```

**Warning signs:**
- No Playwright or Cypress installed in the project
- Dark mode only tested manually
- Theme toggle not given a `data-testid` attribute

**Phase:** Dark mode implementation phase

---

### Pitfall 26: Drag-and-Drop Cannot Be Tested With Existing Test Setup

**What goes wrong:**
The existing test suite tests `moveIdeaDrag()` in the store directly (unit level). There are no component-level tests for the actual drag events (`@dragstart`, `@drop`, `@dragover.prevent`). During the Kanban redesign, adding drag visual feedback requires touching `draggedIdeaId`, `onDragStart`, `onDropLane`, and the Kanban card template — any of which can break the drag interaction without the store tests catching it.

**Prevention:**
Use `@vue/test-utils` to simulate drag events at the component level:

```typescript
const ideaCard = wrapper.find('[draggable="true"]');
await ideaCard.trigger('dragstart');
// assert draggedIdeaId state
const lane = wrapper.find('[data-lane="evaluate"]');
await lane.trigger('drop');
// assert ideaStore.moveIdeaDrag was called
```

Note: jsdom does not fully implement `DataTransfer` — use `vi.spyOn` on the store action rather than asserting on the final DOM state.

**Warning signs:**
- No component test file for the Kanban board
- Drag interaction tested only via store unit tests
- `draggedIdeaId` reactive ref never asserted in tests

**Phase:** Kanban redesign phase

---

## Phase-Specific Warning Summary

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Design token / CSS variable setup | Pitfall 5: JIT scanner misses CSS variables | Extend Tailwind config with CSS variable color names |
| Design token / CSS variable setup | Pitfall 7: `ring-offset-background` undefined | Audit existing CVA strings for undefined token references |
| Dark mode implementation | Pitfall 1: FOUT on load | Blocking inline script in `index.html` before first paint |
| Dark mode implementation | Pitfall 2: `darkMode: 'class'` missing | Add to `tailwind.config.js` as first change |
| Dark mode implementation | Pitfall 3: 80+ hardcoded colors in CVA | Use semantic tokens before writing `dark:` classes |
| Dark mode implementation | Pitfall 25: No automated dark mode test | Add Playwright test with `addInitScript` |
| Component foundation | Pitfall 20: CVA recalculates on every render | Memoize with `computed` in CVA components |
| Component foundation | Pitfall 24: No visual baseline | Write variant class assertion tests before any style change |
| Navigation / Tab redesign | Pitfall 9: Vue Transition conflicts with Radix Tabs aria | Use `data-[state]` CSS selectors, not `<Transition>` wrapper |
| Dialog redesign | Pitfall 11: Double animation on dialog close | Use only Radix `data-[state]` hooks, no Vue `<Transition>` |
| Dialog redesign | Pitfall 6: Tailwind base bleeds into portal | Set colors on `#app`, not `body` |
| Responsive layout | Pitfall 14: `min-h-screen` broken on iOS Safari | Replace with `min-h-[100dvh]` |
| Responsive layout | Pitfall 13: Dashboard calendar unworkable at mobile | Plan separate mobile layout — 7-col grid cannot shrink |
| Responsive layout | Pitfall 12: Kanban button row wraps badly on mobile | Use `grid-cols-2` for card buttons at mobile |
| Animation system | Pitfall 8: `<TransitionGroup>` layout thrash on delete | `position: absolute` on leaving element |
| Animation system | Pitfall 10: `will-change` on hover classes | Never use `will-change` in static Tailwind hover classes |
| Kanban redesign | Pitfall 15: HTML5 drag ghost ignores CSS filters | Test in Firefox; use `setDragImage` fallback |
| Kanban redesign | Pitfall 16: Drop zone transition slows feedback | `transition: none` on drag-over state |
| Kanban redesign | Pitfall 17: Existing race condition amplified by animation | Fix drag bug before adding Kanban animations |
| Kanban redesign | Pitfall 26: No drag component test | Add `@vue/test-utils` drag event simulation test |
| Dashboard redesign | Pitfall 18: 30+ animated cells on month change | Animate container, not individual cells |
| Dashboard redesign | Pitfall 19: `backdrop-blur` causes repaint | Replace with solid semi-transparent background |
| All phases | Pitfall 21: Wrapper divs break Radix ARIA | Style via `class` prop only; no DOM structure changes |
| All phases | Pitfall 22: Focus rings low-contrast after color change | Define `--color-focus-ring` token in Phase 1 |
| All phases | Pitfall 23: Icon-only buttons lack `aria-label` | Replace `:title` with `aria-label` on icon buttons |
| All phases | Pitfall 4: `teal-500` fails contrast as text | Use `teal-700` for text, `teal-500` for backgrounds only |

---

## Sources

**Confidence levels:**

- Pitfalls 1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 14, 15, 20, 21, 22, 23, 24: HIGH — derived directly from reading the codebase (code evidence cited) combined with well-established Vue 3 / Tailwind v3 / Radix Vue documented behaviors
- Pitfalls 12, 13, 16, 17, 18, 25, 26: HIGH — derived from codebase code reading plus standard HTML5 API / browser behavior knowledge
- Pitfall 4 (contrast ratios): MEDIUM — contrast ratio values computed from standard WCAG formula applied to known hex values; not verified against WCAG 3.0 criteria which may differ
- Pitfall 19 (`backdrop-blur` repaint): MEDIUM — established browser compositing behavior; specific performance impact is device-dependent

**References (no web search available; sources are authoritative documentation known at training cutoff):**
- Tailwind CSS v3 Dark Mode documentation: https://tailwindcss.com/docs/dark-mode
- Tailwind CSS v3 Content configuration: https://tailwindcss.com/docs/content-configuration
- Radix Vue Dialog documentation: https://www.radix-vue.com/components/dialog
- Radix Vue Tabs documentation: https://www.radix-vue.com/components/tabs
- Vue 3 `<TransitionGroup>` FLIP documentation: https://vuejs.org/guide/built-ins/transition-group
- WCAG 2.1 Focus Visible criterion (2.4.7): https://www.w3.org/WAI/WCAG21/Understanding/focus-visible

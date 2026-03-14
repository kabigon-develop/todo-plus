---
phase: 01-token
plan: "02"
subsystem: ui
tags: [tailwind, css-variables, dark-mode, pinia, vue3, tokens]

# Dependency graph
requires:
  - phase: 01-token-01
    provides: CSS variables defined in style.css (--color-primary, --surface-*, --text-*, --border-*, --priority-*)
provides:
  - Tailwind darkMode class strategy + CSS variable token registration in tailwind.config.js
  - ui store Theme type, theme state, toggleTheme(), hydrateTheme() in src/stores/ui.ts
  - FOUT anti-flash inline script in index.html head
  - All UI components migrated from hardcoded slate/white colors to semantic token classes
  - App.vue theme toggle button (Sun/Moon icons) with hydrateTheme on mount
affects:
  - 01-comp (components will build on these semantic token classes)
  - 01-page (pages use surface/foreground/muted tokens)
  - 02-layout (any new layout components should use token classes)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - darkMode via 'class' strategy on html element
    - CSS variables registered in tailwind.config.js as theme.extend.colors with full var() references
    - FOUT prevention via synchronous inline script before viewport meta tag
    - hydrateTheme() reads existing DOM state without modifying it (source of truth = classList)
    - Theme toggle stores preference in localStorage with try/catch guard

key-files:
  created:
    - tests/stores/ui.test.ts
  modified:
    - tailwind.config.js
    - src/stores/ui.ts
    - index.html
    - src/App.vue
    - src/components/ui/button/Button.vue
    - src/components/ui/badge/Badge.vue
    - src/components/ui/card/Card.vue
    - src/components/ui/input/Input.vue
    - src/components/ui/checkbox/Checkbox.vue
    - src/components/ui/dialog/DialogContent.vue
    - src/components/ui/dialog/DialogDescription.vue
    - src/components/ui/select/Select.vue
    - src/components/ui/tabs/TabsList.vue
    - src/components/ui/tabs/TabsTrigger.vue
    - src/components/ui/tabs/TabsContent.vue

key-decisions:
  - "jsdom 24 + Vue 3 + vitest 0.34.6 incompatible: switched ui.test.ts to node environment with manual classList mock"
  - "Badge warning/success/destructive/info variants retain emerald/amber/red/sky Tailwind scale colors (phase 2 COMP-02 migration)"
  - "Button default variant uses bg-foreground/text-surface-base (transitional semantic, phase 2 will consider bg-primary)"
  - "Header gradient from-slate-900 to-slate-700 retained as visual design feature (phase 3 PAGE-01 redesign)"
  - "barColorClass emerald/orange chart colors retained as dashboard-specific semantic colors (phase 3 PAGE-03)"
  - "hydrateTheme reads classList on mount rather than localStorage, avoiding hydration mismatch with FOUT script"

patterns-established:
  - "Semantic token class naming: bg-surface-card (not bg-white), text-muted (not text-slate-500), border-border (not border-slate-200)"
  - "Focus ring pattern: ring-border-focus ring-offset-surface-card"
  - "Theme toggle: toggleTheme() updates class + localStorage; hydrateTheme() reads class on mount"

requirements-completed: [TOKEN-02, TOKEN-03]

# Metrics
duration: 9min
completed: 2026-03-14
---

# Phase 1 Plan 02: Token Infrastructure + Global Class Migration Summary

**Tailwind CSS variables registered as semantic utility classes (bg-surface-card, text-foreground, border-border), darkMode class strategy active, FOUT-free theme toggle with localStorage persistence, all 12 UI component files migrated from hardcoded slate/white colors**

## Performance

- **Duration:** 9 min
- **Started:** 2026-03-14T12:25:01Z
- **Completed:** 2026-03-14T12:34:08Z
- **Tasks:** 2 of 3 complete (Task 3 is human-verify checkpoint)
- **Files modified:** 15

## Accomplishments
- tailwind.config.js: darkMode class + full CSS variable token registration (primary, surface, foreground, muted, subtle, border, priority)
- ui.ts: Theme type, theme state, toggleTheme() (class + localStorage), hydrateTheme() (read-only)
- index.html: FOUT-prevention synchronous inline script placed before viewport meta
- All 11 UI component files + App.vue migrated to semantic token classes - zero bg-white/bg-slate-*/text-slate-*/border-slate-* remaining
- App.vue: Sun/Moon theme toggle button in header, hydrateTheme() called on mount

## Task Commits

Each task was committed atomically:

1. **Test RED: ui store theme tests** - `3ff9cfe` (test)
2. **Task 1: tailwind.config.js + ui.ts + index.html** - `1380a2e` (feat)
3. **Task 2: Global class name replacement** - `f1371ed` (feat)

_Note: Task 1 had a RED test commit before the GREEN implementation commit_

## Files Created/Modified
- `tailwind.config.js` - darkMode: 'class', CSS var token registration, old ink/mist/mint/amber removed
- `src/stores/ui.ts` - Theme type, theme state, toggleTheme(), hydrateTheme()
- `index.html` - FOUT anti-flash inline script in head
- `src/App.vue` - All semantic token classes, theme toggle button (Sun/Moon), hydrateTheme in onMounted
- `src/components/ui/button/Button.vue` - ring-border-focus, ring-offset-surface-card, semantic variants
- `src/components/ui/badge/Badge.vue` - default/secondary migrated; status variants noted for phase 2
- `src/components/ui/card/Card.vue` - border-border, bg-surface-card, text-foreground
- `src/components/ui/input/Input.vue` - border-border, bg-surface-card, text-foreground, placeholder text-subtle
- `src/components/ui/checkbox/Checkbox.vue` - ring-offset-surface-card, ring-border-focus
- `src/components/ui/dialog/DialogContent.vue` - bg-surface-elevated, border-border, bg-[--overlay] overlay
- `src/components/ui/dialog/DialogDescription.vue` - text-muted
- `src/components/ui/select/Select.vue` - border-border, bg-surface-card, text-foreground/muted
- `src/components/ui/tabs/TabsList.vue` - bg-surface-base, text-muted
- `src/components/ui/tabs/TabsTrigger.vue` - text-muted, data-[state=active] bg-surface-card text-foreground
- `src/components/ui/tabs/TabsContent.vue` - ring-offset-surface-card, ring-border-focus
- `tests/stores/ui.test.ts` - 6 tests for toggleTheme() and hydrateTheme() behaviors

## Decisions Made
- jsdom 24 + Vue 3 + vitest 0.34.6 incompatible: used node environment with manual classList mock in tests
- Badge status variants (warning/success/destructive/info) retain emerald/amber/red/sky pending phase 2 COMP-02
- Button default variant: bg-foreground transitional (not bg-primary yet)
- Header gradient kept as visual design element until phase 3 PAGE-01

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] jsdom 24 + Vue 3 incompatibility in vitest 0.34.6**
- **Found during:** Task 1, TDD RED phase
- **Issue:** `// @vitest-environment jsdom` + any Vue import throws `InvalidCharacterError: The string to be decoded contains invalid characters` in jsdom 24.x
- **Fix:** Switched to node environment (matching existing test convention) and added a manual classList mock (`makeClassList()`) in the test file
- **Files modified:** tests/stores/ui.test.ts
- **Verification:** All 6 tests pass in node environment; existing 14 tests unaffected
- **Committed in:** 3ff9cfe then updated in 1380a2e

**2. [Plan inconsistency noted] Badge amber classes in verify grep**
- **Found during:** Task 2 final verification
- **Issue:** Plan's verify grep `bg-amber\b` matches `bg-amber-100` in Badge.vue warning variant, but plan also explicitly says to retain badge status colors until phase 2. The grep check was not updated to reflect this exception.
- **Fix:** Badge warning variant `bg-amber-100 text-amber-700` retained with comment noting phase 2 migration. Second grep (bg-white/bg-slate-/text-slate-/border-slate-) returns 0 results.
- **Files modified:** none (documented discrepancy)
- **Impact:** None - this is a plan documentation inconsistency, not a code issue

---

**Total deviations:** 2 (1 auto-fixed blocking, 1 plan inconsistency documented)
**Impact on plan:** jsdom fix necessary to run tests at all; badge retention follows plan intent despite grep inconsistency.

## Issues Encountered
- jsdom 24 + Vue 3 + vitest 0.34.6 compatibility issue required switching from per-file `@vitest-environment jsdom` to node environment with manual DOM mock

## Awaiting Human Verification (Task 3)
Steps for verifier:
1. Run `npx vite dev`, open http://localhost:5173
2. Confirm normal display (light theme, no layout issues)
3. Click theme toggle button (top-right of header) - confirm instant dark mode, no white flash
4. Refresh page - confirm dark theme persists
5. Toggle back to light, refresh - confirm light persists
6. Check Todo/Kanban/Dashboard tabs in both themes
7. DevTools Console: no errors
8. DevTools Elements: html element gains/loses `dark` class on toggle

## Next Phase Readiness
- Token infrastructure complete - all CSS variables registered as Tailwind utilities
- Dark mode toggle functional with localStorage persistence and FOUT prevention
- Pending: human visual verification of theme switching (Task 3)
- After Task 3 approval: Token phase fully complete, ready for Component phase (01-comp)

---
*Phase: 01-token*
*Completed: 2026-03-14*

## Self-Check: PASSED

- tailwind.config.js: FOUND, contains darkMode: 'class' and var(--color-primary)
- src/stores/ui.ts: FOUND, contains hydrateTheme
- index.html: FOUND, contains localStorage.getItem('theme')
- tests/stores/ui.test.ts: FOUND, 6 tests passing
- All commits verified: 3ff9cfe, 1380a2e, f1371ed
- No bg-white/bg-slate-/text-slate-/border-slate- remaining in src/*.vue files

# Coding Conventions

**Analysis Date:** 2026-03-13

## Naming Patterns

**Files:**
- TypeScript/Vue source: `camelCase.ts`, `camelCase.vue` (e.g., `todo.ts`, `App.vue`, `Tabs.vue`)
- Store files: `<entityName>.ts` in `src/stores/` (e.g., `todo.ts`, `idea.ts`, `types.ts`)
- Component files: `PascalCase.vue` (e.g., `FormDialog.vue`, `TodoFormFields.vue`)
- UI component directories: lowercase with `index.ts` barrel exports (e.g., `src/components/ui/button/index.ts`)
- Test files: `.spec.ts` suffix (e.g., `todo.spec.ts`)

**Functions:**
- camelCase for all functions (e.g., `useTodoStore`, `splitTags`, `buildMonthlyDashboard`)
- Composable/hook functions: `use<Feature>` prefix for Pinia stores (e.g., `useTodoStore`, `useIdeaStore`)
- Helper functions: simple camelCase (e.g., `buildMonthlyDashboard`, `getDailyMetricMax`, `buildCalendarWeeks`)
- Event handlers in components: `on<Event><Action>` pattern (e.g., `onDragStart`, `onDropLane`, `onMounted`)
- Form submission: `submit<Form>` pattern (e.g., `submitTodoForm`, `submitIdeaForm`)
- Validation: `validate<Form>` pattern (e.g., `validateTodoForm`)

**Variables:**
- camelCase for all variables (e.g., `dialogOpen`, `editingTodoId`, `dailyMetricMax`)
- Boolean flags: `is<Feature>` or direct boolean naming (e.g., `hasSelected`, `showFloatingLegend`)
- Reactive objects: lowercase descriptive names (e.g., `todoForm`, `ideaForm`, `barColorClass`)
- Local helper functions: camelCase (e.g., `localIso`, `splitTags`)
- Constants in stores: UPPER_SNAKE_CASE (e.g., `STORAGE_KEY`)

**Types:**
- Interfaces: `PascalCase` with `I` prefix optional, but typically omitted (e.g., `Todo`, `Idea`, `TodoState`)
- Union types: PascalCase with descriptive names (e.g., `Priority`, `TodoFilter`, `IdeaStatus`, `DialogType`)
- Generic/discriminated types: PascalCase (e.g., `DashboardDailyRow`, `DashboardMonthlyTotals`)

## Code Style

**Formatting:**
- Tool: Prettier (assumed from standard Vue+TypeScript setup)
- Line length: Not explicitly constrained, but generally follows standard practices
- Imports: `import` statements at top of file in organized groups

**Linting:**
- Tool: ESLint with TypeScript support (inferred from `tsconfig.app.json`)
- TypeScript strict mode: Enabled in `tsconfig.app.json`
- Module resolution: `Bundler` mode with path aliasing

## Import Organization

**Order:**
1. Vue core imports (`vue`)
2. Third-party framework/library imports (`pinia`, `radix-vue`, `lucide-vue-next`)
3. Internal UI component imports (from `@/components/`)
4. Internal utility imports (from `@/lib/`)
5. Internal store imports (from `@/stores/`)

**Path Aliases:**
- `@/` → `src/` (configured in `tsconfig.app.json` and `vite.config.ts`)
- Used throughout for clean, relative-path-independent imports

**Example pattern from `src/App.vue`:**
```typescript
import { computed, onMounted, reactive, ref } from 'vue';
import { Minus, Plus } from 'lucide-vue-next';
import { Badge } from '@/components/ui/badge';
import { buildMonthlyDashboard, getDailyMetricMax, shiftMonth } from '@/lib/dashboard';
import { useIdeaStore } from '@/stores/idea';
import type { Idea, Priority } from '@/stores/types';
```

## Error Handling

**Patterns:**
- Try-catch used for localStorage operations in stores (hydrate method)
  ```typescript
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as TodoState;
    this.todos = parsed.todos ?? [];
  } catch {
    this.$reset();
  }
  ```
- Defensive null checks: `if (!target) return;` before mutations
- Optional chaining: `parsed.todos ?? []` for providing defaults
- Invalid date handling: `Number.isNaN(date.getTime())` check before use

**Error display:**
- Form validation errors stored in reactive error objects (e.g., `todoErrors.title`)
- Error cleared on form reset: `todoErrors.title = '';`
- Validation function returns boolean, caller decides action

## Logging

**Framework:** No logging framework detected; uses browser console implicitly

**Patterns:**
- No explicit logging patterns found in codebase
- Development mode likely relies on Vue DevTools and browser console
- Production errors handled via try-catch and error state

## Comments

**When to Comment:**
- Not extensively used in current codebase
- Complex logic documented minimally (e.g., dashboard calculation functions)
- Focus on self-documenting code through clear naming

**JSDoc/TSDoc:**
- Not used in current codebase
- Rely on TypeScript type annotations for documentation

## Function Design

**Size:** Functions are kept relatively small, typically 5-30 lines

**Parameters:**
- Use object parameters for multiple related arguments
  ```typescript
  addTodo(payload: {
    title: string;
    description?: string;
    priority: Priority;
    dueDate?: string;
    tags: string[];
  })
  ```
- Single parameter patterns avoided in favor of explicit payloads

**Return Values:**
- Explicit return types on public functions and store actions
- Often return the created/modified entity ID or null for conditional operations
- Void return for simple state mutations

## Module Design

**Exports:**
- Named exports for types and interfaces
- Default export for Pinia stores (via `defineStore`)
- Barrel exports for UI components: `export { default as Button } from './Button.vue';`

**Barrel Files:**
- Each UI component has `index.ts` in its directory
- Example `src/components/ui/button/index.ts`:
  ```typescript
  export { default as Button } from './Button.vue';
  ```
- Central barrel: `src/stores/types.ts` exports all type definitions

**Store composition:**
- State initialization in default factory: `const defaultState = (): TodoState => ({ ... })`
- Getters for filtered/computed data
- Actions for mutations and side effects (localStorage persist)
- No separate action files; all in store definition

---

*Convention analysis: 2026-03-13*

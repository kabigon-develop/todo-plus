# Architecture

**Analysis Date:** 2026-03-13

## Pattern Overview

**Overall:** Component-driven Vue 3 frontend with state management via Pinia and client-side persistence. Single Page Application (SPA) architecture with tabbed interface for feature separation.

**Key Characteristics:**
- Vue 3 with Composition API and TypeScript
- Pinia for centralized state management
- localStorage-based persistence (no backend)
- Tab-based UI with three main features (Tasks, Ideas, Dashboard)
- Radix Vue for accessible UI components
- Tailwind CSS for styling
- Date-based metrics aggregation for dashboard visualization

## Layers

**Presentation Layer (Views & Components):**
- Purpose: Render UI and handle user interactions
- Location: `src/components/`, `src/App.vue`
- Contains: UI components (Button, Card, Input, Dialog, Tabs), Form components (FormDialog, TodoFormFields, IdeaFormFields)
- Depends on: Pinia stores, UI utilities, type definitions
- Used by: Vue router/tab navigation

**State Management Layer (Stores):**
- Purpose: Manage application state, business logic, and persistence
- Location: `src/stores/`
- Contains: `todo.ts` (task state), `idea.ts` (idea state), `ui.ts` (UI state), `types.ts` (shared type definitions)
- Depends on: localStorage API, date utilities
- Used by: All Vue components

**Business Logic & Utilities Layer (lib):**
- Purpose: Pure functions for data transformations and dashboard calculations
- Location: `src/lib/`
- Contains: `dashboard.ts` (metrics aggregation, calendar building), `utils.ts` (CSS utilities)
- Depends on: Type definitions from stores
- Used by: Components, stores

**Styling Layer:**
- Purpose: Style system configuration
- Location: `tailwind.config.js`, CSS utilities via `clsx` and `tailwind-merge`
- Contains: Theme configuration, design tokens
- Used by: All components via class-based styling

## Data Flow

**Task Management Flow:**
1. User interacts with Task tab (create/edit/delete/complete)
2. App.vue collects form input via reactive state (`todoForm`)
3. Form validation occurs in App.vue (`validateTodoForm`)
4. On submit, `useTodoStore` action is called (addTodo/updateTodo/removeTodo)
5. Store updates internal state array and persists to localStorage
6. Computed getter `filteredTodos` re-evaluates based on search/filter state
7. Template re-renders with updated task list

**Idea Management Flow:**
1. User creates or edits idea in Idea tab (kanban board)
2. Ideas are organized by three statuses: idea → evaluate → execute
3. Drag-and-drop moves ideas between lanes via `moveIdeaDrag` action
4. Ideas in "execute" status can convert to tasks via `convertToTodo`
5. Store maintains order tracking within each status lane
6. All changes persisted via `ideaStore.persist()`

**Dashboard Data Flow:**
1. Dashboard tab triggers `buildMonthlyDashboard(todos, ideas, date)` computation
2. Pure function iterates all todos/ideas and maps events to calendar days
3. Counts track: todoCreated, todoUpdated, ideaCreated, ideaUpdated per day
4. Returns structured `DashboardMonthlyData` with daily rows and monthly totals
5. `buildCalendarWeeks` transforms flat daily array into calendar grid (7-column weeks)
6. UI renders mini bar charts showing daily metrics with color coding

**State Persistence:**
1. Every mutation in stores calls `persist()` method
2. `persist()` serializes state to JSON string
3. Stored under specific key (e.g., "todo-plus:todos", "todo-plus:ideas") in localStorage
4. On app mount, `hydrate()` loads persisted state from localStorage
5. Graceful fallback to default state if parsing fails

## Key Abstractions

**Store (Pinia):**
- Purpose: Centralized state container with getters and actions
- Examples: `useTodoStore()`, `useIdeaStore()`, `useUiStore()`
- Pattern: State properties, computed getters, action methods that mutate state and call persist()

**Type System:**
- Purpose: Type-safe data structures across application
- Examples: `Todo`, `Idea`, `Priority`, `IdeaStatus`, `TodoFilter`
- Location: `src/stores/types.ts`
- Pattern: Exported interfaces and union types used throughout stores and components

**Dashboard Utilities:**
- Purpose: Pure functions for metrics calculation and calendar transformation
- Examples: `buildMonthlyDashboard()`, `buildCalendarWeeks()`, `getDailyMetricMax()`
- Pattern: Functional, deterministic, no side effects, testable

**UI Component Library:**
- Purpose: Reusable, styled UI primitives with Radix Vue base
- Location: `src/components/ui/` (Badge, Button, Card, Checkbox, Dialog, Input, Select, Tabs)
- Pattern: Each component has index.ts barrel export; styles via Tailwind classes; props for configuration

## Entry Points

**Application Root:**
- Location: `src/main.ts`
- Triggers: Webpack/Vite module loading → App initialization
- Responsibilities: Create Vue app instance, initialize Pinia store, mount to #app DOM element

**Main Component:**
- Location: `src/App.vue`
- Triggers: Vue app mount
- Responsibilities: Tab routing, form state management, dialog lifecycle, store action dispatch, data binding to child components

**Store Initialization:**
- Location: `src/stores/todo.ts`, `src/stores/idea.ts`, `src/stores/ui.ts`
- Triggers: First store access via `useXxxStore()` hook
- Responsibilities: Load persisted state via `hydrate()`, provide actions/getters, manage state mutations

## Error Handling

**Strategy:** Silent fallback with console error catching

**Patterns:**
- Store `hydrate()` methods wrap localStorage parse in try-catch, reset to default state on error
- Form validation returns boolean; submission blocked if validation fails
- Idea-to-todo conversion checks preconditions (idea exists, status is 'execute', not already converted)
- No explicit error boundaries; validation happens at action entry points

## Cross-Cutting Concerns

**Logging:** No logging framework. Debug via browser console or store state inspection.

**Validation:** Form-level in App.vue (required title check); action-level in stores (null checks, existence checks before mutation).

**Authentication:** None. Application is client-side only with no user accounts.

**Persistence:** Every store action calls `persist()` to update localStorage. No undo/redo capability.

**Timestamps:** ISO 8601 strings created via `new Date().toISOString()`. Dashboard uses local time conversion for day grouping.

---

*Architecture analysis: 2026-03-13*

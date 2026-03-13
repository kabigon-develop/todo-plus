# Codebase Structure

**Analysis Date:** 2026-03-13

## Directory Layout

```
todo-plus/
├── src/                        # Source code
│   ├── App.vue                # Root Vue component (main view orchestrator)
│   ├── main.ts                # Application entry point
│   ├── style.css              # Global CSS
│   ├── components/            # Vue components
│   │   ├── ui/                # Reusable UI components (Radix Vue primitives)
│   │   │   ├── badge/
│   │   │   ├── button/
│   │   │   ├── card/
│   │   │   ├── checkbox/
│   │   │   ├── dialog/
│   │   │   ├── input/
│   │   │   ├── select/
│   │   │   └── tabs/
│   │   └── forms/             # Form components for domain logic
│   │       ├── FormDialog.vue
│   │       ├── TodoFormFields.vue
│   │       └── IdeaFormFields.vue
│   ├── stores/                # Pinia state management
│   │   ├── types.ts           # Shared TypeScript type definitions
│   │   ├── todo.ts            # Todo store
│   │   ├── idea.ts            # Idea store
│   │   └── ui.ts              # UI state store
│   ├── lib/                   # Utility functions and helpers
│   │   ├── utils.ts           # General utilities (cn function)
│   │   └── dashboard.ts       # Dashboard calculations
│   └── views/                 # (Empty directory, reserved for future views)
├── tests/                     # Test files
│   ├── setup.ts               # Test environment configuration
│   ├── stores/
│   │   ├── todo.spec.ts
│   │   └── idea.spec.ts
│   └── lib/
│       └── dashboard.spec.ts
├── docs/                      # Documentation
│   ├── plans/                 # Project planning documents
│   └── todo-plus-regression-checklist.md
├── scripts/                   # Build and utility scripts
│   └── mcp-smoke.mjs          # Smoke test script
├── public/                    # Static assets
├── dist/                      # Build output (generated)
├── index.html                 # HTML template
├── package.json               # Project dependencies and scripts
├── tsconfig.json              # TypeScript base configuration
├── tsconfig.app.json          # TypeScript app configuration
├── tsconfig.node.json         # TypeScript Node configuration
├── vite.config.ts             # Vite bundler configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS configuration
├── components.json            # UI component metadata (Radix Vue)
└── .gitignore                 # Git ignore rules
```

## Directory Purposes

**src/**
- Purpose: All application source code (Vue components, stores, utilities)
- Contains: Vue components, Pinia stores, utility functions
- Key files: `App.vue` (entry point), `main.ts` (bootstrapper)

**src/components/**
- Purpose: Reusable Vue components organized by category
- Contains: UI primitives and domain-specific form components
- Pattern: Each component gets its own subdirectory with the component file and barrel export

**src/components/ui/**
- Purpose: Radix Vue primitive components styled with Tailwind CSS
- Contains: Button, Card, Dialog, Input, Select, Tabs, Badge, Checkbox
- Pattern: Each UI component has its own directory with `[ComponentName].vue` and `index.ts` for barrel export

**src/components/forms/**
- Purpose: Domain-specific form components (not generic UI primitives)
- Contains: `FormDialog.vue` (shared dialog wrapper), `TodoFormFields.vue`, `IdeaFormFields.vue`
- Key difference: Form components handle domain validation and field organization for Todos and Ideas

**src/stores/**
- Purpose: Pinia state management stores
- Contains: Todo state, Idea state, UI state, and shared type definitions
- Pattern: `[domain].ts` for each store, `types.ts` for all shared interfaces

**src/lib/**
- Purpose: Utility functions and helpers
- Contains: General utilities (`utils.ts` - `cn` function) and feature-specific utilities (`dashboard.ts`)
- Key files: `dashboard.ts` (calendar building, metric calculations), `utils.ts` (CSS class merging)

**tests/**
- Purpose: Test suites co-located by feature
- Contains: Unit tests for stores and lib utilities
- Pattern: Parallel structure to `src/` with `.spec.ts` files

**docs/**
- Purpose: Project documentation and plans
- Contains: Regression checklists, project plans
- Key files: `todo-plus-regression-checklist.md`

**scripts/**
- Purpose: Utility scripts for development and testing
- Contains: MCP smoke tests
- Key files: `mcp-smoke.mjs`

## Key File Locations

**Entry Points:**
- `src/main.ts`: Application bootstrap (creates Vue app, configures Pinia)
- `src/App.vue`: Root Vue component (orchestrates all tabs and dialogs)
- `index.html`: HTML template with `<div id="app"></div>` mount point

**Configuration:**
- `vite.config.ts`: Build configuration with path alias `@` pointing to `src/`
- `tsconfig.json`: TypeScript base configuration
- `tsconfig.app.json`: TypeScript app-specific configuration
- `tailwind.config.js`: Tailwind CSS customization
- `components.json`: Radix Vue component metadata

**Core Logic:**
- `src/stores/todo.ts`: Todo CRUD and filtering logic
- `src/stores/idea.ts`: Idea CRUD and kanban board logic
- `src/lib/dashboard.ts`: Monthly metrics aggregation and calendar building

**Testing:**
- `tests/setup.ts`: Test environment initialization
- `tests/stores/*.spec.ts`: Store unit tests
- `tests/lib/*.spec.ts`: Utility function tests

## Naming Conventions

**Files:**
- Vue components: PascalCase (e.g., `FormDialog.vue`, `Button.vue`)
- Stores: camelCase with `.ts` extension (e.g., `todo.ts`, `idea.ts`)
- Utils/helpers: camelCase with `.ts` extension (e.g., `utils.ts`, `dashboard.ts`)
- Test files: Match source file name with `.spec.ts` suffix (e.g., `todo.spec.ts`)
- Type definition files: `types.ts` for shared interfaces

**Directories:**
- Feature directories: lowercase plural or camelCase (e.g., `components`, `stores`, `lib`, `forms`, `ui`)
- Component groupings: lowercase (e.g., `button`, `dialog`, `tabs`, `select`)

**Components:**
- Store names: camelCase (e.g., `useTodoStore`, `useIdeaStore`, `useUiStore`)
- Function names: camelCase (e.g., `splitTags()`, `resetTodoForm()`, `validateTodoForm()`)
- Variable names: camelCase (e.g., `todoForm`, `dialogType`, `editingTodoId`)
- Boolean variables: prefix with `has`, `is`, or `show` (e.g., `hasSelected`, `showFloatingLegend`)
- Type aliases: PascalCase (e.g., `Priority`, `TodoFilter`, `IdeaStatus`, `DialogType`)

## Where to Add New Code

**New Feature:**
- Feature logic (store, actions): `src/stores/[feature].ts`
- Feature types: Add to `src/stores/types.ts` or create `src/stores/[feature]-types.ts`
- Feature utilities: `src/lib/[feature].ts`
- Tests: `tests/stores/[feature].spec.ts` or `tests/lib/[feature].spec.ts`

**New Component/Module:**
- UI component (primitive, reusable): `src/components/ui/[component-name]/[ComponentName].vue` with barrel export in `index.ts`
- Form component (domain-specific): `src/components/forms/[ComponentName].vue`
- Business logic view/page: Currently uses single `App.vue`; for multi-view architecture, create `src/views/[ViewName].vue`

**Utilities:**
- Shared helpers: `src/lib/utils.ts`
- Feature-specific utilities: `src/lib/[feature].ts`
- Import path alias: Use `@/` prefix to reference src directory (configured in `vite.config.ts`)

## Import Path Aliases

- `@/`: Resolves to `src/` (configured in `vite.config.ts`)
- Usage: `import Button from '@/components/ui/button'`
- Pattern: Always use `@/` for imports within src/ to avoid relative path fragility

## Special Directories

**dist/**
- Purpose: Build output directory
- Generated: Yes (produced by `npm run build`)
- Committed: No (in .gitignore)
- Created by Vite during production build

**node_modules/**
- Purpose: Installed dependencies
- Generated: Yes (created by `npm install`)
- Committed: No (in .gitignore)

**views/**
- Purpose: Reserved for future page/view components
- Generated: No
- Currently: Empty (single-page app uses App.vue)
- Future use: If multi-view architecture is implemented, create page components here

## Component Organization Pattern

**UI Component Structure** (e.g., `src/components/ui/button/`):
```
Button/
├── Button.vue          # Component implementation
└── index.ts            # Barrel export: export * from './Button.vue'
```

**Form Component Structure**:
```
FormDialog.vue          # Reusable dialog wrapper component
TodoFormFields.vue      # Todo domain form fields
IdeaFormFields.vue      # Idea domain form fields
```

Each form component handles domain-specific validation and field rendering, while `FormDialog.vue` provides the shared dialog UI wrapper and emit pattern.

## File Organization for New Features

When adding a new feature:

1. Create store in `src/stores/[feature].ts` following Pinia store pattern
2. Add types to `src/stores/types.ts` (or create `src/stores/[feature]-types.ts`)
3. Create utilities in `src/lib/[feature].ts` if needed
4. Create UI components in `src/components/ui/[component]/` for primitives
5. Create form components in `src/components/forms/[ComponentName].vue` for domain logic
6. Add tests in `tests/stores/[feature].spec.ts` and `tests/lib/[feature].spec.ts`
7. Integrate into `App.vue` or appropriate view component

---

*Structure analysis: 2026-03-13*

# Technology Stack

**Analysis Date:** 2026-03-13

## Languages

**Primary:**
- TypeScript 5.4.3 - All source code and configuration
- Vue 3.4.21 - Component framework and templating

**Secondary:**
- HTML5 - Page markup via `index.html`
- CSS 3 - Styling via Tailwind

## Runtime

**Environment:**
- Node.js - Development environment (target ES2020 for browser execution)
- Browser - Production runtime (ES2020+)

**Package Manager:**
- npm - Dependency management
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Vue 3.4.21 - Progressive JavaScript framework for UI
- Pinia 2.1.7 - State management (Vuex successor)

**UI/Styling:**
- Tailwind CSS 3.4.3 - Utility-first CSS framework
- Radix Vue 1.9.17 - Headless UI components (unstyled primitives)
- class-variance-authority 0.7.1 - CSS class composition for component variants
- tailwind-merge 3.4.0 - Merge Tailwind classes intelligently
- tailwindcss-animate 1.0.7 - Animation utilities
- @tailwindcss/forms 0.5.7 - Form element styling

**Icons:**
- lucide-vue-next 0.563.0 - Vue 3 icon library

**Utilities:**
- clsx 2.1.1 - Class name concatenation utility

## Key Dependencies

**Critical:**
- vue 3.4.21 - Core framework, cannot be removed
- pinia 2.1.7 - State persistence and management layer
- typescript 5.4.3 - Type safety for development

**Build/Dev:**
- vite 4.5.3 - Modern bundler and dev server
- @vitejs/plugin-vue 4.6.2 - Vue 3 support in Vite
- vue-tsc 1.8.27 - TypeScript type checking for Vue

**Testing:**
- vitest 0.34.6 - Unit test runner
- @vue/test-utils 2.4.5 - Vue component testing utilities
- jsdom 24.0.0 - DOM implementation for Node.js

**CSS Processing:**
- tailwindcss 3.4.3 - CSS generation
- postcss 8.4.38 - CSS transformation
- autoprefixer 10.4.19 - Browser vendor prefixes

**Development Tools:**
- chrome-devtools-mcp 0.17.0 - Chrome DevTools integration
- @types/node 20.11.30 - Node.js type definitions

## Configuration

**Environment:**
- No .env file present - configuration is code-based
- No external API keys or credentials required for runtime

**Build:**
- `vite.config.ts` - Vite bundler configuration with Vue plugin
- `tsconfig.json`, `tsconfig.app.json` - TypeScript compilation settings
- `postcss.config.js` - PostCSS plugins (Tailwind, Autoprefixer)
- `tailwind.config.js` - Tailwind CSS configuration with custom colors
- `components.json` - shadcn-vue component configuration

**Build Scripts (package.json):**
```
dev: vite                          # Development server
build: vite build                  # Production build
preview: vite preview              # Preview built output
test: vitest run                   # Run tests once
test:watch: vitest                 # Run tests in watch mode
```

## Platform Requirements

**Development:**
- Node.js 20+ (inferred from @types/node version)
- npm 8+ (with lockfile v2 support)
- Modern terminal with shell support

**Production:**
- Modern browser with ES2020 support (Chrome 80+, Firefox 74+, Safari 13.1+, Edge 80+)
- localStorage API support (used for data persistence)
- No server required - fully client-side application

## Data Persistence

**Storage:**
- Browser localStorage only
- No database connection
- No backend API calls
- All data stored locally on client machine
- Storage keys: `todo-plus:todos` and `todo-plus:ideas`

---

*Stack analysis: 2026-03-13*

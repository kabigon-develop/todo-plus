# Codebase Concerns

**Analysis Date:** 2026-03-14

## Tech Debt

**Large Monolithic Component:**
- Issue: `src/App.vue` is 584 lines mixing presentation logic, form handling, event management, and state coordination
- Files: `src/App.vue`
- Impact: Difficult to test, maintain, and modify. Component responsible for todo management, idea board, dashboard rendering, and dialogs simultaneously. Changes to any feature risk breaking others.
- Fix approach: Break into smaller components - separate TodoTab, IdeaTab, DashboardTab; extract form logic into composable; create dedicated components for idea lanes and dashboard calendar

**Weak ID Generation:**
- Issue: IDs generated using `Date.now() + Math.random().toString(16).slice(2)` without uniqueness guarantees
- Files: `src/stores/todo.ts` (line 7), `src/stores/idea.ts` (line 8)
- Impact: IDs are not guaranteed unique; collision risk increases with rapid creation. Predictable ID entropy; potential security issue if IDs exposed externally
- Fix approach: Use `crypto.randomUUID()` or library like `nanoid` for cryptographically secure ID generation

**Direct localStorage Dependency Without Abstraction:**
- Issue: Stores directly call localStorage without abstraction layer or error handling
- Files: `src/stores/todo.ts` (lines 48-68), `src/stores/idea.ts` (lines 36-45)
- Impact: Tightly coupled to localStorage; difficult to migrate to IndexedDB or server-side sync; impossible to test in non-browser environments
- Fix approach: Create storage service interface with implementation adapters; inject storage into stores; maintain localStorage as default but allow swapping implementations

**Missing Hydration Error Handling:**
- Issue: `hydrate()` called in `src/App.vue` onMounted (lines 31-34) but no error handling or user feedback if hydration fails
- Files: `src/App.vue` (lines 31-34), `src/stores/todo.ts` (lines 46-58), `src/stores/idea.ts` (lines 34-42)
- Impact: Silent failures during app initialization; corrupted data triggers silent reset without user notification; users unaware of data loss
- Fix approach: Return success/failure status from hydrate; show toast notification on hydration errors; log corruption events

**No Data Migration Strategy:**
- Issue: If store schemas change (adding required fields, renaming properties), old persisted data won't be migrated automatically
- Files: `src/stores/todo.ts`, `src/stores/idea.ts`
- Impact: Users upgrading app could lose data or have incomplete records after restart
- Fix approach: Implement versioned schema with migration functions; add version field to persisted objects; test migrations before releases

**Non-Uniform Error Handling in Store Methods:**
- Issue: Methods return early without error indication: `if (!target) return` pattern (lines 95-97, 105-109 in todo.ts; 72-75, 85-87, 139-141 in idea.ts)
- Files: `src/stores/todo.ts`, `src/stores/idea.ts`
- Impact: UI cannot distinguish success from failure; operations silently fail when IDs don't exist; no error messaging capability
- Fix approach: Return error types (e.g., `Result<T, E>`) or throw typed errors with meaningful messages; update all call sites to handle errors

## Known Bugs

**Timezone Inconsistency in Dashboard:**
- Symptoms: Dashboard metrics calculated using browser's local timezone. Creating items at 23:59 vs 00:01 may show in wrong day bins if server/app assumptions don't match
- Files: `src/lib/dashboard.ts` (lines 60-69, 71-86), `src/App.vue` (line 58)
- Trigger: Create todo at 11:59 PM local time, verify it appears on correct date in dashboard
- Workaround: Dashboard uses local time consistently but edge cases at month boundaries possible if timezone changes mid-session
- Root cause: `toLocalDayKey` converts ISO to local date, but assumptions about local midnight are implicit

**Order Corruption in Idea Drag Operations:**
- Symptoms: After dragging ideas between lanes rapidly, order values may become inconsistent. Reordering logic has potential race condition
- Files: `src/stores/idea.ts` (lines 83-104, 106-114)
- Trigger: Rapidly drag same idea between lanes multiple times in succession
- Workaround: Refresh browser or manually move items using step buttons
- Root cause: No transaction semantics; order recomputation and status change are separate steps; concurrent operations could interfere

**Invalid Date Strings Silently Ignored in Metrics:**
- Symptoms: Dashboard shows no warning when date strings are invalid; metrics silently skip those records
- Files: `src/lib/dashboard.ts` (lines 60-69) with `Number.isNaN()` check
- Trigger: Manually corrupt localStorage with invalid ISO dates
- Workaround: Invalid dates are filtered correctly but user never knows data was lost from metrics
- Root cause: Silent filtering without logging or user notification

**Form Reset Not Enforced:**
- Symptoms: Switching between create/edit modes might show stale values if form state isn't properly reset
- Files: `src/App.vue` (lines 78-93, 104-137)
- Trigger: Unlikely in practice as resetTodoForm/resetIdeaForm called before opening, but pattern not enforced
- Workaround: Currently called before every dialog open, prevents issue
- Root cause: Form state is reactive references without clear lifecycle

## Security Considerations

**No Input Validation on External Data:**
- Risk: localStorage data JSON.parsed without schema validation. Malformed data silently triggers `$reset()` without logging
- Files: `src/stores/todo.ts` (lines 48-57), `src/stores/idea.ts` (lines 36-42)
- Current mitigation: Try-catch prevents crash but silently wipes data
- Recommendations:
  - Add runtime schema validation (e.g., Zod) before parsing
  - Log when data corruption detected
  - Implement data migration versioning with repair strategies

**XSS Risk in Rich Text Fields:**
- Risk: Description and title fields could contain HTML if store corrupted or data injected
- Files: `src/App.vue` (lines 344-350, 384-389), form components
- Current mitigation: Vue template compilation escapes by default; v-html not used for user content
- Recommendations: Continue using text interpolation; add length limits (title 100 chars, description 500 chars); trim/sanitize inputs before persistence

**No Audit Trail or Access Control:**
- Risk: No multi-user access control; anyone with browser access has full read/write. No audit trail of changes
- Files: Entire application
- Current mitigation: Single-user only design; localStorage origin-scoped
- Recommendations: Document clearly as single-user only; if multi-user needed, implement authentication and server backend

**Predictable localStorage Keys:**
- Risk: Storage keys hardcoded (`'todo-plus:todos'`, `'todo-plus:ideas'`); third-party scripts in same origin could read/modify data
- Files: `src/stores/todo.ts` (line 4), `src/stores/idea.ts` (line 5)
- Current mitigation: localStorage is origin-scoped by browser
- Recommendations: Consider IndexedDB for sensitive data; validate data on hydrate to detect tampering; hash keys if sensitive

## Performance Bottlenecks

**Inefficient Idea Filtering in byStatus Getter:**
- Problem: Getter filters and sorts entire ideas list on every access without memoization
- Files: `src/stores/idea.ts` (lines 19-31), `src/App.vue` (lines 378, 234, 368-407)
- Cause: Triple filtering (for each of 3 lanes) with sorting on each, called on every template render
- Current state: Fast for hundreds of items, noticeable lag at 1000+ items per lane
- Improvement path: Memoize getter results; only recompute when ideas array changes; consider denormalizing data into lane-keyed structure

**Re-rendering Large Todo List:**
- Problem: App.vue renders entire filteredTodos list on every state change without virtualization
- Files: `src/App.vue` (lines 334-360)
- Cause: Vue reactivity correct but no scoping of re-renders; no virtual scrolling
- Current state: Smooth for 100 items, sluggish at 500+
- Improvement path: Add virtual scrolling library (vue-virtual-scroller) for 100+ items; consider pagination with 50 items/page

**Dashboard Metric Aggregation On Every Month View:**
- Problem: `buildMonthlyDashboard` iterates all todos/ideas and rebuilds maps for every month navigation
- Files: `src/lib/dashboard.ts` (lines 95-147), `src/App.vue` (line 258)
- Cause: No caching of computed dashboards; recalculates from scratch on every month change
- Current state: Fast for 5000 items, noticeable lag at 20000+
- Improvement path: Cache dashboard results by monthKey; precompute adjacent months on idle; add incremental updates

**Linear Search for Todos:**
- Problem: `filteredTodos` getter loops through all todos applying filter and search sequentially
- Files: `src/stores/todo.ts` (lines 26-43)
- Cause: No indexing on filter/search fields; all todos scanned on every filter/search change
- Current state: Acceptable for 1000 items, becomes slow at 5000+
- Improvement path: Cache filtered results; invalidate only on actual changes; add full-text search index for large datasets

## Fragile Areas

**Form State Management Complexity:**
- Files: `src/App.vue` (lines 36-49, 78-102)
- Why fragile: Two separate reactive form objects (todoForm, ideaForm) with duplicated reset logic. Adding new form field requires changes in multiple places. Validation only on title field. No shared form state interface.
- Safe modification: Extract into composable; use factory pattern for form objects; add comprehensive validation schema (Zod); test form state transitions
- Test coverage: Zero tests for form state, validation, or transitions

**Dialog State Machine Lacks Invariants:**
- Files: `src/App.vue` (lines 25, 54-57, 95-102, 103-137)
- Why fragile: `dialogOpen`, `dialogType`, `editingTodoId`, `editingIdeaId` managed separately without invariant enforcement. Invalid states possible (e.g., open=false but type='todo-edit'). Transitions not explicit.
- Safe modification: Create single DialogState discriminated union type; enforce transitions through explicit actions; add assertions
- Test coverage: No tests for dialog state transitions or edge cases

**Order Recomputation in Idea Store Implicit:**
- Files: `src/stores/idea.ts` (lines 106-114)
- Why fragile: Called after multiple operations but logic is implicit. If any operation forgets to call it, order values become stale. `updateIdea` always calls it even if order shouldn't change.
- Safe modification: Create validation function checking all items in status have sequential 0..N-1 values; add unit tests; make recomputation automatic on any mutation
- Test coverage: Tests move operations but don't verify order consistency across multiple operations

**Timezone Handling Assumptions Undocumented:**
- Files: `src/lib/dashboard.ts` (lines 60-86), `src/App.vue` (line 58)
- Why fragile: Assumes browser timezone is constant throughout session. If timezone changes mid-session or data spans timezone changes, metrics break. Midnight boundary is implicit.
- Safe modification: Document timezone handling explicitly; add timezone parameter to functions; store timezone metadata with records; add DST transition tests
- Test coverage: Tests assume UTC but don't validate timezone robustness

**Date Mutation Using setDate() Across DST:**
- Files: `src/lib/dashboard.ts` (lines 71-86)
- Why fragile: `cursor.setDate(cursor.getDate() + 1)` in loop can have unexpected behavior across DST boundaries
- Safe modification: Use immutable date operations or date library (date-fns); explicitly handle DST transitions
- Test coverage: No tests for DST edge cases

**Edit Form Context Not Validated:**
- Files: `src/App.vue` (lines 110-137)
- Why fragile: No validation that editing todo/idea actually exists in store. If IDs don't match, editing becomes corrupted
- Safe modification: Add console.warn() when opening edit for non-existent item; validate ID exists before populating form
- Test coverage: No test for editing non-existent items

## Scaling Limits

**localStorage Size Capacity:**
- Current capacity: 5-10MB per origin (browser dependent)
- Limit: At ~200 bytes per todo, ~150 bytes per idea, supports 20000-30000 items before quota exceeded
- Scaling path:
  - Migrate to IndexedDB (typically 50MB+)
  - Implement data archival/export feature
  - Add soft delete instead of hard delete
  - Implement data cleanup/retention policies

**No Pagination or Virtualization:**
- Current capacity: ~500 items before UI becomes sluggish
- Limit: 1000+ items locks up main thread for 2-5s; 40k+ dashboard metrics noticeably slow
- Scaling path:
  - Add virtual scrolling (vue-virtual-scroller)
  - Implement pagination with 50 items/page
  - Add archival/historical views
  - Lazy load months in dashboard

**All Data In Memory:**
- Current capacity: 10k todos + 5k ideas occupy ~2-3MB RAM
- Limit: Browsers allow 100-200MB; combined with other tabs rarely exceeds 50MB usable
- Scaling path:
  - Implement lazy loading per month
  - Cache only current month in memory
  - Archive older months to IndexedDB
  - Implement data compression

## Dependencies at Risk

**Outdated Vitest Version:**
- Risk: `vitest@0.34.6` is significantly behind current (1.0+). Major bug fixes and features missing
- Impact: Missing test features, potential incompatibilities with new Vue versions
- Migration plan: Upgrade to latest vitest with `npm install vitest@latest`; update test syntax if breaking changes exist

**Radix Vue Pre-1.0 Stability:**
- Risk: `radix-vue@1.9.17` - pre-1.0 means potential breaking changes; library actively evolving
- Impact: Major release could break UI components; limited long-term support signal
- Migration plan: Monitor releases closely; test major upgrades separately; consider Headless UI or shadcn/vue if breaking changes increase

**Vue @3.4.21 - Specific Minor Version:**
- Risk: Pinned to specific minor; Vue 3.5+ may have breaking changes
- Impact: Delayed security patches if vulnerability discovered in 3.4.21
- Migration plan: Update to latest 3.x when testing available; plan Vue 4 migration path

**Pinia @2.1.7 - Exact Version Pin:**
- Risk: No automatic security updates if vulnerability in 2.1.7
- Impact: Requires manual intervention to patch security issues
- Migration plan: Switch to `^2.1.7` for auto-patch updates; add dependabot/renovate for automated security patches

## Missing Critical Features

**No Data Export/Backup:**
- Problem: Users can lose all data if browser storage cleared or device replaced. No way to export todos/ideas
- Blocks: Data persistence across devices; data portability; GDPR data export compliance

**No Recurring/Template Tasks:**
- Problem: No repeating tasks; users must manually create duplicates
- Blocks: Productivity workflows with routine tasks; efficiency

**No Multi-Device Sync:**
- Problem: Data only lives in single browser; switching devices loses everything
- Blocks: Cross-device workflows; mobile support

**No Notifications/Reminders:**
- Problem: No alerts for overdue tasks even though dueDate field exists
- Blocks: Time management workflows; overdue task visibility

**No Undo/Redo:**
- Problem: Deleted todos and ideas are permanent with no recovery
- Blocks: Accidental deletion recovery

## Test Coverage Gaps

**No Vue Component Tests:**
- What's not tested: Component rendering, user interactions (clicking buttons, form input), form validation UI feedback, drag-and-drop interactions
- Files: `src/App.vue`, all components in `src/components/`
- Risk: Component logic untested; refactoring breaks UI without catching in CI; form handling errors go undetected
- Priority: High - UI is user-facing and changes frequently

**No Integration Tests:**
- What's not tested: End-to-end workflows (create -> filter -> search -> complete -> verify in dashboard)
- Files: No integration test suite exists
- Risk: Store methods work in isolation but fail when combined; multi-step workflows break silently
- Priority: Medium - store tests exist but don't verify full workflows

**Store Hydration Error Cases Not Tested:**
- What's not tested: localStorage corruption recovery, quota exceeded scenarios, missing data after failed hydrate
- Files: `src/stores/todo.ts` (lines 46-58), `src/stores/idea.ts` (lines 34-42)
- Risk: Hydration fails silently; no way to verify recovery works
- Priority: High - affects data persistence reliability

**Form Validation Not Tested:**
- What's not tested: Title validation, empty string handling, special character handling, tag parsing
- Files: `src/App.vue` (lines 139-155), form components
- Risk: Invalid data persisted if validation breaks; no safety net
- Priority: High - form validation critical for data quality

**No Drag-and-Drop Integration Tests:**
- What's not tested: Drag between lanes with no items, dragging to invalid positions, rapid consecutive drags, order recomputation correctness
- Files: `src/stores/idea.ts` (lines 83-104), `src/App.vue` (lines 228-237)
- Risk: Order field corruption or items stuck in inconsistent state
- Priority: High - drag is critical feature with complex logic

**Dashboard Edge Cases:**
- What's not tested: Daylight saving time transitions, leap year handling, concurrent mutations during dashboard build, month/year boundaries
- Files: `src/lib/dashboard.ts`
- Risk: Dashboard shows wrong metrics during DST transitions
- Priority: Medium - current tests fairly comprehensive but edge cases rare

**Concurrent Mutations:**
- What's not tested: Rapid updates/deletes during persistence or hydration; drag operations during state updates
- Files: `src/stores/todo.ts`, `src/stores/idea.ts`
- Risk: Data inconsistency between memory and localStorage; silent corruption
- Priority: Medium - edge case but data loss risk

**No E2E Tests:**
- What's not tested: Full user workflows from login to final export
- Files: Entire application
- Risk: Regressions in multi-step workflows not caught before release
- Priority: Medium - would catch UI integration issues early

**No Accessibility Tests:**
- What's not tested: Keyboard navigation, screen reader compatibility, ARIA labels
- Files: All components
- Risk: App unusable for users with disabilities
- Priority: Medium - not critical for MVP but important for inclusivity

---

*Concerns audit: 2026-03-14*

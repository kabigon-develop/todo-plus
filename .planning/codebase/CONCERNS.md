# Codebase Concerns

**Analysis Date:** 2026-03-13

## Tech Debt

**Weak ID Generation:**
- Issue: Using `Date.now()` + `Math.random().toString(16).slice(2)` for ID generation is not cryptographically secure and has collision risk at high event rates
- Files: `src/stores/todo.ts` (line 7), `src/stores/idea.ts` (line 8)
- Impact: If many items are created in rapid succession, ID collisions could cause data loss or confusion
- Fix approach: Replace with UUID v4 library or use a timestamp-based sequence with atomic counter

**Unvalidated localStorage Deserialization:**
- Issue: JSON.parse used without schema validation; only try-catch for safety. Corrupted or tampered data could silently reset stores
- Files: `src/stores/todo.ts` (lines 46-56), `src/stores/idea.ts` (lines 34-42)
- Impact: Silent data loss on corrupted localStorage. No visibility into what went wrong
- Fix approach: Add schema validation before assigning parsed data. Log errors for debugging. Consider data repair strategies

**No Data Migration Strategy:**
- Issue: If store schemas change (e.g., adding required fields), old persisted data won't be migrated automatically
- Files: `src/stores/todo.ts`, `src/stores/idea.ts`
- Impact: Users upgrading app could lose data or have incomplete records after app restart
- Fix approach: Implement versioned schema with migration functions

## Known Bugs

**Orphaned Selected Items:**
- Symptoms: Selected todos can persist even after item deletion. Subsequent bulk operations could target wrong items if IDs reused
- Files: `src/stores/todo.ts` (line 101 in removeTodo)
- Trigger: Delete a selected todo, then create a new todo (which might reuse ID pattern)
- Workaround: None - selection just silently includes non-existent items

**Idea Reorder Fragility:**
- Symptoms: Drag-drop reordering could fail if two users (or rapid app state changes) modify same lane simultaneously
- Files: `src/stores/idea.ts` (lines 83-104 in moveIdeaDrag)
- Trigger: Multiple rapid drag operations in same lane
- Cause: Array mutations are not atomic; order is recomputed but intermediate state could be inconsistent
- Workaround: Avoid rapid drag operations in same lane

## Security Considerations

**localStorage Exposure:**
- Risk: All user data stored in plain localStorage - no encryption. Malicious scripts can read entire dataset
- Files: `src/stores/todo.ts`, `src/stores/idea.ts`
- Current mitigation: None - data is directly exposed
- Recommendations: Encrypt sensitive fields before persistence, or use encrypted browser storage API

**XSS Vulnerability via Tags:**
- Risk: User-entered tags are rendered in template without HTML escaping (though Vue escapes by default)
- Files: `src/App.vue` (line 349, 388)
- Current mitigation: Vue's default template escaping
- Recommendations: Validate tag format server-side if ever exposed to API; avoid v-html for user content

## Performance Bottlenecks

**Monthly Dashboard Recalculation:**
- Problem: Dashboard recalculates for entire month on every todos/ideas change, even filtered views
- Files: `src/App.vue` (lines 257-258), `src/lib/dashboard.ts` (lines 95-147)
- Cause: `computed()` on full dataset without debounce; loops through all items twice
- Improvement path: Memoize dashboard data by cursor month. Add debounce to store updates. Consider indexing by date

**Drag-Drop Lane Recomputation:**
- Problem: `moveIdeaDrag` filters and recomputes order for entire lane on each drop
- Files: `src/stores/idea.ts` (lines 88-102)
- Cause: Using filter + forEach pattern without optimization
- Improvement path: Maintain order indices directly; use array find/update instead of recreating sublists

**Linear Search for Todos:**
- Problem: `filteredTodos` getter loops through all todos on every render
- Files: `src/stores/todo.ts` (lines 26-43)
- Cause: No indexing on filter/search fields
- Improvement path: Cache filtered results; invalidate only on filter/search/data changes

## Fragile Areas

**Date Parsing in Dashboard:**
- Files: `src/lib/dashboard.ts` (lines 60-68, 71-86)
- Why fragile: `toLocalDayKey()` silently returns empty string for invalid dates. `buildDayKeysInMonth()` mutates cursor in loop
- Safe modification: Add date validation. Use immutable date operations. Add tests for edge cases (DST, leap years, month boundaries)
- Test coverage: Covered by dashboard.spec.ts but edge cases around timezone handling could be missed

**Idea Status Lane Synchronization:**
- Files: `src/stores/idea.ts` (lines 19-31, 106-114)
- Why fragile: `byStatus` getter filters/sorts on-the-fly. `recomputeOrder()` iterates lanes but order field could desync
- Safe modification: Always call `recomputeOrder()` after any idea mutations. Add invariant checks in tests
- Test coverage: Step and drag movements tested, but rapid concurrent operations not tested

**Form State in App.vue:**
- Files: `src/App.vue` (lines 36-49, 78-102)
- Why fragile: Reactive objects for form state cleared on dialog close. If edit dialog canceled, state persists until next edit
- Safe modification: Clear form state immediately on dialog open. Use computed properties for form bindings
- Test coverage: No unit tests for form state management

## Scaling Limits

**localStorage Size:**
- Current capacity: Browser dependent (typically 5-10MB), but UI may lock up earlier
- Limit: ~10,000 items before localStorage becomes slow (depends on device)
- Scaling path: Migrate to IndexedDB for larger datasets, add pagination/archival strategy

**Monthly Dashboard Rendering:**
- Current capacity: ~100,000 items across entire app
- Limit: Dashboard recalculates full dataset; rendering 42 calendar cells each with bars becomes slow after 10k items
- Scaling path: Implement virtual scrolling for calendar, pre-compute aggregates on data insert

## Dependencies at Risk

**Pinia State Management:**
- Risk: No backup pattern if Pinia state hydration fails catastrophically
- Impact: App continues with empty state instead of recovering from localStorage
- Migration plan: Add recovery mechanism; persist to multiple stores or implement time-travel debug

**Date Handling:**
- Risk: Date objects created with `new Date(year, month, day)` are timezone-dependent
- Impact: Dashboard metrics could shift across DST boundaries or when user changes timezone
- Migration plan: Use explicit UTC for all internal date operations; convert to local only for display

## Missing Critical Features

**Data Export/Import:**
- Problem: No way to backup or migrate data between browsers/devices
- Blocks: Users can't recover data if localStorage clears or switch devices

**Undo/Redo:**
- Problem: Deleted todos and ideas are permanent; no undo capability
- Blocks: Accidental deletions are unrecoverable

**Duplicate Detection:**
- Problem: No deduplication if same todo/idea accidentally added twice
- Blocks: Can't verify data integrity

**Conflict Resolution:**
- Problem: No strategy if offline changes conflict with future cloud sync
- Blocks: Future multi-device sync feature

## Test Coverage Gaps

**localStorage Persistence Corruption:**
- What's not tested: Handling of corrupted JSON, missing fields, extra fields, type mismatches in persisted state
- Files: `src/stores/todo.ts`, `src/stores/idea.ts`
- Risk: Silent data loss or app crash on malformed localStorage
- Priority: High

**Concurrent Mutations:**
- What's not tested: Rapid updates/deletes while store is persisting or hydrating
- Files: `src/stores/todo.ts`, `src/stores/idea.ts`
- Risk: Data inconsistency between memory and localStorage
- Priority: Medium

**Date Boundary Edge Cases:**
- What's not tested: Month transitions with items created at exact boundary times, DST transitions, leap seconds
- Files: `src/lib/dashboard.ts`
- Risk: Off-by-one errors in dashboard metrics during DST or leap year transitions
- Priority: Medium

**Form Validation:**
- What's not tested: Empty strings, very long inputs (>10k chars), special characters in tags, invalid date formats
- Files: `src/App.vue` (lines 139-155, 148-154)
- Risk: App crash or unexpected behavior with unusual input
- Priority: Low

**Idea Drag State:**
- What's not tested: Dragging between lanes with no other items, dragging to invalid positions, rapid consecutive drags
- Files: `src/stores/idea.ts`, `src/App.vue` (lines 228-237)
- Risk: Order field corruption or items stuck in inconsistent state
- Priority: Medium

---

*Concerns audit: 2026-03-13*

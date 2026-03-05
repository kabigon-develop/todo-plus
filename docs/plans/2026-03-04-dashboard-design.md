# Dashboard Design (Monthly Daily Metrics)

## Goal
Add a dedicated dashboard tab to show, for the current month, daily counts for task/idea creation and activity.

## Confirmed Decisions
- Navigation: add a standalone `Dashboard` tab.
- Time basis: use user local browser timezone.
- Support month navigation with `previous` and `next` month controls.
- Metrics per day:
  - Todo created: by `createdAt`
  - Todo active: by `updatedAt`
  - Idea created: by `createdAt`
  - Idea active: by `updatedAt`
- Creation and activity can both count for the same item on the same day.

## UI Structure
- Top summary card with month label and timezone note.
- Month switch controls: previous month / next month.
- Four KPI cards:
  - Todo created
  - Todo active
  - Idea created
  - Idea active
- Monthly calendar grid (Monday-first, 7 columns).
- Each day cell shows:
  - date
  - 4 metrics (todo created/active, idea created/active)
  - mini bar visualization
- Legend placement:
  - desktop (`lg`+): fixed floating legend at right-middle of viewport
  - mobile/tablet: inline legend card under calendar
- Color grouping:
  - todo metrics use green shades (active uses deeper green)
  - idea metrics use orange shades (active uses deeper orange)

## Data Flow
- Source data from existing Pinia stores:
  - `todoStore.todos`
  - `ideaStore.ideas`
- Build dashboard view model via `buildMonthlyDashboard(todos, ideas, now)`.
- Output:
  - `dailyRows`: one row per day in current month.
  - `monthlyTotals`: aggregate totals across the rows.

## Edge Handling
- Invalid date strings are ignored.
- Only current-month data is counted.
- Empty input still renders full month with zeros.
- Month length follows Date API (including leap year behavior).

## Testing
- Added unit tests for:
  - created/updated counting across todo and idea.
  - current-month filtering.
  - local day boundary behavior.
  - invalid date safety.
  - empty input full-month rendering.

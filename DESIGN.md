---
name: "Todo Plus"
description: "A local-first task and idea planner built around a calm, tactile utility surface."
colors:
  surface-base-light: "#f8fafc"
  surface-card-light: "#ffffff"
  surface-elevated-light: "#ffffff"
  surface-base-dark: "#1c1917"
  surface-card-dark: "#292524"
  surface-elevated-dark: "#3c3634"
  text-foreground-light: "#1f2937"
  text-muted-light: "#6b7280"
  text-subtle-light: "#9ca3af"
  text-foreground-dark: "#f5f5f4"
  text-muted-dark: "#a8a29e"
  text-subtle-dark: "#78716c"
  workbench-teal: "#14b8a6"
  workbench-teal-hover: "#0d9488"
  workbench-teal-soft-light: "#ccfbf1"
  workbench-teal-ink-light: "#0f766e"
  workbench-teal-bright-dark: "#2dd4bf"
  workbench-teal-soft-dark: "#134e4a"
  border-light: "#e2e8f0"
  border-dark: "#44403c"
  priority-high: "#ef4444"
  priority-medium: "#f59e0b"
  priority-low: "#22c55e"
typography:
  display:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: "32px"
    letterSpacing: "normal"
  headline:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: "28px"
    letterSpacing: "normal"
  title:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: "24px"
    letterSpacing: "normal"
  body:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
    letterSpacing: "normal"
  label:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: "20px"
    letterSpacing: "normal"
rounded:
  input: "6px"
  card: "12px"
  panel: "14px"
  hero: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.workbench-teal}"
    textColor: "{colors.surface-card-light}"
    typography: "{typography.label}"
    rounded: "{rounded.input}"
    padding: "8px 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.workbench-teal-hover}"
    textColor: "{colors.surface-card-light}"
    typography: "{typography.label}"
    rounded: "{rounded.input}"
    padding: "8px 16px"
    height: "40px"
  button-secondary:
    backgroundColor: "{colors.surface-base-light}"
    textColor: "{colors.text-foreground-light}"
    typography: "{typography.label}"
    rounded: "{rounded.input}"
    padding: "8px 16px"
    height: "40px"
  input-default:
    backgroundColor: "{colors.surface-card-light}"
    textColor: "{colors.text-foreground-light}"
    typography: "{typography.body}"
    rounded: "{rounded.input}"
    padding: "8px 12px"
    height: "40px"
  card-default:
    backgroundColor: "{colors.surface-card-light}"
    textColor: "{colors.text-foreground-light}"
    rounded: "{rounded.card}"
    padding: "16px"
  toolbar-filter:
    backgroundColor: "{colors.surface-card-light}"
    textColor: "{colors.text-foreground-light}"
    rounded: "{rounded.panel}"
    padding: "12px"
---

# Design System: Todo Plus

## Overview

**Creative North Star: "Quiet Workbench"**

Todo Plus is a personal planning surface, not a showcase. The system should read like a dependable desk that has already been arranged for work: clear compartments, tactile controls, one signal color, and no decorative noise competing with the task itself. Its current UI language is quiet in structure, but not sterile. The product earns clarity through spacing, semantic color, and small moments of lift rather than through banners, ornament, or oversized gestures.

The chosen atmosphere is **Tactile Utility**. Components should feel pressable and real, with subtle depth, clear borders, and active states that register immediately. The surface is allowed to have texture, shadows, and tonal layering when they make actions easier to read, but it must never drift into spectacle. PRODUCT.md's anti-references remain absolute: no marketing-page composition, no oversized hero treatment, no decorative card grids, no excessive gradients, no noisy gamification, no UI that feels like a template SaaS landing page, and no modal-heavy or overly animated flows.

**Key Characteristics:**
- Local-first trust over product theater.
- One accent color, many neutral surfaces.
- Compact, scannable controls with visible state change.
- Lift is functional, not atmospheric.

## Colors

The palette is built from paired light and dark neutrals, with **Workbench Teal** carrying the entire interaction vocabulary.

### Primary
- **Workbench Teal** (`#14b8a6`, dark-mode partner `#2dd4bf`): the only true signal color. It belongs on primary actions, active tab states, filter selection, and focus rings. Its softer companions, **Workbench Mist** (`#ccfbf1`) and **Workbench Ink** (`#0f766e`), exist to support selection fills and text-on-soft accents without introducing a second voice.

### Neutral
- **Daylight Base** (`#f8fafc`): the page field in light mode. It should stay open and untextured so controls do the talking.
- **Paper Card** (`#ffffff`): the default container fill for cards, dialogs, and fields in light mode.
- **Stone Base** (`#1c1917`): the dark-mode page field, warmer than charcoal and intentionally less glossy than slate.
- **Stone Card** (`#292524`): the default dark container, used for cards and inputs when the page enters dark mode.
- **Raised Stone** (`#3c3634`): the elevated dark layer for overlays and tonal separation.
- **Quiet Ink** (`#1f2937`, dark-mode partner `#f5f5f4`): the primary reading color.
- **Support Ink** (`#6b7280`, dark-mode partner `#a8a29e`): labels, helper text, and secondary metadata.
- **Divider Dust** (`#e2e8f0`, dark-mode partner `#44403c`): borders, strokes, and quiet structure.

### Status Accents
- **Urgent Red** (`#ef4444`): destructive actions and high priority only.
- **Working Amber** (`#f59e0b`): medium priority and caution states.
- **Clear Green** (`#22c55e`): low priority and success states.

**The Single Signal Rule.** Workbench Teal is the only saturated accent allowed to lead interaction on a screen. If a surface starts to look multicolored before a priority badge appears, the composition has already broken.

## Typography

**Display Font:** `ui-sans-serif, system-ui, sans-serif`
**Body Font:** `ui-sans-serif, system-ui, sans-serif`
**Label/Mono Font:** no secondary family, labels stay on the same sans stack

**Character:** utilitarian, native-feeling, and unpretentious. The system avoids expressive type pairings on purpose. Weight, contrast, and placement create hierarchy; family changes are not part of the language.

### Hierarchy
- **Display** (`700`, `24px`, `32px`): page identity only. Used for the product name and other top-of-screen anchors.
- **Headline** (`600`, `18px`, `28px`): section titles such as dashboard headings and dialog titles.
- **Title** (`600`, `16px`, `24px`): item titles, emphasized metadata, and numeric surface labels.
- **Body** (`400`, `16px`, `24px`): form inputs, list descriptions, and general interface copy.
- **Label** (`600`, `14px`, `20px`): buttons, tabs, chips, and short control text.

**The No Costume Rule.** This system never reaches for a second font to create drama. If hierarchy is unclear, fix the scale, weight, or spacing before touching the family.

## Elevation

Todo Plus uses a hybrid depth model: most surfaces are separated by tone and border first, then lifted selectively with restrained shadows. Cards default to a low ambient shadow, dialogs step up to a mid shadow, and the accepted filter toolbar adds a stronger inset-plus-drop combination to make the control cluster feel tactile without becoming glossy.

### Shadow Vocabulary
- **Ambient Low** (`0 1px 3px rgba(0, 0, 0, 0.10), 0 1px 2px -1px rgba(0, 0, 0, 0.10)`): cards and header surfaces that need a gentle edge from the page.
- **Ambient Mid** (`0 10px 15px -3px rgba(0, 0, 0, 0.10), 0 4px 6px -4px rgba(0, 0, 0, 0.10)`): dialogs and stronger floating layers.
- **Structural Lift** (`inset 0 0 0 1px color-mix(...), 0 10px 24px rgba(0, 0, 0, 0.14)`): the signature toolbar treatment when a control cluster needs to feel held together as one instrument.

**The Lift Only on Purpose Rule.** Flat is the default. Extra lift appears only when grouping, focus, or action confidence would be weaker without it.

## Components

### Buttons
- **Shape:** gently rounded utility buttons (`6px radius`).
- **Primary:** Workbench Teal fill (`#14b8a6`) with white text, medium emphasis, `40px` height, and `8px 16px` padding.
- **Hover / Focus:** hover deepens to `#0d9488`; focus uses a `2px` ring in the primary border/focus color. Movement is not required, color and ring are enough.
- **Secondary / Destructive:** secondary pulls from neutral surfaces; destructive keeps the same shape and sizing but swaps to urgent red.

### Tabs and Filter Chips
- **Style:** the tabs are text-first with no pill container per item. Active state is communicated by teal text plus a thin underline bar.
- **Filter Chips:** the accepted toolbar uses rounded pill filters inside a bordered cluster. Pressed state uses the soft teal fill plus darker teal text, not a second solid accent.
- **State:** active must always read through both color and shape change; color-only toggles are insufficient.

### Cards / Containers
- **Corner Style:** soft but not inflated, usually `12px`, with larger `16px` only for hero-level containers like the header.
- **Background:** cards sit on `Paper Card` / `Stone Card`, with the page field kept one tonal step behind.
- **Shadow Strategy:** low ambient shadows by default, stronger lift only on modals and signature grouped controls.
- **Border:** a quiet divider stroke is present on most containers. The border does structural work and should not be removed casually.
- **Internal Padding:** `16px` is the default container padding, with `12px` used for dense control clusters.

### Inputs / Fields
- **Style:** `40px` tall, `6px` rounded, bordered, and filled with the card surface color. Text sits at body size, placeholders drop to the subtle text token.
- **Focus:** a visible `2px` focus ring in Workbench Teal. The ring is mandatory because the product promises keyboard-safe local control.
- **Error / Disabled:** errors switch the stroke/ring to red; disabled elements reduce opacity rather than changing layout.

### Badges
- **Style:** rounded full pills with `12px`-ish horizontal padding, small type, and semantic soft fills for priority/status.
- **Role:** badges carry state, not decoration. They should stay short and never become the dominant visual mass in a row.

### Signature Component: Filter Toolbar
- **Character:** the filter toolbar is the product's main tactile control strip. It should feel like a compact instrument panel, not a marketing banner.
- **Shape and Structure:** `14px` corners, bordered shell, nested chip row, and a right-aligned batch action block.
- **Behavior:** it may use a stronger shadow than ordinary cards, but it still obeys the Single Signal Rule and keeps teal as the only saturated interaction color.

## Do's and Don'ts

### Do:
- **Do** keep primary actions in Workbench Teal (`#14b8a6`) and use the softer teal fill (`#ccfbf1`) for selected-but-secondary states.
- **Do** preserve visible borders (`#e2e8f0` light, `#44403c` dark) on inputs, cards, and grouped controls so structure stays readable at a glance.
- **Do** use `6px`, `12px`, `14px`, and `16px` radii deliberately: inputs and buttons at `6px`, standard cards at `12px`, grouped tool panels at `14px`, hero containers at `16px`.
- **Do** let shadows communicate grouping and interaction confidence, not decoration. If a shadow is present, it must explain what is floating or what is grouped.
- **Do** keep copy short and operational. The UI should always sound like a tool under control, not a tour guide.

### Don't:
- **Don't** use marketing-page composition anywhere in the product shell. This is a work surface, not a campaign page.
- **Don't** use oversized hero treatment inside routine screens. The header already marks identity; nothing below it should compete for that job.
- **Don't** build decorative card grids. If a repeated surface exists, it must earn its framing through scanability or interaction.
- **Don't** add excessive gradients. The current header gradient is already the upper bound, not a pattern to spread.
- **Don't** add noisy gamification, template SaaS landing page motifs, or modal-heavy / overly animated flows. PRODUCT.md prohibits them, and this design system carries that prohibition through unchanged.

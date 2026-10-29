# Unibexs System — Frontend Redesign Brief

**For:** Frontend developer
**From:** Adnan (PM)
**Source of truth:** *Unibexs Design System Guide v1.1 (20 Oct 2026)*. If this brief and the guide disagree, the guide wins. Ask before guessing.
**Target app:** Partner/admin portal at `app.unibexs.com` (Next.js + Tailwind)

---

## 0. What you are building

There are two deliverables, in this order:

1. **Design guideline page.** This is a living style guide route inside the app, at `/design-system`. It renders every token and component from code, so it doubles as the QA surface for the redesign. Build it first, because it forces the token and component layer to exist.
2. **Portal redesign.** Apply the system to the existing screens: Advisor home, Application Tracker, Student profile, Knowledge Hub, Logistics Marketplace, Commission, Onboarding, Notifications, and the Glass Box student view.

Out of scope for now: social templates, slides, email, print. These are covered by the guide but are not frontend work.

### Quick brand test (every screen must pass)
Every screen needs all of the following, each exactly once where it applies:
- a soft blue canvas (or Night Blue for dark sections)
- Inter
- Deep Navy text
- one Primary Blue action per view
- pill buttons
- 6px tags
- at most one hero effect
- the notch at the bottom-right, and only on brand/marketing cards

If anything is missing or doubled, the screen is off-brand.

---

## 1. Setup

### 1.1 File structure (suggested)
```
src/
  styles/
    tokens/
      primitives.css      # raw colors, spacing, radius, type, shadow, motion
      semantic.css        # role tokens mapped from primitives (light + dark)
      utilities.css       # .ub-glass-light, .ub-canvas-light, .ub-notch-*, .ub-tabular, .ub-ref
    globals.css           # imports the above + fonts + base styles
  components/ub/
    core/ forms/ navigation/ feedback/ data/ brand/ icons/
  app/(internal)/design-system/
    page.tsx              # guideline page index
    [section]/page.tsx    # one route per section (optional)
```

> If the shared **Unibexs Design System** project (with `styles.css`, `tokens/` and `components/`) is available to you, import its tokens directly instead of re-typing them. The values below are taken from the PDF guide.

### 1.2 Fonts
- **Inter** for all Latin text (EN, BM, ID). Use weights 400, 500, 600 and 700 via `next/font/google`.
- **Thmanya Sans** for Arabic. The files ship separately as local fonts. Use `next/font/local` and wait for licensing confirmation (see §11).
- Enable OpenType features:
  - `.ub-tabular { font-variant-numeric: tabular-nums; }` for tables, amounts, dates and KPIs.
  - `.ub-ref { font-feature-settings: "ss02"; }` for reference IDs, student IDs and passport numbers.
- **Never** use a monospace font for IDs.

### 1.3 Root
```html
<html lang="en" dir="ltr">            <!-- light is default -->
<section data-ub-theme="dark">…</section>  <!-- opt-in dark section -->
```
- Use logical CSS properties everywhere (`margin-inline-start`, `padding-inline`, `inset-inline-end`). In Tailwind, use `ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*` and `end-*`, never `ml/mr/pl/pr/left/right`.

---

## 2. Tokens

**Rules:**
- Every token name starts with `--ub-`.
- Components use **semantic tokens only**.
- Never hard-code a hex value, pixel size or font name that already has a token.

### 2.1 Color primitives

**Brand**
| Token | Hex | Role |
|---|---|---|
| `--ub-deep-navy` (= neutral-950) | `#000C29` | Primary text, dark canvas |
| `--ub-primary-blue` (= blue-600) | `#0348D1` | CTAs, links, active, progress |
| `--ub-light-blue` (= blue-50) | `#EBF1FF` | Light fills, selected states |
| `--ub-light-grey` (= neutral-100) | `#E9EDF3` | Quiet surfaces, disabled fills |
| White (neutral-0) | `#FFFFFF` | Base surface |

**Blue scale**
| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|
| `#EBF1FF` | `#D6E3FF` | `#B9CFFE` | `#92B5FD` | `#6394FA` | `#356FED` | `#0348D1` | `#023CAA` | `#023085` | `#012364` | `#011746` |

**Neutral scale (navy-tinted)**
| 0 | 25 | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `#FFFFFF` | `#F8FAFD` | `#F3F5F9` | `#E9EDF3` | `#DBE0E8` | `#C6CDD7` | `#9DA5B3` | `#778190` | `#596475` | `#3F4B5E` | `#25334A` | `#0D1E38` | `#000C29` |

Neutral usage:
- **200:** default borders
- **400:** disabled only, never for text
- **500:** form control borders
- **600:** captions and placeholders
- **700:** secondary text

**Dark surfaces**
| Token | Hex | Use |
|---|---|---|
| navy-canvas | `#000C29` | Page |
| navy-surface-1 | `#041634` | Cards, panels |
| navy-surface-2 | `#0C203E` | Dropdowns, popovers, glass fallback |
| navy-surface-3 | `#192B49` | Modals |
| navy-border | `#253857` | Dividers |
| navy-border-strong | `#5A7092` | Form borders |

**Semantic colors**
| Role | 50 bg | 200 border | 500 indicator | 600 fill | 700 text | 800 |
|---|---|---|---|---|---|---|
| Success | `#ECF9EE` | `#B8E5C0` | `#27A654` | `#09853D` | `#086D31` | `#005725` |
| Warning | `#FFF5EA` | `#FCD7AE` | `#FFA92C` | `#D98B06` | `#9D6301` | `#7E4F04` |
| Danger | `#FFF2F0` | `#FFC8C1` | `#F1453F` | `#D00016` | `#AC0211` | `#8A040C` |
| Info | `#EBF7FF` | `#B5DEF8` | `#0F97D1` | `#0678A7` | `#05628A` | `#054E6E` |

How to apply them:
- **Tinted alerts:** 700 text on the 50 background with a 200 border. Warning alerts use 800 text instead.
- **Warning fills:** never put white text on warning. Use a warning-500 fill with Deep Navy text.
- **Filled success and danger buttons:** white text on the 600 fill.

**Tag hues** (functional only: Stage, Status and Days tags)
| Hue | solid (dots/bars only) | bg | border | text | bg dark | text dark |
|---|---|---|---|---|---|---|
| sky | `#55CAF3` | `#DEF4FE` | `#AFDCEF` | `#016F8D` | `#0A303D` | `#6CBCDA` |
| indigo | `#3E63DD` | `#EAF0FF` | `#C2D4FE` | `#4060BE` | `#1A2950` | `#8FAEFD` |
| orange | `#F76808` | `#FFECE3` | `#FDC6AF` | `#AC4709` | `#481C06` | `#F7966B` |
| plum | `#AC4CBB` | `#FAEAFC` | `#EBC6F0` | `#91489C` | `#3C1D41` | `#D996E4` |
| amber | `#FFC704` | `#F9EFDA` | `#E7D2A0` | `#7F6204` | `#372901` | `#D3AC41` |
| red | `#E5484D` | `#FFEBE9` | `#FEC3BF` | `#B23B3E` | `#4A1919` | `#FB908B` |
| pink | `#F46396` | `#FFEAEF` | `#FDC2D1` | `#AA3E65` | `#471929` | `#F68EAD` |
| teal | `#15A695` | `#DFF6F1` | `#B0E0D7` | `#067367` | `#0A332D` | `#6DC1B3` |
| grey | `#BBBBBB` | `#EDF0F5` | `#CFD5DD` | `#5E6774` | `#282C31` | `#A9B2C0` |

**Chart palette:**
- **Categorical, in order:** `#0348D1, #15A695, #FFC704, #AC4CBB, #55CAF3, #F76808, #F46396, #9DA5B3`. Use at most 6 series, then group the rest into "Other".
- **Dark mode:** categorical blue shifts to blue-400.
- **Sequential:** blue-100 to blue-900.
- **Diverging:** danger-600, neutral-200, blue-600.
- **Axes and labels:**
  - Gridlines: neutral-200.
  - Axis labels: neutral-600 at 12px.
  - Prefer direct labels over legends.

**Atmosphere colors** (Mid Blue `#6590E4`, Sky `#C8EBFF`, Hill Green `#88A201`, Hill Light `#C5E083`, Violet Glow `#3C45D4`): **do not use in product UI.** They are for brand and social only.

### 2.2 Semantic tokens (minimum set to implement)
```css
:root {
  /* backgrounds */
  --ub-bg-canvas: var(--ub-neutral-50);            /* fallback under the canvas gradient */
  --ub-bg-surface: var(--ub-neutral-0);
  --ub-bg-surface-subtle: var(--ub-neutral-25);
  --ub-bg-selected: var(--ub-blue-50);
  --ub-bg-disabled: var(--ub-neutral-100);
  /* text */
  --ub-text-primary: var(--ub-neutral-950);
  --ub-text-secondary: var(--ub-neutral-700);
  --ub-text-tertiary: var(--ub-neutral-600);
  --ub-text-disabled: var(--ub-neutral-400);
  --ub-text-link: var(--ub-blue-600);
  --ub-text-on-action: #FFFFFF;
  /* borders */
  --ub-border-default: var(--ub-neutral-200);
  --ub-border-control: var(--ub-neutral-500);
  --ub-border-focus: var(--ub-blue-600);
  /* actions */
  --ub-action-primary-bg: var(--ub-blue-600);
  --ub-action-primary-bg-hover: var(--ub-blue-700);
  --ub-action-primary-bg-pressed: var(--ub-blue-800);
  --ub-action-primary-text: #FFFFFF;
  --ub-action-secondary-border: var(--ub-blue-600);
  --ub-action-secondary-bg-hover: var(--ub-blue-50);
}
[data-ub-theme="dark"] {
  --ub-bg-canvas: #000C29;
  --ub-bg-surface: #041634;
  --ub-text-primary: #FFFFFF;
  --ub-text-secondary: var(--ub-blue-200);
  --ub-text-link: var(--ub-blue-300);
  --ub-border-default: #253857;
  --ub-border-control: #5A7092;
  --ub-border-focus: var(--ub-blue-300);
  --ub-action-primary-bg: var(--ub-blue-500);
  /* never Primary Blue text on navy (2.63:1 fails) */
}
```

### 2.3 Spacing (4px base, 8px rhythm)
| space-0-5 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24 | 32 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2 | 4 | 8 | 12 | 16 | 20 | 24 | 32 | 40 | 48 | 64 | 80 | 96 | 128 |

| Relationship | Gap |
|---|---|
| Related items | 4–8 |
| Within a group | 12–16 |
| Between groups | 24–32 |
| Between sections | 48–96 |

### 2.4 Radius
| Token | px | For |
|---|---|---|
| radius-xs | 4 | Checkboxes, chips in inputs |
| radius-sm | 6 | **Tags and badges** (never pills) |
| radius-md | 8 | Inputs, selects, dropdown items, nav items, tooltips |
| radius-lg | 12 | Cards, dropzones, table containers |
| radius-xl | 16 | Modals, drawers, glass panels |
| radius-2xl | 24 | Marketing cards (web) |
| radius-full | 9999 | **All buttons**, avatars, switches, progress bars, search field |

### 2.5 Type — product UI scale
| Token | Size/line | Weight | Use |
|---|---|---|---|
| display-lg | 48/56 | 700 | Marketing hero |
| display-md | 40/48 | 700 | Dashboard welcome, empty-state hero |
| heading-xl | 32/40 | 700 | Page titles |
| heading-lg | 24/32 | 700 | Section titles |
| heading-md | 20/28 | 600 | Card/modal titles |
| heading-sm | 18/26 | 600 | Sub-sections, drawer titles |
| body-lg | 18/28 | 400 | Onboarding, Knowledge Hub articles |
| body-md | 16/24 | 400 | Default |
| body-sm | 14/20 | 400 | Tables, dense UI, helper text |
| label-lg/md/sm | 16/14/12 | 500 | Buttons, labels, tabs, tags, table headers |
| caption | 12/16 | 400 | Timestamps, metadata |
| data-xl / data-lg | 40 / 28 | 700 | KPI values (tabular) |

**Responsive and spacing rules:**
- Minimum text size is **12px**.
- Below 640px:
  - display-lg becomes 36/44
  - display-md becomes 32/40
  - heading-xl becomes 28/36
- Letter-spacing:
  - Display: −0.02em
  - heading-xl: −0.015em
  - Body: 0

**Writing and layout rules:**
- Use sentence case everywhere.
- Left-align text. Never justify.
- Reading containers are at most 680px wide.
- In product UI, emphasize with weight or size only. Never use color or italics for emphasis.

**Arabic:**
- No letter-spacing.
- No italics.
- Add 4px of line height to every step.
- Use Western numerals for data.
- Put `dir="auto"` on mixed-direction strings.

### 2.6 Elevation (navy-tinted, floating layers only)
| Token | Value | For |
|---|---|---|
| shadow-xs | `0 1px 2px rgba(0,12,41,.06)` | Secondary button hover |
| shadow-sm | `0 1px 3px rgba(0,12,41,.08), 0 1px 2px rgba(0,12,41,.04)` | Interactive card hover |
| shadow-md | `0 4px 12px rgba(0,12,41,.08), 0 2px 4px rgba(0,12,41,.04)` | Dropdowns, popovers |
| shadow-lg | `0 12px 32px rgba(0,12,41,.12), 0 4px 8px rgba(0,12,41,.04)` | Toasts, drawers |
| shadow-xl | `0 24px 64px rgba(0,12,41,.18)` | Modals |

Resting cards use a **border, not a shadow**.

### 2.7 Borders
| Width | For |
|---|---|
| 1px | Default borders, dividers, cards, inputs |
| 1.5px | Outline buttons, dashed dropzones |
| 2px | Focus rings, selected cards, current tracker step |

### 2.8 Motion
| Token | Value | For |
|---|---|---|
| duration-fast | 120ms | Hover, press, toggle |
| duration-base | 200ms | Dropdowns, tooltips, toasts, tabs |
| duration-slow | 320ms | Modals, drawers, tracker step fill |
| duration-deliberate | 480ms | Page transitions, milestone reveal |
| ease-standard | `cubic-bezier(.2,0,0,1)` | Default |
| ease-enter | `cubic-bezier(0,0,.2,1)` | Elements appearing |
| ease-exit | `cubic-bezier(.4,0,1,1)` | Elements leaving |

**Motion rules:**
- Nothing loops.
- Under `prefers-reduced-motion`, use instant changes or 120ms fades, and turn shimmer off.

### 2.9 Breakpoints and grid
| Name | Min | Cols | Margin | Gutter |
|---|---|---|---|---|
| xs | 0 | 4 | 16 | 16 |
| sm | 640 | 8 | 24 | 16 |
| md | 768 | 8 | 32 | 24 |
| lg | 1024 | 12 | 32 | 24 |
| xl | 1280 | 12 | 40 | 24 |
| 2xl | 1536 | 12 | 48 | 32 |

Max widths:
- Dashboards: 1440
- Forms: 720
- Reading: 680
- Marketing: 1200 (1320 at 2xl)

### 2.10 Tailwind mapping
Extend `tailwind.config` so classes resolve to the CSS variables, not hex values:
```js
theme: {
  extend: {
    colors: {
      navy: 'var(--ub-deep-navy)',
      blue: { 50:'var(--ub-blue-50)', /* … */ 600:'var(--ub-blue-600)', /* … */ },
      neutral: { /* 0…950 */ },
      surface: 'var(--ub-bg-surface)',
      'text-primary': 'var(--ub-text-primary)',
      /* semantic + tag hues */
    },
    borderRadius: { xs:'4px', sm:'6px', md:'8px', lg:'12px', xl:'16px', '2xl':'24px', full:'9999px' },
    fontFamily: { sans: ['var(--font-inter)', 'Arial', 'sans-serif'], arabic: ['var(--font-thmanya)', 'sans-serif'] },
    screens: { sm:'640px', md:'768px', lg:'1024px', xl:'1280px', '2xl':'1536px' },
  }
}
```
**Lint rule:** ban arbitrary hex values in `className` (for example `bg-[#…]`) in code review.

> ⚠️ **Migration note.** The current portal already has `--radius-control: 8px`, `--radius-card: 12px` and `--radius-pill: 999px`.
> - These map to `radius-md`, `radius-lg` and `radius-full`. Alias the old names to the new ones, then remove them.
> - The Apple HIG type scale applied to the earlier dashboard mockup is **superseded** by the Inter scale in §2.5.

---

## 3. Surfaces

### 3.1 Canvas
**`.ub-canvas-light`:** a soft blue radial wash on `#F5F8FF`. This is the app background behind all product screens.

### 3.2 Light glass (primary surface)
**`.ub-glass-light`** (also available as the `GlassPanel` component):
- **Fill:** white at 62%. Use 82% for the strong variant.
- **Effect:** `backdrop-filter: blur(20px) saturate(160%)`.
- **Edge:** an inner white highlight, a faint blue hairline and a soft navy shadow.

Use glass for:
- the sidebar
- the top bar
- stat cards
- summary cards
- pills

Use **solid white** for:
- data tables
- forms
- any text longer than two lines

**Fallback:** use solid white when `@supports not (backdrop-filter: blur(1px))` is true, or under `prefers-reduced-transparency: reduce`.

### 3.3 Dark glass
**`.ub-glass`:**
- **Fill:** white at 8% (up to 15%).
- **Border:** 1px white at 14%.
- **Effect:** 24px blur.
- **Fallback:** `#0C203E`.

Use dark glass in dark sections only, and never on data tables.

### 3.4 Glow (dark only)
**`--ub-glow-action`:** a 1px blue-400 ring plus a 24px Primary Blue bloom. Use it for:
- the primary button on hover and focus in dark mode
- the current tracker step

### 3.5 The notch
- **Shape:** a 45° cut at the **bottom-right** (bottom-left under `dir="rtl"`).
- **Sizes:**
  - `.ub-notch-sm`: 12
  - `.ub-notch-md`: 24
  - `.ub-notch-lg`: 40
- **Allowed on:** marketing cards, milestone moments, the Verified Badge, feature cards.
- **Never on:** standard product cards, tables, inputs or modals.

**Implementation:**
- Use `clip-path`.
- Clip-path removes borders and shadows, so:
  - draw borders with an inner SVG stroke
  - draw shadows with `filter: drop-shadow()` on a wrapper element
- On marketing cards, the symbol sits in the cut-out.

---

## 4. Components

**Every component must:**
- use semantic tokens only
- implement all states (default, hover, focus-visible, pressed, disabled, loading where relevant)
- support dark mode and RTL
- use realistic Unibexs copy

**Priority order:**
1. **Core:** Button, TextButton, IconButton, ButtonGroup
2. **Forms:** Input, Dropdown/Combobox, Checkbox, Radio(+Group), Toggle, Stepper, FileUpload
3. **Data:** Card, StatCard, Tag/Badge/DaysTag/Chip/CountBadge, Avatar(+Group), List, DataTable
4. **Navigation:** Sidebar (NavbarSide), NavbarTop, NavbarBottom, Tabs, Breadcrumbs, Pagination, ContextMenu
5. **Feedback:** Alert (inline and toast), Tooltip, Modal (PopUp), Drawer, ActionSheet, ProgressBar, Loader/Skeleton, EmptyState
6. **Brand:** Logo, NotchedCard, VerifiedBadge, VerificationStamp, **ApplicationTracker**, GlassPanel, MilestoneMoment
7. **Icon:** an Iconoir wrapper

### 4.1 Button
| Variant | Default | Hover / pressed | Use |
|---|---|---|---|
| Primary | blue-600 fill, white | blue-700 / blue-800 | The one strong action per view |
| Secondary | 1.5px blue-600 border and text | blue-50 / blue-100 fill | Supporting actions |
| Tertiary | blue-600 text | blue-50 / blue-100 fill | Low emphasis in cards and tables |
| Positive | success-600, white | 700 / 800 | Approve, confirm |
| Destructive | danger-600, white | 700 / 800 | Filled **only inside confirmation dialogs** |
| Inverse | Light Blue fill, blue-600 text | white / blue-100 | Primary CTA on dark or blue |

**Sizes:** sm 32, md 40 (default), lg 48. All buttons are pills.

**States:**
- **Focus:** a 2px blue-600 ring with a 2px offset.
- **Disabled:** neutral-100 fill with neutral-400 text.
- **Loading:** a spinner replaces the leading icon, and the button width stays locked.

**Rules:**
- One Primary per view.
- Labels are verb + object, for example "Submit application". The resulting status uses the same words: "Application submitted".
- In dialogs, the Primary comes last in reading order.
- Never put more than three buttons in a row.
- Icon buttons are circles (32/40/48) with an `aria-label` and a tooltip.

### 4.2 Form fields
**Text field:**
- **Size:** height 40 on desktop, 48 on mobile.
- **Shape:** 12px inline padding, radius 8, 1px neutral-500 border.
- **Label:** label-md, above the field.
- **Helper text:** body-sm in neutral-600, below the field.
- **Optional fields:** mark the label "(optional)".

**States:**
- **Hover:** neutral-600 border.
- **Focus:** blue-600 border plus a ring.
- **Error:** danger-600 border, with a message that says what happened and how to fix it.
- **Disabled:** neutral-50 fill.

**Domain fields:**
- **Phone:** +60 by default.
- **Currency:** RM prefix with tabular numerals.
- **Date:** `DD MMM YYYY`.
- **Passport number:** auto-uppercase with `.ub-ref`.
- **Institution combobox:** shows logo, city and country.
- **Intake:** month-year chips.

**Selection controls:**
- **Checkbox:** 20px, radius 4.
- **Radio:** 20px with a 6px dot.
- **Toggle:** 40×24 pill, for settings that apply instantly.

**File upload:**
- **Dropzone:** dashed 1.5px border, radius 12.
- **File row states:** Uploading, Uploaded, Verified, or Needs replacing (with a reason).

### 4.3 Tags
**Shape:**
- **Height:** 24 (md) or 20 (sm).
- **Padding and radius:** 8px inline padding, **radius 6**.
- **Text:** label-sm. Text is always present.
- **Optional extras:** a 6px dot or a 12px icon.

**Stage tags** (proposal, pending confirmation, see §11):
| Stage | Hue (suggested by the guide's screenshots) |
|---|---|
| Enquiry | grey |
| Documents pending | amber |
| Submitted to Institution | indigo |
| In Institution review | sky |
| Offer received | teal |
| Visa in progress | plum |
| Arrival and Logistics | pink |
| Enrolled | success |
| Commission paid | success |
| Withdrawn | grey |

"Action needed" is a **flag** shown next to the stage tag, not a stage.

**Days tag:**
| | Grey | Amber | Orange | Red |
|---|---|---|---|---|
| Days in stage | 0–3 | 4–7 | 8–14 | 15+ |
| Deadline | 15+ days | 8–14 | 1–7 | Due today or overdue |

Labels: "5 days in stage", "Due in 3 days", "Overdue by 2 days".

### 4.4 Card / StatCard
**Card:**
- **Base:** white surface, 1px neutral-200 border, radius 12, padding 24 (16 on mobile), no resting shadow.
- **Hover (interactive cards):** blue-300 border plus shadow-sm.
- **Selected:** 2px blue-600 border with a blue-50 fill.

**StatCard:**
- **Contents, top to bottom:**
  - a label with a 20px icon
  - the value in data-xl with tabular numerals
  - a delta tag
  - a context caption (for example "vs last intake")
  - an optional sparkline
- **Surface:** light glass.

### 4.5 Application Tracker (hero component)
**Layout:**
- Horizontal at 768px and wider, vertical below.
- Nodes are 24px. Connectors are 2px: blue-600 when completed, neutral-200 when remaining.

**Step states:**
| State | Appearance |
|---|---|
| Complete | Blue fill with a white check |
| Current | 2px ring with an 8px dot, label weight 600, plus a "Next step: …" line |
| Upcoming | neutral-300 outline with the step number |
| Needs attention | Danger fill with "!" |
| Skipped | Dashed, labelled "Not required" |

**Markup and motion:**
- Use `<ol>` with `aria-current="step"` on the current step.
- Announce updates through an `aria-live="polite"` region.
- On a status update, the connector fills over 320ms and the new tag pulses once.

### 4.6 Data table
**Container:** radius 12, with a neutral-50 header in label-sm.

**Rows:**
- **Height:** 56 (comfortable, default for Advisors) or 44 (compact, for team owners and the Institution portal).
- **First column:** avatar, name and reference ID (`.ub-ref`).
- **Amounts:** right-aligned with tabular numerals.

**Behavior:**
- Show a bulk-action bar when rows are selected.
- Below 768px, rows become stacked list items.
- Tables scroll inside their own container.

### 4.7 Other components
| Component | Spec |
|---|---|
| Avatar | Sizes 24/32/40/48/64/96. Initials in blue-700 on blue-50. Status dot is 25% of the diameter. Groups overlap by −8px; show a maximum of 4, then "+N". |
| Tabs | Height 44 with a 2px blue-600 underline. |
| Sidebar nav item | Height 40, radius 8. Active state is a blue-600 fill with white text. |
| Breadcrumbs | Chevrons mirror in RTL. |
| Modal | Widths 400/560/720, radius 16. Scrim `rgba(0,12,41,.56)`. Focus is trapped and Esc closes it. |
| Drawer | 480px wide, opening from the end edge. |
| Dropdown | Radius 12 with shadow-md. |
| Tooltip | neutral-900 background, max width 280px. |
| Toast | Navy surface with white text and a semantic icon, at the bottom-end. Auto-dismisses after 5s, except errors, which stay. |
| Inline alert | Tinted background, border and a 20px icon. |
| Progress bar | 8px pill. |
| Skeleton | neutral-100. |
| Empty state | A 32px icon in a 64px blue-50 circle, a heading-md title, one sentence and one Primary button. |
| Verified Badge | A Light Blue symbol on a blue-600 rounded square with notch-sm and a check. Sizes: 16 inline, label tag, 64–96 credential. Only for verified entities, never decorative. |
| Verification stamp | Shield-check icon with "Verified 12 Jun 2026". Fresh at ≤90 days (success), due for review at 91–180 (warning), expired at >180 (danger, plus "Confirm with the Institution before quoting"). |
| Milestone moment | A notched card (a full-screen sheet on mobile, shown once) with a stepped spotlight, a white heading and an Inverse button: "Share with the Earners Circle". |

### 4.8 Icons
**Set:** Iconoir. Ship the ~88 core glyphs locally through `<Icon name size />` and load the rest from the Iconoir CDN.

**Grid and stroke:**
- 24px grid.
- 1.5px stroke at 24/20px, 1.25px at 16px.
- Round caps and joins.

**Sizes:**
| Size | Use |
|---|---|
| 16 | Inline, tags |
| 20 | Buttons, inputs, nav |
| 24 | Standalone |
| 32 | Empty states |

**Color:**
- Use `currentColor`.
- Default is neutral-700. Interactive icons are blue-600.

**RTL:**
- Mirror directional icons: arrows, chevrons, back, send.
- Never mirror checks, clocks, media controls or the logo.

**No emoji, and no unicode characters used as icons.**

---

## 5. App shell

| Element | Spec |
|---|---|
| Canvas | `.ub-canvas-light` |
| Sidebar | Light glass, 256px expanded / 72px collapsed. Becomes bottom nav below 768px. |
| Top bar | Light glass, 64px. Contains the page title or breadcrumbs, a pill search ("Search students, Institutions…"), notifications and the avatar menu. Primary action: "Add student". |
| Content padding | 32 at lg and up, 24 at md, 16 at xs–sm. |
| Bottom nav | 64px plus the safe-area inset, with 4–5 items. |
| Sidebar sections | Home · Application Tracker (count) · Students · Commission · *Resources:* Knowledge Hub · Logistics Marketplace · Glass Box preview. Footer: Earners Circle onboarding card plus the user card (avatar, name, "Verified Advisor"). |

---

## 6. Screens to redesign

Match the reference screens in the guide: §00 for Advisor home, and §15 for the Tracker, Student profile, Knowledge Hub and Glass Box. **Treat those screens as exact** for spacing, radius, color, type and density.

| Screen | Must have |
|---|---|
| **Advisor home** | Greeting with today's date and the number of applications needing action. **Next actions list first**, each item with a Days tag and one button. Four stat cards (Active applications, Offers this intake, Commission pending, Placed this year). Pipeline bar by stage color. Upcoming deadlines. Onboarding card. Recent activity. |
| **Application Tracker** | Table view (default for team owners: compact, bulk actions) and Board view (columns by stage). Filters: Stage, Institution, Intake, Advisor, Action needed. Saved views. Pagination. |
| **Student profile** | Avatar, name, reference ID, stage tag and Days tag. **The next action is the Primary button.** Tabs: Overview · Applications · Documents · Commission · Activity. Horizontal tracker with a "Next step". Document rows with states. Stale-fee warning alert. Commission card ("Tracked automatically"). Contact card (WhatsApp). "Withdraw application" opens a confirmation dialog. |
| **Knowledge Hub** | Search plus Intake and Location filters, and Foundation/Degree chips. Program cards show annual tuition in RM (tabular), intakes, entry requirements and a verification stamp. Compare up to 3 programs. |
| **Logistics Marketplace** | Service cards: provider, verification stamp, price in RM, availability and a "Book" button. |
| **Commission** | Expected / Invoiced / Paid as status tags. Due date as a Days tag. KPI totals. "Tracked automatically" note. |
| **Onboarding** | Five-step checklist with a progress bar. **The Non-Compete Covenant step is required and is never skipped or collapsed.** Ends with the Earners Circle welcome. |
| **Notifications** | Each item states the event, then the next step. Unread items show an 8px blue dot. Grouped into Today / This week / Earlier. |
| **Glass Box** (student-facing, public link) | Mobile-first, light, read-only. Shows the Advisor with a Verified Badge, a vertical tracker, "What happens next" and "Message your Advisor" (WhatsApp). EN / BM / العربية switcher. **Never shows commission or internal notes.** |
| **Institution portal** (later) | Authority register, compact density, no gradients or glow. Batch review and CSV/PDF export. |

---

## 7. The guideline page (`/design-system`)

This is an internal route, gated to staff (feature flag or role check). It is a single scrollable page with a sticky left table of contents, or one route per section. **Everything must render from the real tokens and components. Never use screenshots.**

### 7.1 Sections and contents
| # | Section | What it renders |
|---|---|---|
| 00 | Overview | Intro, the quick brand test checklist, light/dark theme toggle, LTR/RTL toggle (both global for the page) |
| 01 | Brand | Logo variations on white, navy, Light Blue and Primary Blue. Clear-space and minimum-size diagram. Tagline. Do/Don't tiles. |
| 02 | Voice and terminology | Approved terms table (Never → Always). Writing rules. Examples table (instead of → use). Date, time, currency and number formats. |
| 03 | Color | Swatches for brand, blue scale, neutral scale, dark surfaces, semantic colors and tag hues. Each swatch shows the token name, hex, and **live-computed** contrast ratios on white and on navy, plus a click-to-copy of the CSS variable. "Verified contrast pairs" grid (Use / Avoid). |
| 04 | Typography | Each type token rendered with its live size, line height and weight. Tabular vs proportional numeral demo. `ss02` demo with `UBX-2026-0412`, `Il1 O0`. Arabic sample in Thmanya Sans. |
| 05 | Spacing and layout | Spacing scale bars, breakpoint table, grid overlay toggle, app shell anatomy diagram. |
| 06 | Radius, borders, notch | Radius tiles, border widths, notch sm/md/lg in each allowed fill. |
| 07 | Surfaces | Canvas, light glass vs solid white, dark glass, elevation tiles, glow (dark only). |
| 08 | Icons | Searchable grid of core Iconoir glyphs, sizes, and a mirrored-vs-not RTL demo. |
| 09 | Motion | Buttons that replay each duration and easing. Tracker step-fill demo. Reduced-motion note. |
| 10 | Components | One block per component: live **playground** (variant, size and state controls), all states side by side, dark and RTL previews, a props table, a do/don't note, and a copyable code snippet. |
| 11 | Patterns | Embedded mini versions of Advisor home, Tracker (table/board), Student profile, Knowledge Hub card, Glass Box mobile frame, empty states, error states. |
| 12 | Accessibility | Checklist (see §9). Keyboard map. Focus-ring demo. |
| 13 | Changelog and open questions | Version, date, and the open questions from §11 with status. |

### 7.2 Page behavior
- **Theme and direction:** global toggles for theme (`data-ub-theme`) and direction (`dir`), persisted in `localStorage` inside a try/catch.
- **Copy:**
  - Every swatch and token copies its `var(--ub-…)` on click.
  - Every component block has a "Copy JSX" button.
- **Deep links:** each section and component has an anchor (`/design-system#button`).
- **Contrast computation:** compute contrast in JS from the actual resolved CSS values (`getComputedStyle`). This way, a token change shows up immediately and failures are flagged in red.
- **Layout:** the page itself uses the app shell and passes the brand test.

### 7.3 Optional (if using Storybook)
If you prefer Storybook for component isolation, keep it. But the `/design-system` route is still required: it is the shareable reference for non-developers and lives inside the real app with the real fonts.

---

## 8. Copy rules (enforced in code review)

**Terminology (non-negotiable):**
| Never | Always |
|---|---|
| agent, agency | **Advisor** |
| university (as a category) | **Institution** |
| platform, TPS | **Unibexs System** |
| university database, fee sheet | **Knowledge Hub** |
| tracker tool | **Application Tracker** |
| logistics support | **Logistics Marketplace** |
| enrolled (as proof point) | **placed** |

**Writing rules:**
- Sentence case everywhere.
- No emoji.
- **No lorem ipsum**, even in the guideline page. Use realistic data: Nur Aisyah Binti Kamal, Sunway University, RM4,200, UBX-2026-0412.
- Errors state what happened and how to fix it. Example: "This file is over 10 MB. Upload a PDF under 10 MB."
- Empty states invite action. Example: "No applications yet. Add your first student to start tracking every step."
- Destructive confirmations name the consequence. Example: "Withdraw this application? The Institution will be notified, and this can't be undone."

**Formats:**
| Type | Format |
|---|---|
| Date | `12 Jun 2026`, or relative under 7 days ("2 hours ago") |
| Time | `2:30 pm` |
| Currency | `RM4,200` (no space), `SGD 3,000` |
| Numbers | `3,500` |

**Move strings into a dictionary** (for example `next-intl`) now, so that BM and Arabic can be added without refactoring.

---

## 9. Accessibility (WCAG 2.2 AA minimum)

**Contrast:**
- Text needs ≥4.5:1, or 3:1 at 24px+ / 18.66px bold.
- UI boundaries and focus indicators need ≥3:1.
- Never use neutral-400 or blue-400 for text.
- White text goes only on blue-600 or darker.

**Focus:**
- A 2px ring that is never removed: blue-600 on light, blue-300 on dark.

**Targets:**
- At least 24×24, and 44×44 on touch.

**Keyboard and screen readers:**
- Everything is operable by keyboard.
- Esc closes overlays.
- Arrow keys move through tabs, menus and radio groups.
- Use semantic HTML.
- Icon buttons are labelled.
- Status updates use `aria-live="polite"`.

**Meaning and preferences:**
- Color is never the only signal. Tags always have text, and status always has an icon or label.
- Honor `prefers-reduced-motion` and `prefers-reduced-transparency`.

**Zoom:**
- Layouts hold at 200% zoom with no horizontal scroll, except tables, which scroll in their own container.

**Language and direction:**
- Set `lang` and `dir`.
- Use logical properties.

---

## 10. Delivery plan

| Phase | Output | Done when |
|---|---|---|
| 1. Foundations | Tokens (primitives, semantic, dark), fonts, utilities, Tailwind mapping, hex-ban lint | `/design-system` sections 01–09 render from tokens |
| 2. Core components | Button, form fields, Tag/DaysTag, Card/StatCard, Avatar, Icon, Alert/Toast, Modal/Drawer, Tooltip, EmptyState | Each has a playground plus dark and RTL previews on the guideline page |
| 3. Brand and data components | ApplicationTracker, DataTable, VerifiedBadge, VerificationStamp, GlassPanel, NotchedCard, navigation set | Tracker passes all 5 states, horizontal and vertical |
| 4. App shell | Glass sidebar and top bar, bottom nav, canvas | Shell matches §00 at lg, md and xs |
| 5. Screens | Advisor home → Tracker → Student profile → Knowledge Hub → Commission → Logistics → Onboarding → Notifications | Each passes the §12 checklist |
| 6. Glass Box | Public, mobile-first student view | Works in EN plus RTL; no commission or internal notes leak (checked at the API level, not just hidden in the UI) |

Ship each phase behind a feature flag. Open PRs per phase, with before/after screenshots at 1440, 768 and 375 widths.

---

## 11. Open questions (blockers marked ⛔)

These are unresolved in the guide. **Do not hard-code assumptions.** Keep them as tokens or config so the answer is a one-line change.

1. ⛔ **Application stages.** The real stage list is not confirmed. The guide has three versions:
   - 10 stage tags (Enquiry → Withdrawn)
   - a 5-step tracker on the Student profile (Enquiry, Documents, Submitted, Offer, Visa)
   - a 6-step tracker in the Glass Box (plus Arrival)

   The website copy says "5-stage workflow". Build stages from a config array, and get the final list from backend/product.
2. **Primary Blue** `#0348D1` vs the retired `#1A4EB5`. Confirmation is pending, but `#0348D1` is the token value.
3. **Thmanya Sans** licensing for the web. Until confirmed, fall back to a system Arabic font.
4. **Badge name.** "Unibexs Verified Badge" (guide) vs "Trust Badge" (website). Keep the label in the copy dictionary.
5. **Proof points.** 40% vs 70% admin saving, and the current Advisor count. Do not show either number in product UI until confirmed.
6. **Icons.** Iconoir (decided in Oct 2026) vs Lucide (named in the brief). Sign-off is pending. Wrap icons in `<Icon>` so the set can be swapped.
7. **Languages** beyond EN/AR (BM, ID, Chinese). Use **Western** vs Eastern Arabic numerals in Arabic UI; default to Western.
8. **Missing assets:** SVG logos and mono navy logo/symbol. Use PNGs at 2× for now and request SVGs.

---

## 12. PR acceptance checklist (per screen)

- [ ] Only `--ub-*` tokens are used; there are no raw hex values, pixel radii or font names.
- [ ] There is one Primary button in the view, and its label is verb + object.
- [ ] Buttons are pills, tags are 6px, and cards are radius 12 with a border and no resting shadow.
- [ ] Glass is used only on chrome and summaries; data, forms and long text are on solid white.
- [ ] There is no notch on product cards, tables, inputs or modals.
- [ ] There is at most one hero effect, and no glow in light mode.
- [ ] Tabular numerals are used for amounts, dates and KPIs, and `.ub-ref` for IDs.
- [ ] Only approved terms are used. There is no "agent", "university" (as a category), "platform" or "enrolled" as a proof point.
- [ ] Sentence case, no emoji, no lorem ipsum, and the date/currency formats are correct.
- [ ] The screen looks right in light and dark (where applicable) and in LTR and RTL.
- [ ] The screen works at 375, 768, 1024 and 1440 widths, and at 200% zoom.
- [ ] Keyboard only: tab order, visible focus, and Esc closes overlays.
- [ ] Contrast passes, and color is never the only signal.
- [ ] Reduced motion and reduced transparency are respected.
- [ ] It matches the guide's reference screen for spacing, radius, color, type and density.

---

*Reference: Unibexs Design System Guide v1.1 (Unibexs Brand & Product Design, 20 Oct 2026). The starter brief and full rules are in that PDF; attach it alongside this file.*

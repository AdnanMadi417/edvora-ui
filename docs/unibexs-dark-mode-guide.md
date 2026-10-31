# Unibexs System — Dark Mode Guide (Near-Black)

**Version:** 1.0 · 31 Oct 2026 · Proposal for Brand sign-off
**Companion to:** *Unibexs Design System Guide v1.1* and `unibexs-frontend-redesign-brief.md`
**Reference screen:** "Unibexs Advisor Home — Dark" design canvas

Values marked **(guide)** come from v1.1. Values marked **(derived)** are new; every text pair was contrast-checked (WCAG 2.2 AA).

---

## 1. The idea

**Black and white, with Unibexs blue for action.** A near-black ground with a trace of the brand's navy hue, white text, cool greys for support, and blue only where the user can act. It reads as black and white but still sits beside the logo naturally.

**Why near-black and not pure black:** the guide keeps neutrals navy-tinted and bans charcoal. These greys carry a hint of the brand hue, so they stay inside the system. Pure `#000` also causes glare next to white text on OLED phones.

### Where it applies
| Surface | Dark mode |
|---|---|
| Advisor portal (all screens) | Yes, user choice |
| Institution portal | Yes, but no glow and no gradients |
| Glass Box (student link) | **No — always light** (guide §15) |
| `/design-system` page | Yes, via the page toggle |
| Social, slides, email, print | Not affected (Night Blue social stays navy) |

### How it switches
- Follows the device setting by default. Light / Dark / System switch in the avatar menu.
- The choice is remembered and applied before first paint.
- Code: `data-ub-theme="dark"` on `<html>`. Components never change; only tokens do.

### What never changes
Inter, type scale, spacing, radius, pill buttons, 6px tags, terminology, icon set, notch rules, one Primary action per view.

---

## 2. Color tokens

### 2.1 Surfaces — elevation by lightness, not shadow
| Layer | Token | Hex | White text |
|---|---|---|---|
| Canvas (page) | `--ub-bg-canvas` | `#07090E` | 19.92:1 |
| Surface (cards, tables, forms) | `--ub-bg-surface` | `#0E1118` | 18.88:1 |
| Raised (dropdowns, popovers) | `--ub-bg-surface-raised` | `#161A23` | 17.41:1 |
| Overlay (modals, toasts, tooltips) | `--ub-bg-overlay` | `#1F2430` | 15.52:1 |
| Glass (sidebar, top bar, stat cards) | `--ub-glass-dark-bg` | white 4% + 24px blur, border white 8% | — |

Rule: every floating layer is one step lighter than what is under it.
Canvas may carry one faint blue radial wash at the top (`rgba(53,111,237,0.10)`), nothing more. **(derived)**

### 2.2 Text **(derived)**
| Role | Token | Hex | On surface |
|---|---|---|---|
| Primary | `--ub-text-primary` | `#FFFFFF` | 18.88:1 |
| Secondary | `--ub-text-secondary` | `#B4BBC8` | 9.79:1 |
| Tertiary (captions, placeholders) | `--ub-text-tertiary` | `#8A93A3` | 6.10:1 |
| Disabled | `--ub-text-disabled` | `#5C6577` | 3.22:1 (exempt) |
| Link | `--ub-text-link` | blue-300 `#92B5FD` **(guide)** | 9.22:1 |

### 2.3 Borders and focus
| Role | Token | Value |
|---|---|---|
| Default border, divider | `--ub-border-default` | `#2B3140` (decorative) |
| Form control border | `--ub-border-control` | `#5C6577` (3.22:1, passes 3:1) |
| Focus ring | `--ub-border-focus` | blue-300 `#92B5FD`, 2px + 2px offset **(guide)** |
| Selected row / item | `--ub-bg-selected` | blue-950 `#011746` with blue-200 label (11.07:1) |

### 2.4 Actions
| Button | Default | Hover | Pressed | Text |
|---|---|---|---|---|
| Primary | blue-500 `#356FED` | blue-500 + `--ub-glow-action` | blue-600 `#0348D1` | white (4.52:1) |
| Secondary | 1.5px blue-300 border + text | white 8% fill | white 12% fill | blue-300 |
| Tertiary | blue-300 text | white 8% fill | white 12% fill | blue-300 |
| Inverse | Light Blue fill | white | blue-100 | blue-600 (6.51:1) |
| Positive / Destructive | success-600 / danger-600 | 700 | 800 | white |
| Disabled | white 8% fill | — | — | `#5C6577` |

Never:
- White text on blue-400 or lighter (2.94:1 fails) — so hover is the glow, not a lighter fill.
- blue-600 `#0348D1` as text on dark (fails).

### 2.5 Alerts **(derived)**
| Role | Background | Border | Text | Text contrast | Icon |
|---|---|---|---|---|---|
| Success | `#11231F` | `#184D30` | `#6FD394` | 8.89:1 | `#27A654` · 5.19:1 |
| Warning | `#2B231A` | `#6E4E20` | `#FFC56B` | 9.90:1 | `#FFA92C` · 8.07:1 |
| Danger | `#29171D` | `#692628` | `#FF8A84` | 7.47:1 | `#F1453F` · 4.59:1 |
| Info | `#0E212E` | `#0E4762` | `#6CC6F0` | 8.60:1 | `#0F97D1` · 4.99:1 |

Formula: surface tinted 12% with the role's 500, border at 40%. Icon + text carry the meaning.

### 2.6 Tags **(guide)**
Use v1.1's **bg dark / text dark** per hue; border = solid hue at 40%. All pairs ≥6.5:1.
| sky | indigo | orange | plum | amber | red | pink | teal | grey |
|---|---|---|---|---|---|---|---|---|
| `#0A303D` / `#6CBCDA` | `#1A2950` / `#8FAEFD` | `#481C06` / `#F7966B` | `#3C1D41` / `#D996E4` | `#372901` / `#D3AC41` | `#4A1919` / `#FB908B` | `#471929` / `#F68EAD` | `#0A332D` / `#6DC1B3` | `#282C31` / `#A9B2C0` |

Days tag logic unchanged: grey 0–3 → amber 4–7 → orange 8–14 → red 15+.

### 2.7 Charts
- Series 1 = blue-400 `#6394FA` **(guide)**; other categorical colors unchanged.
- Gridlines `#2B3140`, axis labels `#B4BBC8`, direct labels white.
- Sparklines and progress fill: blue-400. Progress track `#2B3140`.

---

## 3. Surfaces and effects

| Element | Light | Dark |
|---|---|---|
| Canvas | Soft blue wash | `#07090E` + optional faint blue radial |
| Sidebar, top bar, stat cards | Light glass | Dark glass (white 4%, border white 8%, 24px blur; fallback `#161A23`) |
| Tables, forms, long text | Solid white | **Solid** `#0E1118` — never glass |
| Resting card | Border, no shadow | 1px `#2B3140`, no shadow |
| Dropdown / popover | shadow-md | `#161A23` + 1px border |
| Modal | shadow-xl, navy scrim | `#1F2430` + 1px `#5C6577`; scrim black 60% |
| Toast, tooltip | Navy | `#1F2430` + 1px `#5C6577` |
| Glow | Never | Primary button hover/focus + current tracker step only |
| Tile mosaic, fluted glass, violet bloom | Not in product | Still not in product |
| Notch | Brand cards only | Same; add 1px `#2B3140` stroke |
| Skeleton | neutral-100 | `#161A23` |
| Logo | Primary | Reversed (white) |

Reduced transparency: glass falls back to `#161A23`.

---

## 4. Components

| Component | Dark spec |
|---|---|
| Input | Fill `#0E1118`, border `#5C6577`, hover `#8A93A3`, focus blue-300 + ring, placeholder `#8A93A3`, error border danger-500 + `#FF8A84` message |
| Search (pill) | Same as input, radius full |
| Checkbox / radio / toggle | Off border `#5C6577`; on blue-500 + white mark |
| Sidebar nav | Text `#B4BBC8`; hover white 6%; **active blue-500 fill + white text** |
| Count badge | `#161A23` fill, `#2B3140` border, white text |
| Tabs | Text `#B4BBC8`; active white + 2px blue-300 underline |
| Data table | Container `#0E1118`; header `#161A23`, label-sm `#B4BBC8`; row hover white 4%; selected blue-950 |
| StatCard | Dark glass; label `#B4BBC8`; value white data-xl; delta tag in teal dark pair |
| Application Tracker | Complete blue-500 + white check; done connector blue-400; remaining `#2B3140`; current 2px blue-300 ring + glow; upcoming `#5C6577` outline; attention danger-500 |
| Avatar | Initials blue-200 on blue-950; online dot success-500 with canvas-color ring |
| Notification badge | danger-600 + white |
| Empty state | Icon blue-300 in 64px blue-950 circle |
| Callout (e.g. Non-Compete Covenant, Earners Circle) | blue-950 fill, border blue-300 at 25%, title blue-200 |
| Verified Badge | Unchanged in both themes |
| Verification stamp | Fresh / due / expired use §2.5 text colors |

---

## 5. Quick test for any dark screen

- [ ] Near-black canvas; surfaces step lighter as they float
- [ ] White primary text, `#B4BBC8` secondary, `#8A93A3` captions — nothing dimmer for text
- [ ] One Primary action: blue-500 fill, white label
- [ ] No blue-600 text; no white text on blue-400 or lighter
- [ ] Tables and forms on solid surface; glass only on chrome and summaries
- [ ] Elevation by surface step + border, not shadow
- [ ] Glow only on the primary button and current tracker step
- [ ] Tags use the dark pairs, always with text
- [ ] Reversed logo
- [ ] Glass Box still opens in light mode
- [ ] Works LTR and RTL, 375 to 1440 wide

---

## 6. CSS token block

```css
[data-ub-theme="dark"] {
  color-scheme: dark;
  --ub-bg-canvas: #07090E;
  --ub-bg-surface: #0E1118;
  --ub-bg-surface-raised: #161A23;
  --ub-bg-overlay: #1F2430;
  --ub-bg-selected: var(--ub-blue-950);
  --ub-glass-dark-bg: rgba(255,255,255,0.04);
  --ub-glass-dark-border: rgba(255,255,255,0.08);

  --ub-text-primary: #FFFFFF;
  --ub-text-secondary: #B4BBC8;
  --ub-text-tertiary: #8A93A3;
  --ub-text-disabled: #5C6577;
  --ub-text-link: var(--ub-blue-300);

  --ub-border-default: #2B3140;
  --ub-border-control: #5C6577;
  --ub-border-focus: var(--ub-blue-300);

  --ub-action-primary-bg: var(--ub-blue-500);
  --ub-action-primary-bg-hover: var(--ub-blue-500); /* + glow */
  --ub-action-primary-bg-pressed: var(--ub-blue-600);
  --ub-action-primary-text: #FFFFFF;
  --ub-action-secondary-border: var(--ub-blue-300);
  --ub-action-secondary-text: var(--ub-blue-300);
  --ub-action-ghost-hover: rgba(255,255,255,0.08);
  --ub-action-ghost-pressed: rgba(255,255,255,0.12);

  --ub-success-bg: #11231F; --ub-success-border: #184D30; --ub-success-text: #6FD394;
  --ub-warning-bg: #2B231A; --ub-warning-border: #6E4E20; --ub-warning-text: #FFC56B;
  --ub-danger-bg:  #29171D; --ub-danger-border:  #692628; --ub-danger-text:  #FF8A84;
  --ub-info-bg:    #0E212E; --ub-info-border:    #0E4762; --ub-info-text:    #6CC6F0;

  --ub-chart-1: var(--ub-blue-400);
  --ub-chart-grid: #2B3140;
  --ub-scrim: rgba(0,0,0,0.6);
  --ub-glow-action: 0 0 0 1px var(--ub-blue-400), 0 0 24px rgba(3,72,209,0.55);
}
```

---

## 7. For Brand sign-off

1. Product dark mode as a user setting (v1.1 makes light the product default).
2. Near-black neutrals instead of Deep Navy for product dark mode (Night Blue stays for social).
3. Dark glass on the app shell.
4. All **(derived)** values: text greys, surfaces, alerts, button hover/pressed, selected state, scrim.
5. Primary hover = glow instead of a lighter fill.

## 8. Open items carried from v1.1
- Final application stage list ("Enrolled" tag vs the "placed" rule).
- SVG logos (the dark reference screen uses an approximated symbol).
- Thmanya Sans web licence; Iconoir sign-off.

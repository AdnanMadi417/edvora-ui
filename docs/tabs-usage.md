# Tabs across the system

Use `components/ub/navigation/controls/Tabs` for every tab group. Keep the group inside the owning card, section, header or form container, together with the content it controls. Tabs must not float between unrelated cards.

| Purpose | Variant | Examples |
| --- | --- | --- |
| Sections of a page or record | `underline` | Application sections, advisor profiles/directories, institution profiles, team members/invitations, account manager details, technology categories |
| Alternate views of the same data or field group | `segmented` | Bars/pipeline, contact channel, editor/preview |
| Status/category filters | `pills` | Single-level status filters |
| Two-level notification navigation | `NotificationTabs` | Underline All/Unread sections, then a quieter segmented unread-category control |
| Side navigation within settings or a long profile | `vertical` | Use only where the existing layout has a side column |

Use `useId()` for each live tab group's `idPrefix`, and spread `tabPanelProps(prefix, activeKey)` onto its current content container. Do not reuse a hard-coded prefix when a component may appear more than once. Provide an accessible name with `aria-label`.

For dashboard cards, use `controls` for the tabs and `bodyProps={tabPanelProps(prefix, activeKey)}` for the content panel. `BarChartCard` forwards these existing card props. This keeps the control inside the card and available while data loads or fails.

Preserve the existing selected state, URL/query handling, filters, content, permissions, API calls and loading behaviour when replacing tab markup. Shared Tabs owns keyboard navigation, disabled items, RTL arrow direction, semantic colours and mobile scrolling.

The landing technology tabs use the shared component. Notifications use reusable `NotificationTabs`, composed from shared underline and segmented tabs. Profile/directory tabs remain inside their existing containers and are linked to their active content panels. Application and overview tab groups use instance-specific panel IDs.

The style-guide variant demonstrations intentionally retain all four variants; they document the choices rather than prescribe one variant everywhere.

## Coverage

| Area | Change |
| --- | --- |
| Landing technology categories | Replace custom buttons/keyboard handler with shared underline tabs |
| Notifications | `NotificationTabs`: underline read status, segmented unread categories; retain counts, filter reset and paging handlers |
| Application details | Underline tabs with instance-specific tab/panel IDs |
| Overview charts | Segmented tabs inside dashboard cards; card body receives the active panel attributes |
| Admin/reviewer advisor directories | Underline tabs and active panel associations |
| Admin/manager/reviewer advisor details | Underline tabs and active panel associations |
| Partner account profile | Underline tabs and active panel associations |
| Agency team | Underline tabs for members/invitations with active panel association |
| Account manager details | Underline tabs for profile/advisors with active panel association |
| Partner/public institution profiles | Underline tabs connected to their existing main content containers |
| Advisor public-profile editor | Segmented contact-channel tabs with a unique associated field panel |

Existing section order, counts, labels, data calls and tab-selection handlers are retained. The shared component remains the sole implementation of `role="tab"` and `role="tablist"` in application source; showcase examples intentionally demonstrate each supported variant.

## Validation

- Build and standalone TypeScript check pass.
- Lint passes with existing repository warnings.
- Full Jest suite: 75 suites, 432 tests pass.
- Browser audit: 39 tab selections across 13 feature screens, plus all five landing technology categories; each active tab resolves to exactly one correctly labelled panel. No browser runtime errors.
- Desktop/mobile captures and the browser audit results are stored locally in `/tmp/system-tabs/`.
- The public institution preview component has no current live route; its tab wiring is covered by type/build checks. The shared variant showcase remains unchanged.

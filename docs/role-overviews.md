# Role overviews

Each role lands on `/<role>/home`. The role root redirects there and Home is available in the sidebar.

| Role | Daily priorities | Data sources |
| --- | --- | --- |
| Admin | Active and held applications, advisor verification, payouts awaiting action | Admin applications, unverified advisors, finance commission queue |
| Account manager | Assigned applications, held applications, assigned/shared advisors | Account-manager application and advisor APIs |
| Reviewer | Unverified advisors, pending registrations, active advisor and manager directories | Existing reviewer-accessible advisor, registration and manager APIs |
| Data entry | Visible/hidden programmes, institutions and catalogue maintenance | Programme and university APIs |
| Advisor | Own applications, next steps, notifications, eligible commission information | Partner-scoped application API and self-scoped statement API |

All roles receive self-scoped unread counts and recent notification activity. No dashboard figures or activity are embedded fixtures. Existing API services select the mock adapter or backend through `NEXT_PUBLIC_USE_MOCKS`.

## Permissions and data behavior

The overview waits for the session and, for advisors, a matching active partner profile. It does not fetch when the route's expected role differs from the session role. Agency members do not request commission information or receive team-management links. Only agency administrators request member-inclusive applications. Starting applications requires a verified active advisor profile.

Totals come from API pagination metadata, not sampled page lengths. The work queue identifies actionable statuses within the first 20 active applications and shows up to six; it does not claim a global pending-task count. Directory and catalogue panels are first-page lists, not invented recent activity. Activity comes from notifications. Mixed-currency commission amounts are not summed.

Each resource has independent loading, empty, error and retry behavior. Permission or identity changes clear previous resource visibility and discard outstanding results. Quick actions and cards use native keyboard-accessible links and shared brand components.

## Existing environment limitation

`SessionProvider` and `RoleGuard` currently use a mock role identity, and the partner provider falls back to a mock profile when its request fails. These are existing application-wide behaviors, not production authentication. Production deployment requires the existing authentication integration and backend authorization; the dashboard's client-side checks do not replace server enforcement. Live backend behavior cannot be verified using the mock session alone.

## Organization

`src/features/overview` contains role configuration, resource planning, the session-aware hook and the shared role page. `src/components/ub/dashboard/lists/QuickActions.tsx` is reusable outside this feature. Existing dashboard headers, statistic cards, panels, task lists, people lists, timelines, status tags, footer statistics and date formatting are reused.


## Template dashboard composition

The role pages follow `/ui-unibexs-template-2026#dashboard`: one highlighted lead metric, a responsive three-column desktop layout with wide primary panels, icon quick actions, and specialized lists. Application roles use `BarChartCard` with a `PipelineFlow` alternate view; reviewers use `GaugeCard`; data entry uses `BarChartCard` for programme visibility.

Pipeline stages come from `/applications/stages`, ordered by the API's `order_index`. Each stage count comes from the role-scoped application endpoint with `status=active`, `stage_id`, and a one-row page whose pagination total supplies the count. Agency administrators include member applications; member and individual dashboards keep their own scope. A failed stage request fails the pipeline panel rather than drawing a zero. Known backend stage codes map to the shared stage palette; unknown stages retain their API names with neutral styling.

The reviewer chart uses verified and unverified profile totals, including inactive accounts. The catalogue chart uses visible and hidden programme totals. Both charts wait for all their sources and expose failures without calculating partial percentages. Historical trends, deadline countdowns and placement targets remain excluded until corresponding data is available.

`BarChartCard` and `GaugeCard` live in `components/ub/dashboard/cards`. They compose the reference card, menu, chart, legend and footer into reusable UI, with optional caller-supplied actions, statistics, and state handling. Existing `StatCard` variants provide the metric-card designs; no duplicate metric implementation is introduced. Bar-card data can include pending values for hatching when actual forecast data exists. Chart menus on role dashboards refresh real data.

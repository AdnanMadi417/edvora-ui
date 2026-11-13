UI and UX audit · whole Unibexs portal

# Unibexs UX Audit

Every screen in the portal, checked for how easy it is to use, how consistent it looks, and whether it works for everyone on every device. What to fix first, and how to confirm it with real users.

**Version** 2 · 10 Nov 2026 **Scope** 123 pages · 5 roles + public pages **Checked at** desktop 1440px, phone 375px, dark mode, right-to-left **Method** heuristic review, automated checks, code scan

[Versions](#versions) [Summary](#summary) [Journeys](#journeys) [UX findings](#ux) [UI findings](#ui) [Accessibility](#a11y) [Devices and themes](#devices) [What to fix first](#roadmap) [Test with users](#research) [Every page](#appendix)

## Version history

| Version | Date | What changed |
| --- | --- | --- |
| **1** | 10 Nov 2026 | First full audit: 123 pages, 5 roles and public pages, desktop, phone, dark and right-to-left. 23 findings. |
| **2** | 10 Nov 2026 | Five quick fixes shipped, then all 123 pages checked again. 2 findings fixed, 3 partly fixed, 18 still open. |

### Status in version 2

| Finding | Status | What changed | Still to do |
| --- | --- | --- | --- |
| [U2](#u2) Commission placeholder | Fixed | The unfinished page now redirects to the account manager's Home. | Build the real page when it's needed. |
| [A3](#a3) Unnamed buttons | Fixed | 12 icon-only buttons in the programme and logistics forms now say what they do. axe finds none left. | None. |
| [U1](#u1) "Needs your action" | Partly fixed | One rule now drives the Applications list, pipeline flags and Advisor Home, which agree (6 applications). | Notifications still uses its own rule and shows 5. |
| [A1](#a1) Titles and headings | Partly fixed | Every page has a tab title, e.g. "Amina Hossain · Applications · Unibexs". | 47 pages still have two main headings. |
| [U10](#u10) Required fields | Partly fixed | The form now says every field is required unless it says (optional), matching how fields are marked. | Save draft. |
| All other findings | Open | No change yet. | See [What to fix first](#roadmap). |

### Measured again

| Check (123 pages) | Version 1 | Version 2 |
| --- | --- | --- |
| Pages without a browser tab title | 121 | **0** |
| Pages with unnamed buttons (axe critical) | 4 | **0** |
| Pages passing every axe check | 2 | **109** |
| Pages showing placeholder figures | 1 | **0** |
| Pages with low contrast | 14 | 14 |
| Pages with two main headings | 47 | 47 |
| Pages that scroll sideways on a phone (LTR or RTL) | 0 | 0 |

The findings below are written as found in version 1. Each changed finding carries its version 2 status.

## Summary

Screen by screen, the portal is clear and it holds together on phones, in dark mode and right-to-left. The problems sit between screens: the product gives different answers to the same question, names things in several ways, and half of it is built on the new components while the other half still uses the old ones. 23 findings in total.

### Task clarity

Needs work

Users can't rely on one answer to "what do I do next".

### Visual consistency

Needs work

Two component sets live side by side; four patterns for "back" and "edit".

### Accessibility

Fair

No page titles anywhere; contrast and labels mostly fine.

### Phones

Fair

Nothing breaks, but the important content sits low on long pages.

### Dark mode

Good

Every page reads well; a few elements stay light.

### Right-to-left

Ready

No layout breaks when flipped, though the app has no way to switch yet.

### The five problems that cost the most

1. **"What do I need to do?" gets four different answers.**Notifications say 5 actions, the Advisor home queue shows 2, the list flags 2, and an application whose page says Action needed isn't flagged in the list.
2. **The account manager's Commission page shows placeholder dollar figures.**Earnings $340.5, Sales, Total Projects on a ringgit product.
3. **One thing, many names.**One application shows Documents pending, Correction Requested, Documents and Replace the academic transcript at once. Knowledge Hub means a reading area for Advisors and a settings area for admins.
4. **Two visual systems in one product.**Applications is fully on the shared components. Advisors, Programs, Agency, Logistics, Account managers, Universities, Roles and Notifications still carry 1,691 hard-coded colour classes and 132 old components.
5. **Phones bury the work.**Totals and charts come first; tasks and statuses come screens later or off to the side.

### What already works

- No page scrolls sideways at 375px, in either direction (LTR or RTL).
- Dark mode covers every page.
- The application page leads with one next step and one primary action.
- Staff work queues are written as tasks: Review the submitted documents.
- The new-application form has 3 steps, a review step and specific error messages.
- The public Advisor page is clear and loads on phones without problems.

### Findings by severity

2 critical 7 high 11 medium 3 low

Critical: a user can miss a task or act on wrong information. High: a key journey is slower or confusing for most users. Medium: friction with a workaround. Low: polish.

## Key journeys

How easily a first-time user could finish each task with the current screens. Expert judgement, not yet measured with users.

| Who | Task | Rating | Main blocker | See |
| --- | --- | --- | --- | --- |
| Advisor | Find what needs my action today | Hard | Counts and flags disagree across Home, list and Notifications | U1, U3, U4 |
| Advisor | Submit a new application | Good | No required markers, no draft | U10 |
| Advisor | Fix a correction | Fair | Clear inside the page, hard to find from the list | U1, U3 |
| Advisor | Know when and how much I'll be paid | Poor | Only paid and disputed rows, no totals | U6 |
| Advisor | Work from a phone | Poor | Tasks and status pushed down or sideways | U4, U5 |
| New Advisor | Understand the offer and sign up | Fair | Page says Drop us a message but is a sign-up | U11 |
| Agency member | Join from an invite | Fair | An old or broken link is a dead end | U14 |
| Admin / AM | Work through the application queue | Fair | Table cut off at 1440px, totals above it | U5, U9 |
| Account manager | Check commission | Broken | Placeholder figures | U2 |
| Reviewer | Verify a new Advisor | Good | Clear queue; gauge repeats the same numbers | U9 |
| Data entry | Add or update a programme or university | Fair | Long one-column forms, developer wording | U13 |
| Admin | Check what a role can do | Not possible | Role page shows only the name | U8 |
| Admin | Find a setting | Fair | Settings spread across Knowledge Hub and Advisors | U7 |

Part 1

## UX findings

U1Critical

### "Needs your action" means something different on every screen

Partly fixed in v2

What we saw

- Notifications: Action required 5. Advisor Home queue: 2 items. Applications list: 2 rows tagged Action needed.
- Amina Hossain's page shows Action needed and a red Replace the academic transcript alert; her list row only says Correction Requested and she's not in the Home queue.
- Rows that read like Advisor tasks carry no flag: Waiting for Arrival Date, Extra Arrival Documents Required, Waiting for EMGS Eval Upload.

Why it matters

Advisors plan their day from these counts. A missed task delays the student and the Advisor's commission, and mismatched numbers teach people to ignore them.

Recommendation

Define "waiting on the Advisor" once as a list of statuses and use that rule for the Home queue, list tags, notification filter and page alert.

ConsistencyVisibility of statusEffort: small

[![Notifications page showing Action required 5](img/notifications.jpg)](img/notifications.jpg)

Notifications: 5 actions required.

[![Amina Hossain's application with Action needed](img/application-detail.jpg)](img/application-detail.jpg)

Amina's page says "Action needed"; her list row doesn't.

U2Critical

### Account manager Commission page shows placeholder data

Fixed in v2

What we saw

Six cards: Earnings $340.5, Spend this month $642.39, Sales $574.34, Your Balance $1,000, New Tasks 145, Total Projects $2433. The rest of the product uses RM.

Recommendation

Hide the menu item until it's built, or show real commission per Advisor (expected vs paid, in RM).

Match the real worldEffort: tiny to hide

[![Account manager Commission page with generic dollar cards](img/am-commission.jpg)](img/am-commission.jpg)

/account-manager/commission

U3High

### The same state has many names, and system names leak

What we saw

- One application at once: Documents pending (tag), Correction Requested (progress), Documents (tracker), Replace the academic transcript (alert), Application Submission (list).
- System names reach users: Partner Commission Invoicing, Correction Requested by Account Manager, Waiting Advisor to confirm arrival date.
- "Your turn" in four words: Action needed, Action flagged, Action required, Your move. "New application" in three: Start, Create, New.

Recommendation

A status copy sheet: each backend status → one label, a one-line meaning and who acts next. One word for "your turn". Apply it in tags, lists, notifications and emails.

ConsistencySpeak the user's languageEffort: small

U4High

### On phones, tasks sit below a stack of totals

What we saw

- Home pages are 4.6 (Advisor), 5.2 (account manager) and 5.5 (admin) phone screens tall. Totals fill the first screen, one card per row.
- The Advisor's work queue starts after about 2.5 screens. Chart labels break mid-word (Applicat ion Submis sion).

Recommendation

On phones: "Waiting on you" first, then recent activity. Totals as one compact row of chips. Hide or simplify charts on small screens.

EfficiencyEffort: medium, layout

[![Advisor home on a phone](img/advisor-home-phone.jpg)](img/advisor-home-phone.jpg)

Advisor Home, 375px (open for full height).

[![Applications list on a phone](img/advisor-applications-phone.jpg)](img/advisor-applications-phone.jpg)

Applications, 375px: the list starts after the totals and pipeline.

U5High

### Application tables hide the status and the date

What we saw

- Phone: stage and status sit off-screen to the right (Swipe across for more columns).
- Desktop 1440px (admin, account manager): the Updated column is cut to 2 weeks ag.

Recommendation

On phones, one card per application with name, status and who acts next on top. On desktop, fit the columns so nothing is cut at 1440px.

Visibility of statusEffort: medium

[![Admin applications table with the Updated column cut off](img/admin-applications.jpg)](img/admin-applications.jpg)

Admin Applications at 1440px.

U6High

### Advisors can't see the commission that's coming

What we saw

- The Commission Tracker lists only paid and disputed rows. Expected commission (e.g. RM3,000 for Amina) lives inside each application.
- No totals. Disputed has no reason or next step. An Advisor column shows other people's names with no explanation.

Recommendation

Lead with expected, due and paid totals. List every application that will earn commission with its stage and expected date. Give disputed rows a reason and next step.

Visibility of statusEffort: medium, needs data

[![Advisor commission tracker](img/commission-tracker.jpg)](img/commission-tracker.jpg)

Advisor Commission Tracker.

U7High

### The menu structure doesn't match how people think about the work

What we saw

- Knowledge Hub is a reading area for Advisors (programmes, universities) but, for admins and data entry, the place for settings: University Types, Fields of Study, Payment Methods, Document Templates.
- Banks sits under Advisors; payment methods sit under Knowledge Hub.
- Menu labels don't match page headings: Knowledge Hub opens Programs; Agency Scaler opens team members; Logistics Marketplace opens Providers.

Recommendation

Give admins and data entry a Settings group for reference data (universities setup, fields of study, payment methods, banks, document templates). Keep Knowledge Hub for reading. Rename Agency Scaler to Team. Make each menu label match the page heading.

Recognition over recallEffort: small to medium

U8Medium

### Role pages don't show what a role can do

What we saw

A role's page shows only its name and a Save Changes button that's disabled because system roles can't be renamed. There's no list of permissions, so an admin can't check who can approve payouts or edit Advisors.

Recommendation

Show the role's permissions grouped by area, read-only for system roles, and the staff members who have it. Hide Save when nothing can change.

VisibilityEffort: medium, needs data

[![Administrator role page with only a name field](img/detail-role.jpg)](img/detail-role.jpg)

Admin → Roles → Administrator.

U9Medium

### Dashboards repeat the same numbers several times

What we saw

- Every role's Home uses the same template: four totals, a chart, a card footer that repeats the totals (Items shown 6 · Total items 18).
- Data entry: a bar chart of two numbers (26 visible, 2 hidden) that the cards above already show. Reviewer: a gauge repeating 16 verified, 5 awaiting.
- Zero-value cards (Applications on hold 0), a Bars / Pipeline switch for the same data, Quick actions that repeat the menu, and a manual Refresh overview link.

Recommendation

Keep only numbers that lead to an action, each linking to its filtered list. Drop repeated footers and charts of one or two values. Refresh automatically.

Minimalist designEffort: small

[![Advisor home on desktop](img/advisor-home.jpg)](img/advisor-home.jpg)

Advisor Home, 1440px.

[![Data entry home with a two-bar chart](img/dataentry-home.jpg)](img/dataentry-home.jpg)

Data entry Home: a chart of two numbers.

U10Medium

### New application: required fields and lost work

Partly fixed in v2

What we saw

The header says Fields marked * are required but no field shows a `*`; all 5 first-step fields turn out required after Continue. No way to save a draft across 3 steps with uploads.

Recommendation

Mark required fields or say "All fields are required". Add Save draft (the payload already has `is_draft`) and warn before leaving.

Error preventionEffort: small to medium

[![New application step 1](img/new-application.jpg)](img/new-application.jpg)

New application, step 1.

U11Medium

### Apply as Advisor doesn't explain the offer

What we saw

Ready to connect? and Drop us a message and we'll get back fast, but the page is a choice between individual and agency sign-up. Nothing on what Advisors get, what they need, or the 2-working-day review.

Recommendation

"Become a Unibexs Advisor", three short points (what you earn, what you need, review in 2 working days), then the two choices.

Match the real worldEffort: small, copy

[![Apply as Advisor page](img/apply-as-advisor.jpg)](img/apply-as-advisor.jpg)

/apply-as-adviser

U12Medium

### Notifications are hard to scan

What we saw

Two filter layers (tabs and chips). Every item starts with Aisha Rahman and no role. Tasks and information share one list, with system status names. The same old list component on every role also fails contrast (see A2).

Recommendation

One filter row. Lead each item with the student and what to do, then who and when. Show the actor's role. Move it onto the shared list component.

Minimalist designEffort: small

U13Medium

### Admin and data-entry forms are long and use developer wording

What we saw

- Edit forms are one long column with every field full width: programme edit 7.7 phone screens, logistics provider 5.8, university 5.6.
- The sticky Save bar sits over the last fields while they're still visible under it.
- Help text written for developers: this is exactly what renders in the Program Info column.

Recommendation

Group fields into short sections, put short fields side by side on desktop, keep the Save bar clear of content, and rewrite help text for the person filling the form.

EfficiencyEffort: medium

[![Edit logistics provider form](img/edit-logistics.jpg)](img/edit-logistics.jpg)

Admin → Edit logistics provider.

U14Low

### Invite and verification links end in a dead end

What we saw

An old or broken invite link shows Invalid Link and asks the person to use the link from their email, with no way to request a new one or contact anyone.

Recommendation

Add "Ask your agency admin to resend the invite" and a support contact. Say why the link failed when known (expired, already used).

Help users recoverEffort: small

[![Invalid invite link page](img/invite-invalid.jpg)](img/invite-invalid.jpg)

/team/accept-invite with no token.

U15Low

### Long reference pages and a tracker that stops early

Knowledge Hub is 7.9–8.4 phone screens and Logistics Marketplace 6.0: put search and one main filter on top and collapse the rest. The application tracker ends at Visa; arrival and commission, which matter most to Advisors, aren't on it.

Effort: small

Part 2

## UI findings

I1High

### Two visual systems in one product

Applications has moved onto the shared components and design tokens. Most other areas still use hard-coded colours and older form components. They look close in light mode, but drift in spacing, field styles and states, and every fix has to be made twice.

| Area | Files | Shared components | Old components | Hard-coded colours | Fixed white backgrounds |
| --- | --- | --- | --- | --- | --- |
| Advisors (partners) | 38 | 277 | 30 | 483 | 20 |
| Programs | 30 | 123 | 32 | 387 | 11 |
| Agency members | 12 | 71 | 13 | 296 | 21 |
| Logistics | 17 | 61 | 12 | 140 | 9 |
| Account managers | 11 | 64 | 5 | 124 | 12 |
| Universities | 43 | 177 | 28 | 108 | 7 |
| Roles | 4 | 24 | 4 | 71 | 5 |
| Notifications | 5 | 5 | 0 | 53 | 2 |
| Applications | 70 | 321 | 3 | 0 | 0 |
| **All areas** | **243** | **1,196** | **132** | **1,691** | **93** |

Why it matters for UX

Users meet the same control drawn differently in different places, so learned habits don't carry over. It also makes the UX fixes in this report slower to roll out.

Recommendation

Don't add new components. Move the remaining areas onto the existing shared set, one area at a time, as part of their UX fixes, starting with Notifications (smallest, used by every role) and Advisors.

ConsistencyEffort: large, spread over areas

I2Medium

### Detail pages use four patterns for "back" and "edit"

What we saw

- Staff user: a Back to staff users button above the card.
- Bank and Advisor: an icon-only arrow and pencil in the top-right corner.
- Role: a Back button in the top right. Program: an Actions menu.
- Application: breadcrumbs and a labelled primary action.

Recommendation

Use the application pattern everywhere: breadcrumbs for "back", one labelled primary action ("Edit bank"), other actions in the ⋯ menu. Avoid icon-only edit buttons.

ConsistencyEffort: small per page

[![Staff user detail with a back button above the card](img/detail-staff.jpg)](img/detail-staff.jpg)

Staff user: back button above the card.

[![Bank detail with icon-only back and edit](img/detail-bank.jpg)](img/detail-bank.jpg)

Bank: icon-only back and edit.

I3Medium

### Mixed spelling and naming

Advisor and adviser (adviser payout accounts, Reach the adviser, the `/apply-as-adviser` address). Programs in menus, Programme in forms. Institution and University for the same thing. Title Case and sentence case mixed in buttons (Save Changes, Suspend Account vs Save changes). Pick one of each and add it to the status copy sheet (U3).

ConsistencyEffort: small, copy

I4Low

### A few elements stay light in dark mode

Dark mode works across all 123 pages. A few icon tiles and panels keep a white background (93 fixed `bg-white` in code, e.g. the role icon). They'll go away with I1.

[![Advisor detail in dark mode](img/dark-advisor.jpg)](img/dark-advisor.jpg)

Advisor detail, dark.

[![Program edit form in dark mode](img/dark-program-edit.jpg)](img/dark-program-edit.jpg)

Program edit, dark.

Part 3

## Accessibility

Checked with axe-core against WCAG 2.1 AA on every page, plus our own checks for control size and names. Screen reader testing by a person is still needed.

A1High

### No page titles, and two main headings on 47 pages

Partly fixed in v2

What we saw

121 of 123 pages have no page title, so every tab, bookmark and history entry looks the same and screen readers can't announce the page. 47 pages have two main headings (the section name and the record name, e.g. Advisors and Global Pathways Education); on application pages the main heading is Applications, not the student.

Recommendation

A title on every page, like "Amina Hossain · Applications · Unibexs". One main heading per page: the thing on the page. Keep the section name as the top bar label.

WCAG 2.4.2, 1.3.1Effort: small, shared layout

A2Medium

### Low contrast on 14 pages

58 text elements below 4.5:1. Three sources: the old Notifications list (all five roles), the upcoming-step labels in the step indicator on the application and university forms (dimmed with `opacity-80`), and grey helper text in older edit forms (`text-slate-400`).

WCAG 1.4.3Effort: small

A3Medium

### Buttons and links without a name

Fixed in v2

15 pages have controls with no accessible name, mostly icon-only buttons in edit forms: logistics provider edit (8), programme edit (5), Advisor edit (3), university create and edit, profile edit, and the Apply as Advisor pages. axe flags 24 as critical. Add an `aria-label` that says what each does.

WCAG 4.1.2Effort: small

A4Medium

### Small tap targets on lists and forms

Controls smaller than 24px on phones: logistics provider edit (30), admin Applications (28), Logistics Marketplace (26), public Advisor page (18), account manager Applications (18), Banks (15), Fields of Study (14), Finance Queue, Programs and Payment Methods (13 each). Mostly row checkboxes, sort headers and inline links. Give them a 44px hit area on touch screens.

WCAG 2.5.8Effort: small, shared components

Part 4

## Devices and themes

### Phones

0 of 123 pages scroll sideways at 375px. The problems are about order and length, not breakage: see U4, U5, U13, U15. The longest pages on a phone: Knowledge Hub 8.4 screens, programme edit 7.7, Logistics Marketplace 6.0, admin Home 5.5.

### Dark mode

Every page renders in dark mode with readable text and visible borders. A few fixed white elements remain (I4).

### Right-to-left

With the page direction flipped, 0 pages scroll sideways. The app is fixed to left-to-right today, with no language or direction switch, so Arabic users can't use it yet; the layout is ready when that's added.

## What to fix first

Ordered by user impact against effort. "Now" is mostly copy, logic and layout on existing screens; no new design-system work. UI consistency (I1) is done area by area alongside the UX fixes, not as a separate project.

### Now 1–2 weeks

1. Hide or fix the account manager Commission page (U2).
2. One rule for "waiting on you", used everywhere (U1).
3. Status and naming copy sheet (U3, I3).
4. Page titles and one main heading per page (A1).
5. Required markers on the application form (U10).
6. Fit the applications table at 1440px (U5).
7. Name the unnamed buttons; fix contrast (A2, A3).

### Next 2–6 weeks

1. Phone-first order on Home pages and lists (U4).
2. Application cards on phones (U5).
3. Commission Tracker with totals (U6).
4. Settings menu group and matching labels (U7).
5. Notifications: one filter row, shared list component (U12, I1).
6. One detail-page pattern for back and edit (I2).
7. Trim repeated dashboard numbers (U9).

### Later after testing

1. Role permissions view (U8).
2. Shorter grouped admin forms (U13).
3. Save draft on applications (U10).
4. Rewrite Apply as Advisor; recover from bad invite links (U11, U14).
5. Remaining areas onto the shared components (I1, I4).
6. Tap targets (A4); search-first reference pages (U15).
7. Language and right-to-left switch.

## Next: test with users

This audit is expert review on demo data. Confirm the top issues with real people before larger changes.

### Sessions

- 5 Advisors, 30 minutes each, on their own phone: find today's actions, fix a correction, start an application, find when you'll be paid.
- 3 staff shadowing sessions: applications queue, Finance Queue, Advisor review.
- 2 data-entry sessions: add a programme, update a university.

### Measure before and after

- Time from correction requested to the Advisor's re-upload.
- Share of applications submitted without a correction request.
- Time to submit an application; drop-off by step.
- Share of Advisor sessions on phones.
- Support messages asking about commission.

### Questions to answer

- Which statuses do Advisors see as their job?
- Do Advisors start from Home, Notifications or WhatsApp?
- What do account managers need from a Commission page?
- Do staff need permissions visible per role?

## Every page checked

123 pages measured at 1440px and 375px, light and dark, plus a right-to-left check. Two pages had no record to open in the demo data (a payout from the Advisor list, an agency team member). Phone height is the page length in phone screens. "Small" is controls under 24px on a phone; "Unnamed" is controls with no accessible name; "axe" is the number of WCAG rule failures (the missing page title is one on nearly every page).

| Page | Role | Phone height | Small | Unnamed | axe |
| --- | --- | --- | --- | --- | --- |
| `/account-manager` | account-manager | 5.2 | 2 | 0 | 1 |
| `/account-manager/advisors` | account-manager | 1.5 | 2 | 0 | 1 |
| `/account-manager/advisors/[id]` | account-manager | 3.4 | 4 | 0 | 1 |
| `/account-manager/applications` | account-manager | 3.0 | 18 | 0 | 1 |
| `/account-manager/applications/[id]` | account-manager | 4.3 | 4 | 0 | 1 |
| `/account-manager/commission` | account-manager | 1.2 | 2 | 0 | 1 |
| `/account-manager/home` | account-manager | 5.2 | 2 | 0 | 1 |
| `/account-manager/knowledge-hub` | account-manager | 7.9 | 2 | 0 | 1 |
| `/account-manager/knowledge-hub/[id]` | account-manager | 4.8 | 2 | 0 | 1 |
| `/account-manager/logistics-marketplace` | account-manager | 6.0 | 26 | 0 | 1 |
| `/account-manager/logistics-marketplace/[id]` | account-manager | 3.9 | 3 | 0 | 1 |
| `/account-manager/notifications` | account-manager | 1.8 | 2 | 0 | 2 |
| `/account-manager/profile` | account-manager | 1.0 | 2 | 0 | 1 |
| `/admin` | admin | 5.5 | 2 | 0 | 1 |
| `/admin/account-managers` | admin | 1.4 | 2 | 0 | 1 |
| `/admin/account-managers/create` | admin | 1.5 | 2 | 0 | 1 |
| `/admin/account-managers/profile/[id]` | admin | 1.9 | 3 | 0 | 1 |
| `/admin/account-managers/profile/[id]/edit` | admin | 1.8 | 2 | 0 | 1 |
| `/admin/advisors` | admin | 1.8 | 2 | 0 | 1 |
| `/admin/advisors/[id]` | admin | 3.8 | 5 | 0 | 1 |
| `/admin/advisors/[id]/edit` | admin | 3.8 | 5 | 3 | 1 |
| `/admin/advisors/bank-accounts` | admin | 1.5 | 2 | 0 | 1 |
| `/admin/advisors/banks` | admin | 1.6 | 15 | 0 | 1 |
| `/admin/advisors/banks/[id]` | admin | 1.3 | 2 | 0 | 1 |
| `/admin/advisors/banks/[id]/edit` | admin | 1.6 | 2 | 0 | 1 |
| `/admin/advisors/banks/create` | admin | 1.6 | 2 | 0 | 1 |
| `/admin/applications` | admin | 3.0 | 28 | 0 | 1 |
| `/admin/applications/[id]` | admin | 4.3 | 4 | 0 | 1 |
| `/admin/config-universities` | admin | 1.6 | 5 | 0 | 1 |
| `/admin/config-universities/[id]` | admin | 2.2 | 2 | 0 | 1 |
| `/admin/config-universities/[id]/edit` | admin | 3.1 | 2 | 0 | 1 |
| `/admin/config-universities/create` | admin | 2.9 | 2 | 0 | 1 |
| `/admin/config-universities/fields-of-study` | admin | 1.7 | 14 | 0 | 1 |
| `/admin/config-universities/payment-methods` | admin | 1.5 | 13 | 0 | 1 |
| `/admin/config-universities/payment-methods/[id]` | admin | 1.0 | 2 | 0 | 1 |
| `/admin/config-universities/payment-methods/[id]/edit` | admin | 1.1 | 2 | 0 | 1 |
| `/admin/document-types` | admin | 1.6 | 4 | 0 | 1 |
| `/admin/document-types/[id]` | admin | 1.0 | 2 | 0 | 1 |
| `/admin/document-types/[id]/edit` | admin | 1.0 | 2 | 0 | 1 |
| `/admin/document-types/upload` | admin | 1.0 | 2 | 0 | 1 |
| `/admin/finance-queue` | admin | 1.6 | 13 | 0 | 1 |
| `/admin/home` | admin | 5.5 | 2 | 0 | 1 |
| `/admin/knowledge-hub` | admin | 1.7 | 13 | 0 | 1 |
| `/admin/knowledge-hub/[id]` | admin | 5.0 | 2 | 0 | 1 |
| `/admin/knowledge-hub/[id]/edit` | admin | 7.7 | 6 | 5 | 3 |
| `/admin/knowledge-hub/create` | admin | 1.9 | 2 | 0 | 1 |
| `/admin/logistics-marketplace` | admin | 1.7 | 4 | 0 | 1 |
| `/admin/logistics-marketplace/[id]` | admin | 3.5 | 3 | 0 | 1 |
| `/admin/logistics-marketplace/[id]/edit` | admin | 5.8 | 30 | 8 | 2 |
| `/admin/logistics-marketplace/create` | admin | 1.8 | 3 | 1 | 1 |
| `/admin/logistics-marketplace/services` | admin | 1.5 | 3 | 0 | 1 |
| `/admin/notifications` | admin | 2.1 | 2 | 0 | 2 |
| `/admin/profile` | admin | 1.0 | 2 | 0 | 1 |
| `/admin/roles` | admin | 1.5 | 8 | 0 | 1 |
| `/admin/roles/[id]` | admin | 1.0 | 2 | 0 | 1 |
| `/admin/staff-users` | admin | 1.7 | 2 | 0 | 1 |
| `/admin/staff-users/[id]` | admin | 1.3 | 2 | 0 | 1 |
| `/admin/universities` | admin | 1.7 | 6 | 0 | 1 |
| `/admin/universities/[id]` | admin | 2.6 | 2 | 0 | 1 |
| `/admin/universities/[id]/edit` | admin | 5.6 | 3 | 1 | 2 |
| `/admin/universities/create` | admin | 1.6 | 3 | 1 | 2 |
| `/data-entry` | data-entry | 4.5 | 2 | 0 | 1 |
| `/data-entry/banks` | data-entry | 1.6 | 15 | 0 | 1 |
| `/data-entry/banks/[id]` | data-entry | 1.3 | 2 | 0 | 1 |
| `/data-entry/banks/[id]/edit` | data-entry | 1.6 | 2 | 0 | 1 |
| `/data-entry/banks/create` | data-entry | 1.6 | 2 | 0 | 1 |
| `/data-entry/home` | data-entry | 4.5 | 2 | 0 | 1 |
| `/data-entry/knowledge-hub` | data-entry | 1.7 | 13 | 0 | 1 |
| `/data-entry/knowledge-hub/[id]` | data-entry | 5.0 | 2 | 0 | 1 |
| `/data-entry/knowledge-hub/[id]/edit` | data-entry | 7.7 | 6 | 5 | 3 |
| `/data-entry/knowledge-hub/create` | data-entry | 1.9 | 2 | 0 | 1 |
| `/data-entry/logistics-marketplace` | data-entry | 1.7 | 4 | 0 | 1 |
| `/data-entry/logistics-marketplace/[id]` | data-entry | 3.5 | 3 | 0 | 1 |
| `/data-entry/logistics-marketplace/[id]/edit` | data-entry | 5.8 | 30 | 8 | 2 |
| `/data-entry/logistics-marketplace/create` | data-entry | 1.8 | 3 | 1 | 1 |
| `/data-entry/logistics-marketplace/services` | data-entry | 1.5 | 3 | 0 | 1 |
| `/data-entry/notifications` | data-entry | 1.0 | 2 | 0 | 2 |
| `/data-entry/payment-methods` | data-entry | 1.5 | 13 | 0 | 1 |
| `/data-entry/payment-methods/[id]` | data-entry | 1.0 | 2 | 0 | 1 |
| `/data-entry/payment-methods/[id]/edit` | data-entry | 1.1 | 2 | 0 | 1 |
| `/data-entry/profile` | data-entry | 1.0 | 2 | 0 | 1 |
| `/data-entry/universities` | data-entry | 1.7 | 6 | 0 | 1 |
| `/data-entry/universities/[id]` | data-entry | 2.6 | 2 | 0 | 1 |
| `/data-entry/universities/[id]/edit` | data-entry | 5.6 | 3 | 1 | 2 |
| `/data-entry/universities/create` | data-entry | 1.6 | 3 | 1 | 2 |
| `/data-entry/university-configuration` | data-entry | 1.6 | 5 | 0 | 1 |
| `/data-entry/university-configuration/[id]` | data-entry | 2.2 | 2 | 0 | 1 |
| `/data-entry/university-configuration/[id]/edit` | data-entry | 3.1 | 2 | 0 | 1 |
| `/data-entry/university-configuration/create` | data-entry | 2.9 | 2 | 0 | 1 |
| `/data-entry/university-configuration/fields-of-study` | data-entry | 1.7 | 14 | 0 | 1 |
| `/partner` | partner | 4.6 | 2 | 0 | 1 |
| `/partner/applications` | partner | 3.1 | 7 | 0 | 1 |
| `/partner/applications/[id]` | partner | 4.3 | 4 | 0 | 1 |
| `/partner/applications/apply-for-program` | partner | 1.5 | 2 | 0 | 2 |
| `/partner/applications/apply-now` | partner | 1.6 | 2 | 0 | 2 |
| `/partner/commission-tracker` | partner | 1.3 | 5 | 0 | 1 |
| `/partner/home` | partner | 4.6 | 2 | 0 | 1 |
| `/partner/knowledge-hub` | partner | 8.4 | 2 | 0 | 1 |
| `/partner/knowledge-hub/[id]` | partner | 4.9 | 2 | 0 | 1 |
| `/partner/logistics-marketplace` | partner | 6.0 | 26 | 0 | 1 |
| `/partner/logistics-marketplace/[id]` | partner | 3.9 | 3 | 0 | 1 |
| `/partner/notifications` | partner | 1.7 | 2 | 0 | 2 |
| `/partner/profile` | partner | 3.4 | 4 | 0 | 1 |
| `/partner/profile/edit` | partner | 2.6 | 5 | 3 | 1 |
| `/partner/public-profile` | partner | 4.9 | 2 | 0 | 1 |
| `/partner/team-members` | partner | 1.5 | 2 | 0 | 1 |
| `/partner/universities` | partner | 4.0 | 2 | 0 | 1 |
| `/partner/universities/[id]` | partner | 2.0 | 2 | 0 | 1 |
| `/apply-as-adviser` | public | 1.0 | 2 | 1 | 1 |
| `/apply-as-adviser/verify` | public | 1.0 | 2 | 1 | 1 |
| `/demo` | public | 3.9 | 0 | 0 | 0 |
| `/p/[slug]` | public | 3.6 | 18 | 0 | 0 |
| `/team/accept-invite` | public | 1.0 | 0 | 0 | 1 |
| `/team/verify-otp` | public | 1.0 | 0 | 0 | 2 |
| `/reviewer` | reviewer | 4.9 | 2 | 0 | 1 |
| `/reviewer/account-managers` | reviewer | 1.3 | 2 | 0 | 1 |
| `/reviewer/account-managers/profile/[id]` | reviewer | 1.8 | 2 | 0 | 1 |
| `/reviewer/advisors` | reviewer | 1.9 | 2 | 0 | 1 |
| `/reviewer/advisors/[id]` | reviewer | 3.4 | 4 | 0 | 1 |
| `/reviewer/advisors/[id]/edit` | reviewer | 3.8 | 5 | 3 | 1 |
| `/reviewer/home` | reviewer | 4.9 | 2 | 0 | 1 |
| `/reviewer/notifications` | reviewer | 1.1 | 2 | 0 | 2 |
| `/reviewer/profile` | reviewer | 1.0 | 2 | 0 | 1 |

**Method.** Each page was opened as its role in the current build with demo data. Findings come from a heuristic review against Nielsen's usability heuristics and WCAG 2.1 AA. Automated checks used axe-core 4 and a script measuring sideways scroll, control sizes, unnamed controls and page height. The code scan counted shared and old components, hard-coded colour classes and fixed white backgrounds in every feature folder. Load times came from a development server and are not reported.

**Not covered.** Real user behaviour and analytics, emails and WhatsApp messages, popups not opened from page load, and screen reader testing by a person.

Unibexs UX Audit · Version 2 · 10 Nov 2026 · Screens from the current build with demo data. Open any screenshot for full size.
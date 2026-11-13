UX audit · Unibexs portal

# Unibexs UX Audit

Where Advisors and staff lose time or miss a task today, what to fix first, and how to confirm it with real users.

**Date** 10 Nov 2026 **Scope** 28 screens · Advisor, admin, account manager, public **Devices** desktop 1440px and phone 375px **Method** heuristic review + automated checks

[Summary](#summary) [Journeys](#journeys) [Findings](#findings) [What to fix first](#roadmap) [Next: test with users](#research) [Method and data](#method)

## Summary

The portal looks consistent and the core screens are clear one at a time. The UX problems sit between screens: the product gives different answers to the same question, uses internal status names, and on phones puts the most useful content below a stack of numbers. These five issues cost the most:

1. **"What do I need to do?" gets four different answers.**Notifications say 5 actions, the Advisor home queue shows 2, the Applications list flags 2, and an application whose page says Action needed is not flagged in the list. Advisors can miss work that holds up a student.
2. **One state, many names.**A single application shows Documents pending, Correction Requested, Documents and Replace the academic transcript at the same time. Internal names such as Partner Commission Invoicing and Waiting Advisor to confirm arrival date reach users.
3. **Phones bury the work.**On the Advisor home, the task queue starts after about 2.5 screens of totals and a chart. On the Applications list, the status column is off-screen and needs a sideways swipe inside the page.
4. **Advisors can't see the money that's coming.**The Commission Tracker lists only paid and disputed commissions. Expected commission appears only inside each application, with no total.
5. **The account manager's Commission page shows placeholder numbers.**Earnings $340.5, Sales, Total Projects in US dollars on a ringgit product. Someone could take these as real.

### What already works

- The application page leads with one next step, one primary action and a clear alert.
- Staff work queues are written as tasks: Review the submitted documents.
- The new-application form has 3 steps, a review step and specific error messages (Enter the passport number.).
- No page scrolls sideways at 375px.

### Count by severity

2 critical 5 high 5 medium 2 low

Critical: a user can miss a task or act on wrong information. High: a key journey is slower or confusing for most users. Medium: friction with a workaround. Low: polish.

## Key journeys

Rated on how easily a first-time user could finish each task with the current screens. Ratings are expert judgement, not measured with users yet.

| Who | Task | Rating | Main blocker | Findings |
| --- | --- | --- | --- | --- |
| Advisor | Find what needs my action today | Hard | Counts and flags disagree across Home, list and Notifications | F1, F3, F4 |
| Advisor | Submit a new application | Good | No required markers, no way to save a draft | F9 |
| Advisor | Fix a correction on an application | Fair | Clear once inside the page, but hard to find from the list | F1, F3 |
| Advisor | Know when and how much I'll be paid | Poor | Tracker shows only paid and disputed rows, no totals | F6 |
| Advisor | Use the portal on a phone | Poor | Tasks and status pushed below the fold | F4, F5 |
| Staff | Work through the application queue | Fair | Table cut off at desktop width, low-value totals above it | F5, F8 |
| Account manager | Check commission | Broken | Page shows placeholder figures | F2 |
| New Advisor | Understand and start applying | Fair | Page says Drop us a message but is a sign-up, with no benefits or process | F10 |

## Findings

F1Critical

### "Needs your action" means something different on every screen

What we saw

- Notifications → Action required 5.
- Advisor Home work queue → 2 items. Applications list → 2 rows tagged Action needed.
- Amina Hossain's page shows Action needed and a red Replace the academic transcript alert, but her list row only says Correction Requested and she is not in the Home queue.
- Three more rows read like Advisor tasks but carry no flag: Waiting for Arrival Date, Extra Arrival Documents Required, Waiting for EMGS Eval Upload.

Why it matters

Advisors decide what to do next from these counts. A task that isn't flagged delays the student's application and the Advisor's commission, and the mismatch teaches people not to trust the numbers.

Recommendation

Define "waiting on the Advisor" once, as a list of statuses, and use that one rule for the Home queue, list tags, notification filter and page alert. Show the same count everywhere.

Heuristic: consistencyHeuristic: visibility of statusEffort: small, mostly logic

[![Advisor notifications page showing Action required 5](img/notifications.jpg)](img/notifications.jpg)

Notifications: 5 actions required.

[![Amina Hossain's application with Action needed tag and red alert](img/application-detail.jpg)](img/application-detail.jpg)

Amina's page says "Action needed", but her list row doesn't.

F2Critical

### Account manager Commission page shows placeholder data

What we saw

Six cards: Earnings $340.5, Spend this month $642.39, Sales $574.34, Your Balance $1,000, New Tasks 145, Total Projects $2433. Nothing else on the page. The rest of the product uses RM.

Recommendation

Hide the menu item until the page is built, or show the account manager's real commission: per Advisor, expected vs paid, in RM. Don't ship template content.

Heuristic: match the real worldEffort: tiny to hide

[![Account manager Commission page with generic dollar cards](img/am-commission.jpg)](img/am-commission.jpg)

/account-manager/commission

F3High

### The same state has many names, and internal names leak

What we saw

- One application at once: tag Documents pending, progress Correction Requested, tracker step Documents, alert Replace the academic transcript, list stage Application Submission.
- System names reach users: Partner Commission Invoicing (the role is "Advisor"), Correction Requested by Account Manager, Waiting Advisor to confirm arrival date.
- The same idea in four words: Action needed, Action flagged, Action required, Your move. And three for one button: Start application, Create application, New application.

Recommendation

Write a status copy sheet: each backend status → one user-facing label, one-line meaning and who acts next. Pick one word for "your turn" and one for "start an application". Apply it in tags, lists, notifications and emails.

Heuristic: consistencyHeuristic: speak the user's languageEffort: small, copy + one map

F4High

### On phones, tasks sit below a stack of totals

What we saw

- Advisor Home at 375px is 4.6 screens tall. The first screen is four total cards, one per row. The work queue starts after about 2.5 screens.
- Chart labels break mid-word (Applicat ion Submis sion).
- Applications list at 375px: totals and the pipeline take about 1.5 screens before the first application.

Recommendation

On phones, show "Waiting on you" first, then recent activity. Turn totals into one compact row of chips. Hide or simplify the stage chart on small screens.

Heuristic: efficiencyEffort: medium, layout only

[![Advisor home on a phone, totals and chart before the task queue](img/advisor-home-phone.jpg)](img/advisor-home-phone.jpg)

Advisor Home, 375px (open for full height).

[![Applications list on a phone with the status column off-screen](img/advisor-applications-phone.jpg)](img/advisor-applications-phone.jpg)

Applications list, 375px: the status column needs a sideways swipe.

F5High

### Application tables hide the status and the date

What we saw

- Phone: rows show name and programme. Stage and status, the reason someone opens the list, are off-screen to the right (Swipe across for more columns).
- Desktop 1440px (staff): the Updated column is cut to 2 weeks ag, with More columns, scroll horizontally under the table.

Recommendation

On phones, show each application as a card: name, status tag and who acts next on top. On desktop, fit the columns (narrower programme column, date on one line) so nothing is cut at 1440px.

Heuristic: visibility of statusEffort: medium

[![Staff applications table at 1440px with the Updated column cut off](img/admin-applications.jpg)](img/admin-applications.jpg)

Staff Applications at 1440px.

F6High

### Advisors can't see expected commission

What we saw

- Commission Tracker lists 3 rows: 2 Paid, 1 Disputed. Expected commission (e.g. RM3,000 for Amina) appears only inside each application.
- No totals for expected, due or paid.
- Disputed has no reason or next step on the row. Actions hide behind ⋯.
- An Advisor column shows other people's names on the Advisor's own tracker, with no explanation.

Recommendation

Lead with three totals (expected, due, paid). List every application that will earn commission with its stage and expected date. Give disputed rows a one-line reason and the next step.

Heuristic: visibility of statusEffort: medium, needs data

[![Advisor commission tracker with three rows](img/commission-tracker.jpg)](img/commission-tracker.jpg)

Advisor Commission Tracker.

F7High

### Pages don't say where you are

What we saw

- 27 of 28 pages have no page title, so every browser tab, bookmark and history entry looks the same.
- The main heading (h1) is the section, not the page: an application page says Applications, not the student's name; a payout page says Advisors.
- The menu says Knowledge Hub but the page heading says Programs. Agency Scaler is the team members page.

Recommendation

Give every page a title like "Amina Hossain · Applications · Unibexs". Make the h1 the thing on the page. Rename Agency Scaler to Team and match menu labels to page headings.

Heuristic: recognition over recallAccessibility: WCAG 2.4.2Effort: small

F8Medium

### Dashboards spend space on numbers nobody acts on

What we saw

- Card footers repeat counts: Items shown 6 · Total items 18, Actions shown 2 · Active applications 10, Stages 6.
- Full cards for zero values (Applications on hold 0, Awaiting payout 0) and for Stages in use 6.
- The stage chart has a Bars / Pipeline switch that shows the same data two ways. Quick actions repeat the sidebar. A manual Refresh overview link suggests the data may be stale.

Recommendation

Keep only numbers that lead to an action, and make each one a link to that filtered list. Drop the footer counts and the chart switch. Refresh data automatically.

Heuristic: minimalist designEffort: small

[![Advisor home on desktop](img/advisor-home.jpg)](img/advisor-home.jpg)

Advisor Home, 1440px.

F9Medium

### New application: required fields and lost work

What we saw

- The header says Fields marked * are required, but no field shows a `*`. All 5 first-step fields turn out to be required only after pressing Continue.
- No way to save a draft across 3 steps that include document uploads.

Recommendation

Mark required fields, or say "All fields are required" when they all are. Add "Save draft" (the payload already has `is_draft`) and warn before leaving with unsaved work.

Heuristic: error preventionEffort: small to medium

[![New application step 1 with no required markers](img/new-application.jpg)](img/new-application.jpg)

New application, step 1.

F10Medium

### Apply as Advisor doesn't explain the offer

What we saw

Headline Ready to connect? and Drop us a message and we'll get back fast, but the page is a choice between individual and agency sign-up. Nothing on what Advisors get, what they need, or how long review takes (the 2-working-day review is only mentioned after the email code).

Recommendation

Say what it is: "Become a Unibexs Advisor". Add three short points (what you earn, what you need, review in 2 working days) above the two choices.

Heuristic: match the real worldEffort: small, copy

[![Apply as Advisor page](img/apply-as-advisor.jpg)](img/apply-as-advisor.jpg)

/apply-as-adviser

F11Medium

### Notifications are hard to scan

What we saw

- Two layers of filters: tabs (All, Unread) and chips (All unread, Action required, System info).
- Every item starts with Aisha Rahman with no role, so it's unclear who she is.
- Tasks and information share one list. The status path uses system names (see F3).

Recommendation

One filter row. Lead each item with the student and what to do ("Amina Hossain · Replace the academic transcript"), then who and when. Show the actor's role.

Heuristic: minimalist designEffort: small

F12Medium

### Small tap targets and low contrast in places

What we saw

- Controls smaller than 24px: 28 on the staff Applications list (sort buttons, row checkboxes), 26 on Logistics Marketplace, 13 on Finance Queue.
- 34 text elements below WCAG contrast on Notifications pages (an older list component).
- One button with no accessible name on the team page (phone), one link with no name on Apply as Advisor.

Recommendation

Give row checkboxes and sort headers a 44px hit area on touch screens. Move Notifications onto the current list component. Label the two unnamed controls.

Accessibility: WCAG 1.4.3, 2.5.8, 4.1.2Effort: small

F13Low

### Long reference pages on phones

Knowledge Hub is 8.4 phone screens and Universities 4. Put search and the main filter at the top, keep other filters collapsed, and show a short result count.

Effort: small

F14Low

### The progress tracker stops before the Advisor's goal

The application tracker ends at Visa. Arrival and commission, which matter most to the Advisor, are not on it. Consider adding Arrival and Commission steps for the Advisor view.

Effort: small

## What to fix first

Ordered by user impact against effort. "Now" items are mostly copy, logic and layout changes on existing screens, with no new design system work.

### Now 1–2 weeks

1. Hide or fix the account manager Commission page (F2).
2. One rule for "waiting on you", used everywhere (F1).
3. Status copy sheet: one label per status, one word for "your turn" (F3).
4. Page titles and correct headings; rename Agency Scaler (F7).
5. Required markers on the application form (F9).
6. Fit the staff table at 1440px (F5).

### Next 2–4 weeks

1. Phone-first order on Home and lists: tasks first, compact totals (F4).
2. Application cards on phones with status visible (F5).
3. Commission Tracker with expected, due and paid totals (F6).
4. Simpler Notifications (F11).
5. Remove low-value numbers and footers (F8).

### Later after testing

1. Save draft on the application form (F9).
2. Rewrite Apply as Advisor (F10).
3. Search-first Knowledge Hub on phones (F13).
4. Tracker steps to arrival and commission (F14).
5. Tap target and contrast fixes (F12).

## Next: test with users

This audit is expert review on demo data. Before larger changes, confirm the top issues with real Advisors and staff.

### Usability sessions

- 5 Advisors, 30 minutes each, on their own phone.
- Tasks: find what needs your action today · fix a correction · start an application · find when you'll be paid.
- 3 staff shadowing sessions on the Applications queue and Finance Queue.

### Measure before and after

- Time from Correction Requested to the Advisor's re-upload.
- Share of applications submitted without a correction request.
- Time to finish a new application; drop-off by step.
- Share of Advisor sessions on phones.
- Support messages asking "where is my commission?"

### Questions to answer

- Which statuses do Advisors think are their job?
- Do Advisors start from Home, Notifications or WhatsApp?
- What does an account manager need from a Commission page?

## Method and data

Each screen was opened as its role in the current build with demo data, at 1440×900 (desktop) and 375×812 (phone, touch). Findings come from a heuristic review against Nielsen's usability heuristics and WCAG 2.1 AA. Automated checks used axe-core 4 and a script measuring sideways scroll, control sizes, unnamed controls and page height. Load times came from a development server and are not reported.

Not covered: real user behaviour, analytics, emails and WhatsApp messages, the admin data-entry screens (universities, programmes, document templates), and screen reader testing by a person. The public Advisor page (`/p/[slug]`) was switched off on this build.

| Screen | Phone height (screens) | Controls under 24px | axe issues | Main heading |
| --- | --- | --- | --- | --- |
| Advisor Home | 4.6 | 2 | 1 | Home |
| Advisor Applications | 3.1 | 7 | 1 | Applications |
| New application | 1.6 | 2 | 2 | Applications |
| Application page (Advisor) | 4.3 | 4 | 1 | Applications |
| Commission Tracker | 1.3 | 5 | 1 | Commission Tracker |
| Notifications (Advisor) | 1.7 | 2 | 2 | Notifications |
| Knowledge Hub | 8.4 | 2 | 1 | Programs |
| Universities | 4.0 | 2 | 1 | Universities |
| Public profile editor | 4.9 | 2 | 1 | Public Profile |
| Logistics Marketplace | 6.0 | 26 | 1 | Logistics Marketplace |
| Staff Home | 5.5 | 2 | 1 | Home |
| Staff Applications | 3.0 | 28 | 1 | Applications |
| Finance Queue | 1.6 | 13 | 1 | Finance Queue |
| Payout page | 1.4 | 4 | 1 | Advisors |
| Account manager Commission | 1.2 | 2 | 1 | Commission |

The one axe issue on most pages is the missing page title (F7). No screen scrolled sideways at 375px.

Unibexs UX Audit · 10 Nov 2026 · Screens from the current build with demo data. Open any screenshot for full size.
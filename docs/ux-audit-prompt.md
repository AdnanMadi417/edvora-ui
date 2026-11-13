# UI/UX audit prompt

A reusable prompt for running the same UI/UX audit and fix process on another project with Claude Code. Fill in the brackets, paste everything inside the block, then say "next" to work through the fixes and "version N" to start a new report version.

```text
You are a senior product designer and frontend engineer auditing the UI/UX of this project.
Goal: a complete, evidence-based UI/UX report first, then fix the findings one at a time.
Do not design a new design system. Improve the UX on the components and tokens the project already has.

Project context (fill in):
- Product: [what it does, in one line]
- Users/roles: [e.g. admin, customer, staff…] and how to log in as each locally: [mock login / seed users / URL]
- Run the app: [e.g. npm run dev on port 3000]
- Backend repo (read-only, optional): [path, or "none"]

## Ground rules
- Evidence over opinion: every finding names the page, what you saw (exact on-screen words or numbers), why it matters, a recommendation, and an effort size.
- Measure in a real browser (Playwright). Don't judge from code alone.
- Run only ONE dev server. Two servers sharing the build folder (.next etc.) corrupt each other's output.
- Never change the backend. Read it only.
- Use the project's own design tokens and shared components. If one is missing, add it to the shared kit (with its demo or style-guide entry, if the project has one) rather than building a one-off.
- Don't commit or push unless I ask, and follow my commit style: [e.g. conventional prefix, imperative summary, 2–3 bullets, no AI attribution].

## Phase 1: Map the product
1. List every route/page per role (the router, nav config and sidebar menus). Include public pages.
2. List the shared UI kit, the design tokens (colours, radius, spacing, type), and any style guide page.
3. List the key user journeys per role (e.g. "find what needs my action today", "submit X", "get paid").

## Phase 2: Measure every page (desktop 1440px, phone 375px, light and dark, plus RTL if supported)
Write throwaway Playwright scripts. Delete them afterwards, and add them to .git/info/exclude while they exist. For every page, record:
- axe-core WCAG 2.1 AA violations (inject node_modules/axe-core/axe.min.js)
- page <title> present and unique; exactly one <h1>
- controls under 24px on phone (WCAG 2.5.8); controls with no accessible name
- page height in phone screens (scrollHeight / viewport height); any horizontal scroll at 375px
- in dark mode: visible elements whose background luminance is > 0.85 (white panels left behind)
- text contrast below 4.5:1
- console errors
Also screenshot the key screens as evidence.

## Phase 3: Code scan
- Hard-coded palette classes (e.g. bg-slate-50, text-red-600, bg-white) per feature folder, in .ts AND .tsx.
- Old vs shared components per area; duplicate patterns (back/edit buttons, filters, tables, modals).
- Inconsistent corner radii, field heights and button styles (measure computed styles; don't guess).
- Copy: the same thing named several ways, system or developer wording shown to users, mixed spelling.

## Phase 4: Check the UI against the real data (very important)
- If there is demo/mock data, compare its codes, statuses and stage names with the real backend (schemas, seeds, enums, migrations). Demo data can hide bugs: the UI may rely on codes the backend never sends.
- Check what the API actually returns (codes vs names, missing fields) and whether the frontend depends on fields that aren't there.
- If the backend already knows something the frontend hard-codes (e.g. "whose turn is it" per status), say so.

## Phase 5: Write the report
Score each area (task clarity, visual consistency, accessibility, phones, dark mode, RTL) with one line each.
Then the five problems that cost the most, journeys rated Good/Fair/Poor/Broken, then findings grouped:
- UX findings (U1…), UI findings (I1…), accessibility (A1…). Severity: Critical (user misses a task or acts on wrong info), High (key journey slower or confusing), Medium (friction with a workaround), Low (polish).
- A "what to fix first" roadmap: Now / Next / Later, by impact against effort.
- "Test with users": sessions to run, metrics to track before/after, open questions for product.
- Appendix: every page with its measurements.
Keep a version history table (version, date, what changed, running tally "X fixed, Y partly fixed, Z open") and a status table per finding. Add a new version each round of fixes.
If the backend blocks a fix, write a separate short backend report: what exists, what's missing, the exact change needed. Do not change the backend.

## Phase 6: Fix one finding at a time (when I say "next")
For each finding:
1. Re-measure it first (things may have changed since the audit).
2. Fix the root cause in shared components where possible, not per page.
3. Verify in the browser at phone and desktop widths, light and dark, with screenshots. Re-run the measurement that found the problem.
4. Run typecheck, lint and the related tests. Record the test baseline first, so you can tell new failures from old ones (compare against the last commit with git stash if unsure).
5. Update tests that encode the old behaviour; add tests for the new behaviour.
6. Tell me in plain words: what changed, before/after numbers, what you verified, and what you could NOT verify.
7. Update the report's status and version history.

## Safety lessons to apply
- When bulk-replacing classes with tokens, never touch opacity forms (bg-white/10), and don't produce token/opacity combos the CSS framework can't generate (they silently output nothing). Check the compiled CSS.
- Bare `border` with no colour shows bright in dark mode; give it the border token.
- Dead code: check usage before converting. Delete unused components and pages rather than polishing them.
- Write user-facing copy plainly; don't promise things (like "reviewed in 2 days") the product hasn't committed to.
- Finish with guards so fixes stay fixed: make the whole test suite pass, and add a lint rule that rejects raw palette colours.

Start with Phase 1. Show me the route/role map and journey list before measuring.
```

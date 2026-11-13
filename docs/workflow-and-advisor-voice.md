# Application workflow and the Advisor's voice

Two rules for anything that shows an application's stage, status or "whose turn" to someone, and for any text an Advisor reads.

## 1. The workflow comes from the backend

The backend owns the application workflow: 5 stages, 52 statuses, who acts on each (`allowed_actor`) and the next-action text for each side. The frontend never invents stage or status codes.

- **Generated copy:** `src/config/workflow.generated.ts` is written by `npm run sync:workflow` from `unibexs-backend/scripts/prod-seed.json`. Don't edit it by hand.
- **Run it whenever the backend seed changes**, and commit the result with a note of the backend commit (the script prints it):

  ```bash
  npm run sync:workflow -- path/to/unibexs-backend
  # or set UNIBEXS_BACKEND_DIR; the default is ../unibexs-org/unibexs-backend
  ```

- **Where it's used** (`src/features/applications/stages.ts`):
  - `resolveStage()` maps a stage and status code to the stage chip and the tracker step.
  - `isAdvisorAction()` and `isStaffAction()` say whose turn it is, from `allowed_actor`. They drive the Advisor's list filter, Home counts and notification categories.
  - `stageCodeOf()` and `statusCodeOf()` look codes up by name, because the detail response sends names only.
  - `ATTENTION_STATUS_CODES` is the separate list behind the "Action needed" tag on the details page. Keep it in step with `allowed_actor` until product settles the whose-turn decisions in [the naming proposal](unibexs-workflow-and-status-naming.md#decide-first-whose-turn-is-it).
- **Mocks** (`src/mocks/handlers/applications.data.ts`) build their pipeline from the same generated file, so demo data only uses real codes.

## 2. Advisors hear one voice: Unibexs

An Advisor deals with Unibexs, not with its internal roles. Anything staff do (account manager, admin, finance) is shown to an Advisor as done by **Unibexs**. Advisors never see a staff role, a team name or a staff member's name. Staff screens keep the real names and roles, for accountability. The Advisor's own agency (team members, "agency admin") is theirs and keeps its names.

- **Use `src/lib/unibexsVoice.ts`** for any backend text an Advisor reads:
  - `unibexsVoice(text)` rewrites "Unibexs Operations Team", "Account Manager" and "Admin" as Unibexs, and "Partner" as Advisor.
  - `advisorActorName(name, role?)` returns "Unibexs" for any staff actor, and keeps the Advisor's own colleagues' names.
- **Apply it only when the viewer is an Advisor** (`user.role === "partner"`, or viewer actor `"2"` in `toApplicationView`). Staff views keep the backend text.
- **New copy written for Advisors says Unibexs directly**, for example "Provided by Unibexs" or "contact Unibexs". Never "your account manager" or "the team".
- **Where it's applied today:** the application view (status, stage, next step), the activity feed, notifications and the bell preview, chat, Advisor Home, the Advisor's application list and filters, and the Advisor's profile, which no longer names their manager.
- **Mocks** mask staff for the Advisor area the way the backend does (`src/mocks/viewer.ts`), so the dev app shows the real behaviour.
- **Backend follow-ups** that would make this layer a safety net rather than the fix: [the naming proposal](unibexs-workflow-and-status-naming.md#one-voice-to-advisors-unibexs) lists them. The main one is `STAFF_DISPLAY_NAME = "Unibexs"` in `app/services/actor_display.py`, which also fixes emails.

## 3. Status labels (after sign-off)

The proposed user-facing label for every status is in [unibexs-workflow-and-status-naming.md](unibexs-workflow-and-status-naming.md). Once product signs it off, the labels go in one copy map keyed by status code, next to `stages.ts`, and every screen reads from it. Backend names and codes stay unchanged.

Proposal for sign-off · replaces *Unibexs Status Naming* (11 Nov 2026)

# Unibexs workflow and status naming

Every stage and status an application can be in, taken from the backend, with one proposed label for each and the decisions product needs to make. **Status:** draft, not applied in the app. **Date:** 13 Nov 2026. **Source:** `unibexs-backend/scripts/prod-seed.json` at commit `8380737` (5 stages, 52 statuses), the same data as `src/config/workflow.generated.ts`.

Interactive version with search and filters: [Unibexs Workflow Reference](https://claude.ai/artifact/2QknEvCHAhqtqqN4s7ihyG). This file is generated from the same data, so the two match.

## Recommendation

Yes, rename them, in the app. Keep the backend names and codes as they are: they are internal identifiers, and the API, notifications and history use them. Fix what people see: one label per status code, kept in one copy map in the front end and used by tags, lists, the tracker, notifications and the activity feed.

### Rules the labels follow

1. **Say what's happening from the user's side.** "With the institution", not "Sent to University".
2. **When it's the Advisor's turn, name the task.** "Visa fee to pay", "eVAL to fix". The Action needed tag sits beside it.
3. **Everything staff do is Unibexs.** The Advisor never sees account manager, admin, finance or a team: "Under review by Unibexs". Outside parties keep their own name: the institution, EMGS.
4. **No internal words.** No Partner, Stage 1 or Eval. Use eVAL and e-Visa, EMGS's own spelling.
5. **Short, sentence case, one spelling:** two to six words; Advisor, institution, programme, enrolment.
6. **A status that passes straight through** (the system moves it on at once) shows the label of where it lands, so the Advisor never sees a step they can't act on.

## Stages: one name everywhere

| Backend stage | Code | Names in the app today | Proposed |
| --- | --- | --- | --- |
| Application Review | `APPLICATION_REVIEW` | Chips: Documents pending, Submitted to institution; tracker: Documents | **Unibexs review** |
| Offer Letter | `OFFER_LETTER` | Chips: In Institution review, Offer received, Submitted to institution; tracker: Submitted, Offer | **Institution and offer** |
| Visa Processing | `VISA_PROCESSING` | Chips: Visa in progress; tracker: Visa | **Visa** |
| Student Arrival & Enrollment | `STUDENT_ARRIVAL_ENROLLMENT` | Chips: Arrival and logistics, Enrolled; tracker: Arrival | **Arrival and enrolment** |
| Partner Commission Invoicing | `PARTNER_COMMISSION_INVOICING` | Chips: Commission paid, Enrolled; tracker: Commission | **Commission** |

The tracker also shows an Enquiry step that has no backend stage and is always complete. Proposal: the tracker shows the five stages above.

## Decide first: whose turn is it?

Today the app answers this in two places: the Advisor's list filter, Home counts and notification categories follow the backend's actor (`allowed_actor`), while the Action needed tag on the details page follows a separate list in the front end. For these statuses the backend actor and the Advisor's own next-action text disagree. Product decides; the backend actor or the text then changes to match, and both front-end rules read from the one agreed answer.

| Status | Code | Disagreement |
| --- | --- | --- |
| University Approved | `UNIVERSITY_APPROVED` | Backend says the account manager acts, but the Advisor's text says to pay the visa fee now (the same text as Visa fee to pay). |
| Rejected by University | `REJECTED_BY_UNIVERSITY` | Backend says the Advisor acts, but the application is closed. Agree whether the Advisor can do anything (pick another programme?). |
| Eval Ready | `EVAL_READY` | No text for the Advisor at all. Fine if the system always moves it on at once. |
| Awaiting Arrival | `AWAITING_ARRIVAL` | Backend says the Advisor acts, but the Advisor's text says to wait. Agree whether the Advisor confirms the arrival. |
| E-visa required for student | `E_VISA_REQUIRED` | Backend says the account manager acts, but the Advisor's text says to upload the e-visa. |
| Extra arrival documents required | `ARRIVAL_EXTRA_DOCS_REQUIRED` | Backend says the account manager acts, but the Advisor's text says to upload the arrival documents. |
| Enrollment Issue | `ENROLLMENT_ISSUE` | Backend says the account manager acts and offers no next status, but the Advisor's text says to upload proof of enrolment. The details page flags Action needed, while the Advisor's list filter, Home counts and notifications treat it as staff's turn. |

## One voice to Advisors: Unibexs

An Advisor deals with Unibexs, not with its internal roles. Whatever staff do, whether an account manager, an admin or finance, the Advisor reads it as done by **Unibexs**: never a role, a team or a staff member's name. Staff screens keep the real names and roles, for accountability. The Advisor's own agency (their team members, their agency admin) keeps its names.

- **In the app: done** (commit `90315360`, `src/lib/unibexsVoice.ts`). Activity, notifications, chat, Home, next steps, status names and filters.
- **In the backend: still to change.** See [Unibexs Backend Gaps](https://claude.ai/artifact/CABpPkEFgfN54GYaTAEbYm), section 5:
  - Set `STAFF_DISPLAY_NAME = "Unibexs"` in `app/services/actor_display.py` (today "Unibexs Operations Team"). It covers the timeline, chat, notification data and emails.
  - Drop `actor_role` from notification data sent to partners.
  - Reword the two partner notification texts in `notification_service.py` ("The account manager has re-uploaded…", "The account manager requested…").
  - Reword the 10 of 51 Advisor next-action texts and the 2 status names in the seed that name a role. The proposed wording is in the tables below.

## All statuses

Columns: the backend name and code; the proposed label (*passes through* = the system moves it on at once; *closed* = nothing left to do); whose turn in the backend and proposed; and the Advisor's next-action text, with the proposed Unibexs wording where it names a role.

### 1. Application Review · proposed: Unibexs review

| # | Backend status | Code | Proposed label | Whose turn: backend → proposed | Advisor sees |
| --- | --- | --- | --- | --- | --- |
| 1 | New Application | `NEW` | **Waiting for Unibexs review** | Account manager → Unibexs | Application submitted successfully. Account Manager will review the application shortly.<br>**Proposed:** Application submitted successfully. Unibexs will review the application shortly. |
| 2 | Under Review by Account Manager | `UNDER_REVIEW` | **Under review by Unibexs** | Account manager → Unibexs | Account Manager is reviewing the submitted application.<br>**Proposed:** Unibexs is reviewing the submitted application. |
| 3 | Correction Requested by Account Manager | `CORRECTION_REQUESTED` | **Corrections requested by Unibexs** | Advisor → Advisor | Review requested corrections and upload the required documents. |
| 4 | Approved | `APPROVED` | **Approved by Unibexs** *(passes through)* | Account manager → Unibexs | Application approved successfully. The application will now move to university submission. |
| 5 | Rejected | `REJECTED` | **Rejected by Unibexs** *(closed)* | Account manager → No one | Application was rejected. Review the rejection reason for more details. |

### 2. Offer Letter · proposed: Institution and offer

| # | Backend status | Code | Proposed label | Whose turn: backend → proposed | Advisor sees |
| --- | --- | --- | --- | --- | --- |
| 1 | Approved (from Stage 1) | `APPROVED_FROM_STAGE_1` | **Unibexs preparing submission** | Account manager → Unibexs | Account Manager is preparing the application for university submission.<br>**Proposed:** Unibexs is preparing the application for university submission. |
| 2 | Sent to University | `SENT_TO_UNIVERSITY` | **With the institution** | Account manager → Institution | Application submitted successfully. University is now reviewing the application. |
| 3 | University Requested Corrections | `UNI_REQ_CORRECTIONS` | **Institution needs documents** | Advisor → Advisor | Upload the requested or updated documents required by the university. |
| 4 | Program Change Suggested | `PROGRAM_CHANGE_SUGGESTED` | **Programme change suggested** | Advisor → Advisor | Review the suggested program change and choose whether to accept or reject it. |
| 5 | University Approved | `UNIVERSITY_APPROVED` | **Offer received** *(passes through)* | Account manager → Advisor **(decide)** | Congratulations! Offer letter is ready. Pay the required visa-related fees and upload the payment receipt. |
| 6 | Waiting for Payment | `WAITING_FOR_PAYMENT` | **Visa fee to pay** | Advisor → Advisor | Congratulations! Offer letter is ready. Pay the required visa-related fees and upload the payment receipt. |
| 7 | Payment Submitted | `PAYMENT_SUBMITTED` | **Payment under review by Unibexs** | Account manager → Unibexs | Payment receipt submitted successfully. Awaiting Account Manager verification.<br>**Proposed:** Payment receipt submitted successfully. Awaiting Unibexs verification. |
| 8 | Payment Approved | `PAYMENT_APPROVED` | **Payment approved by Unibexs** | Account manager → Unibexs | Payment verified — application advancing to Visa Processing |
| 9 | Offer Letter Forms Approved | `OFFER_LETTER_FORMS_APPROVED` | **Offer forms approved by Unibexs** *(passes through)* | Account manager → Unibexs | All requested offer letter forms reviewed and approved — application advancing to Visa Processing |
| 10 | Application Form Rejected | `APPLICATION_FORM_REJECTED` | **Application form to fix** | Advisor → Advisor | Application form was rejected. Review the issue and upload a corrected version. |
| 11 | Application Form 2 Rejected | `APPLICATION_FORM_2_REJECTED` | **Application form 2 to fix** | Advisor → Advisor | Application form 2 was rejected. Review the issue and upload a corrected version. |
| 12 | Health Declaration Rejected | `HEALTH_DECLARATION_REJECTED` | **Health declaration to fix** | Advisor → Advisor | Health declaration form was rejected. Review the issue and upload a corrected version. |
| 13 | Signed Offer Letter Rejected | `SIGNED_OFFER_LETTER_REJECTED` | **Signed offer letter to fix** | Advisor → Advisor | Signed offer letter was rejected. Review the issue and upload a corrected version. |
| 14 | English Form Rejected | `ENGLISH_FORM_REJECTED` | **English form to fix** | Advisor → Advisor | English form was rejected. Review the issue and upload a corrected version. |
| 15 | Payment Rejected | `PAYMENT_REJECTED` | **Payment receipt to fix** | Advisor → Advisor | Payment receipt was rejected. Review the issue and upload a valid receipt. |
| 16 | Rejected by University | `REJECTED_BY_UNIVERSITY` | **Rejected by the institution** *(closed)* | Advisor → No one **(decide)** | Application was rejected by the university. Review the rejection reason for more details. |

### 3. Visa Processing · proposed: Visa

| # | Backend status | Code | Proposed label | Whose turn: backend → proposed | Advisor sees |
| --- | --- | --- | --- | --- | --- |
| 1 | Visa documents under review | `VISA_DOCUMENTS_UNDER_REVIEW` | **Visa documents under review by Unibexs** | Account manager → Unibexs | Account Manager is reviewing the uploaded visa documents.<br>**Proposed:** Unibexs is reviewing the uploaded visa documents. |
| 2 | Visa documents re-upload required | `VISA_DOCUMENTS_REUPLOAD_REQUIRED` | **Visa documents to fix** | Advisor → Advisor | Review the requested changes and re-upload the required visa documents. |
| 3 | Submit application to EMGS | `SUBMIT_TO_EMGS` | **Submitted to EMGS by Unibexs** | Account manager → EMGS | Visa application is being submitted to EMGS or the university visa team. |
| 4 | Immigration Requested Documents | `IMMIGRATION_REQUESTED_DOCUMENTS` | **EMGS needs documents** | Advisor → Advisor | Upload the requested or updated documents required by EMGS. |
| 5 | Eval Ready | `EVAL_READY` | **eVAL to upload** *(passes through)* | Account manager → Advisor **(decide)** | — |
| 6 | Upload EMGS eval | `EVAL_PARTNER_UPLOAD` | **eVAL to upload** | Advisor → Advisor | Upload the EMGS eVAL document. |
| 7 | Eval under review | `EVAL_UNDER_REVIEW` | **eVAL under review by Unibexs** | Account manager → Unibexs | Account Manager is reviewing the uploaded eVAL document.<br>**Proposed:** Unibexs is reviewing the uploaded eVAL document. |
| 8 | Eval re-upload required | `EVAL_REUPLOAD_REQUIRED` | **eVAL to fix** | Advisor → Advisor | Review the requested changes and re-upload the required eVAL document. |
| 9 | Eval approved | `EVAL_APPROVED` | **eVAL approved by Unibexs** *(passes through)* | Account manager → Unibexs | eVAL approved successfully. Application will now move to the arrival stage. |
| 10 | Visa Rejected | `VISA_REJECTED` | **Visa rejected** *(closed)* | Account manager → No one | Visa application was rejected. Review the rejection reason for more details. |

### 4. Student Arrival & Enrollment · proposed: Arrival and enrolment

| # | Backend status | Code | Proposed label | Whose turn: backend → proposed | Advisor sees |
| --- | --- | --- | --- | --- | --- |
| 1 | Waiting Partner to confirm arrival date | `WAITING_PARTNER_CONFIRM_ARRIVAL_DATE` | **Arrival date to confirm** | Advisor → Advisor | Submit planned arrival date and upload the flight ticket. |
| 2 | Awaiting Arrival | `AWAITING_ARRIVAL` | **Student travelling** | Advisor → Advisor **(decide)** | Wait for student arrival confirmation. |
| 3 | E-visa required for student | `E_VISA_REQUIRED` | **e-Visa to upload** *(passes through)* | Account manager → Advisor **(decide)** | Upload the required e-visa document. |
| 4 | Upload e-visa | `E_VISA_PARTNER_UPLOAD` | **e-Visa to upload** | Advisor → Advisor | Upload the student e-visa document. |
| 5 | E-visa under review | `E_VISA_UNDER_REVIEW` | **e-Visa under review by Unibexs** | Account manager → Unibexs | Account Manager is reviewing the uploaded e-visa document.<br>**Proposed:** Unibexs is reviewing the uploaded e-visa document. |
| 6 | E-visa re-upload required | `E_VISA_REUPLOAD_REQUIRED` | **e-Visa to fix** | Advisor → Advisor | Review the requested changes and re-upload the e-visa document. |
| 7 | E-visa approved | `E_VISA_APPROVED` | **e-Visa approved by Unibexs** *(passes through)* | Account manager → Unibexs | E-visa approved successfully. Application will continue to the arrival stage. |
| 8 | Arrival Confirmed | `ARRIVAL_CONFIRMED` | **Arrived, Unibexs checking enrolment** | Account manager → Unibexs | Student arrival confirmed successfully. |
| 9 | Extra arrival documents required | `ARRIVAL_EXTRA_DOCS_REQUIRED` | **Arrival documents to upload** *(passes through)* | Account manager → Advisor **(decide)** | Upload the requested arrival documents to continue the process. |
| 10 | Upload extra arrival documents | `ARRIVAL_EXTRA_DOCS_UPLOAD` | **Arrival documents to upload** | Advisor → Advisor | Upload the requested arrival documents. |
| 11 | Extra arrival documents under review | `ARRIVAL_EXTRA_DOCS_UNDER_REVIEW` | **Arrival documents under review by Unibexs** | Account manager → Unibexs | Account Manager is reviewing the uploaded arrival documents.<br>**Proposed:** Unibexs is reviewing the uploaded arrival documents. |
| 12 | Extra arrival documents re-upload required | `ARRIVAL_EXTRA_DOCS_REUPLOAD` | **Arrival documents to fix** | Advisor → Advisor | Review the requested changes and re-upload the required arrival documents. |
| 13 | Extra arrival documents approved | `ARRIVAL_EXTRA_DOCS_APPROVED` | **Arrival documents approved by Unibexs** *(passes through)* | Account manager → Unibexs | Arrival documents approved successfully. Application will continue to the arrival process. |
| 14 | Enrollment Verified | `ENROLLMENT_VERIFIED` | **Enrolment verified by Unibexs** | Account manager → Unibexs | Enrollment verified successfully. Commission process will begin shortly. |
| 15 | Enrollment Issue | `ENROLLMENT_ISSUE` | **Enrolment proof needed** | Account manager → Advisor **(decide)** | Review the enrollment issue and upload the requested proof or documents. |

### 5. Partner Commission Invoicing · proposed: Commission

| # | Backend status | Code | Proposed label | Whose turn: backend → proposed | Advisor sees |
| --- | --- | --- | --- | --- | --- |
| 1 | Awaiting Commission | `AWAITING_COMMISSION` | **Invoiced to the institution** | Account manager → Institution | Commission invoicing process has started. Payment timelines depend on the university and may take time. |
| 2 | Commission Ready | `COMMISSION_READY` | **Commission being paid by Unibexs** | Account manager → Unibexs | Commission is ready and will be sent shortly. |
| 3 | Commission Paid | `COMMISSION_PAID` | **Commission to confirm** | Advisor → Advisor | Confirm commission receipt or raise a dispute if something's wrong. |
| 4 | Dispute Issue Received | `DISPUTE_ISSUE_RECEIVED` | **Dispute under review by Unibexs** | Account manager → Unibexs | Dispute submitted successfully. Awaiting Admin review.<br>**Proposed:** Dispute submitted successfully. Awaiting Unibexs review. |
| 5 | Dispute Response Received | `DISPUTE_RESPONSE_RECEIVED` | **Dispute reply to review** | Advisor → Advisor | Review the Admin's response and confirm commission receipt, or dispute again if unresolved.<br>**Proposed:** Review the Unibexs response and confirm commission receipt, or dispute again if unresolved. |
| 6 | Application Complete | `APPLICATION_COMPLETE` | **Complete** *(closed)* | Account manager → No one | Commission received and confirmed successfully. Application completed. |

## After sign-off

1. **One copy map in the front end**, next to `src/features/applications/stages.ts`: status code → label, used by every screen. Backend names and codes stay as they are.
2. **Settle the whose-turn decisions**, then update the backend actor or text; the front end's Action needed list and `isAdvisorAction` read the agreed answer.
3. **Backend copy for the Unibexs voice**: the asks above, so emails match the app.
4. **Check with 3–5 Advisors** that the new labels read clearly.

*Generated from the backend seed and the naming proposal on 13 Nov 2026. Labels are proposals; only the Unibexs voice is applied in the app so far.*

Proposal for sign-off · from the UX audit (U3, I3)

# Unibexs Status Naming

One name for each application status, what it means, and whose turn it is. Today the same status shows up under several names, and some internal names reach users. This sheet proposes one set of words for the whole portal.

**Status** Draft, not applied in the app **Date** 11 Nov 2026 **Covers** 6 stages · 34 statuses · 7 word choices **Source** the statuses and next steps in the current build

[Decide first](#decide) [Whose turn](#turn) [Writing rules](#rules) [Stages](#stages) [All statuses](#statuses) [After sign-off](#rollout)

## Decide first: seven word choices

Each card shows the words in use today and a recommendation. Counts are rough, from the UI code. Once these are agreed, the status names below follow from them.

The person who applies for students

AdvisoradviserPartner

**Advisor.** Used about 323 times against about 25 for "adviser". "Partner" stays in code only; today it leaks into labels such as Partner Commission Invoicing.

Where the student studies

InstitutionUniversity

**Institution** in labels, since it covers colleges too. Keep "university" for real names ("Asia Pacific University"). Both are heavily used today (about 151 and 219).

What the student applies to

programmeprogram

**Programme**, the Malaysian and British spelling. Forms already say "Programme" while menus say "Programs".

Starting at an institution

enrolmentenrollment

**Enrolment**, to match "programme". Today only "Enrollment" appears.

"It's your turn" on a tag

Action neededAction requiredAction flaggedYour move

**Action needed**, already the most used (about 20). Notifications' "Action required" filter becomes "Action needed".

The button that starts an application

New applicationCreate applicationStart application

**New application**, which matches the form's own title.

Capitals in buttons and labels

Save changesSave Changes

**Sentence case** everywhere: only the first word and names take a capital. Already the majority (19 against 4).

## Whose turn: six statuses to settle

The "Action needed" tag, the Advisor Home queue and the Advisor's notifications all follow one rule in the code (`isAdvisorAction`). For these six statuses, that rule and the status's own next-step text disagree about whose turn it is. Product needs to choose; the rule then gets updated to match.

| Status | Next step it shows the Advisor | Rule today | Recommendation |
| --- | --- | --- | --- |
| Commission Ready | Wait for the commission payout | Advisor's turn | Unibexs's turn Finance pays; the Advisor just waits. |
| University Approved | Review and accept the offer letter | Not flagged | Advisor's turn Nothing moves until the offer is accepted. |
| Visa Issued | Confirm the student's arrival date | Not flagged | Advisor's turn Or skip straight to "Arrival date to confirm". |
| Commission Paid | Confirm you received the commission | Not flagged | Advisor's turn The application can't close until they confirm. |
| Dispute Response Received | Confirm the corrected commission | Not flagged | Advisor's turn |
| Institution Requested Corrections notification name only | Upload what the institution asked for | Advisor's turn (wording added in v3) | Keep Confirm the backend status behind it. |

## Writing rules for status names

1. **Say what's happening, from the user's side.** "With the institution", not "Submitted to Institution".
2. **When it's the Advisor's turn, name the task.** "Visa fee to pay", "E-visa to upload". The "Action needed" tag sits next to it.
3. **When someone else acts, say who.** "In review by Unibexs", "With the institution".
4. **No system names.** No "Partner", no "Eval", no "by Account Manager" in a label.
5. **Three to five words, sentence case.** The longer explanation goes in the next-step line under the label.
6. **One name per status everywhere:** tags, lists, notifications, emails and exports.

## Stages

Today each stage has up to four names: the backend name, the coloured stage tag, the notification stage and the tracker step. The proposal keeps one name per stage, used everywhere.

| Code | Names today | Proposed |
| --- | --- | --- |
| APPLICATION_SUBMISSION | Application Submission · Documents pending · Application Review · Documents | Application |
| INSTITUTION_REVIEW | Institution Review · Submitted to Institution · In Institution review · Submitted | Institution review |
| OFFER_AND_VISA_PAYMENT | Offer & Visa Payment · Offer received · Offer | Offer and visa fee |
| VISA_PROCESSING | Visa Processing · Visa in progress · Visa | Visa |
| ARRIVAL_AND_ENROLLMENT | Student Arrival & Enrollment · Arrival and Logistics · Arrival · Enrollment | Arrival and enrolment |
| PARTNER_COMMISSION_INVOICING | Partner Commission Invoicing · Enrolled · Commission paid · Commission | Commission |

## All statuses

"Names today" lists every label a status appears under (list or tag · notification). "Whose turn" uses the recommendations above; rows marked Decide wait on the six choices in "Whose turn".

| Code | Names today | Proposed label | Next step for the Advisor | Whose turn |
| --- | --- | --- | --- | --- |
| Application |  |  |  |  |
| NEW_APPLICATION | New Application | In review by Unibexs | Wait while Unibexs checks the documents. | Unibexs |
| — | Under Review by Account Manager notification only | In review by Unibexs | Same as above. | Unibexs |
| CORRECTION_REQUESTED | Correction Requested · Correction Requested by Account Manager | Documents needed | Upload the documents Unibexs asked for. | Advisor |
| DOCUMENTS_REUPLOADED | Documents Re-uploaded | Documents re-sent | Wait while Unibexs checks them. | Unibexs |
| Institution review |  |  |  |  |
| SUBMITTED_TO_INSTITUTION | Submitted to Institution · Sent to Institution | With the institution | Wait for the institution's decision. | Institution |
| — | Institution Requested Corrections notification only | Institution needs documents | Upload what the institution asked for. | Advisor |
| PROGRAM_CHANGE_SUGGESTED | Program Change Suggested | Choose another programme | Pick the programme the institution suggested, or another. | Advisor |
| UNIVERSITY_APPROVED | University Approved · Offer Letter Issued | Offer received | Review and accept the offer letter. | Decide |
| UNIVERSITY_REJECTED | Rejected by Institution | Not accepted | No action needed. Consider another programme. | No one |
| Offer and visa fee |  |  |  |  |
| VISA_SETUP | Visa Setup | Preparing visa fee | Wait while Unibexs confirms the fee. | Unibexs |
| WAITING_FOR_PAYMENT | Waiting for Payment | Visa fee to pay | Pay the visa fee and upload the receipt. | Advisor |
| PAYMENT_SUBMITTED | Payment Submitted | Receipt in review | Wait while Unibexs checks the payment. | Unibexs |
| PAYMENT_REJECTED | Payment Rejected | Receipt not accepted | Upload a corrected receipt. | Advisor |
| APPLICATION_FORM_REJECTED | Application Form Rejected | Application form to fix | Upload a corrected application form. | Advisor |
| HEALTH_DECLARATION_REJECTED | Health Declaration Rejected | Health declaration to fix | Upload a corrected health declaration. | Advisor |
| PAYMENT_APPROVED | Payment Approved | Visa fee confirmed | Wait while Unibexs submits the visa application. | Unibexs |
| Visa |  |  |  |  |
| EVAL_PARTNER_UPLOAD | Waiting for EMGS Eval Upload | EMGS evaluation to upload | Upload the EMGS evaluation document. | Advisor |
| EVAL_UNDER_REVIEW | Eval Under Review | EMGS evaluation in review | Wait while Unibexs checks it. | Unibexs |
| EVAL_REUPLOAD_REQUIRED | Eval Re-upload Required | EMGS evaluation to re-upload | Upload a corrected EMGS evaluation. | Advisor |
| E_VISA_PARTNER_UPLOAD | Waiting for E-Visa Upload | E-visa to upload | Upload the student's e-visa. | Advisor |
| E_VISA_UNDER_REVIEW | E-Visa Under Review | E-visa in review | Wait while Unibexs checks it. | Unibexs |
| VISA_DOCUMENTS_UNDER_REVIEW | Visa Documents Under Review | Visa documents in review | Wait while Unibexs checks them. | Unibexs |
| — | Immigration Requested Documents notification only | Immigration needs documents | Upload what immigration asked for. | Advisor |
| VISA_ISSUED | Visa Issued | Visa issued | Confirm the student's arrival date. | Decide |
| Arrival and enrolment |  |  |  |  |
| WAITING_PARTNER_CONFIRM_ARRIVAL_DATE | Waiting for Arrival Date · Waiting Advisor to confirm arrival date | Arrival date to confirm | Confirm the arrival date and upload the flight ticket. | Advisor |
| ARRIVAL_CONFIRMED | Arrival Confirmed | Arrival confirmed | Prepare the student for arrival. | Unibexs |
| AWAITING_ARRIVAL | Awaiting Arrival | Arriving soon | Wait for the student to arrive. | Unibexs |
| ARRIVAL_EXTRA_DOCS_UPLOAD | Extra Arrival Documents Required | Arrival form to upload | Upload the completed arrival form. | Advisor |
| EXTRA_ARRIVAL_DOCUMENTS_UNDER_REVIEW | Extra Arrival Documents Under Review | Arrival form in review | Wait while Unibexs checks it. | Unibexs |
| STUDENT_ENROLLED | Student Enrolled · Enrollment Verified | Enrolled | Wait while Unibexs prepares the commission. | Unibexs |
| Commission |  |  |  |  |
| COMMISSION_READY | Commission Ready | Commission being paid | Wait for the payout. | Decide |
| COMMISSION_PAID | Commission Paid | Commission paid | Confirm you received it. | Decide |
| COMMISSION_DISPUTED | Commission Disputed | Commission disputed | Wait while Unibexs reviews the dispute. | Unibexs |
| DISPUTE_RESPONSE_RECEIVED | Dispute Response Received | Corrected commission to confirm | Check and confirm the corrected amount. | Decide |
| APPLICATION_COMPLETE | Application Completed · Application Complete | Complete | Nothing left to do. | No one |

## After sign-off

1. **One copy map in the frontend.** Each status code maps to its label and next step in one file, next to `stages.ts`. Every screen reads from it.
2. **Backend stays as it is.** Codes and internal names don't change; only what users see does. Notifications and emails should use the same labels, which needs the backend team for email text.
3. **Update the "whose turn" rule** to match the six decisions, with tests, so tags, Home and Notifications follow.
4. **Apply the word choices** across menus, buttons and forms (Advisor, institution, programme, enrolment, sentence case).
5. **Check with 3–5 Advisors** that the new labels read clearly, as part of the user sessions in the audit.

Unibexs Status Naming · draft · 11 Nov 2026 · Built from the statuses, next steps and notification names in the current build. Labels are proposals; nothing has been changed in the app.
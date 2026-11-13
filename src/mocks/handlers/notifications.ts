import { mock, httpError } from "../router";
import { maskNotificationData } from "../viewer";
import { table, daysAgo } from "../db";
import { APPLICATIONS, CURRENT_PARTNER, PARTNERS } from "../seed";
import { messages } from "./chat";
import { documentTypeByCode } from "./documentTypes";
import type { Notification } from "features/notifications/types";
import { WORKFLOW } from "config/workflow.generated";

// Mock endpoints for the bell + /notifications pages. Each role area
// (partner, admin, account-manager, reviewer, data-entry) gets its own feed,
// picked from the page the request comes from. Text states the event, then
// the next step.

type App = (typeof APPLICATIONS)[number];

// Each demo status points at a real backend status (config/workflow.generated.ts);
// its name, stage and codes come from there, so the feed reads like the real API.
const STATUS_CODES = {
  newApplication: "NEW",
  underReview: "UNDER_REVIEW",
  correction: "CORRECTION_REQUESTED",
  sentToInstitution: "SENT_TO_UNIVERSITY",
  institutionCorrections: "UNI_REQ_CORRECTIONS",
  programChange: "PROGRAM_CHANGE_SUGGESTED",
  offerLetter: "UNIVERSITY_APPROVED",
  waitingPayment: "WAITING_FOR_PAYMENT",
  paymentSubmitted: "PAYMENT_SUBMITTED",
  immigrationDocs: "IMMIGRATION_REQUESTED_DOCUMENTS",
  visaIssued: "EVAL_APPROVED",
  confirmArrival: "WAITING_PARTNER_CONFIRM_ARRIVAL_DATE",
  arrivalConfirmed: "ARRIVAL_CONFIRMED",
  enrollmentVerified: "ENROLLMENT_VERIFIED",
  commissionReady: "COMMISSION_READY",
  commissionPaid: "COMMISSION_PAID",
  commissionDisputed: "DISPUTE_ISSUE_RECEIVED",
  complete: "APPLICATION_COMPLETE",
} as const;
const STATUSES = Object.fromEntries(
  Object.entries(STATUS_CODES).map(([key, code]) => {
    const stage = WORKFLOW.find((st) => st.statuses.some((x) => x.code === code))!;
    const status = stage.statuses.find((x) => x.code === code)!;
    return [key, { id: `sts_${code.toLowerCase()}`, code, name: status.name, stageCode: stage.code, stageName: stage.name }];
  }),
) as Record<keyof typeof STATUS_CODES, { id: string; code: string; name: string; stageCode: string; stageName: string }>;
type StatusKey = keyof typeof STATUS_CODES;

const NEXT_STEP: Record<StatusKey, string> = {
  newApplication: "Review the documents and assign it for checking.",
  underReview: "No action needed. You will be notified when the review is complete.",
  correction: "Upload the corrected documents so the review can continue.",
  sentToInstitution: "No action needed. The Institution usually responds within 10 working days.",
  institutionCorrections: "Upload the documents the Institution asked for.",
  programChange: "Discuss the suggested programme with the student and accept or decline it.",
  offerLetter: "The university approved the application. Share the offer letter with the student.",
  waitingPayment: "Ask the student to pay the visa processing fee and upload the receipt.",
  paymentSubmitted: "No action needed. Payment is being verified.",
  immigrationDocs: "Upload the additional documents Immigration requested.",
  visaIssued: "The visa stage is complete. Book flights with the student and confirm the arrival date.",
  confirmArrival: "Confirm the student's arrival date and flight details.",
  arrivalConfirmed: "No action needed. Airport pickup has been arranged.",
  enrollmentVerified: "No action needed. Commission invoicing starts next.",
  commissionReady: "No action needed. Your payout will be scheduled shortly.",
  commissionPaid: "Check the payout in your Commission Tracker and confirm receipt.",
  commissionDisputed: "Review the dispute and resolve it from the Commission tab.",
  complete: "No action needed. This application is closed.",
};

let seq = 0;
const nextId = (area: string) => `ntf_${area}_${String(++seq).padStart(3, "0")}`;

function studentContext(app: App) {
  return {
    application_id: app.id,
    student_id: app.student.id,
    student_name: app.student.name,
    student_photo_key: `students/${app.student.id}/photo.png`,
    student_photo_url: app.student.photo_url,
    university_name: app.university.name,
  };
}

function stageChanged(area: string, app: App, key: StatusKey, from: StatusKey, ageDays: number, read: boolean): Notification {
  const to = STATUSES[key];
  const fromStatus = STATUSES[from];
  const created = daysAgo(ageDays, (seq * 3) % 7);
  return {
    id: nextId(area),
    type: "application_stage_changed",
    title: `moved ${app.student.name}'s application to ${to.name}`,
    body: NEXT_STEP[key],
    application_id: app.id,
    data: {
      ...studentContext(app),
      actor_id: app.account_manager.id.replace("am_", "usr_am_"),
      actor_name: app.account_manager.name,
      actor_role: "account_manager",
      to_stage_id: `stage_${to.stageCode.toLowerCase()}`,
      from_stage_id: `stage_${fromStatus.stageCode.toLowerCase()}`,
      to_status_id: to.id,
      from_status_id: fromStatus.id,
      to_status_code: to.code,
      from_status_code: fromStatus.code,
      to_stage_code: to.stageCode,
      from_stage_code: fromStatus.stageCode,
      to_status_name: to.name,
      to_stage_name: to.stageName,
    },
    created_at: created,
    read_at: read ? daysAgo(Math.max(0, ageDays - 0.5)) : null,
  };
}

function messageReceived(area: string, app: App, fromPartner: boolean, ageDays: number, read: boolean): Notification {
  // Point at a real chat message from the right side of the conversation.
  const thread = messages.all().filter((m) => m.application_id === app.id && (m.sender_id === app.partner.user_id) === fromPartner);
  const msg = thread[thread.length - 1];
  const senderName = fromPartner ? app.partner.name : app.account_manager.name;
  return {
    id: nextId(area),
    type: "application_message_received",
    title: `sent a message about ${app.student.name}'s application`,
    body: msg?.message_text ?? "Please check the application chat and reply.",
    application_id: app.id,
    data: {
      application_id: app.id,
      snippet: msg?.message_text.slice(0, 120),
      sender_id: msg?.sender_id,
      sender_name: senderName,
      message_id: msg?.id,
      student_name: app.student.name,
      university_name: app.university.name,
    },
    created_at: msg?.created_at ?? daysAgo(ageDays),
    read_at: read ? daysAgo(Math.max(0, ageDays - 0.3)) : null,
  };
}

function newApplication(area: string, app: App, ageDays: number, read: boolean): Notification {
  const { id: statusId, name: statusName, stageName } = STATUSES.newApplication;
  return {
    id: nextId(area),
    type: "new_application",
    title: `submitted a new application for ${app.student.name}`,
    body: NEXT_STEP.newApplication,
    application_id: app.id,
    data: {
      ...studentContext(app),
      partner_id: app.partner.id,
      partner_name: app.partner.name,
      status_id: statusId,
      status_name: statusName,
      stage_name: stageName,
    },
    created_at: daysAgo(ageDays, 2),
    read_at: read ? daysAgo(Math.max(0, ageDays - 0.5)) : null,
  };
}

function partnerSignedUp(area: string, partner: (typeof PARTNERS)[number], ageDays: number, read: boolean): Notification {
  const isAgency = partner.type === "agency";
  return {
    id: nextId(area),
    type: "partner_signed_up",
    title: `signed up as ${isAgency ? "an agency" : "an individual"} Advisor from ${partner.country}`,
    body: "Review the Advisor's profile and verify their documents.",
    application_id: "",
    data: {
      partner_id: partner.id,
      partner_name: partner.name,
      partner_type: partner.type,
      country: partner.country,
      nationality: partner.country,
      ...(isAgency
        ? { agency_logo_key: `partners/${partner.id}/logo.png`, agency_logo_url: partner.logo_url }
        : { partner_photo_key: `partners/${partner.id}/photo.png`, partner_photo_url: partner.logo_url }),
    },
    created_at: daysAgo(ageDays, 5),
    read_at: read ? daysAgo(Math.max(0, ageDays - 1)) : null,
  };
}

function correctionUpdated(area: string, app: App, ageDays: number, read: boolean): Notification {
  return {
    id: nextId(area),
    type: "correction_request_updated",
    title: `added documents to the correction request for ${app.student.name}`,
    body: "Upload the newly requested Bank Statement and Travel Insurance.",
    application_id: app.id,
    data: {
      ...studentContext(app),
      actor_name: app.account_manager.name,
      actor_role: "account_manager",
      status_id: STATUSES.correction[0],
      status_code: "correction",
      newly_required_document_type_ids: [documentTypeByCode("bank_statement").id, documentTypeByCode("travel_insurance").id],
      reason_updated: true,
    },
    created_at: daysAgo(ageDays, 1),
    read_at: read ? daysAgo(Math.max(0, ageDays - 0.2)) : null,
  };
}

function fileReuploaded(area: string, app: App, ageDays: number, read: boolean): Notification {
  return {
    id: nextId(area),
    type: "manager_file_reuploaded",
    title: `re-uploaded the passport for ${app.student.name}`,
    body: "No action needed. The updated file is in the Documents tab.",
    application_id: app.id,
    data: { ...studentContext(app), actor_name: app.account_manager.name, actor_role: "account_manager" },
    created_at: daysAgo(ageDays, 4),
    read_at: read ? daysAgo(Math.max(0, ageDays - 0.2)) : null,
  };
}

// --- Per-area feeds ----------------------------------------------------------

const myApps = APPLICATIONS.filter((a) => a.partner.id === CURRENT_PARTNER.id);
const app = (n: number) => APPLICATIONS[n % APPLICATIONS.length];
const mine = (n: number) => myApps[n % myApps.length];

function partnerFeed(): Notification[] {
  const a = "partner";
  return [
    messageReceived(a, mine(0), false, 0.1, false),
    stageChanged(a, mine(1), "correction", "underReview", 0.3, false),
    correctionUpdated(a, mine(1), 0.6, false),
    stageChanged(a, mine(2), "offerLetter", "sentToInstitution", 0.9, false),
    stageChanged(a, mine(3), "confirmArrival", "visaIssued", 1.2, false),
    stageChanged(a, mine(4), "sentToInstitution", "underReview", 1.6, false),
    messageReceived(a, mine(4), false, 2, false),
    stageChanged(a, mine(5), "commissionPaid", "commissionReady", 2.5, false),
    stageChanged(a, mine(6), "programChange", "sentToInstitution", 3, true),
    fileReuploaded(a, mine(7), 3.4, true),
    stageChanged(a, mine(0), "waitingPayment", "offerLetter", 4, true),
    stageChanged(a, mine(2), "sentToInstitution", "underReview", 6, true),
    messageReceived(a, mine(6), false, 7, true),
    stageChanged(a, mine(3), "visaIssued", "immigrationDocs", 8, true),
    stageChanged(a, mine(5), "commissionReady", "enrollmentVerified", 10, true),
    stageChanged(a, mine(7), "underReview", "newApplication", 12, true),
    stageChanged(a, mine(1), "underReview", "newApplication", 15, true),
    stageChanged(a, mine(4), "complete", "commissionPaid", 20, true),
  ];
}

function adminFeed(area: string, includeSignups: boolean): Notification[] {
  const list = [
    newApplication(area, app(23), 0.05, false),
    messageReceived(area, app(1), true, 0.2, false),
    newApplication(area, app(22), 0.4, false),
    stageChanged(area, app(3), "commissionDisputed", "commissionPaid", 0.7, false),
    stageChanged(area, app(5), "paymentSubmitted", "waitingPayment", 1.1, false),
    stageChanged(area, app(8), "arrivalConfirmed", "confirmArrival", 1.5, false),
    stageChanged(area, app(10), "institutionCorrections", "sentToInstitution", 2, false),
    newApplication(area, app(20), 2.4, true),
    stageChanged(area, app(11), "commissionDisputed", "commissionPaid", 3, true),
    messageReceived(area, app(13), true, 3.5, true),
    stageChanged(area, app(14), "enrollmentVerified", "arrivalConfirmed", 4, true),
    stageChanged(area, app(16), "visaIssued", "immigrationDocs", 6, true),
    newApplication(area, app(19), 8, true),
    stageChanged(area, app(17), "complete", "commissionPaid", 11, true),
  ];
  if (includeSignups) {
    list.push(
      partnerSignedUp(area, PARTNERS[9], 0.15, false),
      partnerSignedUp(area, PARTNERS[8], 1.8, false),
      partnerSignedUp(area, PARTNERS[7], 9, true),
    );
  }
  return list;
}

function reviewerFeed(): Notification[] {
  const a = "reviewer";
  return [
    partnerSignedUp(a, PARTNERS[9], 0.15, false),
    partnerSignedUp(a, PARTNERS[8], 1.8, false),
    partnerSignedUp(a, PARTNERS[5], 2.6, false),
    partnerSignedUp(a, PARTNERS[7], 9, true),
    partnerSignedUp(a, PARTNERS[6], 14, true),
    partnerSignedUp(a, PARTNERS[4], 21, true),
  ];
}

function dataEntryFeed(): Notification[] {
  const a = "data_entry";
  return [
    stageChanged(a, app(2), "correction", "underReview", 0.5, false),
    stageChanged(a, app(7), "sentToInstitution", "underReview", 1.3, false),
    fileReuploaded(a, app(12), 2.2, true),
    stageChanged(a, app(15), "offerLetter", "sentToInstitution", 5, true),
  ];
}

const FEEDS: Record<string, ReturnType<typeof table<Notification>>> = {};

function feed() {
  const area = typeof window !== "undefined" ? window.location.pathname.split("/")[1] || "admin" : "admin";
  if (!FEEDS[area]) {
    const rows =
      area === "partner" ? partnerFeed()
      : area === "account-manager" ? adminFeed("am", false)
      : area === "reviewer" ? reviewerFeed()
      : area === "data-entry" ? dataEntryFeed()
      : adminFeed("admin", true);
    rows.sort((x, y) => y.created_at.localeCompare(x.created_at));
    FEEDS[area] = table<Notification>(rows);
  }
  return FEEDS[area];
}

// --- Routes ----------------------------------------------------------------

mock.get("/me/notifications", ({ query }) => {
  let items = [...feed().all()];
  if (query.read_status === "unread") items = items.filter((n) => n.read_at === null);
  if (query.read_status === "read") items = items.filter((n) => n.read_at !== null);
  if (query.since) items = items.filter((n) => n.created_at > String(query.since));
  items.sort((x, y) => y.created_at.localeCompare(x.created_at));
  const page = Number(query.page) || 1;
  const pageSize = Number(query.page_size) || 20;
  // Like the backend, an Advisor never sees which staff member acted.
  const pageItems = items.slice((page - 1) * pageSize, page * pageSize).map((n) => ({ ...n, data: maskNotificationData(n.data) }));
  return { items: pageItems, total: items.length, page, page_size: pageSize };
});

mock.get("/me/notifications/unread-count", () => ({
  count: feed().all().filter((n) => n.read_at === null).length,
}));

mock.put("/me/notifications/read-all", () => {
  const now = new Date().toISOString();
  let updated = 0;
  feed()
    .all()
    .forEach((n) => {
      if (n.read_at === null) {
        n.read_at = now;
        updated++;
      }
    });
  return { updated };
});

mock.put("/me/notifications/:id/read", ({ params }) => {
  const n = feed().find(params.id);
  if (!n) throw httpError(404, "Notification not found");
  if (n.read_at === null) feed().update(n.id, { read_at: new Date().toISOString() });
  return n;
});

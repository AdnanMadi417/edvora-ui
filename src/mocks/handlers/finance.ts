import { mock, httpError } from "../router";
import { table, daysAgo, newId, nowIso, SAMPLE_PDF_URL } from "../db";
import { APPLICATIONS, PARTNERS, PROGRAMS } from "../seed";
import { PAYMENT_METHODS } from "./knowledgeHub";
import { getProgramCommission } from "./programs";
import {
  addTimeline,
  applications,
  partnerActorOf,
  programDetail,
  reached,
  stepDate,
  transition,
  type AppRecord,
} from "./applications.data";
import type {
  CommissionQueueItem,
  PartnerPayout,
  Payout,
  PayoutStatementItem,
  RecordBulkPayoutPayload,
  VoidPayoutPayload,
  WaitingOn,
} from "features/applications/payouts/types";
import type { CreatePayInPayload, UniversityPayIn, VoidPayInPayload } from "features/applications/pay-ins/types";
import type { Dispute } from "features/applications/shared/applicationTypes";
import type { ApplicationCommissionItem } from "features/applications/shared/commissionTypes";

// Mock endpoints for the commission money trail: Institution pay-ins, Advisor
// payouts, disputes, and the admin Finance Queue built from all three.
//
// The trail is seeded from each application's pipeline status
// (applications.data.ts), so the two always tell the same story:
//   before Student Enrolled   -> agreed commission only, not in the queue
//   Student Enrolled          -> waiting on the Institution (no pay-in)
//   Commission Ready          -> pay-in recorded, waiting on us
//   Commission Paid           -> pay-in + payout, Advisor still to confirm
//   Commission Disputed       -> pay-in + payout + open dispute
//   Dispute Response Received -> voided payout + corrected payout + resolved dispute
//   Application Completed     -> pay-in + payout + confirmation
// Finance writes (pay-ins, payouts, disputes, confirmations) move the
// application's status along the same path.

const CURRENCY = "RM";
const USD_TO_RM = 4.7;
const FINANCE_USERS = [
  { id: "usr_fin_001", name: "Hana Ismail" },
  { id: "usr_fin_002", name: "Kumar Selvam" },
];
const CURRENT_FINANCE_USER = FINANCE_USERS[0];
// Catalogue ids (knowledgeHub.ts): DuitNow, SWIFT wire, Wise.
const PAYOUT_METHOD_IDS = ["pm_001", "pm_002", "pm_003"];

const appById = (id: string) => applications.find(id);
const seedApp = (id: string) => APPLICATIONS.find((a) => a.id === id);
const commissionId = (app: AppRecord) => app.id.replace("app_", "comm_");
const bankAccountId = (partnerId: string) => partnerId.replace("ptn_", "pba_");
const partnerUserId = (partnerId: string) => PARTNERS.find((p) => p.id === partnerId)?.user_id ?? `usr_${partnerId}`;
const reference = (app: AppRecord) => seedApp(app.id)?.reference ?? `UBX-${app.id.replace(/\D/g, "")}`;
const toRm = (amount: number, currency: string) => Math.round(currency === "USD" ? amount * USD_TO_RM : amount);

// --- Agreed commission (fixed when first read, like the backend's snapshot) ---

type Terms = { amount: number; currency: string; typeId: string | null; type: string | null; notes: string | null; from: number | null; to: number | null };
const termsCache = new Map<string, Terms>();

/** The application's agreed commission, taken from its program (programs.ts). */
function terms(app: AppRecord): Terms {
  const cached = termsCache.get(app.id);
  if (cached) return cached;
  const pc = getProgramCommission(app.programId);
  const tuition = PROGRAMS.find((p) => p.id === app.programId)?.tuition_fee ?? 0;
  const t: Terms =
    pc && pc.amount != null
      ? {
          amount: pc.amount,
          currency: pc.currency === "MYR" ? CURRENCY : pc.currency,
          typeId: pc.type_id,
          type: pc.type,
          notes: pc.notes,
          from: Number(pc.expected_commission_from) || null,
          to: Number(pc.expected_commission_to) || null,
        }
      : {
          // Programs without an agreed amount fall back to 12% of tuition.
          amount: Math.round((tuition * 0.12) / 50) * 50,
          currency: CURRENCY,
          typeId: "ctype_001",
          type: "Percentage of Tuition",
          notes: "12% of first-year tuition, payable after the Institution confirms enrolment.",
          from: 30,
          to: 60,
        };
  termsCache.set(app.id, t);
  return t;
}
/** Agreed commission in RM, what payouts send. */
const commissionRm = (app: AppRecord) => toRm(terms(app).amount, terms(app).currency);
/** What the Institution remits for the commission (gross of our margin). */
const receivedAmount = (app: AppRecord) => Math.round((commissionRm(app) * 1.25) / 50) * 50;

// --- Seed tables -----------------------------------------------------------

type PayInRow = UniversityPayIn & { application_id: string };
type DisputeRow = Dispute & { application_id: string };
type CompletionRow = { id: string; reason: string | null; completed_at: string; completed_by: "partner" | "admin" };

const payInSeed: PayInRow[] = [];
const payoutSeed: Payout[] = [];
const disputeSeed: DisputeRow[] = [];
const completionSeed: CompletionRow[] = [];

let ref = 4100;
const payoutRef = () => `UBX-PO-2026-${++ref}`;

function seedPayout(partnerId: string, apps: AppRecord[], paidAt: string, extra: Partial<Payout> = {}): Payout {
  const id = `po_${String(payoutSeed.length + 1).padStart(3, "0")}`;
  const payout: Payout = {
    id,
    partner_id: partnerId,
    bank_account_id: bankAccountId(partnerId),
    payment_method_id: PAYOUT_METHOD_IDS[payoutSeed.length % PAYOUT_METHOD_IDS.length],
    recorded_by_user_id: FINANCE_USERS[payoutSeed.length % FINANCE_USERS.length].id,
    bank_reference: payoutRef(),
    receipt_file_key: `payouts/${id}/receipt.pdf`,
    receipt_file_url: SAMPLE_PDF_URL,
    paid_at: paidAt,
    currency: CURRENCY,
    voided_at: null,
    void_reason: null,
    voided_by_user_id: null,
    created_at: paidAt,
    items: apps.map((app) => ({
      application_id: app.id,
      application_commission_id: commissionId(app),
      paid_amount: commissionRm(app),
      source_amount: terms(app).amount,
      source_currency: terms(app).currency,
    })),
    ...extra,
  };
  payoutSeed.push(payout);
  return payout;
}

const seeded = applications.all().filter((a) => reached(a.statusCode, "COMMISSION_READY"));

// Pay-ins: everything from Commission Ready on. The first completed application
// also carries a voided pay-in that was re-recorded with the right amount.
const firstComplete = seeded.find((a) => a.statusCode === "APPLICATION_COMPLETE");
seeded.forEach((app, i) => {
  const at = stepDate(app, "COMMISSION_READY");
  if (app === firstComplete) {
    payInSeed.push({
      id: `pin_${app.id.slice(4)}_v`,
      application_id: app.id,
      payment_date: at.slice(0, 10),
      amount: receivedAmount(app) - 500,
      currency: CURRENCY,
      payment_reference: `INST-TT-${88000 + i}`,
      voided_at: at,
      void_reason: "Recorded the gross amount before bank charges were confirmed by the Institution.",
      created_at: at,
    });
  }
  payInSeed.push({
    id: `pin_${app.id.slice(4)}`,
    application_id: app.id,
    payment_date: at.slice(0, 10),
    amount: receivedAmount(app),
    currency: CURRENCY,
    payment_reference: `INST-TT-${90000 + i * 17}`,
    voided_at: null,
    void_reason: null,
    created_at: at,
  });
});

// Payouts: everything from Commission Paid on. Settled applications of the same
// Advisor share one bulk payout, like a Finance Queue batch.
const paid = seeded.filter((a) => reached(a.statusCode, "COMMISSION_PAID"));
const settled = paid.filter((a) => a.statusCode === "COMMISSION_PAID" || a.statusCode === "APPLICATION_COMPLETE");
const bulkPartner = [...new Set(settled.map((a) => a.partnerId))].find((pid) => settled.filter((a) => a.partnerId === pid).length > 1);
const bulkApps = settled.filter((a) => a.partnerId === bulkPartner);
if (bulkApps.length) seedPayout(bulkPartner!, bulkApps, stepDate(bulkApps[0], "COMMISSION_PAID"));

paid.forEach((app) => {
  const paidAt = stepDate(app, "COMMISSION_PAID");
  if (!bulkApps.includes(app)) {
    if (app.statusCode === "DISPUTE_RESPONSE_RECEIVED") {
      // Corrected after a dispute: original voided, balance sent as a new payout.
      const old = seedPayout(app.partnerId, [app], paidAt, {
        voided_at: daysAgo(1),
        void_reason: "Dispute correction: original transfer applied the wrong commission rate.",
        voided_by_user_id: CURRENT_FINANCE_USER.id,
      });
      old.items[0].paid_amount = commissionRm(app) - 750;
      const corrected = seedPayout(app.partnerId, [app], daysAgo(1));
      disputeSeed.push({
        id: `dsp_${app.id.slice(4)}`,
        application_id: app.id,
        status: "resolved",
        justification: `The payout of RM ${(commissionRm(app) - 750).toLocaleString()} is below the agreed commission of RM ${commissionRm(app).toLocaleString()} for this programme.`,
        report: "Confirmed the rate error against the commission agreement. Voided the original payout and sent the balance as a corrected transfer.",
        reported_by_user_id: partnerUserId(app.partnerId),
        resolved_by_user_id: CURRENT_FINANCE_USER.id,
        old_partner_payout_id: old.id,
        new_partner_payout_id: corrected.id,
        created_at: daysAgo(3),
        updated_at: daysAgo(1),
      });
    } else {
      seedPayout(app.partnerId, [app], paidAt);
    }
  }
  if (app.statusCode === "COMMISSION_DISPUTED") {
    const payout = payoutSeed.find((p) => !p.voided_at && p.items.some((it) => it.application_id === app.id))!;
    disputeSeed.push({
      id: `dsp_${app.id.slice(4)}`,
      application_id: app.id,
      status: "open",
      justification: "The amount received is RM 400 lower than the agreed commission. We believe intermediary bank charges were deducted on our side.",
      report: null,
      reported_by_user_id: partnerUserId(app.partnerId),
      resolved_by_user_id: null,
      old_partner_payout_id: payout.id,
      new_partner_payout_id: null,
      // Matches the "commission_disputed" timeline entry in applications.data.ts.
      created_at: daysAgo(3),
      updated_at: daysAgo(3),
    });
  }
  if (app.statusCode === "APPLICATION_COMPLETE") {
    completionSeed.push({ id: app.id, reason: null, completed_at: stepDate(app, "APPLICATION_COMPLETE"), completed_by: "partner" });
  }
});

const payIns = table<PayInRow>(payInSeed);
const payouts = table<Payout>(payoutSeed);
const disputes = table<DisputeRow>(disputeSeed);
// Commissions the Advisor confirmed as received (or an admin completed on their behalf), keyed by app id.
const completions = table<CompletionRow>(completionSeed);

// --- Derived state ---------------------------------------------------------

const activePayIn = (appId: string) => payIns.all().find((p) => p.application_id === appId && !p.voided_at);
const latestPayIn = (appId: string) =>
  [...payIns.all()].filter((p) => p.application_id === appId).sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
const payoutsFor = (appId: string) =>
  [...payouts.all()]
    .filter((p) => p.items.some((it) => it.application_id === appId))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
const activePayout = (appId: string) => payoutsFor(appId).find((p) => !p.voided_at);
const latestDispute = (appId: string) =>
  [...disputes.all()].filter((d) => d.application_id === appId).sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
const openDispute = (appId: string) => disputes.all().find((d) => d.application_id === appId && d.status !== "resolved");
const hasTrail = (appId: string) =>
  payIns.all().some((p) => p.application_id === appId) || payouts.all().some((p) => p.items.some((it) => it.application_id === appId));

/** Is the commission due yet? From Student Enrolled on, or once any money has moved. */
const inQueue = (app: AppRecord) => reached(app.statusCode, "STUDENT_ENROLLED") || hasTrail(app.id);

const daysSince = (iso: string) => Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));

function waitingOn(appId: string): WaitingOn {
  if (openDispute(appId)) return "disputed";
  if (!activePayIn(appId)) return "university";
  if (!activePayout(appId)) return "us";
  return "nobody";
}

function queueItem(app: AppRecord): CommissionQueueItem {
  const state = waitingOn(app.id);
  const payIn = activePayIn(app.id);
  const payout = activePayout(app.id);
  const dispute = openDispute(app.id);
  const paidItem = payout?.items.find((it) => it.application_id === app.id);
  const program = programDetail(app.programId);
  // Arrival is what starts the Institution's clock.
  const arrivalDate = app.arrival_date ?? stepDate(app, "STUDENT_ENROLLED");

  const facts = [
    { type: "arrival" as const, date: arrivalDate, reference: null as string | null },
    ...(payIn ? [{ type: "pay_in" as const, date: payIn.payment_date, reference: payIn.payment_reference }] : []),
    ...(payout ? [{ type: "payout" as const, date: payout.paid_at, reference: payout.bank_reference }] : []),
    ...(dispute ? [{ type: "dispute" as const, date: dispute.created_at, reference: null }] : []),
  ].sort((a, b) => b.date.localeCompare(a.date));
  const last = facts[0];

  const waitingSince =
    state === "university" ? arrivalDate : state === "us" ? payIn!.payment_date : state === "disputed" ? dispute!.created_at : null;

  return {
    application_commission_id: commissionId(app),
    application_id: app.id,
    reference: reference(app),
    student_name: app.student.name,
    partner_id: app.partnerId,
    partner_name: app.partnerName,
    university_name: program.university.name,
    program_name: program.name,
    commission_amount: terms(app).amount,
    commission_currency: terms(app).currency,
    received_amount: payIn?.amount ?? null,
    received_currency: payIn?.currency ?? null,
    paid_amount: paidItem?.paid_amount ?? null,
    paid_currency: payout?.currency ?? null,
    waiting_on: state,
    days_waiting: waitingSince ? daysSince(waitingSince) : null,
    typical_days_from: state === "university" ? 30 : state === "us" ? 3 : state === "disputed" ? 2 : null,
    typical_days_to: state === "university" ? 60 : state === "us" ? 7 : state === "disputed" ? 5 : null,
    last_fact_type: last?.type ?? null,
    last_fact_date: last?.date ?? null,
    last_fact_reference: last?.reference ?? null,
  };
}

function toPartnerPayout(payout: Payout, appId: string): PartnerPayout {
  const item = payout.items.find((it) => it.application_id === appId);
  return {
    id: payout.id,
    bank_reference: payout.bank_reference,
    paid_at: payout.paid_at,
    currency: payout.currency,
    paid_amount: item?.paid_amount ?? null,
    source_amount: item?.source_amount ?? null,
    source_currency: item?.source_currency ?? CURRENCY,
    voided_at: payout.voided_at,
    void_reason: payout.void_reason,
    created_at: payout.created_at,
    receipt_file_key: payout.receipt_file_key,
    receipt_file_url: payout.receipt_file_url,
  };
}

const stripAppId = <T extends { application_id: string }>(row: T): Omit<T, "application_id"> => {
  const { application_id: _ignored, ...rest } = row;
  return rest;
};

/**
 * Finance fields for an application detail response (`GET .../applications/:id`).
 * Exported so the applications module can merge these in and stay in sync with
 * pay-ins/payouts/disputes recorded here.
 */
export function getApplicationFinance(appId: string) {
  const app = appById(appId);
  const payIn = latestPayIn(appId);
  const payout = payoutsFor(appId)[0];
  const dispute = latestDispute(appId);
  const completion = completions.find(appId);
  return {
    university_pay_in: payIn ? (stripAppId(payIn) as UniversityPayIn) : null,
    partner_payout: payout ? toPartnerPayout(payout, appId) : null,
    dispute: dispute ? (stripAppId(dispute) as Dispute) : null,
    commission_completed_at: completion?.completed_at ?? null,
    commissions: app ? [getApplicationCommission(app.id)!] : [],
  };
}

/** The application's commission row (ApplicationCommissionItem), with a status derived from the money trail. */
export function getApplicationCommission(appId: string): ApplicationCommissionItem | null {
  const app = appById(appId);
  if (!app) return null;
  const t = terms(app);
  const state = inQueue(app) ? waitingOn(appId) : null;
  return {
    id: commissionId(app),
    // pending = agreed, not yet due; approved = due from the Institution;
    // released = received, payout pending; paid = paid out (incl. disputed).
    status: state === null ? "pending" : state === "university" ? "approved" : state === "us" ? "released" : "paid",
    amount: t.amount,
    currency: t.currency,
    commission_type_id: t.typeId,
    commission_type: t.type,
    notes: t.notes,
    expected_commission_from: t.from,
    expected_commission_to: t.to,
    created_at: app.created_at,
  };
}

// --- Status follow-through ----------------------------------------------------

/** Move the application to `to` if it is currently at one of `from` (finance writes drive the pipeline). */
function advance(appId: string, from: string[], to: string, actor?: { id: string; name: string }, notes?: string) {
  const app = appById(appId);
  if (app && from.includes(app.statusCode)) transition(app, to, { actor, notes });
}

// --- Writes shared by routes and POST /applications/:id/status ----------------

function insertPayIn(applicationId: string, p: { payment_date: string; amount: unknown; currency?: string; payment_reference: string }) {
  if (activePayIn(applicationId)) throw httpError(409, "A pay-in is already recorded for this application. Void it to correct it.");
  return payIns.insert({
    id: newId("pin"),
    application_id: applicationId,
    payment_date: p.payment_date,
    amount: Number(p.amount) || 0,
    currency: p.currency || CURRENCY,
    payment_reference: p.payment_reference,
    voided_at: null,
    void_reason: null,
    created_at: nowIso(),
  });
}

function createPayout(partnerId: string, payload: RecordBulkPayoutPayload): Payout {
  const id = newId("po");
  const payout: Payout = {
    id,
    partner_id: partnerId,
    bank_account_id: payload.bank_account_id || bankAccountId(partnerId),
    payment_method_id: payload.payment_method_id,
    recorded_by_user_id: CURRENT_FINANCE_USER.id,
    bank_reference: payload.bank_reference,
    receipt_file_key: payload.receipt_file_key || `payouts/${id}/receipt.pdf`,
    receipt_file_url: payload.receipt_file_url || SAMPLE_PDF_URL,
    paid_at: payload.paid_at ? new Date(payload.paid_at).toISOString() : nowIso(),
    currency: payload.currency || CURRENCY,
    voided_at: null,
    void_reason: null,
    voided_by_user_id: null,
    created_at: nowIso(),
    items: payload.lines.map((line) => {
      const app = appById(line.application_id);
      return {
        application_id: line.application_id,
        application_commission_id: app ? commissionId(app) : `comm_${line.application_id}`,
        paid_amount: Number(line.paid_amount) || 0,
        source_amount: app ? terms(app).amount : Number(line.paid_amount) || 0,
        source_currency: app ? terms(app).currency : CURRENCY,
      };
    }),
  };
  return payouts.insert(payout);
}

/**
 * Money recorded alongside a manager status change (useStatusUpdate sends the
 * pay-in fields with "Commission Ready" and the payout fields with "Commission
 * Paid"). The status route itself does the transition.
 */
export function recordFinanceForStatus(appId: string, toStatus: string, body: any) {
  const app = appById(appId);
  if (!app || !body) return;
  if (toStatus === "COMMISSION_READY" && body.payment_date && body.amount != null && !activePayIn(appId)) {
    insertPayIn(appId, body);
  }
  if (toStatus === "COMMISSION_PAID" && body.bank_reference && !activePayout(appId)) {
    createPayout(app.partnerId, {
      bank_account_id: body.bank_account_id,
      payment_method_id: body.payment_method_id,
      bank_reference: body.bank_reference,
      paid_at: body.paid_at,
      currency: body.currency,
      receipt_file_key: body.receipt_file_key,
      receipt_file_url: body.receipt_file_url,
      lines: [{ application_id: appId, paid_amount: String(body.paid_amount ?? commissionRm(app)) }],
    });
  }
}

function voidAndReplace(payoutId: string, payload: VoidPayoutPayload): Payout {
  const old = payouts.find(payoutId);
  if (!old) throw httpError(404, "Payout not found");
  if (old.voided_at) throw httpError(409, "This payout has already been voided");
  payouts.update(payoutId, {
    voided_at: nowIso(),
    void_reason: payload.void_reason,
    voided_by_user_id: CURRENT_FINANCE_USER.id,
  });
  return createPayout(old.partner_id, {
    bank_account_id: payload.new_bank_account_id,
    payment_method_id: payload.new_payment_method_id,
    bank_reference: payload.new_bank_reference,
    paid_at: payload.new_paid_at,
    currency: payload.new_currency,
    receipt_file_key: payload.new_receipt_file_key,
    receipt_file_url: payload.new_receipt_file_url,
    lines: payload.new_lines,
  });
}

// --- Routes: finance queue (payment methods live in knowledgeHub.ts) ---------

const WAITING_ORDER: Record<WaitingOn, number> = { disputed: 0, us: 1, university: 2, nobody: 3 };

mock.get("/admin/finance/commissions", ({ query }) => {
  let items = applications.all().filter(inQueue).map(queueItem);
  if (query.partner_id) items = items.filter((i) => i.partner_id === query.partner_id);
  if (query.waiting_on) items = items.filter((i) => i.waiting_on === query.waiting_on);
  if (String(query.hide_settled) === "true") items = items.filter((i) => i.waiting_on !== "nobody");
  items.sort((a, b) => WAITING_ORDER[a.waiting_on] - WAITING_ORDER[b.waiting_on] || (b.days_waiting ?? 0) - (a.days_waiting ?? 0));

  const page = Number(query.page) || 1;
  const pageSize = Number(query.page_size) || 20;
  return { items: items.slice((page - 1) * pageSize, page * pageSize), total: items.length, page, page_size: pageSize };
});

// --- Routes: pay-ins ---------------------------------------------------------

mock.post("/admin/pay-ins", ({ body }) => {
  const payload = body as CreatePayInPayload;
  if (!appById(payload.application_id)) throw httpError(404, "Application not found");
  const row = insertPayIn(payload.application_id, payload);
  advance(payload.application_id, ["STUDENT_ENROLLED"], "COMMISSION_READY", CURRENT_FINANCE_USER, "Institution pay-in recorded.");
  return stripAppId(row);
});

mock.post("/admin/pay-ins/:id/void", ({ params, body }) => {
  const payload = body as VoidPayInPayload;
  const old = payIns.find(params.id);
  if (!old) throw httpError(404, "Pay-in not found");
  if (old.voided_at) throw httpError(409, "This pay-in has already been voided");
  payIns.update(old.id, { voided_at: nowIso(), void_reason: payload.void_reason });
  const row = payIns.insert({
    id: newId("pin"),
    application_id: old.application_id,
    payment_date: payload.new_payment_date,
    amount: Number(payload.new_amount) || 0,
    currency: payload.new_currency || CURRENCY,
    payment_reference: payload.new_payment_reference,
    voided_at: null,
    void_reason: null,
    created_at: nowIso(),
  });
  return stripAppId(row);
});

// --- Routes: payouts ---------------------------------------------------------

mock.get("/admin/partners/:id/payouts", ({ params, query }) => {
  let rows = [...payouts.all()].filter((p) => p.partner_id === params.id).sort((a, b) => b.paid_at.localeCompare(a.paid_at));
  if (String(query.active_only) === "true") rows = rows.filter((p) => !p.voided_at);
  if (String(query.latest) === "true") rows = rows.slice(0, 1);
  return rows;
});

mock.post("/admin/partners/:id/payouts", ({ params, body }) => {
  const payload = body as RecordBulkPayoutPayload;
  const alreadyPaid = payload.lines.filter((l) => activePayout(l.application_id));
  if (alreadyPaid.length) throw httpError(409, "One or more selected applications already have an active payout.");
  const payout = createPayout(params.id, payload);
  for (const line of payload.lines) {
    advance(line.application_id, ["COMMISSION_READY"], "COMMISSION_PAID", CURRENT_FINANCE_USER, `Commission paid (${payout.bank_reference}).`);
  }
  return payout;
});

mock.get("/admin/payouts/:id", ({ params }) => {
  const payout = payouts.find(params.id);
  if (!payout) throw httpError(404, "Payout not found");
  return payout;
});

mock.post("/admin/payouts/:id/void", ({ params, body }) => voidAndReplace(params.id, body as VoidPayoutPayload));

mock.get("/admin/partners/:id/statement", ({ params, query }) => {
  let rows = [...payouts.all()].filter((p) => p.partner_id === params.id).sort((a, b) => b.paid_at.localeCompare(a.paid_at));
  if (String(query.active_only) === "true") rows = rows.filter((p) => !p.voided_at);

  const items: PayoutStatementItem[] = rows.map((p) => {
    const agreed = p.items.reduce<Record<string, number>>((acc, it) => {
      acc[it.source_currency] = (acc[it.source_currency] ?? 0) + it.source_amount;
      return acc;
    }, {});
    const recorder = FINANCE_USERS.find((u) => u.id === p.recorded_by_user_id);
    const voider = FINANCE_USERS.find((u) => u.id === p.voided_by_user_id);
    return {
      payout_id: p.id,
      bank_reference: p.bank_reference,
      payment_method_name: PAYMENT_METHODS.find(p.payment_method_id)?.name ?? "Bank Transfer",
      paid_at: p.paid_at,
      currency: p.currency,
      applications: p.items.map((it) => ({
        application_id: it.application_id,
        student_name: appById(it.application_id)?.student.name ?? "Unknown student",
      })),
      amount_sent: p.items.reduce((sum, it) => sum + it.paid_amount, 0),
      agreed_totals: Object.entries(agreed).map(([currency, amount]) => ({ currency, amount })),
      recorded_by_name: recorder?.name ?? "Finance Team",
      voided_at: p.voided_at,
      void_reason: p.void_reason,
      voided_by_name: p.voided_at ? voider?.name ?? "Finance Team" : null,
      receipt_file_url: p.receipt_file_url,
      receipt_file_key: p.receipt_file_key,
      can_void: !p.voided_at && !p.items.some((it) => openDispute(it.application_id)),
    };
  });

  const page = Number(query.page) || 1;
  const pageSize = Number(query.page_size) || 20;
  return { items: items.slice((page - 1) * pageSize, page * pageSize), total: items.length, page, page_size: pageSize };
});

// --- Routes: disputes + confirmation ---------------------------------------------

mock.post("/partner/applications/:id/dispute", ({ params, body }) => {
  const app = appById(params.id);
  if (!app) throw httpError(404, "Application not found");
  const payout = activePayout(app.id);
  if (!payout) throw httpError(400, "There is no payout on this application to dispute yet.");
  if (openDispute(app.id)) throw httpError(409, "A dispute is already open for this application.");
  const now = nowIso();
  const justification = String(body?.justification ?? "").trim();
  const row = disputes.insert({
    id: newId("dsp"),
    application_id: app.id,
    status: "open",
    justification,
    report: null,
    reported_by_user_id: partnerUserId(app.partnerId),
    resolved_by_user_id: null,
    old_partner_payout_id: payout.id,
    new_partner_payout_id: null,
    created_at: now,
    updated_at: now,
  });
  completions.remove(app.id);
  addTimeline(app, { entry_type: "commission_disputed", detail: { justification }, notes: justification || null }, partnerActorOf(app));
  advance(app.id, ["COMMISSION_PAID", "DISPUTE_RESPONSE_RECEIVED"], "COMMISSION_DISPUTED", partnerActorOf(app));
  return stripAppId(row);
});

function resolveDispute(dispute: DisputeRow, patch: Partial<DisputeRow>) {
  const row = disputes.update(dispute.id, { status: "resolved", resolved_by_user_id: CURRENT_FINANCE_USER.id, updated_at: nowIso(), ...patch })!;
  advance(dispute.application_id, ["COMMISSION_DISPUTED"], "DISPUTE_RESPONSE_RECEIVED", CURRENT_FINANCE_USER, row.report ?? undefined);
  return stripAppId(row);
}

mock.post("/admin/disputes/:id/resolve-no-issue", ({ params, body }) => {
  const dispute = disputes.find(params.id);
  if (!dispute) throw httpError(404, "Dispute not found");
  if (dispute.status === "resolved") throw httpError(409, "This dispute is already resolved.");
  return resolveDispute(dispute, { report: String(body?.report ?? "").trim() });
});

mock.post("/admin/disputes/:id/resolve-correction", ({ params, body }) => {
  const dispute = disputes.find(params.id);
  if (!dispute) throw httpError(404, "Dispute not found");
  if (dispute.status === "resolved") throw httpError(409, "This dispute is already resolved.");
  const oldId = dispute.old_partner_payout_id ?? activePayout(dispute.application_id)?.id;
  if (!oldId) throw httpError(400, "No payout to correct for this dispute.");
  const payload = body as VoidPayoutPayload;
  const corrected = voidAndReplace(oldId, payload);
  return resolveDispute(dispute, { report: payload.void_reason, old_partner_payout_id: oldId, new_partner_payout_id: corrected.id });
});

mock.post("/partner/applications/:id/confirm-received", ({ params }) => {
  const app = appById(params.id);
  if (!app) throw httpError(404, "Application not found");
  if (!activePayout(params.id)) throw httpError(400, "There is no payout on this application to confirm.");
  completions.remove(params.id);
  completions.insert({ id: params.id, reason: null, completed_at: nowIso(), completed_by: "partner" });
  advance(params.id, ["COMMISSION_PAID", "DISPUTE_RESPONSE_RECEIVED"], "APPLICATION_COMPLETE", partnerActorOf(app), "Advisor confirmed the commission was received.");
  return { application_id: params.id, confirmed: true };
});

mock.post("/admin/applications/:id/complete-commission", ({ params, body }) => {
  if (!appById(params.id)) throw httpError(404, "Application not found");
  const reason = String(body?.reason ?? "").trim() || null;
  completions.remove(params.id);
  completions.insert({ id: params.id, reason, completed_at: nowIso(), completed_by: "admin" });
  advance(params.id, ["COMMISSION_PAID", "DISPUTE_RESPONSE_RECEIVED"], "APPLICATION_COMPLETE", CURRENT_FINANCE_USER, reason ?? "Completed on the Advisor's behalf.");
  return { application_id: params.id, completed: true };
});

/**
 * Commission queue row for one application plus its active payout reference,
 * or null while the commission isn't due yet (before Student Enrolled).
 * Exported for the partner-side statement (`GET /partners/statement`, in partners.ts).
 */
export function getCommissionStatementRow(appId: string) {
  const app = appById(appId);
  if (!app || !inQueue(app)) return null;
  return { ...queueItem(app), created_at: app.created_at, payout_reference: activePayout(appId)?.bank_reference ?? null };
}

import { mock, httpError } from "../router";
import { table, daysAgo, newId, pick, SAMPLE_PDF_URL } from "../db";
import { APPLICATIONS } from "../seed";
import { PAYMENT_METHODS } from "./knowledgeHub";
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

type App = (typeof APPLICATIONS)[number];

const CURRENCY = "RM";
const FINANCE_USERS = [
  { id: "usr_fin_001", name: "Hana Ismail" },
  { id: "usr_fin_002", name: "Kumar Selvam" },
];
const CURRENT_FINANCE_USER = FINANCE_USERS[0];


const appById = (id: string) => APPLICATIONS.find((a) => a.id === id);
const commissionId = (app: App) => app.id.replace("app_", "comm_");
const commissionAmount = (app: App) => Math.round((app.program.tuition_fee * 0.12) / 50) * 50;
const receivedAmount = (app: App) => Math.round((commissionAmount(app) * 1.25) / 50) * 50;
const bankAccountId = (partnerId: string) => partnerId.replace("ptn_", "pba_");

// Lifecycle per application index; "resolved" = settled after a dispute was corrected.
type SeedState = "university" | "us" | "nobody" | "disputed" | "resolved";
const SEED_STATES: SeedState[] = [
  "nobody", "university", "us", "disputed", "nobody", "us", "university", "nobody",
  "us", "nobody", "university", "disputed", "us", "nobody", "university", "us",
  "nobody", "nobody", "resolved", "university", "us", "nobody", "university", "us",
];

// --- Seed tables -----------------------------------------------------------

type PayInRow = UniversityPayIn & { application_id: string };
type DisputeRow = Dispute & { application_id: string };
type CompletionRow = { id: string; reason: string | null; completed_at: string; completed_by: "partner" | "admin" };

const payInSeed: PayInRow[] = [];
const payoutSeed: Payout[] = [];
const disputeSeed: DisputeRow[] = [];

let ref = 4100;
const payoutRef = () => `UBX-PO-2026-${++ref}`;

function seedPayout(partnerId: string, apps: App[], paidDaysAgo: number, extra: Partial<Payout> = {}): Payout {
  const id = `po_${String(payoutSeed.length + 1).padStart(3, "0")}`;
  const payout: Payout = {
    id,
    partner_id: partnerId,
    bank_account_id: bankAccountId(partnerId),
    payment_method_id: `pm_00${(payoutSeed.length % 4) + 1}`,
    recorded_by_user_id: pick(FINANCE_USERS, payoutSeed.length).id,
    bank_reference: payoutRef(),
    receipt_file_key: `payouts/${id}/receipt.pdf`,
    receipt_file_url: SAMPLE_PDF_URL,
    paid_at: daysAgo(paidDaysAgo),
    currency: CURRENCY,
    voided_at: null,
    void_reason: null,
    voided_by_user_id: null,
    created_at: daysAgo(paidDaysAgo, -2),
    items: apps.map((app) => ({
      application_id: app.id,
      application_commission_id: commissionId(app),
      paid_amount: commissionAmount(app),
      source_amount: commissionAmount(app),
      source_currency: CURRENCY,
    })),
    ...extra,
  };
  payoutSeed.push(payout);
  return payout;
}

APPLICATIONS.forEach((app, i) => {
  const state = SEED_STATES[i];
  if (state === "university") return;

  const payInDays = 40 - (i % 12);
  // One historical pay-in that was voided and re-recorded with the right amount.
  if (i === 5) {
    payInSeed.push({
      id: `pin_${app.id.slice(4)}_v`,
      application_id: app.id,
      payment_date: daysAgo(payInDays + 2),
      amount: receivedAmount(app) - 500,
      currency: CURRENCY,
      payment_reference: `INST-TT-${88000 + i}`,
      voided_at: daysAgo(payInDays - 1),
      void_reason: "Recorded the gross amount before bank charges were confirmed by the Institution.",
      created_at: daysAgo(payInDays + 2),
    });
  }
  payInSeed.push({
    id: `pin_${app.id.slice(4)}`,
    application_id: app.id,
    payment_date: daysAgo(payInDays),
    amount: receivedAmount(app),
    currency: CURRENCY,
    payment_reference: `INST-TT-${90000 + i * 17}`,
    voided_at: null,
    void_reason: null,
    created_at: daysAgo(payInDays, -3),
  });
});

// Payouts: settled/disputed apps. Two of the current Advisor's settled apps share one bulk payout.
const bulkApps = [APPLICATIONS[0], APPLICATIONS[9]];
seedPayout(APPLICATIONS[0].partner.id, bulkApps, 18);
APPLICATIONS.forEach((app, i) => {
  const state = SEED_STATES[i];
  if (bulkApps.includes(app)) return;
  if (state === "nobody" || state === "disputed") {
    seedPayout(app.partner.id, [app], 30 - (i % 15));
  }
  if (state === "resolved") {
    const old = seedPayout(app.partner.id, [app], 26, {
      voided_at: daysAgo(12),
      void_reason: "Dispute correction: original transfer applied the wrong commission rate.",
      voided_by_user_id: CURRENT_FINANCE_USER.id,
    });
    old.items[0].paid_amount = commissionAmount(app) - 750;
    const corrected = seedPayout(app.partner.id, [app], 12);
    disputeSeed.push({
      id: `dsp_${app.id.slice(4)}`,
      application_id: app.id,
      status: "resolved",
      justification: `The payout of RM ${(commissionAmount(app) - 750).toLocaleString()} is below the agreed commission of RM ${commissionAmount(app).toLocaleString()} for this programme.`,
      report: "Confirmed the rate error against the commission agreement. Voided the original payout and sent the balance as a corrected transfer.",
      reported_by_user_id: app.partner.user_id,
      resolved_by_user_id: CURRENT_FINANCE_USER.id,
      old_partner_payout_id: old.id,
      new_partner_payout_id: corrected.id,
      created_at: daysAgo(20),
      updated_at: daysAgo(12),
    });
  }
});

// Open/pending disputes on the "disputed" apps.
APPLICATIONS.forEach((app, i) => {
  if (SEED_STATES[i] !== "disputed") return;
  const payout = payoutSeed.find((p) => !p.voided_at && p.items.some((it) => it.application_id === app.id))!;
  disputeSeed.push({
    id: `dsp_${app.id.slice(4)}`,
    application_id: app.id,
    status: i === 3 ? "open" : "pending",
    justification:
      i === 3
        ? "The transfer has not reached our account after 10 working days. Please share the bank's payment confirmation."
        : "The amount received is RM 400 lower than the agreed commission. We believe intermediary bank charges were deducted on our side.",
    report: null,
    reported_by_user_id: app.partner.user_id,
    resolved_by_user_id: null,
    old_partner_payout_id: payout.id,
    new_partner_payout_id: null,
    created_at: daysAgo(4 + (i % 5)),
    updated_at: daysAgo(2),
  });
});

const payIns = table<PayInRow>(payInSeed);
const payouts = table<Payout>(payoutSeed);
const disputes = table<DisputeRow>(disputeSeed);
// Commissions the Advisor confirmed as received (or an admin completed on their behalf), keyed by app id.
const completions = table<CompletionRow>(
  APPLICATIONS.filter((_, i) => SEED_STATES[i] === "nobody" && i % 2 === 0).map((app, k) => ({
    id: app.id,
    reason: null,
    completed_at: daysAgo(5 + k),
    completed_by: "partner" as const,
  })),
);

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

const daysSince = (iso: string) => Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));

function waitingOn(appId: string): WaitingOn {
  if (openDispute(appId)) return "disputed";
  if (!activePayIn(appId)) return "university";
  if (!activePayout(appId)) return "us";
  return "nobody";
}

function queueItem(app: App): CommissionQueueItem {
  const state = waitingOn(app.id);
  const payIn = activePayIn(app.id);
  const payout = activePayout(app.id);
  const dispute = openDispute(app.id);
  const paidItem = payout?.items.find((it) => it.application_id === app.id);
  // Arrival is what starts the Institution's clock.
  const arrivalDate = daysAgo(Math.max(8, 95 - Number(app.id.slice(4)) * 3));

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
    reference: app.reference,
    student_name: app.student.name,
    partner_id: app.partner.id,
    partner_name: app.partner.name,
    university_name: app.university.name,
    program_name: app.program.name,
    commission_amount: commissionAmount(app),
    commission_currency: CURRENCY,
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
  const state = waitingOn(appId);
  return {
    id: commissionId(app),
    status: state === "university" ? "pending" : state === "us" ? "approved" : state === "disputed" ? "released" : "paid",
    amount: commissionAmount(app),
    currency: CURRENCY,
    commission_type_id: "ctype_001",
    commission_type: "Percentage",
    notes: "12% of first-year tuition, payable after the Institution confirms enrolment.",
    expected_commission_from: 30,
    expected_commission_to: 60,
    created_at: app.created_at,
  };
}

// --- Payout writes (shared by void + dispute correction) --------------------

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
    paid_at: payload.paid_at ? new Date(payload.paid_at).toISOString() : new Date().toISOString(),
    currency: payload.currency || CURRENCY,
    voided_at: null,
    void_reason: null,
    voided_by_user_id: null,
    created_at: new Date().toISOString(),
    items: payload.lines.map((line) => {
      const app = appById(line.application_id);
      return {
        application_id: line.application_id,
        application_commission_id: app ? commissionId(app) : `comm_${line.application_id}`,
        paid_amount: Number(line.paid_amount) || 0,
        source_amount: app ? commissionAmount(app) : Number(line.paid_amount) || 0,
        source_currency: CURRENCY,
      };
    }),
  };
  return payouts.insert(payout);
}

function voidAndReplace(payoutId: string, payload: VoidPayoutPayload): Payout {
  const old = payouts.find(payoutId);
  if (!old) throw httpError(404, "Payout not found");
  if (old.voided_at) throw httpError(409, "This payout has already been voided");
  payouts.update(payoutId, {
    voided_at: new Date().toISOString(),
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
  let items = APPLICATIONS.map(queueItem);
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
  if (activePayIn(payload.application_id)) throw httpError(409, "A pay-in is already recorded for this application. Void it to correct it.");
  const row = payIns.insert({
    id: newId("pin"),
    application_id: payload.application_id,
    payment_date: payload.payment_date,
    amount: Number(payload.amount) || 0,
    currency: payload.currency || CURRENCY,
    payment_reference: payload.payment_reference,
    voided_at: null,
    void_reason: null,
    created_at: new Date().toISOString(),
  });
  return stripAppId(row);
});

mock.post("/admin/pay-ins/:id/void", ({ params, body }) => {
  const payload = body as VoidPayInPayload;
  const old = payIns.find(params.id);
  if (!old) throw httpError(404, "Pay-in not found");
  if (old.voided_at) throw httpError(409, "This pay-in has already been voided");
  payIns.update(old.id, { voided_at: new Date().toISOString(), void_reason: payload.void_reason });
  const row = payIns.insert({
    id: newId("pin"),
    application_id: old.application_id,
    payment_date: payload.new_payment_date,
    amount: Number(payload.new_amount) || 0,
    currency: payload.new_currency || CURRENCY,
    payment_reference: payload.new_payment_reference,
    voided_at: null,
    void_reason: null,
    created_at: new Date().toISOString(),
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
  return createPayout(params.id, payload);
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
  const now = new Date().toISOString();
  const row = disputes.insert({
    id: newId("dsp"),
    application_id: app.id,
    status: "open",
    justification: String(body?.justification ?? "").trim(),
    report: null,
    reported_by_user_id: app.partner.user_id,
    resolved_by_user_id: null,
    old_partner_payout_id: payout.id,
    new_partner_payout_id: null,
    created_at: now,
    updated_at: now,
  });
  completions.remove(app.id);
  return stripAppId(row);
});

mock.post("/admin/disputes/:id/resolve-no-issue", ({ params, body }) => {
  const dispute = disputes.find(params.id);
  if (!dispute) throw httpError(404, "Dispute not found");
  if (dispute.status === "resolved") throw httpError(409, "This dispute is already resolved.");
  const row = disputes.update(dispute.id, {
    status: "resolved",
    report: String(body?.report ?? "").trim(),
    resolved_by_user_id: CURRENT_FINANCE_USER.id,
    updated_at: new Date().toISOString(),
  })!;
  return stripAppId(row);
});

mock.post("/admin/disputes/:id/resolve-correction", ({ params, body }) => {
  const dispute = disputes.find(params.id);
  if (!dispute) throw httpError(404, "Dispute not found");
  if (dispute.status === "resolved") throw httpError(409, "This dispute is already resolved.");
  const oldId = dispute.old_partner_payout_id ?? activePayout(dispute.application_id)?.id;
  if (!oldId) throw httpError(400, "No payout to correct for this dispute.");
  const payload = body as VoidPayoutPayload;
  const corrected = voidAndReplace(oldId, payload);
  const row = disputes.update(dispute.id, {
    status: "resolved",
    report: payload.void_reason,
    resolved_by_user_id: CURRENT_FINANCE_USER.id,
    old_partner_payout_id: oldId,
    new_partner_payout_id: corrected.id,
    updated_at: new Date().toISOString(),
  })!;
  return stripAppId(row);
});

mock.post("/partner/applications/:id/confirm-received", ({ params }) => {
  if (!appById(params.id)) throw httpError(404, "Application not found");
  if (!activePayout(params.id)) throw httpError(400, "There is no payout on this application to confirm.");
  completions.remove(params.id);
  completions.insert({ id: params.id, reason: null, completed_at: new Date().toISOString(), completed_by: "partner" });
  return { application_id: params.id, confirmed: true };
});

mock.post("/admin/applications/:id/complete-commission", ({ params, body }) => {
  if (!appById(params.id)) throw httpError(404, "Application not found");
  completions.remove(params.id);
  completions.insert({
    id: params.id,
    reason: String(body?.reason ?? "").trim() || null,
    completed_at: new Date().toISOString(),
    completed_by: "admin",
  });
  return { application_id: params.id, completed: true };
});


/**
 * Commission queue row for one application plus its active payout reference.
 * Exported for the partner-side statement (`GET /partners/statement`, in partners.ts).
 */
export function getCommissionStatementRow(appId: string) {
  const app = appById(appId);
  if (!app) return null;
  return { ...queueItem(app), created_at: app.created_at, payout_reference: activePayout(appId)?.bank_reference ?? null };
}

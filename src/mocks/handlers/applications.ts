import { mock, httpError } from "../router";
import { daysAgo, newId, nowIso, paginate, search, SAMPLE_PDF_URL } from "../db";
import { CURRENT_PARTNER, PARTNERS, PROGRAMS, UNIVERSITIES } from "../seed";
import { getApplicationFinance } from "./finance";
import {
  APP_DOCUMENT_TYPES,
  STAGES,
  STATUSES,
  addTimeline,
  applications,
  arrivalDocumentsFor,
  commissionDocumentsFor,
  commissionsFor,
  disputeFor,
  docTypeRef,
  documentsFor,
  emgsFor,
  nextStatuses,
  offerLetterFor,
  partnerActorOf,
  payInFor,
  paymentDocumentsFor,
  payoutFor,
  programDetail,
  seedTimeline,
  statusByCode,
  statusById,
  studentPhoto,
  toStageStatus,
  transition,
  uploadedDoc,
  visaCaseFor,
  visaDocFor,
  visaPaymentsFor,
  type AppRecord,
} from "./applications.data";

// Mock endpoints for applications (admin, account manager and Advisor views).

const findApp = (id: string) => {
  const app = applications.find(id);
  if (!app) throw httpError(404, "Application not found");
  return app;
};

const currentStatus = (app: AppRecord) => statusByCode(app.statusCode);
const stageOf = (app: AppRecord) => STAGES[currentStatus(app).stageIndex];

// --- list rows ---------------------------------------------------------------

function listRow(app: AppRecord) {
  const st = currentStatus(app);
  const program = programDetail(app.programId);
  return {
    id: app.id,
    updated_at: app.updated_at,
    partner_id: app.partnerId,
    partner_name: app.partnerName,
    account_manager_name: app.accountManagerName,
    program_name: program.name,
    university_name: program.university.name,
    student_name: app.student.name,
    student_email: app.student.email,
    passport_number: app.student.passport_number,
    student_photo_file_key: app.student.photo_file_key,
    student_photo_file_url: studentPhoto(app),
    stage: STAGES[st.stageIndex].name,
    status: st.name,
    next_action: st.manager,
    lifecycle_status: app.lifecycle,
    new_notifications_count: app.new_notifications_count,
  };
}

/** Shared filtering for the three list endpoints. */
function listApplications(rows: AppRecord[], query: Record<string, any>, viewer: "partner" | "manager" = "manager") {
  let items = rows;
  const lifecycle = query.status ?? "active";
  if (lifecycle !== "all") items = items.filter((a) => a.lifecycle === lifecycle);
  if (query.stage_id) items = items.filter((a) => currentStatus(a).stage_id === query.stage_id);
  if (query.stage_status_id) items = items.filter((a) => currentStatus(a).id === query.stage_status_id);
  if (query.partner_id) items = items.filter((a) => a.partnerId === query.partner_id);
  if (query.university_id) items = items.filter((a) => programDetail(a.programId).university.id === query.university_id);
  let mapped = items
    .map((a) => {
      const row = listRow(a);
      return viewer === "partner" ? { ...row, next_action: currentStatus(a).partner } : row;
    })
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  mapped = search(mapped, query.search, ["student_name", "student_email", "passport_number", "program_name", "university_name", "partner_name"]);
  return paginate(mapped, query);
}

// --- detail ------------------------------------------------------------------

function detail(app: AppRecord, viewer: "partner" | "manager" = "manager") {
  const st = currentStatus(app);
  const stage = stageOf(app);
  const program = programDetail(app.programId);
  // Money trail (pay-in, payout, dispute, commission) is owned by finance.ts
  // so records written through finance routes show up here; fall back to the
  // derived values for applications finance doesn't know (e.g. new ones).
  const finance = getApplicationFinance(app.id);
  const commissions = finance.commissions.length ? finance.commissions : commissionsFor(app);
  return {
    id: app.id,
    is_draft: false,
    lifecycle_status: app.lifecycle,
    status_code: st.code,
    intake_date: app.intake_date,
    arrival_date: app.arrival_date,
    is_e_visa_required: true,
    is_arrival_extra_docs_required: app.statusCode === "ARRIVAL_EXTRA_DOCS_UPLOAD",
    qualification_level: app.student.previous_educations?.[0]?.qualification ?? null,
    created_at: app.created_at,
    updated_at: app.updated_at,
    partner: { id: app.partnerId, name: app.partnerName },
    program,
    student: app.student,
    student_photo_file_key: app.student.photo_file_key,
    student_photo_file_url: studentPhoto(app),
    stage: {
      id: stage.id,
      name: stage.name,
      code: stage.code,
      order_index: stage.order_index,
      statuses: [
        {
          id: st.id,
          name: st.name,
          code: st.code,
          next_actions: [
            { actor: "2", name: st.partner },
            { actor: "3", name: st.manager },
          ],
        },
      ],
    },
    documents: documentsFor(app),
    commissions,
    payment_documents: paymentDocumentsFor(app),
    arrival_documents: arrivalDocumentsFor(app),
    offer_letter_document: offerLetterFor(app),
    visa_document: visaDocFor(app),
    emgs_evaluation_document: emgsFor(app),
    commission_documents: commissionDocumentsFor(app),
    university_pay_in: finance.commissions.length ? finance.university_pay_in : viewer === "partner" ? null : payInFor(app),
    partner_payout: finance.commissions.length ? finance.partner_payout : payoutFor(app),
    dispute: finance.commissions.length ? finance.dispute : disputeFor(app),
    commission_completed_at: finance.commission_completed_at ?? null,
    visa_fee_amount: app.visa_fee_amount,
  };
}

/** GET /applications/:id — the status/actions payload (useApplicationActions). */
function actionsPayload(app: AppRecord) {
  const st = currentStatus(app);
  const next = nextStatuses(app.statusCode);
  const requested = new Set(app.requested_doc_type_ids);
  const uploadPending = st.docs && requested.size > 0;
  // While awaiting arrival with nothing requested the Advisor sees the
  // "awaiting arrival" panel, which needs an empty document_types list.
  const documentTypes = app.statusCode === "AWAITING_ARRIVAL"
    ? []
    : APP_DOCUMENT_TYPES.map((d) => ({
        ...d,
        is_required_for_init: d.is_required_init_app_doc,
        is_required_for_current_upload: !!uploadPending && requested.has(d.id),
        template_file_key: d.code === "arrival_form" ? `applications/${app.id}/arrival_form_template.pdf` : null,
        template_file_url: d.code === "arrival_form" ? SAMPLE_PDF_URL : null,
      }));
  const rejectedOrCorrection = !!st.reason || !!st.docs;
  return {
    id: app.id,
    stage: STAGES[st.stageIndex].name,
    status: st.name,
    status_code: st.code,
    is_draft: false,
    is_arrival_extra_docs_required: app.statusCode === "ARRIVAL_EXTRA_DOCS_UPLOAD",
    is_application_form_required: app.forms.application_form,
    is_application_form_2_required: app.forms.application_form_2,
    is_health_declaration_form_required: app.forms.health_declaration,
    is_signed_offer_letter_required: app.forms.signed_offer_letter,
    is_english_form_required: app.forms.english_form,
    correction_reason: app.correction_reason,
    can_update_correction_request: rejectedOrCorrection && app.lifecycle === "active",
    next_action: st.partner,
    available_actions: next.map((n) => ({ status: n.name, next_action: n.manager })),
    document_types: documentTypes,
    manager_allowed_next_statuses: next.map(toStageStatus),
    partner_actions: [],
    arrival_documents: arrivalDocumentsFor(app),
    visa_fee_amount: app.visa_fee_amount,
  };
}

// --- reference data ----------------------------------------------------------

mock.get("/applications/stages", () => STAGES);
mock.get("/applications/stage-statuses", ({ query }) =>
  STATUSES.filter((s) => !query.stage_id || s.stage_id === query.stage_id).map(toStageStatus),
);

const REQUIRED_FIELDS = [
  ["intake_date", "Intake Date", true],
  ["student.birthday", "Date of Birth", true],
  ["student.nationality", "Nationality", true],
  ["student.passport_number", "Passport Number", true],
  ["student.email", "Email Address", true],
  ["student.phone", "Phone Number", true],
  ["student.current_address", "Current Address", false],
  ["student.gender", "Gender", true],
  ["student.emergency_contacts", "Emergency Contacts", false],
  ["student.english_proficiencies", "English Proficiency", false],
  ["student.previous_educations", "Previous Education", true],
] as const;

function requiredFields(universityId: string) {
  const idx = Math.max(0, UNIVERSITIES.findIndex((u) => u.id === universityId));
  return {
    university_id: universityId,
    university_type_id: idx % 2 ? "utype_002" : "utype_001",
    university_type_name: idx % 2 ? "Private University College" : "Private University",
    fields: REQUIRED_FIELDS.map(([key, name, req], i) => ({
      id: `rf_${universityId}_${i + 1}`,
      field_key: key,
      field_name: name,
      // Vary the optional set a little per Institution.
      is_required: req || (idx + i) % 3 === 0,
    })),
  };
}

mock.get("/applications/universities/:universityId/required-fields", ({ params }) => requiredFields(params.universityId));
mock.get("/partners/:partnerId/universities/:universityId/required-fields", ({ params }) => requiredFields(params.universityId));

// --- lists -------------------------------------------------------------------

mock.get("/admin/applications", ({ query }) => listApplications(applications.all(), query));
mock.get("/account-managers/applications", ({ query }) => listApplications(applications.all(), query));

const partnerRows = (partnerId: string) => {
  const known = PARTNERS.some((p) => p.id === partnerId);
  const id = known ? partnerId : CURRENT_PARTNER.id;
  return applications.all().filter((a) => a.partnerId === id);
};

mock.get("/partners/:partnerId/applications", ({ params, query }) =>
  listApplications(partnerRows(params.partnerId), query, "partner"),
);

// --- details -----------------------------------------------------------------

mock.get("/admin/applications/:id", ({ params }) => detail(findApp(params.id)));
mock.get("/account-managers/applications/:id", ({ params }) => detail(findApp(params.id)));
mock.get("/partners/:partnerId/applications/:id", ({ params }) => detail(findApp(params.id), "partner"));
mock.get("/applications/:id", ({ params }) => actionsPayload(findApp(params.id)));

mock.get("/applications/:id/timeline", ({ params, query }) => {
  const app = findApp(params.id);
  if (!app.timeline.length) app.timeline = seedTimeline(app);
  const page = Number(query.page ?? 1) || 1;
  const pageSize = Number(query.page_size ?? 20) || 20;
  return {
    items: app.timeline.slice((page - 1) * pageSize, page * pageSize),
    total: app.timeline.length,
    page,
    page_size: pageSize,
  };
});

// --- visa --------------------------------------------------------------------

mock.patch("/applications/:id/visa-case", ({ params, body }) => {
  const app = findApp(params.id);
  const existing = visaCaseFor(app);
  if (body?.visa_fee_amount != null) app.visa_fee_amount = Number(body.visa_fee_amount);
  app.visaCaseOverride = {
    id: existing?.id ?? `visa_${app.id}`,
    application_id: app.id,
    visa_fee_amount: app.visa_fee_amount.toFixed(2),
    visa_reference_number: body?.visa_reference_number ?? existing?.visa_reference_number ?? null,
    notes: body?.notes ?? existing?.notes ?? null,
    created_at: existing?.created_at ?? nowIso(),
    updated_at: nowIso(),
  };
  app.updated_at = nowIso();
  addTimeline(app, { entry_type: "visa_case_updated", detail: { visa_fee_amount: app.visa_fee_amount } });
  return app.visaCaseOverride;
});

mock.post("/applications/:id/visa-payments", ({ params, body }) => {
  const app = findApp(params.id);
  const vc = visaCaseFor(app);
  const payment = {
    id: newId("vp"),
    visa_case_id: vc?.id ?? `visa_${app.id}`,
    university_payment_method_id: body?.university_payment_method_id ?? "upm_001",
    amount: String(body?.amount ?? app.visa_fee_amount),
    currency: body?.currency ?? "RM",
    payment_reference: body?.payment_reference ?? "",
    status: "pending",
    submitted_at: nowIso(),
    created_at: nowIso(),
    updated_at: nowIso(),
    documents: [{ id: newId("vpd"), file_key: body?.file_key ?? "uploads/visa_payment.pdf", file_url: SAMPLE_PDF_URL }],
  };
  app.visaPayments.unshift(payment);
  addTimeline(app, { entry_type: "visa_payment_created", detail: { amount: payment.amount, currency: payment.currency } }, partnerActorOf(app));
  if (["WAITING_FOR_PAYMENT", "PAYMENT_REJECTED", "APPLICATION_FORM_REJECTED", "HEALTH_DECLARATION_REJECTED"].includes(app.statusCode)) {
    transition(app, "PAYMENT_SUBMITTED", { actor: partnerActorOf(app) });
  }
  return payment;
});

// --- status & lifecycle ----------------------------------------------------

mock.post("/applications/:id/status", ({ params, body }) => {
  const app = findApp(params.id);
  const target = statusById(body?.status_id);
  if (!target) throw httpError(422, "Unknown status");
  transition(app, target.code, {
    reason: body?.reason_text,
    notes: body?.notes,
    docIds: body?.required_document_type_ids ?? [],
  });
  return actionsPayload(app);
});

mock.patch("/applications/:id/lifecycle-status", ({ params, body }) => {
  const app = findApp(params.id);
  const status = body?.status;
  if (!["active", "hold", "cancel"].includes(status)) throw httpError(422, "Invalid lifecycle status");
  app.lifecycle = status;
  app.updated_at = nowIso();
  addTimeline(app, { entry_type: "lifecycle_status_changed", detail: { status } });
  return detail(app);
});

mock.patch("/applications/:id/correction-request", ({ params, body }) => {
  const app = findApp(params.id);
  app.correction_reason = body?.reason_text ?? app.correction_reason;
  if (Array.isArray(body?.required_document_type_ids)) app.requested_doc_type_ids = body.required_document_type_ids;
  app.updated_at = nowIso();
  addTimeline(app, {
    entry_type: "correction_request_updated",
    detail: { reason_text: app.correction_reason, required_document_type_ids: app.requested_doc_type_ids },
    required_document_types: app.requested_doc_type_ids.map(docTypeRef),
  });
  return actionsPayload(app);
});

mock.post("/applications/:id/change-program", ({ params, body }) => {
  const app = findApp(params.id);
  if (!PROGRAMS.some((p) => p.id === body?.new_program_id)) throw httpError(422, "Program not found");
  app.programId = body.new_program_id;
  addTimeline(app, { entry_type: "program_changed", detail: { new_program_id: body.new_program_id }, notes: body?.notes || null }, partnerActorOf(app));
  if (app.statusCode === "PROGRAM_CHANGE_SUGGESTED") {
    transition(app, "SUBMITTED_TO_INSTITUTION", { notes: body?.notes, actor: partnerActorOf(app) });
  }
  app.updated_at = nowIso();
  return detail(app);
});

// --- uploads -----------------------------------------------------------------

/** Advisor uploads of requested documents (corrections, arrival extras). */
mock.post("/applications/:id/requested-documents/bulk", ({ params, body }) => {
  const app = findApp(params.id);
  const rows: any[] = Array.isArray(body) ? body : Object.values(body ?? {});
  const arrival = app.statusCode === "ARRIVAL_EXTRA_DOCS_UPLOAD";
  const created = rows.map((r) => {
    const type = APP_DOCUMENT_TYPES.find((d) => d.id === r?.document_type_id);
    const d = uploadedDoc(app, type?.type ?? "Supporting Document", r, r?.document_type_id ?? null);
    (arrival ? app.extraArrivalDocs : app.extraDocs).push(d);
    return d;
  });
  const ids = rows.map((r) => r?.document_type_id).filter(Boolean);
  addTimeline(
    app,
    {
      entry_type: "document_upload",
      detail: { bulk: true, reupload: true },
      requested_document_types: app.requested_doc_type_ids.map(docTypeRef),
      uploaded_document_types: ids.map(docTypeRef),
    },
    partnerActorOf(app),
  );
  if (app.statusCode === "CORRECTION_REQUESTED") transition(app, "DOCUMENTS_REUPLOADED", { actor: partnerActorOf(app) });
  else if (arrival) transition(app, "EXTRA_ARRIVAL_DOCUMENTS_UNDER_REVIEW", { actor: partnerActorOf(app) });
  app.updated_at = nowIso();
  return created;
});

mock.post("/applications/:id/documents/:documentId/manager-reupload", ({ params, body }) => {
  const app = findApp(params.id);
  const existing = documentsFor(app).find((d) => d.id === params.documentId);
  const d = uploadedDoc(app, existing?.document_type ?? "Document", body, existing?.document_type_id ?? null);
  d.status = "2";
  d.approve_notes = "Re-uploaded by the account manager.";
  app.extraDocs.push(d);
  app.updated_at = nowIso();
  addTimeline(app, { entry_type: "document_upload", detail: { document_type_code: existing?.document_type?.toLowerCase().replace(/\s+/g, "_") ?? "document", reupload: true } });
  return d;
});

mock.post("/applications/:id/offer-letter", ({ params, body }) => {
  const app = findApp(params.id);
  const d = uploadedDoc(app, "Offer Letter", body);
  d.status = "2";
  app.overrides.offer_letter_document = d;
  if (body?.health_declaration_form_required !== undefined) app.forms.health_declaration = !!body.health_declaration_form_required;
  if (body?.signed_offer_letter_required !== undefined) app.forms.signed_offer_letter = !!body.signed_offer_letter_required;
  if (body?.application_form_2_template_file_key) app.forms.application_form_2 = true;
  if (body?.english_form_template_file_key) app.forms.english_form = true;
  if (["SUBMITTED_TO_INSTITUTION", "PROGRAM_CHANGE_SUGGESTED"].includes(app.statusCode)) {
    transition(app, "UNIVERSITY_APPROVED", { notes: "Offer letter received from the Institution." });
  }
  app.updated_at = nowIso();
  return d;
});

/** Single-document uploads that may move the application along. */
const SINGLE_UPLOADS: [string, string, (app: AppRecord, body: any) => void][] = [
  ["emgs-evaluation-document", "EMGS Evaluation Document", (app, body) => {
    app.overrides.emgs_evaluation_document = uploadedDoc(app, "EMGS Evaluation Document", body);
    if (["EVAL_PARTNER_UPLOAD", "EVAL_REUPLOAD_REQUIRED"].includes(app.statusCode)) transition(app, "EVAL_UNDER_REVIEW", { actor: partnerActorOf(app) });
  }],
  ["e-visa-document", "E-Visa", (app, body) => {
    app.extraArrivalDocs.push(uploadedDoc(app, "E-Visa", body));
    if (app.statusCode === "E_VISA_PARTNER_UPLOAD") transition(app, "E_VISA_UNDER_REVIEW", { actor: partnerActorOf(app) });
  }],
  ["visa-document", "Visa Approval Letter", (app, body) => {
    const d = uploadedDoc(app, "Visa Approval Letter", body);
    d.status = "2";
    app.overrides.visa_document = d;
  }],
  ["application-form-document", "Application Form", (app, body) => {
    app.extraDocs.push({ ...uploadedDoc(app, "Application Form Template", body), status: "2" });
    if (body?.visa_invoice_file_key) app.extraDocs.push({ ...uploadedDoc(app, "Visa Invoice", { file_key: body.visa_invoice_file_key }), status: "2" });
  }],
  ["application-form-2-document", "Application Form 2", (app, body) => {
    app.extraPaymentDocs.push(uploadedDoc(app, "Application Form 2", body));
    if (app.statusCode === "APPLICATION_FORM_2_REJECTED") transition(app, "PAYMENT_SUBMITTED", { actor: partnerActorOf(app) });
  }],
  ["health-declaration-document", "Health Declaration Form", (app, body) => {
    app.extraPaymentDocs.push(uploadedDoc(app, "Health Declaration Form", body));
    if (app.statusCode === "HEALTH_DECLARATION_REJECTED") transition(app, "PAYMENT_SUBMITTED", { actor: partnerActorOf(app) });
  }],
  ["signed-offer-letter-document", "Signed Offer Letter", (app, body) => {
    app.extraPaymentDocs.push(uploadedDoc(app, "Signed Offer Letter", body));
  }],
  ["english-form-document", "English Form", (app, body) => {
    app.extraPaymentDocs.push(uploadedDoc(app, "English Form", body));
  }],
  ["commission-payment-document", "commission_payment_document", (app, body) => {
    app.commissionDocs.commission_payment_document = { ...uploadedDoc(app, "commission_payment_document", body), status: "2" };
  }],
];

for (const [path, label, apply] of SINGLE_UPLOADS) {
  mock.post(`/applications/:id/${path}`, ({ params, body }) => {
    const app = findApp(params.id);
    apply(app, body);
    // The Application Form re-upload from a rejected status goes back to review.
    if (path === "application-form-document" && app.statusCode === "APPLICATION_FORM_REJECTED") {
      app.extraPaymentDocs.push(uploadedDoc(app, "Application Form", body));
      transition(app, "PAYMENT_SUBMITTED", { actor: partnerActorOf(app) });
    }
    addTimeline(app, { entry_type: "document_upload", detail: { document_type_code: label.toLowerCase().replace(/[\s-]+/g, "_") } });
    app.updated_at = nowIso();
    return detail(app);
  });
}

mock.patch("/applications/:id/arrival-date", ({ params, body }) => {
  const app = findApp(params.id);
  app.arrival_date = body?.arrival_date ?? app.arrival_date ?? daysAgo(-10);
  if (body?.ticket_file_key) app.extraArrivalDocs.push(uploadedDoc(app, "Flight Ticket", { file_key: body.ticket_file_key }));
  if (body?.e_visa_file_key) app.extraArrivalDocs.push(uploadedDoc(app, "E-Visa", { file_key: body.e_visa_file_key }));
  addTimeline(app, { entry_type: "arrival_date_updated", detail: { arrival_date: app.arrival_date } }, partnerActorOf(app));
  if (app.statusCode === "WAITING_PARTNER_CONFIRM_ARRIVAL_DATE") transition(app, "ARRIVAL_CONFIRMED", { actor: partnerActorOf(app) });
  app.updated_at = nowIso();
  return detail(app);
});

// --- create (Advisor) --------------------------------------------------------

mock.post("/partners/:partnerId/applications", ({ params, body }) => {
  const partner = PARTNERS.find((p) => p.id === params.partnerId) ?? CURRENT_PARTNER;
  const program = PROGRAMS.find((p) => p.id === body?.program_id) ?? PROGRAMS[0];
  const existing = body?.student_id ? applications.all().find((a) => a.student.id === body.student_id)?.student : null;
  const s = body?.student ?? {};
  const studentId = existing?.id ?? newId("stu");
  const student = existing ?? {
    id: studentId,
    name: s.name || "New Student",
    birthday: s.birthday || null,
    nationality: s.nationality || null,
    passport_number: s.passport_number || null,
    email: s.email || null,
    phone: s.phone || null,
    current_address: s.current_address || null,
    gender: typeof s.gender === "boolean" ? s.gender : null,
    photo_file_key: null,
    photo_url: null,
    emergency_contacts: (s.emergency_contacts ?? []).filter((c: any) => c?.name),
    english_proficiencies: (s.english_proficiencies ?? []).filter((e: any) => e?.test_type),
    previous_educations: (s.previous_educations ?? []).filter((e: any) => e?.institution_name),
  };
  const id = newId("app");
  const now = nowIso();
  const record: AppRecord = {
    id,
    partnerId: partner.id,
    partnerName: partner.name,
    accountManagerName: partner.assigned_manager.name,
    student,
    programId: program.id,
    statusCode: "NEW_APPLICATION",
    lifecycle: "active",
    intake_date: body?.intake_date ?? now.slice(0, 10),
    arrival_date: null,
    correction_reason: null,
    requested_doc_type_ids: [],
    forms: { application_form: true, application_form_2: false, health_declaration: true, signed_offer_letter: false, english_form: false },
    visa_fee_amount: 2450,
    extraDocs: [],
    extraPaymentDocs: [],
    extraArrivalDocs: [],
    overrides: {},
    commissionDocs: {},
    visaPayments: [],
    visaCaseOverride: null,
    timeline: [],
    new_notifications_count: 0,
    created_at: now,
    updated_at: now,
  };
  // Seeded documents are derived for NEW_APPLICATION; replace them with what was actually uploaded.
  const uploaded = (body?.documents ?? []) as any[];
  record.extraDocs = uploaded.map((d) => {
    const type = APP_DOCUMENT_TYPES.find((t) => t.id === d?.document_type_id);
    return uploadedDoc(record, type?.type ?? "Supporting Document", d, d?.document_type_id ?? null);
  });
  applications.insert(record);
  record.timeline = seedTimeline(record);
  return detail(record, "partner");
});

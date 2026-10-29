import { mock, httpError } from "../router";
import { newId, seedId, table } from "../db";
import { UNIVERSITIES } from "../seed";
import type { FieldOfStudy, CommissionTypes, QualificationType, PaymentMethod } from "features/knowledge-hub";

// Knowledge hub reference data: fields of study, qualifications, commission
// types and the global payment-method catalogue (/admin/payment-methods).

const slug = (s: string) =>
  s
    .toUpperCase()
    .replace(/&/g, "AND")
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 24);

// ---- Fields of study -------------------------------------------------------

const FIELD_NAMES = [
  "Computer Science & IT",
  "Business & Management",
  "Engineering",
  "Accounting & Finance",
  "Medicine & Health Sciences",
  "Law",
  "Architecture & Built Environment",
  "Hospitality & Tourism",
  "Mass Communication & Media",
  "Education",
  "Psychology",
  "Pharmacy",
  "Data Science & Analytics",
  "Creative Arts & Design",
  "Islamic Studies",
  "Biotechnology",
];

export const FIELDS_OF_STUDY = table<FieldOfStudy>(
  FIELD_NAMES.map((name, i) => ({
    id: seedId("fos", i + 1),
    name,
    code: slug(name),
    is_active: i !== 14,
  })),
);

mock.get("/knowledge-hub/fields-of-study", () => FIELDS_OF_STUDY.all());

mock.get("/knowledge-hub/fields-of-study/:id", ({ params }) => {
  const row = FIELDS_OF_STUDY.find(params.id);
  if (!row) throw httpError(404, "Field of study not found");
  return row;
});

mock.post("/knowledge-hub/fields-of-study", ({ body }) => {
  const name = String(body?.name ?? "").trim();
  if (!name) throw httpError(422, "Name is required. Enter a name and try again.");
  if (FIELDS_OF_STUDY.all().some((f) => f.name.toLowerCase() === name.toLowerCase())) {
    throw httpError(409, "A field of study with this name already exists. Use a different name.");
  }
  return FIELDS_OF_STUDY.insert({ id: newId("fos"), name, code: slug(name), is_active: body?.is_active ?? true });
});

mock.put("/knowledge-hub/fields-of-study/:id", ({ params, body }) => {
  const row = FIELDS_OF_STUDY.update(params.id, {
    ...(body?.name ? { name: body.name, code: slug(body.name) } : {}),
    ...(body?.is_active !== undefined ? { is_active: body.is_active } : {}),
  });
  if (!row) throw httpError(404, "Field of study not found");
  return row;
});

mock.delete("/knowledge-hub/fields-of-study/:id", ({ params }) => {
  if (!FIELDS_OF_STUDY.remove(params.id)) throw httpError(404, "Field of study not found");
  return { success: true };
});

// ---- Qualifications --------------------------------------------------------

const QUALIFICATION_NAMES = [
  "SPM",
  "STPM",
  "UEC",
  "O-Level",
  "A-Level",
  "IGCSE",
  "WAEC / WASSCE",
  "NECO",
  "HSC (Bangladesh)",
  "FSc / HSSC (Pakistan)",
  "Thanaweya Amma",
  "International Baccalaureate (IB)",
  "Foundation",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctoral Degree (PhD)",
];

export const QUALIFICATIONS = table<QualificationType>(
  QUALIFICATION_NAMES.map((name, i) => ({ id: seedId("qual", i + 1), name })),
);

mock.get("/knowledge-hub/qualifications", () => QUALIFICATIONS.all());

mock.post("/knowledge-hub/qualifications", ({ body }) => {
  const name = String(body?.name ?? "").trim();
  if (!name) throw httpError(422, "Name is required. Enter a name and try again.");
  return QUALIFICATIONS.insert({ id: newId("qual"), name });
});

mock.delete("/knowledge-hub/qualifications/:id", ({ params }) => {
  if (!QUALIFICATIONS.remove(params.id)) throw httpError(404, "Qualification not found");
  return { success: true };
});

// ---- Commission types ------------------------------------------------------

export const COMMISSION_TYPES = table<CommissionTypes>(
  [
    ["Percentage of Tuition", "A percentage of the student's first-year tuition fee, paid once the student is placed.", true],
    ["Flat Fee per Student", "A fixed amount paid per placed student, regardless of programme fee.", false],
    ["Tiered Volume Bonus", "Rate increases as the Advisor reaches 10, 25 and 50 placements in an intake.", false],
    ["Per-Semester Recurring", "A percentage of tuition paid each semester while the student remains placed.", false],
    ["Scholarship-Adjusted", "Commission calculated on the net tuition after scholarships and discounts.", false],
  ].map(([name, description, is_default], i) => ({
    id: seedId("ctype", i + 1),
    name: name as string,
    code: slug(name as string),
    description: description as string,
    is_default: is_default as boolean,
  })),
);

/** Only one commission type can be the default. */
const clearOtherDefaults = (keepId: string) =>
  COMMISSION_TYPES.all().forEach((c) => {
    if (c.id !== keepId) c.is_default = false;
  });

mock.get("/knowledge-hub/commission-types", () => COMMISSION_TYPES.all());

mock.get("/knowledge-hub/commission-types/:id", ({ params }) => {
  const row = COMMISSION_TYPES.find(params.id);
  if (!row) throw httpError(404, "Commission type not found");
  return row;
});

mock.post("/knowledge-hub/commission-types", ({ body }) => {
  const name = String(body?.name ?? "").trim();
  if (!name) throw httpError(422, "Name is required. Enter a name and try again.");
  const row = COMMISSION_TYPES.insert({
    id: newId("ctype"),
    name,
    code: slug(name),
    description: body?.description ?? "",
    is_default: !!body?.is_default,
  });
  if (row.is_default) clearOtherDefaults(row.id);
  return row;
});

mock.put("/knowledge-hub/commission-types/:id", ({ params, body }) => {
  const row = COMMISSION_TYPES.update(params.id, {
    ...(body?.name ? { name: body.name, code: slug(body.name) } : {}),
    ...(body?.description !== undefined ? { description: body.description } : {}),
    ...(body?.is_default !== undefined ? { is_default: !!body.is_default } : {}),
  });
  if (!row) throw httpError(404, "Commission type not found");
  if (row.is_default) clearOtherDefaults(row.id);
  return row;
});

mock.delete("/knowledge-hub/commission-types/:id", ({ params }) => {
  const row = COMMISSION_TYPES.find(params.id);
  if (!row) throw httpError(404, "Commission type not found");
  if (row.is_default) throw httpError(409, "The default commission type can't be deleted. Set another type as default first.");
  COMMISSION_TYPES.remove(params.id);
  return { success: true };
});

// ---- Payment methods (global catalogue) -----------------------------------

type CatalogueMethod = PaymentMethod & { description: string; created_at?: string };

// The single payment-method catalogue: finance.ts (payouts), universities.ts
// (per-Institution assignments) and common.ts (visa payment methods) all
// reference these ids.
export const PAYMENT_METHODS = table<CatalogueMethod>(
  [
    ["Bank Transfer (DuitNow)", "<p>Local transfer to a Malaysian bank account via DuitNow or IBG. Funds usually arrive within one working day.</p>"],
    [
      "International Wire (SWIFT)",
      "<p>Cross-border telegraphic transfer (SWIFT). Include the <strong>student's passport number</strong> as the payment reference.</p><p>Bank charges must be borne by the sender.</p>",
    ],
    ["Wise Transfer", "<p>Multi-currency transfer via Wise Business. Share the Wise transfer ID as the reference.</p>"],
    ["Cheque", "<p>Crossed cheque payable to the Institution, deposited at any Maybank or CIMB branch. Allow 3 working days to clear.</p>"],
    [
      "Flywire",
      "<p>Pay securely in your home currency via <strong>Flywire</strong>. Select the Institution as the recipient and follow the on-screen instructions.</p><p>Upload the Flywire receipt once the payment is completed.</p>",
    ],
    [
      "Credit / Debit Card",
      "<p>Visa and Mastercard are accepted through the Institution's online payment portal. A 2% card processing fee applies (for example RM84 on RM4,200).</p>",
    ],
    [
      "Western Union",
      "<p>Transfer through any Western Union agent. Share the <strong>MTCN</strong> and upload the receipt as proof of payment.</p>",
    ],
    [
      "Local Bank Deposit (Malaysia)",
      "<p>Cash or cheque deposit at any Maybank / CIMB branch into the Institution's collection account. Keep the bank-in slip for upload.</p>",
    ],
    [
      "PayPal",
      "<p>Pay via PayPal to the Institution's finance email. Only accepted for application and processing fees.</p>",
    ],
  ].map(([name, description], i) => ({ id: seedId("pm", i + 1), name, description })),
);

mock.get("/admin/payment-methods", () => PAYMENT_METHODS.all());

mock.get("/admin/payment-methods/:id", ({ params }) => {
  const row = PAYMENT_METHODS.find(params.id);
  if (!row) throw httpError(404, "Payment method not found");
  return row;
});

mock.post("/admin/payment-methods", ({ body }) => {
  const name = String(body?.name ?? "").trim();
  if (!name) throw httpError(422, "Name is required. Enter a name and try again.");
  return PAYMENT_METHODS.insert({ id: newId("pm"), name, description: body?.description ?? "" });
});

mock.put("/admin/payment-methods/:id", ({ params, body }) => {
  const row = PAYMENT_METHODS.update(params.id, {
    ...(body?.name !== undefined ? { name: body.name } : {}),
    ...(body?.description !== undefined ? { description: body.description } : {}),
  });
  if (!row) throw httpError(404, "Payment method not found");
  return row;
});

mock.delete("/admin/payment-methods/:id", ({ params }) => {
  if (!PAYMENT_METHODS.remove(params.id)) throw httpError(404, "Payment method not found");
  return { success: true };
});

mock.post("/admin/payment-methods/batch-assign", ({ body }) => {
  const methodIds: string[] = body?.payment_method_ids ?? [];
  const universityIds: string[] = body?.university_ids ?? [];
  if (!methodIds.length || !universityIds.length) {
    throw httpError(422, "Select at least one payment method and one Institution, then try again.");
  }
  const assignments = universityIds.flatMap((university_id) =>
    methodIds.map((payment_method_id) => ({
      id: newId("upm"),
      university_id,
      university_name: UNIVERSITIES.find((u) => u.id === university_id)?.name ?? null,
      payment_method_id,
      payment_method_name: PAYMENT_METHODS.find(payment_method_id)?.name ?? null,
      instructions: body?.instructions ?? "",
      currency: body?.currency ?? "MYR",
      is_active: body?.is_active ?? true,
    })),
  );
  return { created: assignments.length, skipped: 0, assignments };
});

import { mock, httpError } from "../router";
import { daysAgo, newId, nowIso, pick, search, seedId, table } from "../db";
import { PROGRAMS, UNIVERSITIES } from "../seed";
import { PAYMENT_METHODS } from "./knowledgeHub";
import type {
  ApplicationRequiredField,
  AssignPaymentMethodPayload,
  AssignUniversityTypePayload,
  Branch,
  CreateBranchPayload,
  CreateUniversityPayload,
  CreateUniversityTypePayload,
  SubmissionField,
  UniversityDetails,
  UniversityPaymentMethod,
  UniversityType,
  UpdateBranchPayload,
  UpdatePaymentMethodPayload,
  UpdateUniversityTypePayload,
} from "features/universities/types";

// Mock endpoints for universities: catalogue (knowledge-hub), branches,
// per-university payment methods, university types + application required fields.

// ── States (Malaysia) ─────────────────────────────────────────────────────────

export const STATES = [
  "Kuala Lumpur",
  "Selangor",
  "Penang",
  "Johor",
  "Sarawak",
  "Sabah",
  "Melaka",
  "Negeri Sembilan",
  "Perak",
  "Putrajaya",
].map((name, i) => ({ id: seedId("state", i + 1), name }));

const stateName = (id: string) => STATES.find((s) => s.id === id)?.name ?? "";

// ── University types & application submission fields ─────────────────────────

const SUBMISSION_FIELDS: SubmissionField[] = [
  ["student.phone", "Student Phone Number"],
  ["student.current_address", "Current Address"],
  ["student.gender", "Gender"],
  ["student.english_proficiencies", "English Proficiency Results"],
  ["student.photo", "Passport-size Photo"],
  ["student.date_of_birth", "Date of Birth"],
  ["student.emergency_contact", "Emergency Contact"],
  ["student.previous_education", "Previous Education History"],
].map(([field_key, field_name], i) => ({ id: seedId("sf", i + 1), field_key, field_name }));

const TYPE_SEED: [string, string, string[]][] = [
  ["Private Institution (Standard)", "Default intake requirements for private institutions.", ["student.phone", "student.gender", "student.photo", "student.date_of_birth"]],
  ["Public Institution", "Stricter document checks required by public institutions and the Ministry of Higher Education.", ["student.phone", "student.current_address", "student.gender", "student.english_proficiencies", "student.photo", "student.date_of_birth", "student.previous_education"]],
  ["Language Centre Pathway", "Institutions with an in-house English language centre; proficiency results are optional.", ["student.phone", "student.photo"]],
  ["Fast-track Private Institution", "Minimal submission set for institutions offering conditional offers within 48 hours.", ["student.phone"]],
];

function buildRequiredFields(typeId: string, required: (f: SubmissionField) => boolean): ApplicationRequiredField[] {
  return SUBMISSION_FIELDS.map((f, i) => ({
    id: `rf_${typeId}_${i + 1}`,
    field_key: f.field_key,
    field_name: f.field_name,
    is_required: required(f),
  }));
}

const types = table<UniversityType>(
  TYPE_SEED.map(([name, description, req], i) => {
    const id = seedId("ut", i + 1);
    return { id, name, description, required_fields: buildRequiredFields(id, (f) => req.includes(f.field_key)) };
  }),
);

const typeName = (id?: string | null) => (id ? types.find(id)?.name ?? "" : "");

// ── Universities ──────────────────────────────────────────────────────────────

const DESCRIPTIONS: Record<string, string> = {
  APU: "<p>Asia Pacific University of Technology &amp; Innovation is a leading technology-focused institution in Kuala Lumpur, known for its computing, engineering and business programmes delivered in partnership with Staffordshire University (UK).</p><ul><li>Premier Digital Tech Institution status</li><li>Over 13,000 students from 130+ countries</li></ul>",
  TU: "<p>Taylor's University is a top-ranked private institution in Malaysia, set on a 27-acre lakeside campus in Subang Jaya. It is well regarded for hospitality, business, design and medicine.</p><ul><li>QS World Ranking top 300</li><li>Strong industry placement network</li></ul>",
  UCSI: "<p>UCSI University is a research-intensive private institution with campuses in Kuala Lumpur and Kuching, offering programmes from foundation to doctoral level across music, pharmacy, engineering and business.</p>",
  SU: "<p>Sunway University is a not-for-profit institution in Bandar Sunway with academic partnerships with Lancaster University, offering dual-award degrees in business, IT and psychology.</p>",
  MMU: "<p>Multimedia University is Malaysia's first private institution, with campuses in Cyberjaya and Melaka. It specialises in IT, creative multimedia, engineering and management.</p>",
  INTI: "<p>INTI International University is a Laureate-heritage institution in Nilai with a branch campus in Penang, offering industry-linked programmes in business, engineering and hospitality.</p>",
  LUCT: "<p>Limkokwing University of Creative Technology is a creative-arts focused institution in Cyberjaya with an international student body from over 150 countries.</p>",
  SEGi: "<p>SEGi University is one of the largest private higher-education groups in Malaysia, with its flagship institution in Kota Damansara offering medicine, education and business programmes.</p>",
};

// [name, location, state index]
const BRANCH_SEED: Record<string, [string, string, number][]> = {
  uni_001: [["Main Campus", "Technology Park Malaysia, Bukit Jalil", 0], ["City Campus", "Jalan Tun Razak, Kuala Lumpur", 0]],
  uni_002: [["Lakeside Campus", "Jalan Taylors, Subang Jaya", 1]],
  uni_003: [["Kuala Lumpur Campus", "Taman Connaught, Cheras", 0], ["Kuching Campus", "Jalan Tun Jugah, Kuching", 4]],
  uni_004: [["Bandar Sunway Campus", "Jalan Universiti, Bandar Sunway", 1]],
  uni_005: [["Cyberjaya Campus", "Persiaran Multimedia, Cyberjaya", 1], ["Melaka Campus", "Jalan Ayer Keroh Lama, Bukit Beruang", 6]],
  uni_006: [["Nilai Campus", "Persiaran Perdana BBN, Putra Nilai", 7], ["Penang Campus", "Jalan Anson, George Town", 2]],
  uni_007: [["Cyberjaya Campus", "Inovasi 1-1, Cyberjaya", 1]],
  uni_008: [["Kota Damansara Campus", "Persiaran Kayangan, Kota Damansara", 1], ["Penang Campus", "Jalan Sultan Azlan Shah, Bayan Lepas", 2]],
};

export interface UniversityRow extends UniversityDetails {
  description: string;
  intake_months: number[];
  created_at: string;
  updated_at: string;
}

export interface BranchRow extends Branch {
  university_id: string;
}

const INTAKE_PATTERNS = [[1, 5, 9], [2, 7, 10], [1, 3, 9], [3, 8], [1, 4, 7, 10], [2, 9]];

export const universities = table<UniversityRow>(
  UNIVERSITIES.map((u, i) => ({
    id: u.id,
    name: u.name,
    country: u.country,
    is_active: u.is_active,
    logo_file_key: `universities/logos/${u.id}.png`,
    logo_file_url: u.logo_url,
    description: DESCRIPTIONS[u.short] ?? "",
    university_type_id: pick(types.all(), i).id,
    university_type_name: pick(types.all(), i).name,
    intake_months: pick(INTAKE_PATTERNS, i),
    // MMU and UCSI shown as public so the public/private filter has both values.
    is_public: u.short === "MMU" || u.short === "UCSI",
    has_language_center: i % 3 !== 1,
    is_hidden: u.short === "LUCT",
    created_at: u.created_at,
    updated_at: daysAgo(10 + i * 3),
  })),
);

export const branches = table<BranchRow>(
  Object.entries(BRANCH_SEED).flatMap(([universityId, list], u) =>
    list.map(([name, location, s], k) => ({
      id: seedId("br", u * 2 + k + 1),
      university_id: universityId,
      name,
      location,
      state_id: STATES[s].id,
      state: STATES[s].name,
    })),
  ),
);

const toBranch = ({ university_id: _u, ...b }: BranchRow): Branch => b;
export const branchesOf = (universityId: string) => branches.all().filter((b) => b.university_id === universityId);

const toDetails = ({ created_at: _c, updated_at: _u, ...rest }: UniversityRow): UniversityDetails & { description: string; intake_months: number[] } => rest;

// Partner-facing pages never see hidden universities (the backend strips them by role).
const isPartnerView = () => typeof window !== "undefined" && window.location.pathname.startsWith("/partner");

const asBool = (v: unknown): boolean | undefined => (v === undefined || v === null || v === "" ? undefined : String(v) === "true");

function findUniversity(id: string) {
  const uni = universities.find(id);
  if (!uni) throw httpError(404, "University not found");
  return uni;
}

function upsertBranches(universityId: string, list: (CreateBranchPayload | UpdateBranchPayload)[]) {
  for (const b of list) {
    const patch = { name: b.name, location: b.location, state_id: b.state_id, state: stateName(b.state_id) };
    const id = "id" in b ? b.id : undefined;
    if (id && branches.find(id)) branches.update(id, patch);
    else branches.insert({ id: newId("br"), university_id: universityId, ...patch });
  }
}

mock.get("/knowledge-hub/universities", ({ query }) => {
  let items = universities.all();
  if (asBool(query.include_inactive_universities) !== true) items = items.filter((u) => u.is_active);
  const isPublic = asBool(query.is_public);
  if (isPublic !== undefined) items = items.filter((u) => u.is_public === isPublic);
  const hasLc = asBool(query.has_language_center);
  if (hasLc !== undefined) items = items.filter((u) => u.has_language_center === hasLc);
  const hidden = asBool(query.is_hidden);
  if (hidden !== undefined) items = items.filter((u) => u.is_hidden === hidden);
  else if (isPartnerView()) items = items.filter((u) => !u.is_hidden);
  items = search(items, query.search, ["name", "country"]);

  const pageSize = Number(query.page_size ?? 20) || 20;
  const page = Number(query.page ?? 1) || 1;
  return {
    items: items.slice((page - 1) * pageSize, page * pageSize).map(toDetails),
    total: items.length,
    page,
    page_size: pageSize,
  };
});

mock.get("/knowledge-hub/universities/:id", ({ params }) => {
  const uni = findUniversity(params.id);
  return { university: toDetails(uni), branches: branchesOf(uni.id).map(toBranch) };
});

mock.post("/knowledge-hub/universities", ({ body }) => {
  const data = body as CreateUniversityPayload;
  if (universities.all().some((u) => u.name.trim().toLowerCase() === data.name?.trim().toLowerCase())) {
    return httpError(409, "A university with this name already exists");
  }
  const uni = universities.insert({
    id: newId("uni"),
    name: data.name,
    country: data.country || "Malaysia",
    is_active: data.is_active ?? true,
    logo_file_key: data.logo_file_key ?? "",
    logo_file_url: data.logo_file_url ?? "",
    description: data.description ?? "",
    university_type_id: data.university_type_id ?? "",
    university_type_name: typeName(data.university_type_id),
    intake_months: data.intake_months ?? [],
    is_public: data.is_public ?? false,
    has_language_center: data.has_language_center ?? false,
    is_hidden: data.is_hidden ?? false,
    created_at: nowIso(),
    updated_at: nowIso(),
  });
  upsertBranches(uni.id, data.branches ?? []);
  return { ...toDetails(uni), university: toDetails(uni), branches: branchesOf(uni.id).map(toBranch) };
});

// Partial update — only the keys sent are applied.
mock.put("/knowledge-hub/universities/:id", ({ params, body }) => {
  const uni = findUniversity(params.id);
  const { branches: branchList, ...patch } = (body ?? {}) as Partial<UniversityRow> & { branches?: UpdateBranchPayload[] };
  const next: Partial<UniversityRow> = { ...patch, updated_at: nowIso() };
  if (patch.university_type_id !== undefined) next.university_type_name = typeName(patch.university_type_id);
  universities.update(uni.id, next);
  if (branchList) upsertBranches(uni.id, branchList);
  return { university: toDetails(uni), branches: branchesOf(uni.id).map(toBranch) };
});

mock.delete("/knowledge-hub/universities/:id", ({ params }) => {
  findUniversity(params.id);
  universities.remove(params.id);
  branchesOf(params.id).forEach((b) => branches.remove(b.id));
  return { detail: "University deleted" };
});

// ── Branches ──────────────────────────────────────────────────────────────────

mock.get("/knowledge-hub/universities/:id/branches", ({ params }) => {
  findUniversity(params.id);
  return branchesOf(params.id).map(toBranch);
});

mock.post("/knowledge-hub/universities/:id/branches", ({ params, body }) => {
  findUniversity(params.id);
  const data = body as CreateBranchPayload;
  const row = branches.insert({
    id: newId("br"),
    university_id: params.id,
    name: data.name,
    location: data.location,
    state_id: data.state_id,
    state: stateName(data.state_id),
  });
  return toBranch(row);
});

mock.delete("/knowledge-hub/universities/:id/branches/:branchId", ({ params }) => {
  if (!branches.remove(params.branchId)) throw httpError(404, "Branch not found");
  return { detail: "Branch deleted" };
});

mock.get("/knowledge-hub/states", () => STATES);

// ── Per-university payment methods ───────────────────────────────────────────

// Assignments reference the global catalogue in knowledgeHub.ts (PAYMENT_METHODS);
// names are read from there so a rename in the catalogue shows up here.
const paymentMethodName = (id: string) => PAYMENT_METHODS.find(id)?.name ?? "Payment Method";

// Catalogue ids: pm_002 SWIFT wire, pm_005 Flywire, pm_006 card, pm_003 Wise, pm_007 Western Union.
const ASSIGNABLE_METHODS = ["pm_002", "pm_005", "pm_006", "pm_003", "pm_007"];
const USD_METHODS = new Set(["pm_005", "pm_007"]);

const INSTRUCTIONS: Record<string, string> = {
  pm_002: "Transfer the full amount to the institution's Maybank account (SWIFT MBBEMYKL). Use the student's passport number as the payment reference and upload the bank slip.",
  pm_005: "Pay through the institution's Flywire portal. Select Malaysia as the destination country; the receipt is emailed automatically.",
  pm_006: "Card payments are accepted at the institution's online payment page. A 2% surcharge applies to international cards.",
  pm_003: "Send via Wise to the institution's MYR account. Include the application reference in the transfer note.",
  pm_007: "Western Union Quick Pay is accepted. Share the MTCN with the admissions office within 3 working days.",
};

export const universityPaymentMethods = table<UniversityPaymentMethod>(
  UNIVERSITIES.flatMap((u, i) => {
    const methodIds = ASSIGNABLE_METHODS.filter((_, k) => (i + k) % 3 !== 2).slice(0, 2 + (i % 3));
    return methodIds.map((pmId, k) => ({
      id: seedId("upm", i * 5 + k + 1),
      university_id: u.id,
      payment_method_id: pmId,
      payment_method_name: paymentMethodName(pmId),
      instructions: INSTRUCTIONS[pmId],
      currency: USD_METHODS.has(pmId) ? "USD" : "MYR",
      is_active: !(i === 3 && k === 1),
    }));
  }),
);

mock.get("/admin/universities/:id/payment-methods", ({ params }) =>
  universityPaymentMethods.all().filter((m) => m.university_id === params.id),
);

mock.post("/admin/universities/:id/payment-methods", ({ params, body }) => {
  findUniversity(params.id);
  const data = body as AssignPaymentMethodPayload & { payment_method_name?: string };
  const existing = universityPaymentMethods.all().find((m) => m.university_id === params.id && m.payment_method_id === data.payment_method_id);
  if (existing) return httpError(409, "Payment method is already assigned to this university");
  return universityPaymentMethods.insert({
    id: newId("upm"),
    university_id: params.id,
    payment_method_id: data.payment_method_id,
    payment_method_name: data.payment_method_name ?? paymentMethodName(data.payment_method_id),
    instructions: data.instructions ?? "",
    currency: data.currency ?? "MYR",
    is_active: data.is_active ?? true,
  });
});

mock.put("/admin/universities/:id/payment-methods/:methodId", ({ params, body }) => {
  const data = body as UpdatePaymentMethodPayload;
  const row = universityPaymentMethods.update(params.methodId, {
    ...data,
    ...(data.payment_method_id ? { payment_method_name: paymentMethodName(data.payment_method_id) } : {}),
  });
  if (!row) throw httpError(404, "University payment method not found");
  return row;
});

mock.delete("/admin/universities/:id/payment-methods/:methodId", ({ params }) => {
  if (!universityPaymentMethods.remove(params.methodId)) throw httpError(404, "University payment method not found");
  return { detail: "Payment method removed" };
});

// ── University types ──────────────────────────────────────────────────────────

function findType(id: string) {
  const t = types.find(id);
  if (!t) throw httpError(404, "University type not found");
  return t;
}

mock.get("/admin/university-types", () => types.all());
mock.get("/admin/university-types/:id", ({ params }) => findType(params.id));

mock.post("/admin/university-types", ({ body }) => {
  const data = body as CreateUniversityTypePayload;
  const id = newId("ut");
  const required = new Map((data.required_fields ?? []).map((r) => [r.application_submission_field_id, r.is_required]));
  return types.insert({
    id,
    name: data.name,
    description: data.description ?? "",
    required_fields: buildRequiredFields(id, (f) => required.get(f.id) === true),
  });
});

mock.put("/admin/university-types/:id", ({ params, body }) => {
  const t = findType(params.id);
  const data = body as UpdateUniversityTypePayload;
  const required = new Map((data.required_fields ?? []).map((r) => [r.id, r.is_required]));
  types.update(t.id, {
    name: data.name ?? t.name,
    description: data.description ?? t.description,
    required_fields: t.required_fields.map((f) => (required.has(f.id) ? { ...f, is_required: !!required.get(f.id) } : f)),
  });
  universities.all().filter((u) => u.university_type_id === t.id).forEach((u) => (u.university_type_name = t.name));
  return t;
});

mock.delete("/admin/university-types/:id", ({ params }) => {
  findType(params.id);
  types.remove(params.id);
  universities.all().filter((u) => u.university_type_id === params.id).forEach((u) => {
    u.university_type_id = "";
    u.university_type_name = "";
  });
  return { detail: "University type deleted" };
});

mock.put("/admin/universities/:id/type", ({ params, body }) => {
  const uni = findUniversity(params.id);
  const { university_type_id } = body as AssignUniversityTypePayload;
  universities.update(uni.id, { university_type_id: university_type_id ?? "", university_type_name: typeName(university_type_id) });
  return {
    id: uni.id,
    name: uni.name,
    university_type_id: university_type_id ?? null,
    university_type_name: university_type_id ? typeName(university_type_id) : null,
  };
});

mock.get("/admin/universities", () =>
  universities.all().map((u) => ({
    id: u.id,
    name: u.name,
    university_type_id: u.university_type_id,
    university_type_name: u.university_type_name,
    required_fields: types.find(u.university_type_id)?.required_fields ?? [],
  })),
);

// ── Application required / submission fields ─────────────────────────────────

mock.get("/admin/university-types/:id/application-required-fields", ({ params }) => findType(params.id).required_fields);

mock.put("/admin/university-types/:id/application-required-fields", ({ params, body }) => {
  const t = findType(params.id);
  const incoming = (Array.isArray(body) ? body : []) as ApplicationRequiredField[];
  const byId = new Map(incoming.map((f) => [f.id, f]));
  types.update(t.id, { required_fields: t.required_fields.map((f) => ({ ...f, ...(byId.get(f.id) ?? {}) })) });
  return t.required_fields;
});

mock.get("/admin/university-types/application-required-fields/:fieldId", ({ params }) => {
  const field = types.all().flatMap((t) => t.required_fields).find((f) => f.id === params.fieldId);
  if (!field) throw httpError(404, "Required field not found");
  return field;
});

mock.get("/admin/application-submission-fields", () => SUBMISSION_FIELDS);

// ── Partner: universities with their programmes (hooks/useUniversities) ──────

mock.get("/partners/:partnerId/universities", () => ({
  items: universities
    .all()
    .filter((u) => u.is_active && !u.is_hidden)
    .map((u, i) => ({
      id: u.id,
      name: u.name,
      country: u.country,
      is_active: u.is_active,
      programs: PROGRAMS.filter((p) => p.university_id === u.id).map((p, k) => ({
        id: p.id,
        name: p.name,
        created_at: daysAgo(200 - i * 10 - k),
      })),
    })),
}));

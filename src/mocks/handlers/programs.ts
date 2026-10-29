import { mock, httpError, reply } from "../router";
import { daysAgo, newId, nowIso, pick, seedId, table } from "../db";
import { PROGRAMS } from "../seed";
import { branches, branchesOf, universities, type UniversityRow } from "./universities";
import { COMMISSION_TYPES as KH_COMMISSION_TYPES, FIELDS_OF_STUDY, QUALIFICATIONS as KH_QUALIFICATIONS } from "./knowledgeHub";
import type {
  BatchUpdateProgramPayload,
  Commission,
  CourseType,
  CreateProgramPayload,
  Currency,
  ExchangeRate,
  FieldOfStudy,
  Program,
  ProgramUniversity,
  Scholarship,
  UpdateProgramRequest,
} from "features/programs/types";

// Mock endpoints for programs (knowledge-hub catalogue), scholarships,
// copy-to-branch, partner intake months and the default visa fee.

// ── Lookups: the knowledge-hub tables (fos_*, qual_*, ctype_*) are the source
// of truth, so the program filters, form dropdowns and details all agree. ──

/** Seed program level -> knowledge-hub qualification name. */
const LEVEL_QUALIFICATION: Record<string, string> = {
  foundation: "Foundation",
  diploma: "Diploma",
  bachelor: "Bachelor's Degree",
  master: "Master's Degree",
  phd: "Doctoral Degree (PhD)",
};
const qualificationByName = (name: string) => KH_QUALIFICATIONS.all().find((q) => q.name === name);
const qualificationFor = (level: string) =>
  qualificationByName(LEVEL_QUALIFICATION[level.toLowerCase()] ?? LEVEL_QUALIFICATION.bachelor) ?? KH_QUALIFICATIONS.all()[0];
const qualificationById = (id?: string) => (id ? KH_QUALIFICATIONS.find(id) : undefined);
/** Same rule as features/programs/utils/courseType.ts#isMasterOrPhd. */
const isPostgradQualification = (name?: string | null) => /master|phd/i.test(name ?? "");
// Program commissions are fixed amounts unless the program uses the percentage type.
const commissionTypeByName = (name: string) => KH_COMMISSION_TYPES.all().find((c) => c.name === name);
const FLAT_COMMISSION_TYPE_ID = commissionTypeByName("Flat Fee per Student")?.id ?? "ctype_002";
const PERCENT_COMMISSION_TYPE_ID = commissionTypeByName("Percentage of Tuition")?.id ?? "ctype_001";
const defaultCommissionTypeId = () => KH_COMMISSION_TYPES.all().find((c) => c.is_default)?.id ?? PERCENT_COMMISSION_TYPE_ID;
const commissionTypeName = (id?: string | null) => (id ? KH_COMMISSION_TYPES.find(id)?.name : undefined) ?? "Flat Fee per Student";

const fieldByName = (name: string): FieldOfStudy => {
  const f = FIELDS_OF_STUDY.all().find((x) => x.name === name) ?? FIELDS_OF_STUDY.all()[0];
  return { id: f.id, name: f.name, code: f.code, is_active: f.is_active };
};

function fieldFor(name: string) {
  if (/data science/i.test(name)) return fieldByName("Data Science & Analytics");
  if (/computer|software|information technology/i.test(name)) return fieldByName("Computer Science & IT");
  if (/engineering/i.test(name)) return fieldByName("Engineering");
  if (/accounting/i.test(name)) return fieldByName("Accounting & Finance");
  if (/hospitality/i.test(name)) return fieldByName("Hospitality & Tourism");
  return fieldByName("Business & Management");
}

const EXCHANGE_RATES: ExchangeRate[] = [
  { to_currency: "USD", rate: 0.21 },
  { to_currency: "EUR", rate: 0.2 },
  { to_currency: "GBP", rate: 0.17 },
];

const REQUIRED_DOCUMENTS = [
  ["Passport", "PASSPORT", "Full colour scan of all passport pages, valid for at least 18 months.", true],
  ["Academic Transcripts", "TRANSCRIPT", "Certified copies of the most recent academic transcripts.", true],
  ["Academic Certificate", "CERTIFICATE", "Highest completed qualification certificate, translated into English if needed.", true],
  ["Passport-size Photo", "PHOTO", "Recent photo with a white background (35mm x 45mm).", true],
  ["English Proficiency Result", "ENGLISH", "IELTS, TOEFL or equivalent result, if available.", false],
  ["Personal Statement", "STATEMENT", "One-page statement of purpose explaining the choice of programme.", false],
  ["Recommendation Letter", "RECOMMENDATION", "Academic or professional reference letter (postgraduate only).", false],
] as const;

const requiredDocumentsFor = (qualificationName: string) =>
  REQUIRED_DOCUMENTS.filter(([, code]) => code !== "RECOMMENDATION" || isPostgradQualification(qualificationName)).map(
    ([type, code, description, required], i) => ({
      id: seedId("rdoc", i + 1),
      type,
      code,
      description,
      is_init_app_doc: required ? "true" : "false",
      is_required_init_app_doc: required,
      is_required_for_init: required,
    }),
  );

// ── Program rows ──────────────────────────────────────────────────────────────

const CURRENT_MONTH = 10; // matches the fixed mock "now" (Oct 2026)
const nextIntake = (months: number[] | null) => {
  if (!months?.length) return null;
  const sorted = [...months].sort((a, b) => a - b);
  return sorted.find((m) => m > CURRENT_MONTH) ?? sorted[0];
};

const toProgramUniversity = (u: UniversityRow): ProgramUniversity => ({
  id: u.id,
  name: u.name,
  country: u.country,
  is_active: u.is_active,
  description: u.description,
  logo_file_key: u.logo_file_key,
  logo_file_url: u.logo_file_url,
  intake_months: u.intake_months,
  university_type_id: u.university_type_id,
  university_type_name: u.university_type_name,
});

const toProgramBranch = (branchId?: string) => {
  const b = branchId ? branches.find(branchId) : undefined;
  return b ? { id: b.id, name: b.name, location: b.location, state: b.state, state_id: b.state_id } : { id: "", name: "", location: "", state: "", state_id: "" };
};

const OVERVIEWS: Record<string, string> = {
  foundation: "<p>A one-year pathway that prepares students for degree-level study, covering mathematics, academic English and core subject modules. Successful students progress directly into the institution's bachelor's programmes.</p>",
  diploma: "<p>A practical, industry-focused diploma combining classroom learning with hands-on projects and a supervised internship in the final semester.</p>",
  bachelor: "<p>An honours degree that builds strong theoretical foundations alongside applied project work. Students complete an industrial placement and a final-year capstone project with an industry partner.</p>",
  master: "<p>A postgraduate programme for graduates and working professionals, delivered through weekend and evening classes with a strong focus on case studies and leadership.</p>",
  phd: "<p>A research degree supervised by experienced faculty. Candidates complete a research proposal defence, publish in indexed journals and submit a doctoral thesis.</p>",
};

const CURRICULUM: Record<string, string> = {
  foundation: "<ul><li>Academic English</li><li>Foundation Mathematics</li><li>Introduction to Computing</li><li>Study Skills</li></ul>",
  diploma: "<ul><li>Year 1: Core principles and communication skills</li><li>Year 2: Specialisation modules</li><li>Final semester: 16-week internship</li></ul>",
  bachelor: "<ul><li>Year 1: Core fundamentals</li><li>Year 2: Specialisation electives</li><li>Year 3: Industrial placement and final-year project</li></ul>",
  master: "<ul><li>Core modules (24 credits)</li><li>Electives (12 credits)</li><li>Research project or dissertation (12 credits)</li></ul>",
  phd: "<ul><li>Research methodology</li><li>Proposal defence</li><li>Thesis writing and viva voce</li></ul>",
};

const SCHOLARSHIP_POOL: Omit<Scholarship, "id">[] = [
  { type: "2", coverage_percent: 30, max_amount: 15000, name: "International Merit Scholarship", description: "Awarded to international students with outstanding results in their previous qualification.", conditions: ["Minimum CGPA 3.5 or equivalent", "Maintain CGPA 3.3 each semester"] },
  { type: "2", coverage_percent: 20, max_amount: 8000, name: "Early Bird Tuition Waiver", description: "Tuition reduction for students who accept their offer and pay the deposit within 30 days.", conditions: ["Offer accepted within 30 days", "Applies to first-year tuition only"] },
  { type: "1", coverage_percent: 100, max_amount: 60000, name: "Vice-Chancellor's Excellence Award", description: "Full tuition scholarship for top-performing applicants, subject to interview.", conditions: ["Straight A results or CGPA 3.8+", "Interview with the faculty panel", "Community service commitment"] },
  { type: "2", coverage_percent: 15, max_amount: 5000, name: "Sibling Discount", description: "Tuition reduction when a sibling is currently enrolled at the institution.", conditions: ["Proof of sibling enrolment"] },
];

interface ProgramRow extends Program {
  commission: Commission;
}

const COURSE_TYPES: CourseType[] = ["course_work", "research", "mixed_mode"];

function buildCommission(amount: number | null, currency: string, typeId: string, notes: string | null, from: number, to: number): Commission {
  return {
    amount,
    currency,
    type_id: typeId,
    type: commissionTypeName(typeId),
    notes,
    expected_commission_from: String(from),
    expected_commission_to: String(to),
  };
}

let defaultVisaFee = 2500;

function seedProgram(seed: (typeof PROGRAMS)[number], n: number, branchId: string, idOverride?: string): ProgramRow {
  const uni = universities.find(seed.university_id)!;
  const level = seed.level.toLowerCase();
  const qual = qualificationFor(level);
  const years = Math.max(1, Math.round(seed.duration_months / 12));
  const yearlyCurrency: Currency = n % 5 === 4 ? "USD" : "MYR";
  const perYear = Math.round(seed.tuition_fee / years / 100) * 100;
  const yearly = Array.from({ length: years }, (_, i) => ({
    year: i + 1,
    fee: yearlyCurrency === "USD" ? Math.round((perYear + i * 500) * 0.21) : perYear + i * 500,
  }));
  const hasScholarship = n % 3 !== 2;
  const scholarships = hasScholarship
    ? [pick(SCHOLARSHIP_POOL, n), pick(SCHOLARSHIP_POOL, n + 1)].slice(0, 1 + (n % 2)).map((s, k) => ({ ...s, id: seedId("sch", n * 2 + k + 1) }))
    : [];
  const isPostgrad = level === "master" || level === "phd";
  const commissionAmount = n % 7 === 6 ? null : 1500 + (n % 6) * 750;
  const commissionCurrency = n % 4 === 3 ? "USD" : "MYR";
  const commission = buildCommission(commissionAmount, commissionCurrency, n % 4 === 1 ? PERCENT_COMMISSION_TYPE_ID : FLAT_COMMISSION_TYPE_ID, n % 2 ? "Paid after the student's first semester tuition is settled." : "Paid within 60 days of enrolment confirmation.", 30, 90);
  const isOnline = n % 6 === 3;

  return {
    id: idOverride ?? seed.id,
    name: seed.name,
    tuition_fee: seed.tuition_fee,
    visa_fee_amount: n % 8 === 5 ? 3200 : defaultVisaFee,
    first_year_tuition: yearlyCurrency === "MYR" ? yearly[0].fee : perYear,
    intake_months: n % 5 === 2 ? null : pick([[1, 5, 9], [2, 7, 10], [3, 9], [1, 4, 7, 10]], n),
    next_intake_month: null,
    duration: years,
    branch: toProgramBranch(branchId),
    yearly_fee_currency: yearlyCurrency,
    yearly_fees: yearly,
    one_time_fees: [
      { description: "Application Fee", fee: 500, currency: "MYR" },
      { description: "Registration & Resource Fee", fee: 1800 + (n % 3) * 200, currency: "MYR" },
      ...(n % 2 ? [{ description: "EMGS Visa Processing", fee: 2500, currency: "MYR" as Currency }] : []),
    ],
    english_required_score: level === "foundation" ? 5.0 : isPostgrad ? 6.5 : level === "diploma" ? 5.5 : 6.0,
    overview: OVERVIEWS[level] ?? OVERVIEWS.bachelor,
    curriculum: CURRICULUM[level] ?? CURRICULUM.bachelor,
    is_on_campus: !isOnline,
    is_online: isOnline || n % 4 === 0,
    class_type: isOnline ? "online" : "physical",
    has_scholarship: hasScholarship,
    scholarships,
    commission,
    commission_amount: commissionAmount,
    commission_currency: commissionCurrency,
    qualification_id: qual.id,
    qualification_level: qual.name,
    course_type: isPostgrad ? pick(COURSE_TYPES, n) : null,
    field_of_study: fieldFor(seed.name),
    university: toProgramUniversity(uni),
    is_hidden: n % 11 === 10,
    updated_at: daysAgo(n % 20, n),
    required_documents: requiredDocumentsFor(qual.name),
  };
}

const firstBranchId = (universityId: string, k = 0) => {
  const list = branchesOf(universityId);
  return list.length ? list[k % list.length].id : "";
};

const programs = table<ProgramRow>([
  ...PROGRAMS.map((p, n) => seedProgram(p, n, firstBranchId(p.university_id, n % 2 === 1 ? 1 : 0))),
  // The same programme offered at a second campus, so copy-to-branch shows "already added".
  ...[0, 6, 12, 15].map((idx, k) => {
    const seed = PROGRAMS[idx];
    const current = firstBranchId(seed.university_id, idx % 2 === 1 ? 1 : 0);
    const other = branchesOf(seed.university_id).find((b) => b.id !== current)?.id ?? current;
    return seedProgram(seed, idx, other, seedId("prog", 25 + k));
  }),
]);

// University/branch details are re-read on every response so edits elsewhere show up.
function present(p: ProgramRow): ProgramRow {
  const uni = universities.find(p.university.id);
  return {
    ...p,
    university: uni ? toProgramUniversity(uni) : p.university,
    branch: p.branch.id ? toProgramBranch(p.branch.id) : p.branch,
    next_intake_month: nextIntake(p.intake_months) ?? nextIntake(uni?.intake_months ?? null),
    commission_amount: p.commission.amount,
    commission_currency: p.commission.currency,
  };
}

const detail = (p: ProgramRow) => {
  const view = present(p);
  return {
    program: view,
    required_documents: view.required_documents ?? [],
    commission: view.commission,
    exchange_rates: EXCHANGE_RATES,
  };
};

function findProgram(id: string) {
  const p = programs.find(id);
  if (!p) throw httpError(404, "Program not found");
  return p;
}

const isPartnerView = () => typeof window !== "undefined" && window.location.pathname.startsWith("/partner");
const asBool = (v: unknown): boolean | undefined => (v === undefined || v === null || v === "" ? undefined : String(v) === "true");

// ── List / detail ─────────────────────────────────────────────────────────────

mock.get("/knowledge-hub/programs", ({ query }) => {
  let items = programs.all().filter((p) => universities.find(p.university.id)).map(present);

  if (isPartnerView()) items = items.filter((p) => p.university.is_active && !universities.find(p.university.id)?.is_hidden);
  // Hidden programs only appear when explicitly asked for.
  items = asBool(query.is_hidden) === true ? items.filter((p) => p.is_hidden) : items.filter((p) => !p.is_hidden);

  if (query.university_id) items = items.filter((p) => p.university.id === query.university_id);
  if (query.field_of_study_id) items = items.filter((p) => p.field_of_study.id === query.field_of_study_id);
  if (query.qualification_id) items = items.filter((p) => p.qualification_id === query.qualification_id);
  if (query.state_id) items = items.filter((p) => p.branch.state_id === query.state_id);
  if (query.course_type) items = items.filter((p) => p.course_type === query.course_type);
  if (query.class_type === "online") items = items.filter((p) => p.is_online);
  if (query.class_type === "physical") items = items.filter((p) => p.is_on_campus);
  const hasSch = asBool(query.has_scholarship);
  if (hasSch !== undefined) items = items.filter((p) => p.has_scholarship === hasSch);
  if (query.level === "undergraduate") items = items.filter((p) => !isPostgradQualification(p.qualification_level));
  if (query.level === "graduate") items = items.filter((p) => isPostgradQualification(p.qualification_level));

  if (typeof query.search === "string" && query.search) {
    const q = query.search.toLowerCase();
    items = items.filter((p) => p.name.toLowerCase().includes(q) || p.university.name.toLowerCase().includes(q));
  }

  const sorters: Record<string, (a: Program, b: Program) => number> = {
    commission_asc: (a, b) => (a.commission_amount ?? 0) - (b.commission_amount ?? 0),
    commission_desc: (a, b) => (b.commission_amount ?? 0) - (a.commission_amount ?? 0),
    tuition_asc: (a, b) => (a.tuition_fee ?? 0) - (b.tuition_fee ?? 0),
    tuition_desc: (a, b) => (b.tuition_fee ?? 0) - (a.tuition_fee ?? 0),
  };
  if (sorters[query.sort_by]) items = [...items].sort(sorters[query.sort_by]);

  const pageSize = Number(query.page_size ?? 20) || 20;
  const page = Number(query.page ?? 1) || 1;
  return { items: items.slice((page - 1) * pageSize, page * pageSize), total: items.length, page, page_size: pageSize };
});

mock.get("/knowledge-hub/programs/:id", ({ params }) => detail(findProgram(params.id)));

// ── Create / update / delete ─────────────────────────────────────────────────

type ProgramWrite = Partial<CreateProgramPayload> & UpdateProgramRequest;

function applyWrite(p: ProgramRow, data: ProgramWrite) {
  const {
    uni_id, branch_id, field_of_study_id, qualification_id, english_required_score,
    commission_amount, commission_currency, commission_type_id, commission_notes,
    expected_commission_from, expected_commission_to, scholarships, expected_updated_at: _e,
    ...rest
  } = data;
  Object.assign(p, rest);

  if (uni_id) {
    const uni = universities.find(uni_id);
    if (uni) p.university = toProgramUniversity(uni);
  }
  if (branch_id !== undefined) p.branch = toProgramBranch(branch_id);
  if (field_of_study_id) {
    const f = FIELDS_OF_STUDY.find(field_of_study_id);
    if (f) p.field_of_study = { id: f.id, name: f.name, code: f.code, is_active: f.is_active };
  }
  if (qualification_id) {
    const q = qualificationById(qualification_id);
    p.qualification_id = qualification_id;
    p.qualification_level = q?.name ?? p.qualification_level;
    if (!isPostgradQualification(p.qualification_level)) p.course_type = null;
  }
  if (data.course_type === null && isPostgradQualification(p.qualification_level)) p.course_type = "course_work";
  if (english_required_score !== undefined) p.english_required_score = english_required_score === "" ? null : Number(english_required_score);
  if (data.yearly_fees) p.first_year_tuition = Number(data.yearly_fees[0]?.fee ?? p.first_year_tuition);
  if (data.is_on_campus !== undefined || data.is_online !== undefined) p.class_type = p.is_on_campus ? "physical" : "online";

  const c = p.commission;
  if (commission_amount !== undefined) c.amount = commission_amount;
  if (commission_currency !== undefined) c.currency = commission_currency;
  if (commission_type_id !== undefined) {
    c.type_id = commission_type_id;
    c.type = commissionTypeName(commission_type_id);
  }
  if (commission_notes !== undefined) c.notes = commission_notes;
  if (expected_commission_from != null) c.expected_commission_from = String(expected_commission_from);
  if (expected_commission_to != null) c.expected_commission_to = String(expected_commission_to);

  if (scholarships) p.scholarships = scholarships.map((s) => ({ ...s, id: newId("sch"), type: String(s.type ?? "2") }));
  if (data.has_scholarship === false) p.scholarships = [];
  p.has_scholarship = p.scholarships.length > 0 || !!data.has_scholarship;
  p.updated_at = nowIso();
}

mock.post("/knowledge-hub/programs", ({ body }) => {
  const data = body as CreateProgramPayload;
  if (!universities.find(data.uni_id)) return httpError(422, "Unknown university");
  const base = seedProgram({ ...PROGRAMS[0], university_id: data.uni_id }, 0, data.branch_id, newId("prog"));
  const row: ProgramRow = {
    ...base,
    scholarships: [],
    has_scholarship: false,
    is_hidden: false,
    visa_fee_amount: defaultVisaFee,
    commission: buildCommission(null, "MYR", defaultCommissionTypeId(), null, 30, 90),
  };
  applyWrite(row, data);
  row.required_documents = requiredDocumentsFor(row.qualification_level);
  programs.insert(row);
  return detail(row);
});

mock.put("/knowledge-hub/programs/:id", ({ params, body }) => {
  const p = findProgram(params.id);
  applyWrite(p, (body ?? {}) as ProgramWrite);
  return detail(p);
});

mock.delete("/knowledge-hub/programs/:id", ({ params }) => {
  findProgram(params.id);
  programs.remove(params.id);
  return { detail: "Program deleted" };
});

mock.delete("/knowledge-hub/programs", ({ body }) => {
  const ids: string[] = body?.program_ids ?? [];
  const deleted = ids.filter((id) => programs.remove(id));
  return { deleted_count: deleted.length, deleted_ids: deleted };
});

mock.put("/knowledge-hub/programs-batch", ({ body }) => {
  const { program_ids = [], scholarships, ...patch } = (body ?? {}) as BatchUpdateProgramPayload;
  const rows = program_ids.map((id) => programs.find(id)).filter((p): p is ProgramRow => !!p);
  if (patch.course_type !== undefined && rows.some((p) => !isPostgradQualification(p.qualification_level))) {
    return httpError(422, "Course type can only be set on master or PhD programs");
  }
  for (const p of rows) {
    applyWrite(p, patch as ProgramWrite);
    if (patch.visa_fee_amount !== undefined) p.visa_fee_amount = patch.visa_fee_amount;
    // Batch scholarships are added on top of the program's existing ones.
    if (scholarships?.length) {
      p.scholarships = [...p.scholarships, ...scholarships.map((s) => ({ ...s, id: newId("sch"), type: String(s.type ?? "2") }))];
      p.has_scholarship = true;
    }
  }
  return { updated_count: rows.length, program_ids: rows.map((p) => p.id) };
});

mock.post("/knowledge-hub/programs/:id/copy", ({ params, body }) => {
  const src = findProgram(params.id);
  const branchId: string = body?.branch_id;
  const branch = branches.find(branchId);
  if (!branch || branch.university_id !== src.university.id) return httpError(422, "Branch does not belong to this university");
  const taken = programs.all().some(
    (p) => p.branch.id === branchId && p.name.trim().toLowerCase() === src.name.trim().toLowerCase() && p.qualification_id === src.qualification_id,
  );
  if (taken) return reply(409, { detail: "This program already exists in the selected branch", code: "program_exists_in_branch" });
  const copy: ProgramRow = JSON.parse(JSON.stringify(src));
  copy.id = newId("prog");
  copy.branch = toProgramBranch(branchId);
  copy.updated_at = nowIso();
  programs.insert(copy);
  return detail(copy);
});

// ── Scholarships (batch popups) ──────────────────────────────────────────────

mock.post("/knowledge-hub/scholarships", ({ body }) => {
  const ids: string[] = body?.program_ids ?? [];
  const seen = new Map<string, Scholarship & { currency: string }>();
  for (const id of ids) {
    for (const s of programs.find(id)?.scholarships ?? []) {
      if (!seen.has(s.name)) seen.set(s.name, { ...s, currency: "MYR" });
    }
  }
  return [...seen.values()];
});

mock.delete("/knowledge-hub/scholarships", ({ body }) => {
  const ids: string[] = body?.program_ids ?? [];
  const names = new Set<string>(body?.scholarship_names ?? []);
  let removed = 0;
  for (const id of ids) {
    const p = programs.find(id);
    if (!p) continue;
    const before = p.scholarships.length;
    p.scholarships = p.scholarships.filter((s) => !names.has(s.name));
    removed += before - p.scholarships.length;
    p.has_scholarship = p.scholarships.length > 0;
  }
  return { deleted_count: removed };
});

// ── Partner intake months & default visa fee ─────────────────────────────────

mock.get("/partners/:partnerId/programs/:programId/intake-months", ({ params }) => {
  const p = findProgram(params.programId);
  return { intake_months: p.intake_months?.length ? p.intake_months : universities.find(p.university.id)?.intake_months ?? [] };
});

// GET and PUT share `defaultVisaFee` so a saved default shows up on the next read.
mock.get("/admin/settings/default-visa-fee", () => ({ amount: defaultVisaFee.toFixed(2), currency: "MYR" }));

mock.put("/admin/settings/default-visa-fee", ({ body }) => {
  const amount = Number(body?.amount);
  if (!Number.isFinite(amount) || amount < 0) return httpError(422, "Amount must be a positive number");
  // Programs still on the old default follow the new one.
  for (const p of programs.all()) if (p.visa_fee_amount === defaultVisaFee) p.visa_fee_amount = amount;
  defaultVisaFee = amount;
  return { amount, currency: "MYR", updated_at: nowIso() };
});


/**
 * A program's agreed commission (amount, currency, knowledge-hub commission
 * type). finance.ts builds each application's commission row from this so
 * program details and application/finance views quote the same figure.
 */
export function getProgramCommission(programId: string): Commission | null {
  const p = programs.find(programId);
  return p ? { ...p.commission } : null;
}

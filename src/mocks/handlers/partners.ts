import { mock, httpError, reply } from "../router";
import { table, newId, daysAgo, daysFromNow, dateOnly, nowIso, pick, placeholderImage, search, SAMPLE_PDF_URL } from "../db";
import { PARTNERS, CURRENT_PARTNER, ACCOUNT_MANAGERS, APPLICATIONS } from "../seed";
import type {
  PartnerDetails,
  IndividualDetails,
  CompanyDetails,
  PartnerPublicProfileAdminView,
  PublicPartnerProfile,
  PendingRegistrationOtp,
  AdditionalManager,
} from "features/partners/types";
import type { AgencyMember } from "features/agency-members/types";
import { getCommissionStatementRow } from "./finance";
import type { PartnerAgreement } from "features/partners/agreement/types";
import type { PartnerStatementItem } from "features/partners/statement/types";

// Advisors (partners): admin/reviewer/account-manager lists and details, the
// signed-in partner's own profile, public profile pages, registration,
// agreements and the commission statement.

const truthy = (v: unknown) => (v === undefined || v === null || v === "" ? undefined : v === true || v === "true");
const pageOf = <T,>(items: T[], query: Record<string, any>, defaultSize = 10) => {
  const page = Number(query.page ?? 1) || 1;
  const page_size = Number(query.page_size ?? defaultSize) || defaultSize;
  return { items: items.slice((page - 1) * page_size, page * page_size), total: items.length, page, page_size };
};
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const fileKey = (partnerId: string, name: string) => `partners/${partnerId}/${name}`;

const BACKGROUNDS = [
  "Former admissions officer with eight years of experience placing students from West Africa in Malaysian Institutions. Specialises in computing and business programmes.",
  "Independent Advisor helping families in Dhaka choose foundation and diploma pathways. Over 120 students placed since 2021.",
  "Education consultant focused on postgraduate placements, MBA and data science in particular. Runs monthly info sessions in Jakarta.",
  "Alumna of Taylor's University who now guides students from Northern Nigeria through admissions, visas and arrival in Kuala Lumpur.",
  "Teacher turned Advisor supporting students from Sana'a and Aden with scholarship-friendly Institutions in Selangor.",
  "Advisor based in Beijing focused on hospitality and business diplomas, with a strong network of partner schools.",
];

function individualDetails(id: string, name: string, i: number): IndividualDetails {
  return {
    id_document_file_key: fileKey(id, "national-id.pdf"),
    id_document_file_url: SAMPLE_PDF_URL,
    background: pick(BACKGROUNDS, i),
    social_media_url: `https://www.facebook.com/${slugify(name)}`,
    linkedin_url: `https://www.linkedin.com/in/${slugify(name)}`,
    date_of_birth: `${1982 + (i % 12)}-${String((i % 12) + 1).padStart(2, "0")}-${String((i * 3) % 27 + 1).padStart(2, "0")}`,
    passport_number: `P${String(40000000 + i * 104729).slice(0, 8)}`,
    profile_photo_file_key: fileKey(id, "profile-photo.png"),
    profile_photo_file_url: placeholderImage(name, pick(["#0EA5E9", "#8B5CF6", "#10B981", "#F59E0B"], i)),
    passport_photo_file_key: fileKey(id, "passport.png"),
    passport_photo_file_url: placeholderImage(name, "#334155"),
  };
}

function companyDetails(id: string, name: string, i: number): CompanyDetails {
  return {
    company_name: name,
    website_url: `https://www.${slugify(name).replace(/-/g, "")}.com`,
    company_registration_doc_file_key: fileKey(id, "company-registration.pdf"),
    company_registration_doc_file_url: SAMPLE_PDF_URL,
    contact_id_document_file_key: fileKey(id, "contact-id.pdf"),
    contact_id_document_file_url: SAMPLE_PDF_URL,
    date_of_birth: `${1978 + (i % 10)}-0${(i % 9) + 1}-1${i % 9}`,
    passport_number: `A${String(70000000 + i * 7331).slice(0, 8)}`,
    logo_file_key: fileKey(id, "logo.png"),
    logo_file_url: placeholderImage(name, pick(["#0348D1", "#7C3AED", "#059669", "#D97706"], i)),
    passport_photo_file_key: fileKey(id, "passport.png"),
    passport_photo_file_url: placeholderImage(name, "#334155"),
  };
}

const LANGUAGE_IDS = [
  "6f1c2a0e-1b7d-4c55-9a43-0e3f1d2a7b01", // English
  "8a4d3b2c-5e6f-4a70-8b91-1c2d3e4f5a02", // Arabic
  "9b5e4c3d-6f70-4b81-9ca2-2d3e4f5a6b03", // Malay
];

function publicProfile(p: { id: string; name: string; country: string }, i: number, published: boolean): PartnerPublicProfileAdminView {
  return {
    id: `pp_${p.id}`,
    partner_id: p.id,
    slug: slugify(p.name),
    display_name: p.name,
    bio: `${pick(BACKGROUNDS, i)} Book a free consultation on WhatsApp to plan your intake.`,
    whatsapp_number: `${60 + i}12${String(3456789 + i * 1111).slice(0, 7)}`,
    countries_supported: [p.country, "Malaysia", ...(i % 2 ? ["Indonesia"] : ["Bangladesh"])],
    language_ids: LANGUAGE_IDS.slice(0, (i % 3) + 1),
    is_published: published,
    is_verified: i % 3 !== 2,
    verified_at: i % 3 !== 2 ? daysAgo(60 + i * 5) : null,
    created_at: daysAgo(300 - i * 10),
    updated_at: daysAgo(i * 2 + 1),
  };
}

// ── Seed ────────────────────────────────────────────────────────────────────

const managerName = (id: string | null) => ACCOUNT_MANAGERS.find((m) => m.id === id)?.name ?? null;
const additionalManager = (n: number): AdditionalManager => {
  const m = ACCOUNT_MANAGERS[n % ACCOUNT_MANAGERS.length];
  return { id: m.id, name: m.name, email: m.email };
};

const basePartners: PartnerDetails[] = PARTNERS.map((p, i) => {
  // Hassan Al-Amri is a suspended (verified, inactive) Advisor.
  const isActive = p.id === "ptn_008" ? false : p.is_active;
  return {
    id: p.id,
    user_id: p.user_id,
    name: p.name,
    email: p.email,
    type: p.type,
    country: p.country,
    nationality: p.country,
    phone: p.phone,
    is_active: isActive,
    is_verified: p.is_verified,
    assigned_manager_id: p.assigned_manager.id,
    assigned_manager_name: p.assigned_manager.name,
    additional_managers: i % 3 === 0 ? [additionalManager(i + 1)] : [],
    individual_details: p.type === "individual" ? individualDetails(p.id, p.name, i) : null,
    company_details: p.type === "agency" ? companyDetails(p.id, p.name, i) : null,
    created_at: p.created_at,
    updated_at: daysAgo(i * 3 + 1),
    last_login: p.last_login,
    agency_role: p.type === "agency" ? "admin" : null,
    agency_membership: null,
    // Public profiles are individual-only in V1; the current partner gets one
    // too so the partner-side public profile page has something to show.
    public_profile:
      p.type === "individual" || p.id === CURRENT_PARTNER.id ? publicProfile(p, i, p.is_verified && i !== 5) : null,
  };
});

// Team members linked under an agency. Each is also its own partner row.
const MEMBER_SEED: [string, string, string, boolean, boolean, number][] = [
  // name, agency, country, active, commission visible, commission %
  ["Kwame Mensah", "ptn_001", "Ghana", true, true, 70],
  ["Ngozi Eze", "ptn_001", "Nigeria", true, true, 60],
  ["Tunde Bakare", "ptn_001", "Nigeria", true, false, 0],
  ["Blessing Okoro", "ptn_001", "Nigeria", false, true, 50],
  ["Emeka Obi", "ptn_001", "Nigeria", true, false, 0],
  ["Usman Tariq", "ptn_003", "Pakistan", true, true, 65],
  ["Ayesha Malik", "ptn_003", "Pakistan", true, false, 0],
  ["Mahmoud Fathy", "ptn_005", "Egypt", true, true, 55],
];

const memberPartners: PartnerDetails[] = MEMBER_SEED.map(([name, agencyId, country, active], i) => {
  const id = `ptn_m${String(i + 1).padStart(2, "0")}`;
  const agency = basePartners.find((p) => p.id === agencyId)!;
  return {
    id,
    user_id: `usr_${id}`,
    name,
    email: `${name.split(" ")[0].toLowerCase()}.${name.split(" ")[1].toLowerCase()}@${agency.email.split("@")[0]}.example.com`,
    type: "individual",
    country,
    nationality: country,
    phone: `+${233 + i} 24 ${5500000 + i * 2711}`,
    is_active: active,
    is_verified: true,
    assigned_manager_id: agency.assigned_manager_id,
    assigned_manager_name: agency.assigned_manager_name,
    additional_managers: [],
    individual_details: individualDetails(id, name, i + 2),
    company_details: null,
    created_at: daysAgo(200 - i * 15),
    updated_at: daysAgo(i + 2),
    last_login: i === 4 ? null : daysAgo(i % 6, i + 1),
    agency_role: "member",
    agency_membership: { agency_id: agency.id, agency_name: agency.name },
    public_profile: null,
  };
});

// Fresh sign-ups waiting for review (unverified + inactive = "pending").
const pendingPartners: PartnerDetails[] = [
  ["Horizon Edu Consult", "agency", "Kenya"],
  ["Siti Aminah", "individual", "Indonesia"],
  ["Abdullahi Musa", "individual", "Nigeria"],
].map(([name, type, country], i) => {
  const id = `ptn_p${String(i + 1).padStart(2, "0")}`;
  return {
    id,
    user_id: `usr_${id}`,
    name,
    email: `${name.split(" ")[0].toLowerCase()}@example.com`,
    type,
    country,
    nationality: country,
    phone: `+${254 - i * 20} 71 ${2200000 + i * 917}`,
    is_active: false,
    is_verified: false,
    assigned_manager_id: null,
    assigned_manager_name: null,
    additional_managers: [],
    individual_details: type === "individual" ? individualDetails(id, name, i + 4) : null,
    company_details: type === "agency" ? companyDetails(id, name, i + 4) : null,
    created_at: daysAgo(i + 1, 3),
    updated_at: daysAgo(i + 1, 3),
    last_login: null,
    agency_role: type === "agency" ? "admin" : null,
    agency_membership: null,
    public_profile: type === "individual" ? publicProfile({ id, name, country }, i + 1, false) : null,
  };
});

export const partners = table<PartnerDetails>([...basePartners, ...memberPartners, ...pendingPartners]);

/** Agency membership rows; `partner_id` is the member's own partner id. */
export const memberships = table<AgencyMember>(
  MEMBER_SEED.map(([name, agencyId, , active, visible, pct], i) => {
    const p = memberPartners[i];
    return {
      id: `mbr_${String(i + 1).padStart(3, "0")}`,
      partner_id: p.id,
      user_id: p.user_id,
      name,
      email: p.email,
      status: active ? 1 : 0,
      is_active: active,
      commission_visible: visible,
      commission_display_percentage: visible ? pct : 0,
      created_at: p.created_at,
      // Not part of AgencyMember; used to scope rows to an agency.
      agency_id: agencyId,
    } as AgencyMember & { agency_id: string };
  }),
);

export const membersOf = (agencyId: string) =>
  memberships.all().filter((m) => (m as AgencyMember & { agency_id: string }).agency_id === agencyId);

/** Full details view: embeds the agency's team members. */
export function partnerDetails(p: PartnerDetails): PartnerDetails {
  return {
    ...p,
    agency_members: p.type === "agency" ? membersOf(p.id).map(({ ...m }) => ({ ...m, is_active: partners.find(m.partner_id)?.is_active ?? m.is_active })) : null,
  };
}

// The account-managers module reassigns `assigned_manager` on the shared
// PARTNERS seed objects (portfolio transfers), so read it live per request.
// Team members follow their agency's manager.
type SeedManager = { id: string; name: string } | null | undefined;
function syncManager(p: PartnerDetails): PartnerDetails {
  const seedId = p.agency_membership?.agency_id ?? p.id;
  const seed = PARTNERS.find((s) => s.id === seedId);
  if (seed) {
    const m = (seed as { assigned_manager: SeedManager }).assigned_manager;
    p.assigned_manager_id = m?.id ?? null;
    p.assigned_manager_name = m?.name ?? null;
  }
  return p;
}

/** Keep the seed in step when this module changes a seed partner's manager. */
function setSeedManager(partnerId: string, managerId: string | null) {
  const seed = PARTNERS.find((s) => s.id === partnerId);
  if (!seed) return;
  (seed as { assigned_manager: SeedManager }).assigned_manager = ACCOUNT_MANAGERS.find((m) => m.id === managerId) ?? null;
}

const allPartners = () => partners.all().map(syncManager);

const findOr404 = (id: string) => {
  const p = partners.find(id);
  if (!p) throw httpError(404, "Advisor not found.");
  return syncManager(p);
};

function applyPartnerPatch(p: PartnerDetails, body: any) {
  const { individual_details, company_details, public_profile, password: _pw, user, ...rest } = body ?? {};
  void _pw;
  void user;
  Object.assign(p, rest);
  if (rest.assigned_manager_id !== undefined) {
    p.assigned_manager_name = managerName(rest.assigned_manager_id);
    setSeedManager(p.id, rest.assigned_manager_id || null);
  }
  if (individual_details) p.individual_details = { ...(p.individual_details ?? individualDetails(p.id, p.name, 0)), ...individual_details };
  if (company_details) p.company_details = { ...(p.company_details ?? companyDetails(p.id, p.name, 0)), ...company_details };
  if (public_profile) {
    if (!p.public_profile) throw httpError(404, "This Advisor has no public profile.");
    p.public_profile = { ...p.public_profile, ...public_profile, updated_at: nowIso() };
  }
  p.updated_at = nowIso();
  // Keep a member's membership row in sync with suspend/reactivate.
  const m = memberships.all().find((r) => r.partner_id === p.id);
  if (m && rest.is_active !== undefined) Object.assign(m, { is_active: rest.is_active, status: rest.is_active ? 1 : 0 });
}

// ── Admin / reviewer ────────────────────────────────────────────────────────

mock.get("/admin/partners", ({ query }) => {
  const all = allPartners();
  const q = String(query.search ?? "").toLowerCase();
  let rows = q
    ? all.filter((p) => [p.name, p.email, p.country, p.phone, p.company_details?.company_name].some((f) => String(f ?? "").toLowerCase().includes(q)))
    : all;
  const verified = truthy(query.is_verified);
  const active = truthy(query.is_active);
  if (verified !== undefined) rows = rows.filter((p) => p.is_verified === verified);
  if (active !== undefined) rows = rows.filter((p) => p.is_active === active);
  if (query.type) rows = rows.filter((p) => p.type === query.type);
  if (query.assigned_manager_id) rows = rows.filter((p) => p.assigned_manager_id === query.assigned_manager_id);
  if (query.manager_id) {
    rows = rows.filter((p) => p.assigned_manager_id === query.manager_id || p.additional_managers?.some((m) => m.id === query.manager_id));
  }
  const stats = {
    total: all.length,
    verified: all.filter((p) => p.is_verified).length,
    unverified: all.filter((p) => !p.is_verified).length,
    active: all.filter((p) => p.is_active).length,
    inactive: all.filter((p) => !p.is_active).length,
    individual: all.filter((p) => p.type === "individual").length,
    agency: all.filter((p) => p.type === "agency").length,
  };
  return { ...pageOf(rows, query), stats };
});

mock.get("/admin/partners/register/pending-otps", ({ query }) => {
  let rows = search(pendingOtps, query.search, ["email", "full_name", "company_name"]);
  if (query.progress) rows = rows.filter((r) => r.progress === query.progress);
  if (query.partner_type) rows = rows.filter((r) => r.partner_type === query.partner_type);
  return pageOf(rows, query);
});

mock.post("/admin/partners/register/resend-otp", ({ body }) => {
  const row = pendingOtps.find((r) => r.email === body?.email);
  if (row) Object.assign(row, { resend_count: row.resend_count + 1, progress: "otp_pending", expires_at: daysFromNow(0.01) });
  return { message: `A new verification code was sent to ${body?.email}.` };
});

mock.get("/admin/partners/:id", ({ params }) => partnerDetails(findOr404(params.id)));

mock.post("/admin/partners", ({ body }) => {
  const id = newId("ptn");
  const name = body?.user?.name ?? "New Advisor";
  const row: PartnerDetails = {
    id,
    user_id: `usr_${id}`,
    name,
    email: body?.user?.email ?? `${id}@example.com`,
    type: body?.type ?? "individual",
    country: body?.country ?? "Malaysia",
    nationality: body?.country ?? null,
    phone: "",
    is_active: body?.user?.is_active ?? true,
    is_verified: true,
    assigned_manager_id: null,
    assigned_manager_name: null,
    additional_managers: [],
    individual_details: null,
    company_details: null,
    created_at: nowIso(),
    updated_at: nowIso(),
    last_login: null,
    agency_role: body?.type === "agency" ? "admin" : null,
    agency_membership: null,
    public_profile: null,
  };
  partners.insert(row);
  return reply(201, row);
});

mock.put("/admin/partners/:id", ({ params, body }) => {
  const p = findOr404(params.id);
  applyPartnerPatch(p, body);
  return partnerDetails(p);
});

mock.delete("/admin/partners/:id", ({ params }) => {
  findOr404(params.id);
  partners.remove(params.id);
  return { message: "Advisor deleted." };
});

mock.post("/admin/partners/:id/assign-manager", ({ params, body }) => {
  const p = findOr404(params.id);
  p.assigned_manager_id = body?.manager_id ?? null;
  p.assigned_manager_name = managerName(p.assigned_manager_id);
  setSeedManager(p.id, p.assigned_manager_id);
  p.additional_managers = (p.additional_managers ?? []).filter((m) => m.id !== p.assigned_manager_id);
  return partnerDetails(p);
});

const managersResult = (p: PartnerDetails) => ({
  partner_id: p.id,
  assigned_manager_id: p.assigned_manager_id,
  additional_managers: p.additional_managers ?? [],
});

mock.post("/admin/partners/:id/additional-managers", ({ params, body }) => {
  const p = findOr404(params.id);
  const m = ACCOUNT_MANAGERS.find((a) => a.id === body?.manager_id);
  if (!m) throw httpError(404, "Account manager not found.");
  if (!p.additional_managers?.some((a) => a.id === m.id)) {
    p.additional_managers = [...(p.additional_managers ?? []), { id: m.id, name: m.name, email: m.email }];
  }
  return managersResult(p);
});

mock.delete("/admin/partners/:id/additional-managers/:managerId", ({ params }) => {
  const p = findOr404(params.id);
  p.additional_managers = (p.additional_managers ?? []).filter((m) => m.id !== params.managerId);
  return managersResult(p);
});

mock.patch("/admin/partners/:id/review", ({ params, body }) => {
  const p = findOr404(params.id);
  if (body?.decision === "approved") Object.assign(p, { is_verified: true, is_active: true, updated_at: nowIso() });
  else partners.remove(p.id);
  return { message: body?.decision === "approved" ? "Advisor approved. A welcome email is on its way." : "Advisor application rejected." };
});

mock.post("/admin/partners/:id/resend-approval-email", ({ params }) => {
  const p = findOr404(params.id);
  return { message: `Approval email resent to ${p.email}.` };
});

// ── Account manager ─────────────────────────────────────────────────────────

const appsCount = (id: string) => APPLICATIONS.filter((a) => a.partner.id === id).length;

mock.get("/account-managers/partners", ({ query }) => {
  // The mock AM sees every verified Advisor; a few arrive via a share.
  const rows = search(
    allPartners().filter((p) => p.is_verified),
    query.search,
    ["name", "email", "country"],
  ).map((p, i) => ({
    id: p.id,
    name: p.name,
    email: p.email,
    type: p.type as "individual" | "agency",
    country: p.country,
    phone: p.phone,
    is_verified: p.is_verified,
    is_active: p.is_active,
    applications_count: appsCount(p.id),
    last_login: p.last_login,
    created_at: p.created_at,
    updated_at: p.updated_at,
    is_shared: i % 4 === 3,
    agency_role: p.agency_role as "admin" | "member" | null,
    agency_membership: p.agency_membership,
  }));
  return dbPaginate(rows, query);
});

mock.get("/account-managers/partners/:id", ({ params }) => {
  const p = partnerDetails(findOr404(params.id));
  const ind = p.individual_details;
  return {
    ...p,
    individual_details: ind
      ? {
          date_of_birth: ind.date_of_birth ?? null,
          passport_number: ind.passport_number ?? null,
          profile_photo_file_key: ind.profile_photo_file_key ?? null,
          profile_photo_file_url: ind.profile_photo_file_url ?? null,
          passport_photo_file_key: ind.passport_photo_file_key ?? null,
          passport_photo_file_url: ind.passport_photo_file_url ?? null,
          id_document_file_key: ind.id_document_file_key,
          id_document_file_url: ind.id_document_file_url,
          background: ind.background,
          social_media_url: ind.social_media_url,
          linkedin_url: ind.linkedin_url,
        }
      : null,
  };
});

function dbPaginate<T>(items: T[], query: Record<string, any>) {
  const limit = Number(query.limit ?? 10) || 10;
  const offset = Number(query.offset ?? 0) || 0;
  return { items: items.slice(offset, offset + limit), total: items.length, limit, offset };
}

// ── Signed-in partner ───────────────────────────────────────────────────────

mock.get("/partners/profile", () => partnerDetails(syncManager(partners.find(CURRENT_PARTNER.id)!)));

mock.put("/partners/profile", ({ body }) => {
  const p = partners.find(CURRENT_PARTNER.id)!;
  applyPartnerPatch(p, body);
  return partnerDetails(syncManager(p));
});

mock.post("/partners/onboarding/complete", () => ({ message: "Onboarding complete." }));

mock.post("/partners/reset-password", () => ({ message: "Your password has been updated." }));

// ── Public registration ("Apply as Advisor") ────────────────────────────────

const pendingOtps: PendingRegistrationOtp[] = [
  ["Rahim Uddin", null, "individual", "otp_pending", 0, 0, 0],
  ["Joy Wanjiku", "Savannah Study Links", "agency", "otp_pending", 1, 1, 1],
  ["Dewi Lestari", null, "individual", "otp_expired", 3, 1, 2],
  ["Yaw Boateng", "Accra Scholars Network", "agency", "max_resends_reached", 5, 5, 3],
  ["Salma Idris", null, "individual", "otp_attempts_exhausted", 1, 5, 4],
  ["Farhan Qureshi", "Lahore Learning Partners", "agency", "completed", 0, 1, 6],
  [null, null, null, "otp_expired", 0, 0, 9],
].map(([full_name, company_name, partner_type, progress, resend_count, attempt_count, age], i) => ({
  email: full_name ? `${String(full_name).split(" ")[0].toLowerCase()}.${String(full_name).split(" ")[1].toLowerCase()}@mail.com` : `applicant${i}@mail.com`,
  full_name: full_name as string | null,
  company_name: company_name as string | null,
  partner_type: partner_type as "individual" | "agency" | null,
  created_at: daysAgo(age as number, 2),
  expires_at: progress === "otp_pending" ? daysFromNow(0.007) : daysAgo(age as number, 1),
  resend_count: resend_count as number,
  attempt_count: attempt_count as number,
  is_used: progress === "completed",
  progress: progress as PendingRegistrationOtp["progress"],
}));

mock.post("/partners/register/initiate", ({ body }) => {
  const email = body?.email ?? body?.contact_email ?? "applicant@mail.com";
  pendingOtps.unshift({
    email,
    full_name: body?.name ?? body?.contact_full_name ?? null,
    company_name: body?.company_name ?? null,
    partner_type: body?.type ?? null,
    created_at: nowIso(),
    expires_at: daysFromNow(0.007),
    resend_count: 0,
    attempt_count: 0,
    is_used: false,
    progress: "otp_pending",
  });
  return { message: `We sent a 6-digit code to ${email}.` };
});

mock.post("/partners/register/resend-otp", ({ body }) => ({ message: `A new code was sent to ${body?.email}.` }));

mock.post("/partners/register/verify-otp", ({ body }) => {
  const row = pendingOtps.find((r) => r.email === body?.email);
  if (row) Object.assign(row, { is_used: true, progress: "completed" });
  return { message: "Email verified. Our team will review your application within 2 working days.", reference_id: `UBX-ADV-2026-${String(400 + pendingOtps.length).padStart(4, "0")}` };
});

// ── Public profile page (/p/[slug]) ─────────────────────────────────────────

mock.get("/partners/public/:slug", ({ params }) => {
  const p = partners.all().find((r) => r.public_profile?.slug === params.slug);
  // The demo partner's page is always viewable so /p/<slug> isn't a dead link.
  if (!p || (!p.public_profile!.is_published && p.id !== CURRENT_PARTNER.id)) throw httpError(404, "This profile doesn't exist or isn't published yet.");
  const pp = p.public_profile!;
  const photo = p.individual_details ?? null;
  const profile: PublicPartnerProfile = {
    slug: pp.slug,
    display_name: pp.display_name,
    bio: pp.bio,
    whatsapp_number: pp.whatsapp_number,
    countries_supported: pp.countries_supported,
    languages: ["English", "Arabic", "Malay"].slice(0, pp.language_ids.length),
    is_verified: pp.is_verified,
    name: p.name,
    country: p.country,
    nationality: p.nationality ?? null,
    profile_photo_file_url: photo?.profile_photo_file_url ?? p.company_details?.logo_file_url ?? null,
    profile_photo_file_key: photo?.profile_photo_file_key ?? p.company_details?.logo_file_key ?? null,
    social_media_url: photo?.social_media_url ?? null,
    linkedin_url: photo?.linkedin_url ?? `https://www.linkedin.com/company/${pp.slug}`,
  };
  return profile;
});

// ── Agreement (e-signature) ─────────────────────────────────────────────────

const agreements = new Map<string, PartnerAgreement>();
basePartners.forEach((p, i) => {
  if (i % 5 === 4) return; // a few Advisors have no agreement yet
  const status = pick<PartnerAgreement["status"]>(["completed", "partner_signed", "sent", "completed", "declined", "expired"], i);
  agreements.set(p.id, {
    id: `agr_${p.id}`,
    status,
    docuseal_submission_id: String(880100 + i),
    sent_at: daysAgo(90 - i * 4),
    partner_signed_at: status === "completed" || status === "partner_signed" ? daysAgo(85 - i * 4) : null,
    completed_at: status === "completed" ? daysAgo(84 - i * 4) : null,
    file_key: status === "completed" ? fileKey(p.id, "advisor-agreement.pdf") : null,
    file_url: status === "completed" ? SAMPLE_PDF_URL : null,
  });
});

mock.get("/partners/:id/agreement", ({ params }) => {
  const a = agreements.get(params.id);
  if (!a) return reply(404, { detail: "No agreement has been started for this Advisor.", code: "agreement_not_found" });
  return a;
});

mock.post("/partners/:id/agreement", ({ params }) => {
  const current = agreements.get(params.id);
  if (current && (current.status === "sent" || current.status === "partner_signed")) {
    return reply(409, { detail: "An agreement is already waiting for signature.", code: "agreement_already_pending" });
  }
  const a: PartnerAgreement = {
    id: newId("agr"),
    status: "sent",
    docuseal_submission_id: String(Date.now()).slice(-6),
    sent_at: nowIso(),
    partner_signed_at: null,
    completed_at: null,
    file_key: null,
    file_url: null,
  };
  agreements.set(params.id, a);
  return reply(201, a);
});

// ── Commission statement (partner "Commission tracker") ─────────────────────
// Built from the finance module's commission rows so amounts/states match the
// admin finance queue. Rows are attributed across the agency team (display
// only) so the member filter has something to show.

mock.get("/partners/statement", ({ query }) => {
  const team = [CURRENT_PARTNER.id, ...membersOf(CURRENT_PARTNER.id).map((m) => m.partner_id)];
  let rows: PartnerStatementItem[] = APPLICATIONS.filter((a) => a.partner.id === CURRENT_PARTNER.id)
    .map((app, i) => {
      const row = getCommissionStatementRow(app.id);
      if (!row) return null;
      const owner = team[i % team.length];
      // One evolving figure: agreed -> pay-in amount -> paid amount.
      const amount = row.paid_amount ?? row.received_amount ?? row.commission_amount;
      return {
        application_commission_id: row.application_commission_id,
        application_id: row.application_id,
        reference: row.reference,
        student_name: row.student_name,
        partner_id: owner,
        partner_name: partners.find(owner)?.name ?? row.partner_name,
        university_name: row.university_name,
        program_name: row.program_name,
        created_at: row.created_at,
        commission_amount: amount,
        commission_currency: row.paid_currency ?? row.received_currency ?? row.commission_currency,
        waiting_on: row.waiting_on,
        since_date: dateOnly(row.last_fact_date ?? row.created_at),
        payout_reference: row.payout_reference,
      };
    })
    .filter(Boolean);
  if (query.waiting_on) rows = rows.filter((r) => r.waiting_on === query.waiting_on);
  if (query.member_partner_id) rows = rows.filter((r) => r.partner_id === query.member_partner_id);
  return pageOf(rows, query, 20);
});

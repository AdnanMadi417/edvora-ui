import type { AgencyMember } from "features/agency-members/types";

export interface IndividualDetails {
  id_document_file_key: string | null;
  id_document_file_url: string | null;
  background: string | null;
  social_media_url: string | null;
  linkedin_url: string | null;
  date_of_birth?: string | null;
  passport_number?: string;
  profile_photo_file_key?: string | null;
  profile_photo_file_url?: string | null;
  passport_photo_file_key?: string | null;
  passport_photo_file_url?: string | null;
}

export interface CompanyDetails {
  company_name: string;
  website_url: string;
  company_registration_doc_file_key: string;
  company_registration_doc_file_url: string;
  contact_id_document_file_key: string;
  contact_id_document_file_url: string;
  date_of_birth?: string | null;
  passport_number?: string;
  logo_file_key?: string | null;
  logo_file_url?: string | null;
  passport_photo_file_key?: string | null;
  passport_photo_file_url?: string | null;
}

/** An account manager with shared (non-primary) access to a partner — UBX-324. */
export interface AdditionalManager {
  id: string;
  name: string | null;
  email: string;
}

export type Partner = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  type: string;
  country: string;
  nationality?: string | null;
  phone: string;
  is_verified: boolean;
  is_active: boolean;
  assigned_manager_id: string;
  assigned_manager_name: string;
  additional_managers?: AdditionalManager[];
  individual_details: IndividualDetails | null;
  company_details: CompanyDetails | null;
  created_at: string;
  updated_at: string;
  last_login: string | null;
};

export interface AgencyMembership {
  agency_id: string;
  agency_name: string;
}

export interface PartnerDetails {
  id: string;
  user_id: string;
  name: string;
  email: string;
  type: string;
  country: string;
  nationality?: string | null;
  phone: string;
  is_active: boolean;
  is_verified: boolean;
  assigned_manager_id: string | null;
  assigned_manager_name: string | null;
  additional_managers?: AdditionalManager[];
  individual_details: IndividualDetails | null;
  company_details: CompanyDetails | null;
  created_at: string | null;
  updated_at: string | null;
  last_login: string | null;
  agency_role: string | null;
  agency_membership: AgencyMembership | null;
  agency_members?: AgencyMember[] | null;
  /** null for agency partners — public profiles are individual-only in V1. */
  public_profile?: PartnerPublicProfileAdminView | null;
}

export interface CreatePartnerPayload {
  name: string;
  email: string;
  password: string;
  is_active: boolean;
  type: string;
}

export interface UpdatePartnerPayload {
  name: string;
  email: string;
  password?: string;
  is_active: boolean;
  type: string;
  country: string;
  nationality?: string | null;
  phone: string;
  assigned_manager_id: string;
  individual_details?: Partial<IndividualDetails>;
  company_details?: Partial<CompanyDetails>;
  /** Partial — send only the fields being changed. 404s
   *  (public_profile_not_found) if sent for an agency partner. */
  public_profile?: UpdatePartnerPublicProfilePayload;
}

export type AssignManagerPayload = {
  manager_id: string;
};

/** Response of the per-partner add/remove additional-manager endpoints (UBX-324). */
export interface AdditionalManagersResult {
  partner_id: string;
  assigned_manager_id: string | null;
  additional_managers: AdditionalManager[];
}

export interface AccountManagerPartnerIndividualDetails {
  date_of_birth: string | null;
  passport_number: string | null;
  profile_photo_file_key: string | null;
  profile_photo_file_url: string | null;
  passport_photo_file_key: string | null;
  passport_photo_file_url: string | null;
  id_document_file_key: string | null;
  id_document_file_url: string | null;
  background: string | null;
  social_media_url: string | null;
  linkedin_url: string | null;
}

export type AccountManagerPartnerListItem = {
  id: string;
  name: string | null;
  email: string;
  type: "individual" | "agency";
  country: string;
  phone: string;
  is_verified: boolean;
  is_active: boolean;
  applications_count: number;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  /** True when the signed-in manager reaches this partner through a share, not as primary — UBX-324. */
  is_shared?: boolean;
};

export type AccountManagerPartnerDetails = {
  id: string;
  name: string | null;
  email: string;
  type: "individual" | "agency";
  country: string;
  nationality?: string | null;
  phone: string;
  is_verified: boolean;
  is_active: boolean;
  individual_details: AccountManagerPartnerIndividualDetails | null;
  company_details: CompanyDetails | null;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  agency_role?: string | null;
  agency_membership?: AgencyMembership | null;
  agency_members?: AgencyMember[] | null;
};

// GET /partners/public/{slug} — unauthenticated. Deliberately a small,
// separate shape from `Partner`: this is only what the partner has chosen
// to publish, not the full admin-facing record. A sub-feature — expect
// more fields (stats, specializations, etc.) as later endpoints land;
// don't widen this to match the full `Partner` type.
//
// UBX-317 integration notes:
// - display_name is the public name; fall back to `name` when null.
// - whatsapp_number is raw digits, no formatting — build the wa.me link
//   and prefilled message client-side (see PartnerPublicProfile.tsx).
// - is_verified is a bare boolean, granted automatically on a student's
//   e-visa approval and never revoked — there's no admin control for it.
// - country/nationality: the integration guide claims these are already
//   resolved to full names (e.g. "Malaysia"), but the live endpoint
//   returned a raw ISO-2 code ("IN") for real seed data — rendered as-is,
//   not "fixed" to match the guide, since the guide's claim didn't hold
//   up against the real response.
export interface PublicPartnerProfile {
  slug: string;
  display_name: string | null;
  bio: string | null;
  whatsapp_number: string | null;
  countries_supported: string[] | null;
  languages: string[];
  is_verified: boolean;
  name: string;
  country: string | null;
  nationality: string | null;
  profile_photo_file_url: string | null;
  profile_photo_file_key: string | null;
  social_media_url: string | null;
  linkedin_url: string | null;
}

// The `public_profile` object embedded in GET/PUT /admin/partners/{id},
// GET /admin/partners (list items), and GET/PUT /partners/profile (the
// partner's own self-service endpoint — read-only there, no public_profile
// field in that endpoint's own request body). Deliberately a different,
// smaller shape from PublicPartnerProfile: no name/country/nationality/
// photo/social links (those are "public only" per the integration guide),
// but does carry the admin-only slug/publish/id fields the public endpoint
// never returns. null for agency partners — V1 profiles are individual-only.
export interface PartnerPublicProfileAdminView {
  id: string;
  partner_id: string;
  slug: string;
  display_name: string | null;
  bio: string | null;
  whatsapp_number: string | null;
  countries_supported: string[] | null;
  /** UUIDs, not names — there's no languages-list endpoint yet to resolve
   *  these against, so no language editor exists in the admin form. */
  language_ids: string[];
  is_published: boolean;
  is_verified: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

// PUT /admin/partners/{id} — send only the fields being changed, as a
// `public_profile` sub-object alongside (or instead of) top-level partner
// fields; both apply in one transaction. is_verified is deliberately
// absent — it's granted automatically, never admin-set.
export interface UpdatePartnerPublicProfilePayload {
  slug?: string;
  display_name?: string;
  bio?: string;
  whatsapp_number?: string;
  countries_supported?: string[];
  language_ids?: string[];
  is_published?: boolean;
}

export interface UpdatePartnerProfilePayload {
  name?: string;
  type?: string;
  country?: string;
  nationality?: string | null;
  phone?: string;
  individual_details?: Partial<IndividualDetails>;
  company_details?: Partial<CompanyDetails>;
}

// ── Pending partner registration OTPs ────────────────────────────────────────
// GET /admin/partners/register/pending-otps — a registration that hasn't
// completed email verification yet, so no partner/user row exists for it at
// all. Distinct from a Partner awaiting admin review (which already has a
// full account, just not activated).

export type RegistrationOtpProgress =
  | "otp_pending"
  | "otp_expired"
  | "max_resends_reached"
  | "otp_attempts_exhausted"
  | "completed";

export interface PendingRegistrationOtp {
  email: string;
  full_name: string | null;
  company_name: string | null;
  partner_type: "individual" | "agency" | null;
  created_at: string;
  expires_at: string;
  resend_count: number;
  attempt_count: number;
  is_used: boolean;
  progress: RegistrationOtpProgress;
}

export interface GetPendingRegistrationOtpsParams {
  search?: string;
  progress?: RegistrationOtpProgress;
  partner_type?: "individual" | "agency";
  page?: number;
  page_size?: number;
}

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

export interface UpdatePartnerProfilePayload {
  name?: string;
  type?: string;
  country?: string;
  nationality?: string | null;
  phone?: string;
  individual_details?: Partial<IndividualDetails>;
  company_details?: Partial<CompanyDetails>;
}

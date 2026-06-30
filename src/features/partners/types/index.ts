export interface IndividualDetails {
  id_document_file_key: string;
  id_document_file_url: string;
  background: string;
  social_media_url: string;
  linkedin_url: string;
}

export interface CompanyDetails {
  company_name: string;
  website_url: string;
  company_registration_doc_file_key: string;
  company_registration_doc_file_url: string;
  contact_id_document_file_key: string;
  contact_id_document_file_url: string;
}

export type Partner = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  type: string;
  country: string;
  phone: string;
  is_verified: boolean;
  is_active: boolean;
  assigned_manager_id: string;
  assigned_manager_name: string;
  individual_details: IndividualDetails | null;
  company_details: CompanyDetails | null;
};

export interface PartnerDetails {
  id: string;
  user_id: string;
  name: string;
  email: string;
  type: string;
  country: string;
  phone: string;
  is_active: boolean;
  is_verified: boolean;
  assigned_manager_id: string;
  assigned_manager_name: string;
  individual_details: IndividualDetails | null;
  company_details: CompanyDetails | null;
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
  phone: string;
  is_verified: boolean;
  assigned_manager_id: string;
  individual_details?: Partial<IndividualDetails>;
  company_details?: Partial<CompanyDetails>;
}

export type AssignManagerPayload = {
  manager_id: string;
};

export interface UpdatePartnerProfilePayload {
  name?: string;
  type?: string;
  country?: string;
  phone?: string;
  individual_details?: Partial<IndividualDetails>;
  company_details?: Partial<CompanyDetails>;
}

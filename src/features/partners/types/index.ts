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
}

export type AssignManagerPayload = {
  manager_id: string;
};

export interface UpdatePartnerProfilePayload {
  type?: string;
  country?: string;
  phone?: string;
}

export interface AssignedPartner {
  id: string;
  name: string;
}

export interface AccountManager {
  id: string;
  name: string;
  email: string;
  assigned_partners_count: string;
  assigned_partners: AssignedPartner[];
  is_active: boolean;
}

export interface CreateAccountManagerPayload {
  name: string;
  email: string;
  password: string;
  is_active: boolean;
}

export interface EditAccountManagerPayload {
  name: string;
  email: string;
  password?: string;
  is_active: boolean;
}

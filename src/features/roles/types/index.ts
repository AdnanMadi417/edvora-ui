export interface Role {
  id: number;
  code: string;
  name: string;
  is_system: boolean;
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  description: string;
}

export interface CreateRolePayload {
  code: string;
  name: string;
}

export interface UpdateRolePayload {
  name: string;
}

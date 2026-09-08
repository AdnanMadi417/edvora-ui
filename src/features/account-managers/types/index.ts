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

/**
 * Only "move" exists today (source loses the partners, target gains them).
 * Reserved so a future share/copy can reuse the same request and UI entry point.
 */
export type TransferPartnersMode = "move";

export interface TransferPartnersPayload {
  /** Manager that receives the partners; null unassigns them. */
  target_manager_id: string | null;
  /** Optional subset of partner IDs; omit to move every partner of the source manager. */
  partner_ids?: string[];
  mode?: TransferPartnersMode;
}

export interface TransferPartnersResult {
  source_manager_id: string;
  target_manager_id: string | null;
  /** Standalone partners + agencies moved (agency members are folded into their agency). */
  moved_partners_count: number;
  /** Agency members carried along because their agency moved. */
  moved_agency_members_count: number;
  moved_partner_ids: string[];
}

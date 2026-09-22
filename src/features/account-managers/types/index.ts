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
  /** Partners this manager reaches through a share (additional manager), not as primary — UBX-324. */
  shared_partners_count?: number;
  shared_partners?: AssignedPartner[];
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
 * "move": the source manager loses the partners and the target becomes their
 * primary manager. "copy": the source keeps them and the target is added as an
 * additional manager with identical access (UBX-324) — a snapshot, later
 * assignments are not mirrored.
 */
export type TransferPartnersMode = "move" | "copy";

export interface TransferPartnersPayload {
  /** Manager that receives the partners; null unassigns them (move only). */
  target_manager_id: string | null;
  /** Optional subset of partner IDs; omit to act on every partner of the source manager. */
  partner_ids?: string[];
  mode?: TransferPartnersMode;
}

export interface TransferPartnersResult {
  mode: TransferPartnersMode;
  source_manager_id: string;
  target_manager_id: string | null;
  /** mode=move: standalone partners + agencies moved (agency members are folded into their agency). */
  moved_partners_count: number;
  /** mode=move: agency members carried along because their agency moved. */
  moved_agency_members_count: number;
  moved_partner_ids: string[];
  /** mode=copy: partners that received a new additional-manager link. */
  shared_partners_count: number;
  shared_agency_members_count: number;
  /** mode=copy: partners skipped because the target already had access. */
  already_shared_count: number;
  shared_partner_ids: string[];
}

export interface UnsharePartnersPayload {
  /** Manager whose shared access to the source manager's partners is removed. */
  target_manager_id: string;
  partner_ids?: string[];
}

export interface UnsharePartnersResult {
  source_manager_id: string;
  target_manager_id: string;
  unshared_partners_count: number;
  unshared_agency_members_count: number;
  unshared_partner_ids: string[];
}

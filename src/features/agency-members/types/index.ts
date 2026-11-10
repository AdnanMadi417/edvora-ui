import type { IndividualDetails } from "features/partners/types";

export interface AgencyMember {
  id: string;
  partner_id: string;
  user_id: string;
  name: string;
  email: string;
  status: number;
  is_active: boolean;
  commission_visible: boolean;
  commission_display_percentage: number;
  created_at: string;
}

export interface AgencyMemberDetails extends AgencyMember {
  country?: string;
  nationality?: string;
  phone?: string;
  last_login?: string | null;
  individual_details?: IndividualDetails;
}

export type InvitationProgress =
  | "completed"
  | "link_expired"
  | "otp_expired"
  | "otp_pending"
  | "pending_profile"
  | "superseded";

export interface AgencyInvitation {
  id: string;
  email: string;
  name: string;
  commission_visible: boolean;
  commission_display_percentage: number;
  otp_verified_at: string | null;
  is_used: boolean;
  created_at: string;
  progress: InvitationProgress;
}

export interface InviteAgencyMemberPayload {
  email: string;
  name: string;
  commission_visible: boolean;
  /** Must be omitted entirely (not 0) when commission_visible is false. */
  commission_display_percentage?: number;
}

export interface UpdateMemberCommissionPayload {
  commission_visible: boolean;
  /** Must be omitted entirely (not 0) when commission_visible is false. */
  commission_display_percentage?: number;
}


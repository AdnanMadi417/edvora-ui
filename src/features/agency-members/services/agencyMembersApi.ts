import api from "lib/useApi";
import Cookies from "js-cookie";
import type {
  AgencyMember,
  AgencyMemberDetails,
  AgencyInvitation,
  InviteAgencyMemberPayload,
  UpdateMemberCommissionPayload,
} from "../types";

const authHeader = () => {
  const token = Cookies.get("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const agencyMembersApi = {
  listMembers: (params?: {
    search?: string;
    is_active?: boolean;
    commission_visible?: boolean;
    page?: number;
    page_size?: number;
  }) =>
    api.get<{ items: AgencyMember[]; total: number; page: number; page_size: number }>(
      "/partners/agency/members",
      { params, headers: authHeader() }
    ),

  getMember: (memberPartnerId: string) =>
    api.get<AgencyMemberDetails>(`/partners/agency/members/${memberPartnerId}`, {
      headers: authHeader(),
    }),

  updateCommission: (memberPartnerId: string, payload: UpdateMemberCommissionPayload) =>
    api.patch<AgencyMember>(
      `/partners/agency/members/${memberPartnerId}/commission`,
      payload,
      { headers: authHeader() }
    ),

  suspend: (memberPartnerId: string) =>
    api.patch<AgencyMember>(`/partners/agency/members/${memberPartnerId}/suspend`, undefined, {
      headers: authHeader(),
    }),

  reactivate: (memberPartnerId: string) =>
    api.patch<AgencyMember>(`/partners/agency/members/${memberPartnerId}/reactivate`, undefined, {
      headers: authHeader(),
    }),

  resendWelcomeEmail: (memberPartnerId: string) =>
    api.post<{ member_partner_id: string; sent_at: string; message: string }>(
      `/partners/agency/members/${memberPartnerId}/resend-welcome-email`,
      undefined,
      { headers: authHeader() }
    ),

  listInvitations: (params?: {
    search?: string;
    progress?: string;
    page?: number;
    page_size?: number;
  }) =>
    api.get<{ items: AgencyInvitation[]; total: number; page: number; page_size: number }>(
      "/partners/agency/invitations",
      { params, headers: authHeader() }
    ),

  inviteMember: (payload: InviteAgencyMemberPayload) =>
    api.post<{ message: string }>("/partners/agency/members/invite", payload, {
      headers: authHeader(),
    }),

  resendSubmissionLink: (email: string) =>
    api.post<{ message: string }>(
      "/partners/agency/members/resend-submission-link",
      { email },
      { headers: authHeader() }
    ),
};

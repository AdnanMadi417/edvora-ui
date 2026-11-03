import api, { publicApi } from 'lib/useApi';
import Cookies from 'js-cookie';
import type {
  CreatePartnerPayload,
  UpdatePartnerPayload,
  AssignManagerPayload,
  AdditionalManagersResult,
  UpdatePartnerProfilePayload,
  PublicPartnerProfile,
  UpdateMyPublicProfilePayload,
} from '../types';

const authHeader = () => {
  const token = Cookies.get('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const partnersApi = {
  list: (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    is_verified?: boolean;
    is_active?: boolean;
    type?: string;
    assigned_manager_id?: string;
    /** Primary OR shared access (UBX-324); assigned_manager_id stays primary-only. */
    manager_id?: string;
  }, signal?: AbortSignal) => api.get('/admin/partners', { params, headers: authHeader(), signal }),

  get: (id: string) =>
    api.get(`/admin/partners/${id}`, { headers: authHeader() }),

  create: (payload: CreatePartnerPayload) =>
    api.post(
      '/admin/partners',
      {
        user: {
          name: payload.name.trim(),
          email: payload.email,
          password: payload.password,
          is_active: payload.is_active,
        },
        type: payload.type,
        country: payload.country.trim(),
      },
      { headers: authHeader() }
    ),

  // Partial by design — the backend is a genuine partial-update endpoint
  // (missing fields are left untouched), so callers like suspend/reactivate
  // should only send the field(s) they actually mean to change.
  update: (id: string, payload: Partial<UpdatePartnerPayload>) =>
    api.put(
      `/admin/partners/${id}`,
      { ...payload, ...(payload.name !== undefined ? { name: payload.name.trim() } : {}) },
      { headers: authHeader() }
    ),

  delete: (id: string) =>
    api.delete(`/admin/partners/${id}`, { headers: authHeader() }),

  assignManager: (id: string, payload: AssignManagerPayload) =>
    api.post(`/admin/partners/${id}/assign-manager`, payload, {
      headers: authHeader(),
    }),

  // Shared (additional, non-primary) managers on one partner — UBX-324.
  addAdditionalManager: (id: string, managerId: string) =>
    api.post<AdditionalManagersResult>(
      `/admin/partners/${id}/additional-managers`,
      { manager_id: managerId },
      { headers: authHeader() }
    ),

  removeAdditionalManager: (id: string, managerId: string) =>
    api.delete<AdditionalManagersResult>(
      `/admin/partners/${id}/additional-managers/${managerId}`,
      { headers: authHeader() }
    ),

  review: (id: string, payload: { decision: "approved" | "rejected"; rejection_reason?: string }) =>
    api.patch(`/admin/partners/${id}/review`, payload, { headers: authHeader() }),

  resendApprovalEmail: (id: string) =>
    api.post(`/admin/partners/${id}/resend-approval-email`, {}, { headers: authHeader() }),

  // Team members are their own row in /admin/partners — a partial update with
  // just is_active is enough to suspend/reactivate one, same endpoint as a
  // whole partner account but without the full-payload fields.
  updateAgencyMemberStatus: (memberPartnerId: string, isActive: boolean) =>
    api.put(`/admin/partners/${memberPartnerId}`, { is_active: isActive }, { headers: authHeader() }),

  adminResendRegistrationOtp: (email: string) =>
    api.post<{ message: string }>('/admin/partners/register/resend-otp', { email }, { headers: authHeader() }),

  // Accessible with an admin OR reviewer token.
  getPendingRegistrationOtps: (params?: {
    search?: string;
    progress?: string;
    partner_type?: string;
    page?: number;
    page_size?: number;
  }) => api.get('/admin/partners/register/pending-otps', { params, headers: authHeader() }),

  // Account-manager-scoped: only the AM's own assigned partners (AM identified via Bearer token)
  listForAccountManager: (params?: { limit?: number; offset?: number; search?: string }, signal?: AbortSignal) =>
    api.get('/account-managers/partners', { params, headers: authHeader(), signal }),

  getForAccountManager: (id: string) =>
    api.get(`/account-managers/partners/${id}`, { headers: authHeader() }),

  getProfile: () =>
    api.get('/partners/profile', { headers: authHeader() }),

  updateProfile: (payload: UpdatePartnerProfilePayload) =>
    api.put('/partners/profile', payload),

  completeOnboarding: () =>
    api.post('/partners/onboarding/complete', {}, { headers: authHeader() }),

  // Public registration endpoints — use publicApi so a logged-in user's token is never sent
  registerInitiate: (payload: Record<string, unknown>) =>
    publicApi.post('/partners/register/initiate', payload),

  registerResendOtp: (email: string) =>
    publicApi.post<{ message: string }>('/partners/register/resend-otp', { email }),

  registerVerifyOtp: (email: string, otp: string) =>
    publicApi.post<{ message: string; reference_id: string }>('/partners/register/verify-otp', { email, otp }),

  // Public profile (UBX-??? — sub-feature, more endpoints expected later).
  getPublicProfile: (slug: string) =>
    publicApi.get<PublicPartnerProfile>(`/partners/public/${slug}`),

  // The signed-in Advisor's own public profile, in any publish state, and
  // their edits to it. ⚠ Pending backend: served by the mock only for now.
  getMyPublicProfile: () =>
    api.get<PublicPartnerProfile>('/partners/profile/public', { headers: authHeader() }),

  updateMyPublicProfile: (payload: UpdateMyPublicProfilePayload) =>
    api.put<PublicPartnerProfile>('/partners/profile/public', payload, { headers: authHeader() }),
};

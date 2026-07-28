import api, { publicApi } from 'lib/useApi';
import Cookies from 'js-cookie';
import type {
  CreatePartnerPayload,
  UpdatePartnerPayload,
  AssignManagerPayload,
  UpdatePartnerProfilePayload,
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
  }) => api.get('/admin/partners', { params, headers: authHeader() }),

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
      },
      { headers: authHeader() }
    ),

  update: (id: string, payload: UpdatePartnerPayload) =>
    api.put(
      `/admin/partners/${id}`,
      { ...payload, name: payload.name.trim() },
      { headers: authHeader() }
    ),

  delete: (id: string) =>
    api.delete(`/admin/partners/${id}`, { headers: authHeader() }),

  assignManager: (id: string, payload: AssignManagerPayload) =>
    api.post(`/admin/partners/${id}/assign-manager`, payload, {
      headers: authHeader(),
    }),

  review: (id: string, payload: { decision: "approved" | "rejected"; rejection_reason?: string }) =>
    api.patch(`/admin/partners/${id}/review`, payload, { headers: authHeader() }),

  // Account-manager-scoped: only the AM's own assigned partners (AM identified via Bearer token)
  listForAccountManager: (params?: { limit?: number; offset?: number; search?: string }) =>
    api.get('/account-managers/partners', { params, headers: authHeader() }),

  getForAccountManager: (id: string) =>
    api.get(`/account-managers/partners/${id}`, { headers: authHeader() }),

  getProfile: () =>
    api.get('/partners/profile', { headers: authHeader() }),

  updateProfile: (payload: UpdatePartnerProfilePayload) =>
    api.put('/partners/profile', payload),

  // Public registration endpoints — use publicApi so a logged-in user's token is never sent
  registerInitiate: (payload: Record<string, unknown>) =>
    publicApi.post('/partners/register/initiate', payload),

  registerResendOtp: (email: string) =>
    publicApi.post<{ message: string }>('/partners/register/resend-otp', { email }),

  registerVerifyOtp: (email: string, otp: string) =>
    publicApi.post<{ message: string; reference_id: string }>('/partners/register/verify-otp', { email, otp }),
};

import api from 'lib/useApi';
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
  list: () =>
    api.get('/admin/partners', { headers: authHeader() }),

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

  getProfile: () =>
    api.get('/partners/profile', { headers: authHeader() }),

  updateProfile: (payload: UpdatePartnerProfilePayload) =>
    api.put('/partners/profile', payload),
};

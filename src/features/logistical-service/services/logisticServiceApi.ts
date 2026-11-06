import { serviceTypesApi } from "../service-types/services";
import api from "lib/useApi";
import Cookies from "js-cookie";
import type {
  ServiceProvider,
  ServiceProviders,
  LogisticLanguages,
  LogisticUniversities,
  LogisticServiceLocations,
  CreateLogisticsProviderPayload,
  EditLogisticsProviderPayload,
} from "../types";

const authHeader = () => {
  const token = Cookies.get("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const logisticServiceApi = {
  providers: {
    list: () =>
      api.get<ServiceProviders>("/logistic-providers", {
        headers: authHeader(),
      }),

    get: (id: string) =>
      api.get<ServiceProvider>(`/logistic-providers/${id}`, {
        headers: authHeader(),
      }),

    create: (payload: CreateLogisticsProviderPayload) =>
      api.post<ServiceProvider>("/logistic-providers", payload, {
        headers: authHeader(),
      }),

    update: (id: string, payload: EditLogisticsProviderPayload) =>
      api.put<ServiceProvider>(`/logistic-providers/${id}`, payload, {
        headers: authHeader(),
      }),

    delete: (id: string) =>
      api.delete(`/logistic-providers/${id}`, { headers: authHeader() }),
  },

  services: serviceTypesApi,

  languages: {
    list: () =>
      api.get<LogisticLanguages>("/logistic-languages", {
        headers: authHeader(),
      }),
  },

  universities: {
    list: () =>
      api.get<LogisticUniversities>("/logistic-universities", {
        headers: authHeader(),
      }),
  },

  locations: {
    list: () =>
      api.get<LogisticServiceLocations>("/logistic-service-locations", {
        headers: authHeader(),
      }),
  },
};

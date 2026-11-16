import api from "lib/useApi";
import type { LanguageCenter, LanguageCenterInput } from "./types";
const path = "/knowledge-hub/language-centers";
export const languageCentersApi = {
  list: () => api.get<{ items: LanguageCenter[] }>(path),
  create: (data: LanguageCenterInput) => api.post<LanguageCenter>(path, data),
  update: (id: string, data: LanguageCenterInput) =>
    api.put<LanguageCenter>(`${path}/${encodeURIComponent(id)}`, data),
  remove: (id: string) => api.delete(`${path}/${encodeURIComponent(id)}`),
};

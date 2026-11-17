import {
  mergePublishedCentres,
  publishedCentreConfiguration,
  updatePublishedCentreBasics,
  removePublishedCentre,
} from "features/language-centre-admin/services/centreWorkspace";
import api from "lib/useApi";
import type { LanguageCenter, LanguageCenterInput } from "./types";
// The app's existing preview sessions are selected by role area. Local workspace
// mutations use the same demo actor; no backend authorization is implied.
const previewActor = () => {
  const area =
    typeof window === "undefined" ? "" : window.location.pathname.split("/")[1];
  const role =
    area === "data-entry"
      ? "data_entry"
      : area === "language-centre-admin"
      ? "language_centre_admin"
      : area;
  return { id: `mock-${role}`, role };
};
const path = "/knowledge-hub/language-centers";
export const languageCentersApi = {
  list: () =>
    api.get<{ items: LanguageCenter[] }>(path).then((response) => ({
      ...response,
      data: {
        ...response.data,
        items: mergePublishedCentres(response.data.items),
      },
    })),
  create: (data: LanguageCenterInput) => api.post<LanguageCenter>(path, data),
  update: async (id: string, data: LanguageCenterInput) => {
    if (publishedCentreConfiguration(id))
      return { data: updatePublishedCentreBasics(previewActor(), id, data) };
    return api.put<LanguageCenter>(`${path}/${encodeURIComponent(id)}`, data);
  },
  remove: async (id: string) => {
    if (publishedCentreConfiguration(id)) {
      removePublishedCentre(previewActor(), id);
      return { data: {} };
    }
    return api.delete(`${path}/${encodeURIComponent(id)}`);
  },
};

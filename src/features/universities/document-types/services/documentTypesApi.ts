import api from "lib/useApi";

import type { SetStaticTemplatePayload } from "../types";
export type { SetStaticTemplatePayload } from "../types";

export const documentTypesApi = {
  list: (params: Record<string, string | boolean> = {}) =>
    api.get("/document-types", { params }),
  setStaticTemplate: (
    documentTypeId: string,
    payload: SetStaticTemplatePayload
  ) => api.patch(`/document-types/${documentTypeId}/static-template`, payload),
};

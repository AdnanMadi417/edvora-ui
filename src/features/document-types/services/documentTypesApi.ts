import api from "lib/useApi";

export interface SetStaticTemplatePayload {
  file_key: string;
  file_url: string;
}

export const documentTypesApi = {
  setStaticTemplate: (documentTypeId: string, payload: SetStaticTemplatePayload) =>
    api.patch(`/document-types/${documentTypeId}/static-template`, payload),
};

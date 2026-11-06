import api from "lib/useApi";
import Cookies from "js-cookie";
import type { FieldOfStudyPayload } from "../types";
const config = () => {
  const token = Cookies.get("token");
  return { headers: token ? { Authorization: `Bearer ${token}` } : {} };
};
const path = "/knowledge-hub/fields-of-study";
export const fieldsOfStudyApi = {
  list: () => api.get(path, config()),
  create: (data: FieldOfStudyPayload) => api.post(path, data, config()),
  update: (id: string, data: FieldOfStudyPayload) =>
    api.put(`${path}/${id}`, data, config()),
  delete: (id: string) => api.delete(`${path}/${id}`, config()),
};

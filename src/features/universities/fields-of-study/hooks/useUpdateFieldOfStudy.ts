import { useState } from "react";
import { fieldsOfStudyApi } from "../services";
import { parseApiError } from "utils/parseApiError";

export type UpdateFieldOfStudyPayload = {
  name: string;
  is_active: boolean;
};

export function useUpdateFieldOfStudy(fieldId: string) {
  const [fieldLoading, setLoading] = useState<boolean>(false);
  const [fieldError, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const updateFieldOfStudy = async (data: UpdateFieldOfStudyPayload) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fieldsOfStudyApi.update(fieldId, data);
      setSuccess(true);
      return res.data;
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to update field of study"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateFieldOfStudy, fieldLoading, fieldError, success };
}

import { useState } from "react";
import { fieldsOfStudyApi } from "../services";
import { parseApiError } from "utils/parseApiError";

export function useDeleteField() {
  const [isDeleting, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const deleteField = async (fieldId: string) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await fieldsOfStudyApi.delete(fieldId);
      setSuccess(true);
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to delete field of study"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteField, isDeleting, error, success };
}

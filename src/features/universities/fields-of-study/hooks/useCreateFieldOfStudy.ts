import { useState } from "react";
import { fieldsOfStudyApi } from "../services";
import { parseApiError } from "utils/parseApiError";

export type CreateFieldOfStudyPayload = {
  name: string;
  is_active: boolean;
};

export function useCreateFieldOfStudy() {
  const [fieldLoading, setLoading] = useState<boolean>(false);
  const [fieldError, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const CreateFieldOfStudy = async (data: CreateFieldOfStudyPayload) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fieldsOfStudyApi.create(data);
      setSuccess(true);
      return res.data;
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to create field of study"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { CreateFieldOfStudy, fieldLoading, fieldError, success };
}

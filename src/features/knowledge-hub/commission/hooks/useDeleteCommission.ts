import { useState } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";
import { parseApiError } from "utils/parseApiError";

export function useDeleteCommission() {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const deleteCommissionType = async (commissionId: string) => {
    setIsDeleting(true);
    setError("");
    try {
      const token = Cookies.get("token");
      await api.delete(`/knowledge-hub/commission-types/${commissionId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to delete commission type"));
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteCommissionType, isDeleting, error };
}

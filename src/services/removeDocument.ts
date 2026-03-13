import Cookies from "js-cookie";
import api from "lib/useApi";

export function useRemoveDocument(
  formData: any,
  setFormData: React.Dispatch<React.SetStateAction<any>>,
  showToast: (msg: string, type: "success" | "error") => void
) {
  const removeDocument = async (document_type_id: string) => {
    const doc = formData.documents?.find(
      (d: any) => d.document_type_id === document_type_id
    );

    if (!doc) return;

    if (doc.file_key) {
      try {
        const token = Cookies.get("token");

        await api.delete("/storage/file", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          data: { file_key: doc.file_key },
        });

        showToast("File deleted from storage successfully", "success");
      } catch (err) {
        console.error(err);
        showToast("Failed to delete file from storage", "error");
        return;
      }
    }

    setFormData((prev: any) => ({
      ...prev,
      documents: prev.documents.filter(
        (d: any) => d.document_type_id !== document_type_id
      ),
    }));
  };

  return { removeDocument };
}
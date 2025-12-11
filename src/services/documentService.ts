// services/documentService.ts
import api from "lib/useApi";
import Cookies from "js-cookie";

export async function getDocumentDownloadUrl(fileKey: string): Promise<string> {
  if (!fileKey) throw new Error("No file key provided");

  const token = Cookies.get("token");
  if (!token) throw new Error("User is not authenticated");

  try {
    const res = await api.post(
      "/storage/presigned-download-url",
      { file_key: fileKey },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.data?.download_url) throw new Error("No download URL returned");

    return res.data.download_url;
  } catch (err: any) {
    console.error("Error fetching document download URL:", err);
    throw err;
  }
}

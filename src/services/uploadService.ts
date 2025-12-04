// services/uploadService.ts
import Cookies from "js-cookie";
import api from "lib/useApi";

export interface PresignedUpload {
  upload_url: string;
  fields: Record<string, string>;
  file_key: string;
  public_url: string;
  expires_in: number;
}

export async function getPresignedUploads(
  files: File[],
  folder = "applications-files"

): Promise<PresignedUpload[]> {
  if (!files || !files.length) return [];

  const token = Cookies.get("token");

  if (!token) {
    throw new Error("No token found. Please log in again.");
  }

  const body = {
    files: files.map((f) => ({
      file_name: f.name,
      content_type: f.type || "application/octet-stream",
      folder,
      max_file_size: f.size,
    })),
  };

  try {
    const { data } = await api.post("/storage/presigned-upload-urls", body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (data.uploads) {
      data.uploads.forEach((p: PresignedUpload, i: number) => {

      });
    }

    return data.uploads || [];
  } catch (err: any) {
    console.error(
      "Error getting presigned URLs:",
      err.response?.data || err.message
    );
    throw err;
  }
}
/**
 * Upload files to DigitalOcean Spaces using presigned URLs
 */
export async function uploadFilesToSpaces(
  files: File[],
  presignedUploads: PresignedUpload[],
  onProgress?: (fileIndex: number, percent: number) => void
): Promise<{ public_url: string; file_key: string }[]> {
  if (!files.length || !presignedUploads.length) return [];

  const results: { public_url: string; file_key: string }[] = [];

  await Promise.all(
    files.map(async (file, i) => {
      const presigned = presignedUploads[i];
      const formData = new FormData();

      Object.entries(presigned.fields).forEach(([key, value]) => {
        formData.append(key, value);
      });

      formData.append("file", file);

      try {
        const response = await fetch(presigned.upload_url, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          console.error(
            `Upload failed for ${file.name} with status ${response.status}`
          );
          throw new Error(`Upload failed with status ${response.status}`);
        }

        results.push({
          public_url: presigned.public_url,
          file_key: presigned.file_key,
        });

        if (onProgress) onProgress(i, 100);
      } catch (err) {
        console.error(`Network or upload error for ${file.name}:`, err);
        throw err;
      }
    })
  );

  return results;
}

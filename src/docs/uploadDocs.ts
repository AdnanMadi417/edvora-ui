// docs/uploadDocs.ts
import Cookies from "js-cookie";

export interface PresignedUpload {
  upload_url: string;
  fields: Record<string, string>;
  file_key: string;
  public_url: string;
  expires_in: number;
}

/**
 * Get presigned URLs from backend
 * @param files Array of File objects
 * @param folder Optional folder name in Spaces
 * @returns Array of PresignedUpload
 */
export async function getPresignedUploads(files: File[], folder = "documents"): Promise<PresignedUpload[]> {
  if (!files || !files.length) return [];

  const token = Cookies.get("token");
  const body = {
    files: files.map((f) => ({
      file_name: f.name,
      content_type: f.type || "application/octet-stream",
      folder,
      max_file_size: f.size,
    })),
  };

  const res = await fetch(`/api/v1/storage/presigned-upload-urls`, {
    method: "POST",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error("Failed to get presigned URLs");

  const data = await res.json();
  return data.uploads || [];
}

/**
 * Upload files to DigitalOcean Spaces using presigned URLs
 * @param files Array of File objects
 * @param presignedUploads Array of presigned upload configs
 * @param onProgress Optional callback: (fileIndex, percent) => void
 * @returns Array of objects { public_url, file_key } in the same order as files
 */
export async function uploadFilesToSpaces(
  files: File[],
  presignedUploads: PresignedUpload[],
  onProgress?: (index: number, progress: number) => void
): Promise<{ public_url: string; file_key: string }[]> {
  if (!files.length || !presignedUploads.length) return [];

  const results: { public_url: string; file_key: string }[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const presigned = presignedUploads[i];

    const formData = new FormData();
    Object.entries(presigned.fields).forEach(([key, value]) => formData.append(key, value));
    formData.append("file", file);

    const publicUrlPromise = new Promise<{ public_url: string; file_key: string }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", presigned.upload_url);

      if (onProgress && xhr.upload) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = (e.loaded / e.total) * 100;
            onProgress(i, pct);
          }
        };
      }

      xhr.onload = () => {
        if ([200, 201, 204].includes(xhr.status)) {
          resolve({ public_url: presigned.public_url, file_key: presigned.file_key });
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(formData);
    });

    const uploaded = await publicUrlPromise;
    results.push(uploaded);
  }

  return results;
}

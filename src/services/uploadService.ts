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

/**
 * Check if a file is allowed (PDF or PNG)
 */
function isAllowedFile(file: File): boolean {
  const allowedMimeTypes = ["application/pdf", "image/png"];
  const allowedExtensions = [".pdf", ".png"];
  const fileName = file.name.toLowerCase();

  return (
    allowedMimeTypes.includes(file.type) ||
    allowedExtensions.some((ext) => fileName.endsWith(ext))
  );
}

/**
 * Remove a file from storage using its file_key
 */
async function removeFileFromStorage(file_key: string) {
  try {
    const token = Cookies.get("token");
    if (!token) throw new Error("No token found");

    await api.delete("/storage/file", {
      headers: { Authorization: `Bearer ${token}` },
      data: { file_key },
    });

    console.log(`File ${file_key} removed successfully.`);
  } catch (err) {
    console.error(`Failed to remove file ${file_key}:`, err);
  }
}

/**
 * Get presigned upload URLs for valid files only
 */
export async function getPresignedUploads(
  files: File[],
  folder = "applications-files"
): Promise<PresignedUpload[]> {
  if (!files || !files.length) return [];

  // Filter invalid files and schedule deletion using file.name
  const invalidFiles = files.filter((f) => !isAllowedFile(f));
  invalidFiles.forEach((f) => {
    console.warn(`Invalid file detected: ${f.name}. Will remove in 6s.`);
    setTimeout(() => removeFileFromStorage(f.name), 6000);
  });

  // Only keep valid files
  const validFiles = files.filter((f) => isAllowedFile(f));
  if (!validFiles.length) {
    throw new Error("No valid files. Only PDF and PNG are allowed.");
  }

  const token = Cookies.get("token");
  if (!token) throw new Error("No token found. Please log in again.");

  const body = {
    files: validFiles.map((f) => ({
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

    return data.uploads || [];
  } catch (err: any) {
    console.error("Error getting presigned URLs:", err.response?.data || err.message);
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
  const results: { public_url: string; file_key: string }[] = [];

  await Promise.all(
    files.map(async (file, i) => {
      // Skip invalid files and schedule deletion
      if (!isAllowedFile(file)) {
        console.warn(`Invalid file detected: ${file.name}. Will remove in 6s.`);
        setTimeout(() => removeFileFromStorage(file.name), 6000);
        return;
      }

      const presigned = presignedUploads[i];
      const formData = new FormData();
      Object.entries(presigned.fields).forEach(([key, value]) => formData.append(key, value));
      formData.append("file", file);

      try {
        const response = await fetch(presigned.upload_url, { method: "POST", body: formData });
        if (!response.ok) throw new Error(`Upload failed for ${file.name}`);

        results.push({ public_url: presigned.public_url, file_key: presigned.file_key });
        if (onProgress) onProgress(i, 100);
      } catch (err) {
        console.error(`Upload error for ${file.name}:`, err);

        setTimeout(() => removeFileFromStorage(presigned.file_key), 6000);
      }
    })
  );

  return results;
}
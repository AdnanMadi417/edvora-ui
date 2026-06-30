import type { PresignedUpload } from "./uploadService";
import { ALLOWED_FILE_TYPES, uploadFilesToSpaces } from "./uploadService";
import { publicApi } from "lib/useApi";

export async function uploadPublicPartnerFile(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<{ file_key: string; file_url: string }> {
  if (!ALLOWED_FILE_TYPES.mimeTypes.includes(file.type)) {
    throw new Error(`Invalid file type. Only ${ALLOWED_FILE_TYPES.label} are allowed.`);
  }

  const { data } = await publicApi.post<PresignedUpload>("/partners/register/upload-url", null, {
    params: { file_name: file.name, content_type: file.type },
  });

  const results = await uploadFilesToSpaces([file], [data], (_i, pct) => onProgress?.(pct));

  if (!results[0]) throw new Error("Upload failed");

  return { file_key: results[0].file_key, file_url: results[0].public_url };
}

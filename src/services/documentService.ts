// services/documentService.ts
import api from "lib/useApi";
import Cookies from "js-cookie";

interface CachedUrl {
  url: string;
  expiresAt: number;
}

// Presigned URLs are valid for `expires_in` seconds (backend default 3600),
// so the same file key is asked for once and reused until shortly before
// expiry. Concurrent callers for one key (the navbar and sidebar both render
// the user's avatar) share a single in-flight request. Before this, every
// mount minted a fresh URL: 17k such calls in one session on 5 Oct (UBX-423).
const DEFAULT_EXPIRES_IN_SECONDS = 3600;
const EXPIRY_SAFETY_MS = 60_000;

const urlCache = new Map<string, CachedUrl>();
const inFlight = new Map<string, Promise<string>>();

/** Test-only / sign-out: forget every cached URL. */
export function clearDocumentUrlCache(): void {
  urlCache.clear();
  inFlight.clear();
}

export async function getDocumentDownloadUrl(fileKey: string): Promise<string> {
  if (!fileKey) throw new Error("No file key provided");

  const cached = urlCache.get(fileKey);
  if (cached && cached.expiresAt - EXPIRY_SAFETY_MS > Date.now()) return cached.url;

  const pending = inFlight.get(fileKey);
  if (pending) return pending;

  const token = Cookies.get("token");
  if (!token) throw new Error("User is not authenticated");

  const request = (async () => {
    try {
      const res = await api.post(
        "/storage/presigned-download-url",
        { file_key: fileKey },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const url: unknown = res.data?.download_url;
      if (typeof url !== "string" || !url) throw new Error("No download URL returned");

      const expiresIn =
        typeof res.data?.expires_in === "number" && res.data.expires_in > 0
          ? res.data.expires_in
          : DEFAULT_EXPIRES_IN_SECONDS;
      urlCache.set(fileKey, { url, expiresAt: Date.now() + expiresIn * 1000 });
      return url;
    } catch (err: any) {
      console.error("Error fetching document download URL:", err);
      throw err;
    } finally {
      inFlight.delete(fileKey);
    }
  })();

  inFlight.set(fileKey, request);
  return request;
}

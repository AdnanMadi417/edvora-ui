import Cookies from "js-cookie";
import { mock, httpError } from "../router";
import { newId, pick, placeholderImage, SAMPLE_PDF_URL } from "../db";
import { applications, programDetail } from "./applications.data";
import { universityPaymentMethods } from "./universities";

// Cross-cutting endpoints: the signed-in user, storage (presigned uploads,
// downloads, deletes), public partner uploads and the visa payment methods an
// application's Institution accepts.

// UI-only mode has no sign-in, but documentService/uploadService refuse to
// call the API without a "token" cookie. Plant a dummy one in the browser.
if (typeof document !== "undefined" && !Cookies.get("token")) {
  Cookies.set("token", "mock-ui-token", { sameSite: "lax" });
}

// ---- Current user ----------------------------------------------------------

mock.get("/auth/me", () => ({
  id: "usr_admin_001",
  partner_id: null,
  name: "Nur Aisyah Binti Kamal",
  email: "aisyah.kamal@unibexs.com",
  role: "admin",
  has_completed_onboarding: true,
  agency_role: null,
  agency_membership: null,
}));

// ---- Storage ---------------------------------------------------------------

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|svg)$/i;
const isImageKey = (key: string) => IMAGE_EXT.test(key.split("?")[0]);
const safeName = (name: string) => name.replace(/[^\w.-]+/g, "_");

/** A viewable URL for a stored file: initials image for images, the sample PDF otherwise. */
export function mockFileUrl(fileKey: string) {
  if (!isImageKey(fileKey)) return SAMPLE_PDF_URL;
  const base = fileKey.split("/").pop()?.replace(IMAGE_EXT, "").replace(/[_-]+/g, " ") || "File";
  return placeholderImage(base, pick(["#0348D1", "#7C3AED", "#059669", "#D97706", "#0891B2"], base.length));
}

function presignedUpload(fileName: string, folder: string) {
  const file_key = `${folder}/${newId("file")}-${safeName(fileName || "upload.pdf")}`;
  return {
    upload_url: "/api/mock-upload",
    fields: { key: file_key, "Content-Type": "application/octet-stream" },
    file_key,
    public_url: mockFileUrl(file_key),
    expires_in: 3600,
  };
}

mock.post("/storage/presigned-upload-urls", ({ body }) => {
  const files: { file_name: string; folder?: string }[] = body?.files ?? [];
  if (!files.length) throw httpError(422, "No files provided. Choose a file and try again.");
  return { uploads: files.map((f) => presignedUpload(f.file_name, f.folder || "applications-files")) };
});

mock.post("/storage/presigned-upload-url", ({ body, query }) => {
  const name = body?.file_name ?? query.file_name ?? "upload.pdf";
  return presignedUpload(name, body?.folder ?? query.folder ?? "applications-files");
});

const download = (fileKey: unknown) => {
  if (!fileKey || typeof fileKey !== "string") throw httpError(422, "No file key provided. Select a file and try again.");
  return { download_url: mockFileUrl(fileKey), file_key: fileKey, expires_in: 3600 };
};

mock.post("/storage/presigned-download-url", ({ body, query }) => download(body?.file_key ?? query.file_key));
mock.get("/storage/presigned-download-url", ({ query }) => download(query.file_key));
mock.post("/storage/presigned-view-url", ({ body, query }) => {
  const res = download(body?.file_key ?? query.file_key);
  return { ...res, view_url: res.download_url };
});

mock.delete("/storage/file", ({ body, query }) => ({
  success: true,
  file_key: body?.file_key ?? query.file_key ?? null,
  message: "File deleted from storage.",
}));

// Public partner registration uploads (no auth).
mock.post("/partners/register/upload-url", ({ query }) =>
  presignedUpload(String(query.file_name ?? "document.pdf"), "partner-registrations"),
);

// Offer-letter decisions, visa cases and visa payments live in
// applications.ts, next to the application records they change.

// ---- Visa payment methods ----------------------------------------------------

/** The Institution's active payment-method assignments (universities.ts) for an application. */
mock.get("/applications/:id/university-payment-methods", ({ params }) => {
  const app = applications.find(params.id);
  if (!app) throw httpError(404, "Application not found");
  const universityId = programDetail(app.programId).university.id;
  return universityPaymentMethods
    .all()
    .filter((m) => m.university_id === universityId && m.is_active)
    .map((m) => ({ id: m.id, name: m.payment_method_name, instructions: m.instructions, currency: m.currency }));
});

const ILLEGAL_FILENAME_CHARS = /[\\/:*?"<>|]/g;

function sanitizeSegment(segment: string): string {
  return segment.trim().replace(ILLEGAL_FILENAME_CHARS, "").replace(/\s+/g, " ");
}

function firstWords(segment: string, count: number): string {
  return segment.split(" ").filter(Boolean).slice(0, count).join(" ");
}

function getExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex === -1 ? "" : fileName.slice(dotIndex);
}

/**
 * Builds a "{personName} - {docName}.ext" filename, e.g. "John Doe - Passport.pdf".
 * Falls back to the original file name if either part is missing.
 */
export function buildDocumentFileName(personName: string, docName: string, originalFileName: string): string {
  const name = firstWords(sanitizeSegment(personName || ""), 2);
  const doc = firstWords(sanitizeSegment(docName || ""), 3);
  const extension = getExtension(originalFileName);

  if (!name && !doc) return originalFileName;
  const base = [name, doc].filter(Boolean).join(" - ");
  return `${base}${extension}`;
}

/**
 * Returns a new File with the given display name, preserving its content and type.
 */
export function renameFileForUpload(file: File, personName: string, docName: string): File {
  const newName = buildDocumentFileName(personName, docName, file.name);
  return new File([file], newName, { type: file.type, lastModified: file.lastModified });
}

/**
 * Fetches a URL as a blob and triggers a browser "save as" with the given file name,
 * instead of letting the browser/host pick the name (as a plain `window.open` would).
 */
export async function downloadFileAs(url: string, fileName: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to download file");
  const blob = await res.blob();

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

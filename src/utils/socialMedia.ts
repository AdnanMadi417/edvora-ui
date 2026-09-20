// The generic URL validator for LinkedIn/Social Media/Website fields —
// these are plain URL inputs (no platform picker, no fixed-prefix matching):
// any well-formed http(s) URL is accepted.
export function isValidWebsiteUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && Boolean(url.hostname);
  } catch {
    return false;
  }
}

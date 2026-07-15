import { SOCIAL_MEDIA_PLATFORMS } from "constants/lists";

export function isValidWebsiteUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export function buildSocialMediaUrl(platform: string, usernameOrUrl: string): string {
  const trimmed = usernameOrUrl.trim();
  if (!trimmed) return "";

  const meta = SOCIAL_MEDIA_PLATFORMS.find((p) => p.value === platform);
  if (!meta || !meta.prefix) return trimmed;

  const withoutPrefix = trimmed.startsWith(meta.prefix)
    ? trimmed.slice(meta.prefix.length)
    : trimmed.replace(/^@/, "");

  return `${meta.prefix}${withoutPrefix}`;
}

interface ValidateSocialMediaFields {
  platformField: string;
  usernameField: string;
}

export function validateSocialMediaField(
  formData: Record<string, any>,
  { platformField, usernameField }: ValidateSocialMediaFields
): string | undefined {
  const platform = formData[platformField];
  const username = (formData[usernameField] ?? "").trim();

  if (!platform) return "Please select a platform";

  if (platform === "website") {
    if (!username) return "Website URL is required";
    if (!isValidWebsiteUrl(username)) return "Enter a valid URL (e.g. https://yourwebsite.com)";
    return undefined;
  }

  if (!username) return "Username is required";
  return undefined;
}

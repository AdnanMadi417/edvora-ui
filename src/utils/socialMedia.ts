import { SOCIAL_MEDIA_PLATFORMS } from "constants/lists";

export function isValidWebsiteUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function extractHandleForPlatform(prefix: string, absoluteUrl: string): string | null {
  try {
    const prefixUrl = new URL(prefix);
    const valueUrl = new URL(absoluteUrl);

    const expectedHost = prefixUrl.hostname.replace(/^www\./i, "").toLowerCase();
    const actualHost = valueUrl.hostname.replace(/^www\./i, "").toLowerCase();
    if (actualHost !== expectedHost) return null;

    const expectedPath = prefixUrl.pathname;
    const path = valueUrl.pathname.startsWith(expectedPath)
      ? valueUrl.pathname.slice(expectedPath.length)
      : valueUrl.pathname.replace(/^\/@?/, "");

    return path.replace(/\/+$/, "");
  } catch {
    return null;
  }
}

export function buildSocialMediaUrl(platform: string, usernameOrUrl: string): string {
  const trimmed = usernameOrUrl.trim();
  if (!trimmed) return "";

  const meta = SOCIAL_MEDIA_PLATFORMS.find((p) => p.value === platform);
  if (!meta || !meta.prefix) return trimmed;

  if (!/^https?:\/\//i.test(trimmed)) {
    // Not a URL at all — leave it as typed instead of silently wrapping it in this
    // platform's prefix. A bare handle is no longer auto-promoted into a fake profile
    // URL; validation below is what catches and rejects this case.
    return trimmed.replace(/\s+/g, "");
  }

  const handle = extractHandleForPlatform(meta.prefix, trimmed);
  // Pasted a full URL for a different site entirely — keep it as-is rather than
  // wrapping it in this platform's prefix, which would double up into garbage.
  if (handle === null) return trimmed.replace(/\s+/g, "");
  return `${meta.prefix}${handle.replace(/\s+/g, "")}`;
}

export function isValidPlatformUrl(platform: string, value: string): boolean {
  const meta = SOCIAL_MEDIA_PLATFORMS.find((p) => p.value === platform);
  if (!meta || !meta.prefix) return isValidWebsiteUrl(value);
  if (!/^https?:\/\//i.test(value)) return false;

  // Reject a bare-domain URL (e.g. "https://www.linkedin.com/in/") — the host
  // matches, but there's no actual profile handle after the prefix.
  const handle = extractHandleForPlatform(meta.prefix, value);
  return handle !== null && handle.length > 0;
}

export function parseSocialMediaUrl(url: string): { platform: string; username: string } {
  const trimmed = (url ?? "").trim();
  if (!trimmed) return { platform: "", username: "" };

  for (const p of SOCIAL_MEDIA_PLATFORMS) {
    if (p.prefix && trimmed.toLowerCase().startsWith(p.prefix.toLowerCase())) {
      return { platform: p.value, username: trimmed.slice(p.prefix.length) };
    }
  }

  return { platform: "website", username: trimmed };
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

  if (!username) return "Profile URL is required";
  if (!isValidPlatformUrl(platform, username)) {
    const meta = SOCIAL_MEDIA_PLATFORMS.find((p) => p.value === platform);
    return `Enter a valid ${meta?.label ?? "profile"} URL (e.g. ${meta?.prefix}yourname)`;
  }
  return undefined;
}

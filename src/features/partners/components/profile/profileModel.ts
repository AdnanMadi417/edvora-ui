import type {
  AdvisorContactChannel,
  AdvisorProfileFaq,
  PublicPartnerProfile,
  UpdateMyPublicProfilePayload,
} from "features/partners/types";

/** Everything the Advisor can edit on their profile page, as plain strings. */
export interface AdvisorProfileDraft {
  display_name: string;
  headline: string;
  role_title: string;
  city: string;
  countries_supported: string[];
  intro_video_url: string;
  help_intro: string;
  help_points: string[];
  faqs: AdvisorProfileFaq[];
  contact_channel: AdvisorContactChannel;
  contact_label: string;
  contact_value: string;
}

export const DEFAULT_CONTACT_LABEL = "Contact me";

export function draftFromProfile(p: PublicPartnerProfile): AdvisorProfileDraft {
  const c = p.content;
  return {
    display_name: p.display_name || p.name,
    headline: c?.headline ?? "",
    role_title: c?.role_title ?? "",
    city: c?.city ?? "",
    countries_supported: p.countries_supported ?? [],
    intro_video_url: c?.intro_video_url ?? "",
    help_intro: c?.help_intro ?? p.bio ?? "",
    help_points: c?.help_points ?? [],
    faqs: c?.faqs ?? [],
    contact_channel: c?.contact_channel ?? "whatsapp",
    contact_label: c?.contact_label ?? DEFAULT_CONTACT_LABEL,
    contact_value: c?.contact_value ?? p.whatsapp_number ?? "",
  };
}

const clean = (v: string) => v.trim();

/** Drops empty list rows so a half-typed "Add point" never gets saved. */
export function draftToPayload(d: AdvisorProfileDraft): UpdateMyPublicProfilePayload {
  return {
    display_name: clean(d.display_name),
    countries_supported: d.countries_supported.map(clean).filter(Boolean),
    content: {
      headline: clean(d.headline) || null,
      role_title: clean(d.role_title) || null,
      city: clean(d.city) || null,
      intro_video_url: clean(d.intro_video_url) || null,
      help_intro: clean(d.help_intro) || null,
      help_points: d.help_points.map(clean).filter(Boolean),
      faqs: d.faqs
        .map((f) => ({ question: clean(f.question), answer: clean(f.answer) }))
        .filter((f) => f.question && f.answer),
      contact_channel: d.contact_channel,
      contact_label: clean(d.contact_label) || null,
      contact_value: clean(d.contact_value) || null,
    },
  };
}

/** Field-level problems that block saving; keys match the draft. */
export function validateDraft(d: AdvisorProfileDraft): Partial<Record<"display_name" | "intro_video_url" | "contact_value", string>> {
  const errors: Partial<Record<"display_name" | "intro_video_url" | "contact_value", string>> = {};
  if (!clean(d.display_name)) errors.display_name = "Enter the name students will see.";
  if (clean(d.intro_video_url) && !youtubeEmbedUrl(d.intro_video_url)) errors.intro_video_url = "Paste a YouTube link, for example youtube.com/watch?v=…";
  const value = clean(d.contact_value);
  if (!value) errors.contact_value = d.contact_channel === "link" ? "Enter the link students should open." : "Enter the number students should message.";
  else if (d.contact_channel === "link" && !/^https?:\/\/\S+\.\S+/.test(value)) errors.contact_value = "Enter a full link starting with https://";
  else if (d.contact_channel !== "link" && value.replace(/[^\d]/g, "").length < 8) errors.contact_value = "Enter the number with its country code, for example +60123456789.";
  return errors;
}

/** youtube.com/watch?v=, youtu.be/ and /shorts/ links → privacy-enhanced embed URL. */
export function youtubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\.|^m\./, "");
    let id: string | null = null;
    if (host === "youtu.be") id = u.pathname.slice(1);
    else if (host === "youtube.com") id = u.searchParams.get("v") ?? u.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1] ?? null;
    return id && /^[\w-]{6,}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  } catch {
    return null;
  }
}

/** The contact button's target. WhatsApp gets a short prefilled greeting. */
export function contactHref(channel: AdvisorContactChannel, value: string, advisorName: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (channel === "link") return /^https?:\/\//.test(v) ? v : null;
  const digits = v.replace(/[^\d]/g, "");
  if (!digits) return null;
  if (channel === "telegram") return `https://t.me/+${digits}`;
  const message = `Hi ${advisorName}, I found your profile on Unibexs and I'd like to study abroad.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/** "MY" → "Malaysia"; full names (as some records hold) pass through, first letter capitalised. */
export function placeName(value: string | null | undefined): string | null {
  if (!value) return null;
  const v = value.trim();
  if (/^[A-Za-z]{2}$/.test(v)) {
    try {
      return new Intl.DisplayNames(["en"], { type: "region" }).of(v.toUpperCase()) ?? v.toUpperCase();
    } catch {
      return v.toUpperCase();
    }
  }
  return v.charAt(0).toUpperCase() + v.slice(1);
}

"use client";

import { useEffect, useRef, useState } from "react";
import { BadgeCheck, Check, MessageCircle, Globe2, Languages, Linkedin, Link2, MapPin } from "lucide-react";
import { Tooltip } from "components/ui/tooltip";
import PillButton from "components/ui/buttons/PillButton";
import IconButton from "components/ui/buttons/IconButton";
import SiteFooter from "components/footer/SiteFooter";
import FadeIn from "components/ui/FadeIn";
import { Faq, type FaqItem } from "components/ui/faq";
import type { PublicPartnerProfile } from "features/partners/types";

// Written for the visitor/prospective-student reading this page — a
// different audience from the near-identical FAQ on the partner's own
// self-service view (src/app/partner/public-profile/page.tsx), which
// answers the advisor's own questions about the feature instead.
const VISITOR_FAQ: FaqItem[] = [
  {
    question: "What does the “Verified” badge mean?",
    answer:
      "Verified means Unibexs has confirmed this advisor has successfully supported at least one student through visa approval. It's granted and managed by Unibexs — never self-reported.",
  },
  {
    question: "How do I get in touch?",
    answer:
      "Use the “Chat on WhatsApp” button on this page — it opens a WhatsApp chat with this advisor directly, with a short intro message already filled in.",
  },
  {
    question: "Is this page official?",
    answer:
      "Yes — this profile is hosted and maintained by Unibexs on behalf of the advisor, showing only the details they've chosen to publish.",
  },
  {
    question: "Can I trust the information shown here?",
    answer:
      "This page shows exactly what the advisor has published through Unibexs — nothing more. For anything beyond what's shown here, message them directly.",
  },
];

// Gradient + dot-grid + soft glow, styled after Unibexs's own Facebook cover
// — pure CSS rather than a raster image, so it stays crisp at any banner
// width (the previous small JPG banner had to be replaced for exactly that
// scaling problem).
const BANNER_STYLE = {
  backgroundImage: [
    "radial-gradient(circle at 22% 70%, rgba(255,255,255,0.28), transparent 55%)",
    "radial-gradient(circle, rgba(255,255,255,0.16) 1px, transparent 1.5px)",
    "linear-gradient(135deg, #5b8def 0%, #2f5fd6 42%, #101d4d 100%)",
  ].join(", "),
  backgroundSize: "auto, 18px 18px, auto",
  backgroundRepeat: "no-repeat, repeat, no-repeat",
};

const VERIFIED_EXPLANATION =
  "This advisor has successfully supported at least one student through visa approval. Verification is granted and managed by Unibexs.";
const NOT_VERIFIED_EXPLANATION =
  "This advisor hasn't yet supported a student through visa approval. Verification is granted automatically by Unibexs once they do.";

// countries_supported holds ISO-2 codes (e.g. "MY") — short enough that
// upper-casing them reads as a code, not as shouting. Used only for that
// chip list below.
const countryCode = (code: string | null) => code?.toUpperCase() || null;

// Partner.country/nationality were assumed to be ISO-2 codes too (per the
// UBX-317 integration guide), but real seed data contradicts that — some
// partners have a full word instead (e.g. country "palestine", nationality
// "Palestinian"), inconsistently cased. Upper-casing the whole value reads
// as shouting; leaving "palestine" fully lowercase reads as broken. Just
// capitalize the first letter — "MY"/"PS" (already-uppercase codes) pass
// through unchanged, "palestine" becomes "Palestine".
const asStored = (value: string | null) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : null);

// Per the integration guide: the API deliberately sends only raw digits —
// no link, no message — both are built client-side.
const waLink = (number: string | null, greetingName: string | null) => {
  if (!number) return null;
  const digits = number.replace(/[^\d]/g, "");
  if (!digits) return null;
  const message = `Hi ${greetingName ?? ""}, I found your profile on Unibexs. I'm interested in studying in Malaysia.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
};

interface Props {
  profile: PublicPartnerProfile;
}

// profile_photo_file_url has been seen returning a URL that 403s when this
// page fetches it directly (this endpoint is unauthenticated, so there's no
// token to presign with, unlike PresignedImage elsewhere in the app) — an
// <img> with no error handling then renders as a broken image with its alt
// text wrapping inside the circle. Falls back to the initials avatar on any
// load failure instead, the same as every other broken-photo case.
//
// This page is server-rendered (see app/p/[slug]/page.tsx), so the browser
// starts loading the <img> straight from the SSR'd HTML — often before
// React hydrates and attaches onError. A fast-failing image's error event
// fires and is missed in that window, leaving `failed` stuck at false even
// though the image never loaded. The effect below catches that race by
// checking img.complete/naturalWidth right after mount, in addition to
// onError for failures that happen later (a slower/expired URL, etc.).
function Avatar({ src, alt, initials }: { src: string | null; alt: string; initials: string }) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setFailed(false);
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth === 0) setFailed(true);
  }, [src]);

  if (!src || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
        {initials}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className="h-full w-full rounded-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

/**
 * Renders exactly what GET /partners/public/{slug} returns — nothing more.
 * This is a sub-feature: the profile only shows what the partner has
 * published. Track-record stats, university/program specializations, and
 * a lead-capture form all appear in the eventual design but have no
 * backing endpoint yet — add their sections here once those exist rather
 * than fabricating them now.
 */
export default function PartnerPublicProfile({ profile }: Props) {
  const displayName = profile.display_name || profile.name;
  const initials = displayName?.slice(0, 2).toUpperCase() ?? "??";
  const whatsapp = waLink(profile.whatsapp_number, displayName);
  const country = asStored(profile.country);
  const nationality = asStored(profile.nationality);
  const countriesSupported = profile.countries_supported ?? [];

  // Shown once in the hero and again in the sticky sidebar CTA — each
  // has a different job (hero: first impression; sidebar: stays on screen
  // as the visitor reads the bio/FAQ), not accidental duplication. A
  // function, not a plain element, because the two spots want different
  // widths: natural width in the hero (matching unibexs.com's own "Login"
  // button, which sizes to its text rather than stretching), full width in
  // the narrow sidebar card, where a snug pill would look lost.
  // window.open, not a plain <a>, matching the shared Button component's
  // established use for external links elsewhere (see
  // app/partner/public-profile/page.tsx's "View live profile"). PillButton
  // (not Button) so it's shaped like that same "Login" button — solid
  // brand blue here since this is a primary CTA, not the outline look
  // that component defaults to. WhatsApp's own green is reserved for the
  // icon-only floating button below, where the color itself is what
  // signals "this opens WhatsApp".
  const renderCta = (fullWidth: boolean) =>
    whatsapp && (
      <PillButton
        onClick={() => window.open(whatsapp, "_blank", "noopener,noreferrer")}
        icon={<MessageCircle className="h-4.5 w-4.5" />}
        text="Chat on WhatsApp"
        bgColor="bg-blue-600"
        textColor="text-white"
        borderColor="border-blue-600"
        hoverBgColor="hover:bg-blue-700"
        hoverTextColor="hover:text-white"
        hoverBorderColor="hover:border-blue-700"
        className={`text-sm font-semibold ${fullWidth ? "w-full" : ""}`}
      />
    );

  const verifiedBadgeRow = (
    <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-6 py-4">
      <p className="text-xs text-slate-400">Unibexs</p>
      {profile.is_verified && (
        <Tooltip content={VERIFIED_EXPLANATION} position="left">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
            <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" />
            Unibexs Verified Advisor
          </span>
        </Tooltip>
      )}
    </div>
  );

  const hasAbout = Boolean(profile.bio);
  const hasCountries = countriesSupported.length > 0;
  const hasSocial = Boolean(profile.linkedin_url || profile.social_media_url);

  // Every major section below is spaced pt-16/mt-16 apart — one consistent
  // rhythm end to end, rather than the mix of pt-8/pt-16/mt-12 this had
  // accumulated through incremental edits.
  return (
    <main className="min-h-screen bg-white px-4 py-10">
      {/* Hero — identity only. The one CTA below is the page's first,
          most prominent conversion point. */}
      <div className="mx-auto max-w-6xl">
        <FadeIn className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-28 w-full sm:h-36" style={BANNER_STYLE} role="presentation" />

          <div className="flex flex-col items-center gap-4 border-b border-slate-100 px-6 pb-6 text-center sm:flex-row sm:items-end sm:text-left">
            <div className="-mt-12 h-24 w-24 shrink-0 overflow-hidden rounded-full bg-white p-1 shadow-md sm:-mt-10 sm:h-28 sm:w-28">
              <Avatar
                src={profile.profile_photo_file_url}
                alt={displayName ?? "Advisor"}
                initials={initials}
              />
            </div>

            <div className="min-w-0 pt-2 sm:pb-1">
              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
                <h1 className="text-xl font-bold text-slate-900">{displayName}</h1>
                <Tooltip
                  content={profile.is_verified ? VERIFIED_EXPLANATION : NOT_VERIFIED_EXPLANATION}
                  position="bottom"
                >
                  <span
                    className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                      profile.is_verified ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                    aria-label={profile.is_verified ? "Verified" : "Not verified"}
                  >
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  </span>
                </Tooltip>
              </div>

              <div className="mt-1 flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:justify-start">
                {country && (
                  <p className="flex items-center gap-1.5 text-sm text-slate-500">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    Based in {country}
                    {nationality && nationality !== country ? ` · ${nationality} national` : ""}
                  </p>
                )}

                {profile.languages.length > 0 && (
                  <p className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Languages className="h-3.5 w-3.5 shrink-0" />
                    {profile.languages.join(", ")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {verifiedBadgeRow}
        </FadeIn>
      </div>

      {/* Main content (2/3) + sticky contact sidebar (1/3) — the same
          "profile + persistent contact card" split LinkedIn/Upwork use,
          so the CTA is never more than a glance away while reading. */}
      <div className="mx-auto max-w-6xl grid grid-cols-1 gap-6 pt-16 md:grid-cols-3">
        <div className="md:col-span-2">
          {hasAbout || hasCountries || hasSocial ? (
            <FadeIn className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {hasAbout && (
                <div className="p-6">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">About</p>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{profile.bio}</p>
                </div>
              )}

              {hasCountries && (
                <div className="flex flex-col gap-4 p-6">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <Globe2 className="h-3.5 w-3.5" />
                    Supports students applying to
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {countriesSupported.map((c) => (
                      <span key={c} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {countryCode(c)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {hasSocial && (
                <div className="flex flex-col gap-4 p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Connect</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.linkedin_url && (
                      <a
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                      >
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                      </a>
                    )}
                    {profile.social_media_url && (
                      <a
                        href={profile.social_media_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                      >
                        <Link2 className="h-4 w-4" />
                        Social profile
                      </a>
                    )}
                  </div>
                </div>
              )}
            </FadeIn>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
              This advisor hasn't added any details yet — reach out on WhatsApp to learn more.
            </div>
          )}
        </div>

        {/* Sticky on desktop only — on mobile this stacks below the main
            column, where a "stuck" element wouldn't make sense. */}
        <div className="md:col-span-1">
          <FadeIn delay={0.1} className="md:sticky md:top-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="p-6">
                <p className="text-sm font-semibold text-slate-900">Get in touch</p>
                <p className="mt-1 text-sm text-slate-500">
                  Message {displayName} directly on WhatsApp — no account needed.
                </p>
                <div className="mt-4">{renderCta(true)}</div>
              </div>
              {verifiedBadgeRow}
            </div>
          </FadeIn>
        </div>
      </div>

      <div className="mx-auto max-w-4xl pt-16 text-center">
        <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
          Frequently Asked <span className="text-blue-600">Questions</span>
        </h2>
        <div className="mt-8 text-left">
          <Faq items={VISITOR_FAQ} />
        </div>
      </div>

      <FadeIn>
        <SiteFooter className="mt-16" />
      </FadeIn>

      {/* The one persistent, always-visible touchpoint — a safety net on
          mobile, where the sidebar above isn't sticky. Icon-only so it
          doesn't crowd the page's other WhatsApp CTAs, which already carry
          the label. WhatsApp's actual brand green (#25D366, #128C7E on
          hover) rather than Tailwind's emerald — this button's whole job
          is to be recognized at a glance as "open WhatsApp", so the exact
          brand color matters here in a way it doesn't for the text CTAs
          above (which already say "WhatsApp" and use Unibexs's own blue). */}
      {whatsapp && (
        <IconButton
          onClick={() => window.open(whatsapp, "_blank", "noopener,noreferrer")}
          icon={<MessageCircle className="h-6 w-6" />}
          aria-label="Chat on WhatsApp"
          title="Chat on WhatsApp"
          bgColor="bg-[#25D366]"
          textColor="text-white"
          borderColor="border-transparent"
          hoverTextColor="hover:text-white"
          hoverBorderColor="hover:border-transparent"
          className="fixed bottom-6 right-6 h-14 w-14 !rounded-full shadow-lg hover:bg-[#128C7E]"
        />
      )}
    </main>
  );
}

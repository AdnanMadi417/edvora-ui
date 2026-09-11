import { BadgeCheck, Check, MessageCircle, Globe2, Languages, Linkedin, Link2, MapPin } from "lucide-react";
import { Tooltip } from "components/ui/tooltip";
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
  "This partner has successfully supported at least one student through visa approval. Verification is granted and managed by Unibexs.";
const NOT_VERIFIED_EXPLANATION =
  "This partner hasn't yet supported a student through visa approval. Verification is granted automatically by Unibexs once they do.";

// Partner.country/nationality are stored as ISO-2 codes (e.g. "MY"), which
// don't match the app's `constants/lists` COUNTRIES (lowercase full names —
// a different convention used by the registration form). No ISO-2 -> name
// table exists on the frontend yet, so this shows the raw code rather than
// a lookup that would silently miss for real data. (The UBX-317 integration
// guide claims these arrive pre-resolved to full names — checked against
// the live endpoint and that isn't true for real data, so not "fixed" to
// match a claim the actual response contradicts.)
const countryName = (code: string | null) => code?.toUpperCase() || null;

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
  const country = countryName(profile.country);
  const nationality = countryName(profile.nationality);
  const countriesSupported = profile.countries_supported ?? [];

  // Shown once in the hero and again in the sticky sidebar CTA — each
  // has a different job (hero: first impression; sidebar: stays on screen
  // as the visitor reads the bio/FAQ), not accidental duplication.
  const ctaButton = whatsapp && (
    <a
      href={whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
    >
      <MessageCircle className="h-4.5 w-4.5" />
      Chat on WhatsApp
    </a>
  );

  const verifiedBadgeRow = (
    <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
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

  return (
    <main className="min-h-screen bg-white px-4 py-10">
      {/* Hero — identity only. The one CTA below is the page's first,
          most prominent conversion point. */}
      <div className="mx-auto max-w-6xl">
        <FadeIn className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-28 w-full sm:h-36" style={BANNER_STYLE} role="presentation" />

          <div className="flex flex-col items-center gap-3 border-b border-slate-100 px-6 pb-6 text-center sm:flex-row sm:items-end sm:gap-4 sm:text-left">
            <div className="-mt-12 h-24 w-24 shrink-0 overflow-hidden rounded-full bg-white p-1 shadow-md sm:-mt-10 sm:h-28 sm:w-28">
              {profile.profile_photo_file_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.profile_photo_file_url}
                  alt={displayName ?? "Advisor"}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                  {initials}
                </div>
              )}
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

              <div className="mt-1 flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:gap-3 sm:justify-start">
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

          {ctaButton && <div className="px-6 pt-6">{ctaButton}</div>}
          {verifiedBadgeRow}
        </FadeIn>
      </div>

      {/* Main content (2/3) + sticky contact sidebar (1/3) — the same
          "profile + persistent contact card" split LinkedIn/Upwork use,
          so the CTA is never more than a glance away while reading. */}
      <div className="mx-auto max-w-6xl grid grid-cols-1 gap-6 pt-8 md:grid-cols-3">
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
                <div className="p-6">
                  <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <Globe2 className="h-3.5 w-3.5" />
                    Supports students applying to
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {countriesSupported.map((c) => (
                      <span key={c} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {countryName(c)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {hasSocial && (
                <div className="p-6">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Connect</p>
                  <div className="flex flex-wrap gap-3">
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
                <div className="mt-4">{ctaButton}</div>
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
        <SiteFooter className="mt-12" />
      </FadeIn>

      {/* The one persistent, always-visible touchpoint — a safety net on
          mobile, where the sidebar above isn't sticky. */}
      {whatsapp && (
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-600"
        >
          <MessageCircle className="h-5 w-5 shrink-0" />
          Chat on WhatsApp
        </a>
      )}
    </main>
  );
}

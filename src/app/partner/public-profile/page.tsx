"use client";

import { useState } from "react";
import { Globe2, ExternalLink, Copy, Check, Info } from "lucide-react";
import { usePartnerProfile } from "features/partners/hooks";
import { useToast } from "components/ub/feedback/ToastContext";
import Loading from "components/ub/feedback/Loading";
import PresignedImage from "components/ub/data/PresignedImage";
import Button from "components/ub/core/Button";
import Faq from "components/ub/data/Faq";
import type { FaqItem } from "components/ub/data/Faq";

// Answers reflect exactly how the feature behaves today (UBX-317) — no
// self-editing yet, verification is automatic, no public directory — update
// these if/when that changes rather than letting them drift out of date.
const PROFILE_FAQ: FaqItem[] = [
  {
    question: "Who can see my public profile?",
    answer:
      "Anyone with the link — it's a public page and doesn't require a login. Share it with prospective students so they can learn about you and reach out directly.",
  },
  {
    question: "How do I get the “Verified” badge?",
    answer:
      "Verification is automatic and managed by Unibexs — it's granted the first time a student you've supported gets their e-visa approved, and it never expires or gets revoked. There's nothing to apply for.",
  },
  {
    question: "Can I edit my own profile?",
    answer:
      "Not yet — your bio, photo, WhatsApp number, and other details are set up and maintained by your Unibexs account manager. Reach out to them if you'd like something changed.",
  },
  {
    question: "How do students find my profile?",
    answer:
      "Share your profile link yourself — on WhatsApp, social media, or anywhere else. There's no public directory yet, so your link is currently the only way people discover it.",
  },
];

/**
 * The partner's own view of their public profile.
 *
 * GET /partners/profile now returns `public_profile` (UBX-317) — this page
 * shows the real publish state and, once published, links to the live
 * page. Editing still isn't available here: the write endpoint is
 * admin-only (PUT /admin/partners/{id}), so this stays read-only.
 */
export default function PartnerPublicProfilePage() {
  const { partner, isPartnerLoading } = usePartnerProfile();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  if (isPartnerLoading) return <Loading text="Loading your profile..." />;

  const profile = partner?.public_profile;
  // Relative path — resolved against the current origin by both
  // window.open and (via `new URL`) the clipboard copy below, so this is
  // safe to compute during server render too (no `window` access here).
  const livePath = profile ? `/p/${profile.slug}` : null;

  const handleCopy = async () => {
    if (!livePath) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${livePath}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Failed to copy link.", "error");
    }
  };

  return (
    <div className="mx-auto mt-6 max-w-2xl">
      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="flex items-center gap-4 border-b border-slate-200 px-6 py-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
            <PresignedImage
              fileKey={partner?.individual_details?.profile_photo_file_key ?? undefined}
              alt="Profile"
              className="h-full w-full object-cover"
              fallback={partner?.name ? partner.name.slice(0, 2).toUpperCase() : "NA"}
            />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-slate-900">My Public Profile</h1>
            <p className="truncate text-sm text-slate-500">{partner?.name}</p>
          </div>
        </div>

        {!profile ? (
          // Shouldn't normally happen — this route is gated to individual
          // partners, who always get a profile row at registration — but
          // stay defensive rather than assume.
          <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
              <Globe2 className="h-7 w-7 text-blue-600" />
            </div>
            <p className="max-w-md text-sm text-slate-500">
              Your public profile is set up and managed by the Unibexs team. Once it&apos;s
              published, you&apos;ll be able to view and share it here.
            </p>
          </div>
        ) : (
          <div className="space-y-5 px-6 py-6">
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                  profile.is_published ? "bg-emerald-500" : "bg-amber-400"
                }`}
              />
              <p className="text-sm font-medium text-slate-700">
                {profile.is_published ? "Published — visible to the public" : "Not published yet"}
              </p>
            </div>

            {profile.is_published && livePath && (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  onClick={() => window.open(livePath, "_blank", "noopener,noreferrer")}
                  icon={<ExternalLink className="h-4 w-4" />}
                  text="View live profile"
                  bgColor="bg-blue-600"
                  textColor="text-white"
                  borderColor="border-blue-600"
                  hoverTextColor="hover:text-white"
                  hoverBorderColor="hover:border-blue-700"
                  className="flex-1 hover:bg-blue-700"
                />
                <Button
                  onClick={handleCopy}
                  icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  text={copied ? "Copied!" : "Copy link"}
                  bgColor="bg-white"
                  textColor="text-slate-700"
                  borderColor="border-slate-200"
                  hoverTextColor="hover:text-slate-700"
                  hoverBorderColor="hover:border-slate-300"
                  className="flex-1"
                />
              </div>
            )}

            {profile.bio && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Bio</p>
                <p className="whitespace-pre-line text-sm text-slate-700">{profile.bio}</p>
              </div>
            )}

            {(profile.countries_supported?.length ?? 0) > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Countries supported
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.countries_supported!.map((c) => (
                    <span
                      key={c}
                      className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
              <p className="text-xs text-blue-700">
                This profile is curated by the Unibexs team. Have questions or want something
                changed? Reach out to your account manager.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">
          Frequently Asked <span className="text-blue-600">Questions</span>
        </h2>
        <div className="mt-4">
          <Faq items={PROFILE_FAQ} />
        </div>
      </div>
    </div>
  );
}

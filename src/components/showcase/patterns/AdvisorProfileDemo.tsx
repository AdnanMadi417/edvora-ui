"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import Toggle from "components/ub/forms/choices/Toggle";
import AdvisorProfile from "features/partners/components/profile/AdvisorProfile";
import { draftFromProfile, validateDraft, type AdvisorProfileDraft } from "features/partners/components/profile/profileModel";
import type { PublicPartnerProfile } from "features/partners/types";
import { Demo } from "../Showcase";

export const SAMPLE_ADVISOR_PROFILE: PublicPartnerProfile = {
  slug: "ahmed-al-rashid",
  display_name: "Ahmed Al-Rashid",
  bio: null,
  whatsapp_number: "60123456789",
  countries_supported: ["MY"],
  languages: ["Arabic", "English"],
  is_verified: true,
  name: "Ahmed Al-Rashid",
  country: "MY",
  nationality: "Jordanian",
  profile_photo_file_url: null,
  profile_photo_file_key: null,
  social_media_url: null,
  linkedin_url: null,
  content: {
    headline: "Your trusted guide to studying in Malaysia",
    role_title: "Education Advisor",
    city: "Kuala Lumpur",
    intro_video_url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    help_intro: "I help international students choose the right university and programme, prepare their application and get through admission and the student visa.",
    help_points: ["University and programme selection", "Application preparation and submission", "Student visa guidance", "Pre-arrival and arrival support"],
    faqs: [
      { question: "Do you charge students?", answer: "My guidance is free. Universities pay me when you enrol." },
      { question: "How quickly do you normally respond?", answer: "Usually within a few hours on WhatsApp during the day." },
    ],
    contact_channel: "whatsapp",
    contact_label: "Contact me",
    contact_value: "+60123456789",
    students_enrolled: 2,
    identity_verified: true,
  },
};

export function AdvisorProfileDemo() {
  const [draft, setDraft] = useState<AdvisorProfileDraft>(() => draftFromProfile(SAMPLE_ADVISOR_PROFILE));
  const [editing, setEditing] = useState(false);
  return (
    <Demo
      name="Advisor profile"
      path="features/partners/components/profile/AdvisorProfile.tsx"
      description="The Advisor's public page (/p/[slug]) and its in-place editor (/partner/public-profile): header with verification and enrolment tags, Based in / Languages / Study destinations, one contact button (WhatsApp, Telegram or a link), intro video, How I can help, FAQ and a trust note. The editor shows the same component with fields; Preview flips it read-only."
      code={`<AdvisorProfile profile={profile} draft={draft} editing={!preview} onChange={(patch) => setDraft({ ...draft, ...patch })} errors={validateDraft(draft)} />`}
      props={[
        { name: "profile", type: "PublicPartnerProfile", description: "Read-only facts: photo, languages, country, verification, students enrolled." },
        { name: "draft / onChange", type: "AdvisorProfileDraft / (patch) => void", description: "What the page shows; draftFromProfile builds it, draftToPayload saves it." },
        { name: "editing", type: "boolean", default: "false", description: "Fields become inputs. Empty sections show only while editing." },
        { name: "errors", type: "{ display_name?, intro_video_url?, contact_value? }", description: "From validateDraft." },
      ]}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Toggle checked={editing} onChange={setEditing} label="Edit mode" switchPosition="end" />
        <Link href="/design-system/patterns/advisor-profile" className="inline-flex items-center gap-1.5 text-ub-label-md text-ub-text-link hover:underline">
          Open full page
          <ExternalLink className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
        </Link>
      </div>
      <div className="mx-auto max-w-3xl">
        <AdvisorProfile profile={SAMPLE_ADVISOR_PROFILE} draft={draft} editing={editing} onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))} errors={editing ? validateDraft(draft) : {}} />
      </div>
    </Demo>
  );
}

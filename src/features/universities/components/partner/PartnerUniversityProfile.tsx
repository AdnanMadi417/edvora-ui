"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Award, BookOpen, Calendar, GraduationCap, Landmark, Languages, MapPin } from "lucide-react";
import FadeIn from "components/ub/core/FadeIn";
import PresignedImage from "components/ub/data/PresignedImage";
import Loading from "components/ub/feedback/Loading";
import EmptyData from "components/ub/feedback/EmptyTableData";
import Tabs from "components/ub/navigation/Tabs";
import type { TabItem } from "components/ub/navigation/Tabs";
import { useUniversityDetails } from "features/universities/hooks";

type ProfileTab = "overview" | "campuses";

const PROFILE_TABS: TabItem<ProfileTab>[] = [
  { key: "overview", label: "Overview" },
  { key: "campuses", label: "Campuses" },
];

// Same gradient/dot-grid/glow banner as the university-profile-demo page
// (features/universities/components/public/UniversityPublicProfile.tsx) and
// the partner public profile — one consistent "profile" visual language,
// reused here with real data instead of that page's static preview data.
const BANNER_STYLE = {
  backgroundImage: [
    "radial-gradient(circle at 22% 70%, rgba(255,255,255,0.28), transparent 55%)",
    "radial-gradient(circle, rgba(255,255,255,0.16) 1px, transparent 1.5px)",
    "linear-gradient(135deg, #5b8def 0%, #2f5fd6 42%, #101d4d 100%)",
  ].join(", "),
  backgroundSize: "auto, 18px 18px, auto",
  backgroundRepeat: "no-repeat, repeat, no-repeat",
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface Props {
  id: string;
}

export default function PartnerUniversityProfile({ id }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const { university, branches, universityLoading } = useUniversityDetails(id);

  if (universityLoading) {
    return <Loading text="Loading university details..." />;
  }

  // Hidden universities are data-entry/admin-only and must never reach a
  // partner — this endpoint has no role-based access control of its own
  // (unlike the dedicated partner list endpoint, which excludes them
  // server-side), so enforce it here: treat a hidden university exactly
  // like "not found" rather than rendering its profile.
  if (!university || university.is_hidden) {
    return <EmptyData />;
  }

  const initials = university.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const intakeLabel = (university.intake_months ?? [])
    .slice()
    .sort((a, b) => a - b)
    .map((m) => MONTH_NAMES[m - 1])
    .filter(Boolean)
    .join(", ");

  return (
    <main className="min-h-screen overflow-hidden bg-white mt-6 rounded-2xl border border-slate-200">
      {/* Hero — identity + back-to-list action. No border/rounding of its
          own: it sits flush (no padding gap) against the shared outer
          shell above, which already provides the border — adding a
          second one here would double up against it. */}
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <div className="h-28 w-full sm:h-36" style={BANNER_STYLE} role="presentation" />

          <div className="flex flex-col items-center gap-3 border-b border-slate-100 px-6 pb-6 text-center sm:flex-row sm:items-end sm:gap-4 sm:text-left">
            <div className="-mt-12 h-24 w-24 shrink-0 overflow-hidden rounded-full bg-white p-1 shadow-md sm:-mt-10 sm:h-28 sm:w-28">
              <PresignedImage
                fileKey={university.logo_file_key}
                alt={university.name}
                className="h-full w-full rounded-full object-cover"
                fallback={
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                    {initials}
                  </div>
                }
              />
            </div>

            <div className="min-w-0 pt-2 sm:pb-1">
              <h1 className="text-xl font-bold text-slate-900">{university.name}</h1>
              <div className="mt-1 flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:gap-3 sm:justify-start">
                <p className="flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {university.country}
                </p>
                {university.university_type_name && (
                  <p className="flex items-center gap-1.5 text-sm text-slate-500">
                    <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                    {university.university_type_name}
                  </p>
                )}
                <p className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Landmark className="h-3.5 w-3.5 shrink-0" />
                  {university.is_public ? "Public" : "Private"}
                </p>
              </div>
            </div>
          </div>

          <Tabs<ProfileTab> tabs={PROFILE_TABS} active={activeTab} onChange={setActiveTab} />
        </FadeIn>
      </div>

        <div className="px-4 py-10">

          {/* Main content (2/3) + quick-facts sidebar (1/3). */}
          <div className="mx-auto max-w-6xl grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              {activeTab === "overview" ? (
                <FadeIn key="overview" className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">About</p>
                  {university.description ? (
                    <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{university.description}</p>
                  ) : (
                    <p className="text-sm text-slate-500">No description provided.</p>
                  )}
                </FadeIn>
              ) : (
                <FadeIn key="campuses" className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <MapPin className="h-3.5 w-3.5" />
                    Campuses
                  </p>
                  {branches.length === 0 ? (
                    <p className="text-sm text-slate-500">No campuses listed.</p>
                  ) : (
                    <div className="space-y-2">
                      {branches.map((branch) => (
                        <div
                          key={branch.id}
                          className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
                        >
                          <p className="text-sm font-medium text-slate-900">{branch.name}</p>
                          <p className="text-xs text-slate-500">{branch.location}, {branch.state}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </FadeIn>
              )}
            </div>

            <div className="md:col-span-1">
              <FadeIn delay={0.1} className="md:sticky md:top-6">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="space-y-4 p-6">
                    <p className="text-sm font-semibold text-slate-900">Quick facts</p>

                    <div className="flex items-start gap-2.5">
                      <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400">Intake</p>
                        <p className="text-sm text-slate-700">{intakeLabel || "Contact university"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400">Campuses</p>
                        <p className="text-sm text-slate-700">{branches.length}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Award className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400">Status</p>
                        <p className="text-sm text-slate-700">{university.is_active ? "Active" : "Inactive"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Languages className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400">Language Center</p>
                        <p className="text-sm text-slate-700">{university.has_language_center ? "Yes" : "No"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>

        </div>
    
    </main>
  );
}

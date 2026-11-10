"use client";

import { useId, useState } from "react";
import {
  Award,
  BookOpen,
  Calendar,
  ExternalLink,
  GraduationCap,
  Languages as LanguagesIcon,
  MapPin,
  Users,
} from "lucide-react";
import PillButton from "components/ub/core/buttons/PillButton";
import SiteFooter from "components/ub/navigation/layout/SiteFooter";
import FadeIn from "components/ub/core/motion/FadeIn";
import Faq from "components/ub/data/display/Faq";
import type { FaqItem } from "components/ub/data/display/Faq";
import Tabs, { tabPanelProps, type TabItem } from "components/ub/navigation/controls/Tabs";
import CourseList, { type Course } from "components/ub/data/display/CourseList";

// Same gradient/dot-grid/glow banner as the partner public profile
// (src/features/partners/components/public/PartnerPublicProfile.tsx) —
// one consistent "public profile" visual language across the app, not a
// one-off for partners.
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

type ProfileTab = "overview" | "language-center";

// Typed explicitly (not inferred from an inline array literal) so Tabs'
// generic resolves to ProfileTab rather than widening to plain string,
// which would make `active`/`onChange` below a type error.
const PROFILE_TABS: TabItem<ProfileTab>[] = [
  { key: "overview", label: "Overview" },
  { key: "language-center", label: "Language Center" },
];

export interface UniversityProgram {
  name: string;
  level: string;
  duration: string;
}

export interface UniversityBranch {
  name: string;
  location: string;
  state: string;
}

export interface LanguageCenterLocation {
  name: string;
  area: string;
  state: string;
}

// Not every university runs its own language/pathway center — optional,
// and shown as a second tab on this same page (not a separate page or
// section bolted onto the university's own About/Programs/Campuses),
// since it's a full profile of its own (description, courses, centers,
// quick facts), not just a pricing table. Same Course shape a standalone
// language center profile would use, so this stays a data swap if that
// ever needs to exist as its own thing again.
export interface UniversityLanguageCenter {
  description: string;
  courses: Course[];
  locations: LanguageCenterLocation[];
  student_count: string;
  founded_year: number;
}

// Deliberately a bit wider than the real `University`/`UniversityDetails`
// backend types (src/features/universities/types/index.ts) — this is a
// static design preview with no backing endpoint yet, so fields like
// `programs`, `student_count`, and `website_url` that a real public
// profile would eventually need are modeled here as a preview of that
// shape, not invented permanently. Keep the field names aligned with the
// real types (name/country/description/logo_file_url/intake_months) so
// wiring this to a real endpoint later is a data swap, not a rewrite.
export interface UniversityPublicProfileData {
  name: string;
  country: string;
  university_type_name: string;
  description: string;
  logo_file_url: string | null;
  intake_months: number[];
  website_url: string;
  student_count: string;
  founded_year: number;
  programs: UniversityProgram[];
  branches: UniversityBranch[];
  languageCenter?: UniversityLanguageCenter;
}

const UNIVERSITY_FAQ: FaqItem[] = [
  {
    question: "Is this page official?",
    answer:
      "This page is hosted by Unibexs on behalf of the university, showing programs, campuses, and (where it runs one) its language center as submitted to the platform.",
  },
  {
    question: "How do I apply to a program?",
    answer:
      "Use the “Visit Website” button above to go to the university's official site, or reach out through your Unibexs advisor to start an application.",
  },
  {
    question: "Are the programs listed here complete?",
    answer:
      "This page shows a selection of programs. Contact the university directly, or ask your advisor, for the full list and current intake availability.",
  },
];

const LANGUAGE_CENTER_FAQ: FaqItem[] = [
  {
    question: "How do I enroll in a language center course?",
    answer:
      "Use the “Visit Website” button above, or reach out through your Unibexs advisor to start enrollment.",
  },
  {
    question: "Do course prices ever change?",
    answer:
      "Prices are set by the language center and may change between intakes. Confirm current pricing directly before enrolling.",
  },
];

interface Props {
  university: UniversityPublicProfileData;
}

/**
 * Static design preview for a university public profile — no live data,
 * no backing endpoint (unlike PartnerPublicProfile, which reads a real
 * GET /partners/public/{slug}). Built from the same reusable pieces
 * (FadeIn, Faq, SiteFooter, PillButton, Tabs, banner style) so a
 * university profile reads as the same product as the partner one, not a
 * one-off design.
 */
export default function UniversityPublicProfile({ university }: Props) {
  const hasLanguageCenter = Boolean(university.languageCenter);
  const tabId = useId();
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const showLanguageCenter = hasLanguageCenter && activeTab === "language-center";

  const initials = university.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const intakeLabel = university.intake_months
    .slice()
    .sort((a, b) => a - b)
    .map((m) => MONTH_NAMES[m - 1])
    .filter(Boolean)
    .join(", ");

  const faqItems = hasLanguageCenter ? [...UNIVERSITY_FAQ, ...LANGUAGE_CENTER_FAQ] : UNIVERSITY_FAQ;

  return (
    <main className="min-h-screen bg-white px-4 py-10">
      {/* Hero — identity + the one primary CTA. Shared by both tabs: the
          language center, in this preview, is part of the same
          institution rather than a separate entity with its own hero. */}
      <div className="mx-auto max-w-6xl">
        <FadeIn className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-28 w-full sm:h-36" style={BANNER_STYLE} role="presentation" />

          <div className="flex flex-col items-center gap-3 border-b border-slate-100 px-6 pb-6 text-center sm:flex-row sm:items-end sm:gap-4 sm:text-left">
            <div className="-mt-12 h-24 w-24 shrink-0 overflow-hidden rounded-full bg-white p-1 shadow-md sm:-mt-10 sm:h-28 sm:w-28">
              {university.logo_file_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={university.logo_file_url}
                  alt={university.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                  {initials}
                </div>
              )}
            </div>

            <div className="min-w-0 pt-2 sm:pb-1">
              <h1 className="text-xl font-bold text-slate-900">{university.name}</h1>
              <div className="mt-1 flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:gap-3 sm:justify-start">
                <p className="flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {university.country}
                </p>
                <p className="flex items-center gap-1.5 text-sm text-slate-500">
                  <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                  {university.university_type_name}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center p-6 sm:justify-start">
            <PillButton
              onClick={() => window.open(university.website_url, "_blank", "noopener,noreferrer")}
              icon={<ExternalLink className="h-4.5 w-4.5" />}
              text="Visit Website"
              bgColor="bg-blue-600"
              textColor="text-white"
              borderColor="border-blue-600"
              hoverBgColor="hover:bg-blue-700"
              hoverTextColor="hover:text-white"
              hoverBorderColor="hover:border-blue-700"
              className="text-sm font-semibold"
            />
          </div>

          {hasLanguageCenter && (
            <Tabs
              tabs={PROFILE_TABS}
              active={activeTab}
              onChange={(key: ProfileTab) => setActiveTab(key)}
              variant="underline" idPrefix={tabId} aria-label="Institution sections"
            />
          )}

          <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
            <p className="text-xs text-ub-text-tertiary">Unibexs</p>
            <span className="text-xs font-medium text-slate-400">Design preview — not live data</span>
          </div>
        </FadeIn>
      </div>

      {/* Main content (2/3) + quick-facts sidebar (1/3) — full details for
          whichever tab is active, not a squeezed-in subsection. */}
      <div className="mx-auto max-w-6xl grid grid-cols-1 gap-6 pt-16 md:grid-cols-3" {...(hasLanguageCenter ? tabPanelProps(tabId, activeTab) : {})}>
        {showLanguageCenter && university.languageCenter ? (
          <>
            <div className="md:col-span-2">
              <FadeIn className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="p-6">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">About</p>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
                    {university.languageCenter.description}
                  </p>
                </div>

                <div className="p-6">
                  <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <BookOpen className="h-3.5 w-3.5" />
                    Courses
                  </p>
                  <CourseList courses={university.languageCenter.courses} />
                </div>

                <div className="p-6">
                  <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <MapPin className="h-3.5 w-3.5" />
                    Centers
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {university.languageCenter.locations.map((location) => (
                      <span
                        key={`${location.name}-${location.area}`}
                        className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                      >
                        {location.name} — {location.area}, {location.state}
                      </span>
                    ))}
                  </div>
                </div>
              </FadeIn>
            </div>

            <div className="md:col-span-1">
              <FadeIn delay={0.1} className="md:sticky md:top-6">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="space-y-4 p-6">
                    <p className="text-sm font-semibold text-slate-900">Quick facts</p>

                    <div className="flex items-start gap-2.5">
                      <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div>
                        <p className="text-xs text-ub-text-tertiary">Courses offered</p>
                        <p className="text-sm text-slate-700">{university.languageCenter.courses.length}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Award className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div>
                        <p className="text-xs text-ub-text-tertiary">Founded</p>
                        <p className="text-sm text-slate-700">{university.languageCenter.founded_year}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <LanguagesIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div>
                        <p className="text-xs text-ub-text-tertiary">Students</p>
                        <p className="text-sm text-slate-700">{university.languageCenter.student_count}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </>
        ) : (
          <>
            <div className="md:col-span-2">
              <FadeIn className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="p-6">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">About</p>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{university.description}</p>
                </div>

                <div className="p-6">
                  <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <BookOpen className="h-3.5 w-3.5" />
                    Notable programs
                  </p>
                  <div className="space-y-2">
                    {university.programs.map((program) => (
                      <div
                        key={program.name}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 px-4 py-2.5"
                      >
                        <p className="text-sm font-medium text-slate-800">{program.name}</p>
                        <p className="text-xs text-slate-500">
                          {program.level} · {program.duration}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6">
                  <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <MapPin className="h-3.5 w-3.5" />
                    Campuses
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {university.branches.map((branch) => (
                      <span
                        key={`${branch.name}-${branch.location}`}
                        className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                      >
                        {branch.name} — {branch.location}, {branch.state}
                      </span>
                    ))}
                  </div>
                </div>
              </FadeIn>
            </div>

            <div className="md:col-span-1">
              <FadeIn delay={0.1} className="md:sticky md:top-6">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="space-y-4 p-6">
                    <p className="text-sm font-semibold text-slate-900">Quick facts</p>

                    <div className="flex items-start gap-2.5">
                      <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div>
                        <p className="text-xs text-ub-text-tertiary">Intake</p>
                        <p className="text-sm text-slate-700">{intakeLabel || "Contact university"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Users className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div>
                        <p className="text-xs text-ub-text-tertiary">Students</p>
                        <p className="text-sm text-slate-700">{university.student_count}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Award className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div>
                        <p className="text-xs text-ub-text-tertiary">Founded</p>
                        <p className="text-sm text-slate-700">{university.founded_year}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </>
        )}
      </div>

      <div className="mx-auto max-w-4xl pt-16 text-center">
        <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
          Frequently Asked <span className="text-blue-600">Questions</span>
        </h2>
        <div className="mt-8 text-left">
          <Faq items={faqItems} />
        </div>
      </div>

      <FadeIn>
        <SiteFooter className="mt-16" />
      </FadeIn>
    </main>
  );
}

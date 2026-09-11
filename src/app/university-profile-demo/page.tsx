import type { Metadata } from "next";
import UniversityPublicProfile, {
  type UniversityPublicProfileData,
} from "features/universities/components/public/UniversityPublicProfile";

export const metadata: Metadata = {
  title: "Global University | Unibexs",
  description: "Design preview of a university public profile page.",
};

// Static design preview — no fetch, no slug, no backing endpoint (unlike
// the partner public profile at /p/[slug], which reads a real API). Data
// below is modeled on a real record already in this app's local database
// (universities.id = 6cffc1ea-0a17-4dbd-9fde-5ab66ace6304, "Global
// University", Malaysia — verified via direct DB query, not invented),
// not a fictional placeholder like the earlier "Meridian University".
//
// Two things worth flagging about that real record:
// - Its university_type_name is genuinely "Minimum submission" — reads
//   oddly for a public label, likely leftover test-seed naming. Kept
//   as-is rather than silently "fixed".
// - Its two real branches are named "Downtown Campus, New York" and
//   "Main branch, Kuala Lumpur" — a US branch name on a Malaysia-based
//   university, likely inconsistent seed data. Renamed below to two
//   Malaysian cities (Kuala Lumpur + Penang) so the page reads as one
//   coherent institution — the underlying record's actual branch names
//   are unchanged, only this preview's display copy.
const DUMMY_UNIVERSITY: UniversityPublicProfileData = {
  name: "Global University",
  country: "Malaysia",
  university_type_name: "Minimum submission",
  description: "Global business and management university.",
  logo_file_url: null,
  intake_months: [1, 8],
  website_url: "https://example.edu",
  student_count: "18,500+",
  founded_year: 1962,
  // A sample of the university's real programs (from the local `programs`
  // table) — level inferred from the standard degree abbreviation (BSc/BBA
  // = Undergraduate, MSc/MBA/LLM/MEng = Postgraduate), since the table
  // itself has no separate level column.
  programs: [
    { name: "MBA", level: "Postgraduate", duration: "2 years" },
    { name: "BBA International Business", level: "Undergraduate", duration: "4 years" },
    { name: "MSc Artificial Intelligence", level: "Postgraduate", duration: "2 years" },
    { name: "LLM International Law", level: "Postgraduate", duration: "1 year" },
  ],
  branches: [
    { name: "Global University", location: "Kuala Lumpur City Campus", state: "Kuala Lumpur" },
    { name: "Global University", location: "Penang Campus", state: "Penang" },
  ],
  // The language center feature has no backend at all yet (grepped —
  // nothing in this repo or unibexs-backend), so this tab stays a design
  // preview regardless; only the university side above reflects real
  // data. First course is the exact sample data given for this feature.
  languageCenter: {
    description:
      "Global University's Language Center runs rolling-intake English courses for international students preparing for admission or short-term study visits, alongside the university's own degree programs.",
    student_count: "1,200+",
    founded_year: 2011,
    courses: [
      {
        name: "EduTourism — 1 Month",
        duration: "4 weeks",
        intake: "Rolling, can start any week",
        levels: [
          { level_name: "Starter", level: 1, duration: "4 weeks", price_myr: 6400, price_usd: 1685 },
          { level_name: "Elementary", level: 2, duration: "4 weeks", price_myr: 6400, price_usd: 1685 },
        ],
        notes: "",
      },
      {
        name: "General English — 3 Months",
        duration: "12 weeks",
        intake: "First Monday of every month",
        levels: [
          { level_name: "Pre-Intermediate", level: 3, duration: "12 weeks", price_myr: 15200, price_usd: 4000 },
          { level_name: "Intermediate", level: 4, duration: "12 weeks", price_myr: 15200, price_usd: 4000 },
          { level_name: "Upper-Intermediate", level: 5, duration: "12 weeks", price_myr: 16800, price_usd: 4420 },
        ],
        notes: "Includes weekly placement testing and a certificate of completion.",
      },
    ],
    locations: [
      { name: "Global University Language Center", area: "Kuala Lumpur City Campus", state: "Kuala Lumpur" },
    ],
  },
};

export default function UniversityProfileDemoPage() {
  return <UniversityPublicProfile university={DUMMY_UNIVERSITY} />;
}

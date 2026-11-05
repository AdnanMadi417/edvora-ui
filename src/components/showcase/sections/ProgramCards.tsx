"use client";

import ProgramCard, { type ProgramCardData } from "components/ub/data/cards/ProgramCard";
import { Demo } from "../Showcase";

const programs: ProgramCardData[] = [
  {
    name: "Bachelor of Computer Science (Honours)",
    university: { name: "Asia Pacific University" },
    branch: { state: "Kuala Lumpur" },
    qualification_level: "Bachelor",
    course_type: null,
    duration: 3,
    first_year_tuition: 32500,
    yearly_fee_currency: "MYR",
    intake_months: [3, 7, 11],
    has_scholarship: true,
    commission_amount: 4200,
    commission_currency: "MYR",
  },
  {
    name: "Master of Business Administration",
    university: { name: "Taylor’s University" },
    branch: { state: "Selangor" },
    qualification_level: "Master",
    course_type: "mixed_mode",
    duration: 1.5,
    first_year_tuition: 28000,
    yearly_fee_currency: "MYR",
    intake_months: [1, 5, 9],
    has_scholarship: false,
    commission_amount: 3100,
    commission_currency: "MYR",
  },
  {
    name: "Doctor of Philosophy in Engineering",
    university: { name: "Universiti Teknologi Malaysia" },
    branch: { state: "Johor" },
    qualification_level: "PhD",
    course_type: "research",
    duration: null,
    first_year_tuition: null,
    yearly_fee_currency: "MYR",
    intake_months: null,
    has_scholarship: false,
    commission_amount: null,
  },
];

export default function ProgramCards() {
  return (
    <Demo
      name="ProgramCard"
      path="components/ub/data/cards/ProgramCard.tsx"
      description="Knowledge Hub program cards with study details, intakes, tuition and optional commission. Sample data illustrates scholarships, read-only access and unavailable details."
      code={'<ProgramCard program={program} href={`/partner/knowledge-hub/${program.id}`} applyHref={applyHref} />'}
      props={[
        { name: "program", type: "ProgramCardData", description: "Program and university details. Missing fees and dates show a helpful fallback." },
        { name: "href", type: "string", description: "Program details route, opened in a new tab." },
        { name: "applyHref", type: "LinkProps[\"href\"]", description: "Optional application route. Omit for roles without application access." },
      ]}
    >
      <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
        {programs.map((program, index) => (
          <ProgramCard key={program.name} program={program} href="#c-programcard" applyHref={index < 2 ? "#c-programcard" : undefined} />
        ))}
      </div>
    </Demo>
  );
}

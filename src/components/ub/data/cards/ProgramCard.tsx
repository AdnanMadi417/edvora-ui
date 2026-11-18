"use client";

import type { LinkProps } from "next/link";
import { Award } from "lucide-react";
import Tag from "components/ub/data/badges/Tag";
import CatalogCard, { type CatalogCardAction, type CatalogCardFact } from "components/ub/data/cards/CatalogCard";
import UniversityLogo from "features/universities/components/shared/UniversityLogo";
import { programStatus } from "features/programs/components/shared/table/KnowledgeHubTable";
import IntakeMonthsChips from "features/programs/components/shared/IntakeMonthsChips";
import { courseTypeLabel } from "features/programs/utils/courseType";
import type { Program } from "features/programs/types";

export type ProgramCardData = Pick<
  Program,
  | "name"
  | "qualification_level"
  | "course_type"
  | "duration"
  | "first_year_tuition"
  | "yearly_fee_currency"
  | "intake_months"
  | "has_scholarship"
  | "commission_amount"
  | "commission_currency"
> & {
  /** Hidden programs show a grey circle on the logo; omitted means visible. */
  is_hidden?: boolean;
  university: { name: string; logo_file_key?: string };
  branch?: { state?: string };
};

export interface ProgramCardProps {
  program: ProgramCardData;
  href: string;
  /** Omit for roles that cannot create an application. */
  applyHref?: LinkProps["href"];
}

/** A Next href object as a string, for a plain link. */
const hrefString = (target: LinkProps["href"]) => {
  if (typeof target === "string") return target;
  const query = new URLSearchParams(
    Object.entries(target.query ?? {}).flatMap(([key, value]) => (value == null ? [] : [[key, String(value)]]))
  ).toString();
  return `${target.pathname ?? ""}${query ? `?${query}` : ""}`;
};

const money = (amount: number, currency: string) => `${currency.toUpperCase()} ${amount.toLocaleString("en-MY")}`;

/** Catalogue card shared by the Knowledge Hub and the UI template. */
export default function ProgramCard({ program, href, applyHref }: ProgramCardProps) {
  const courseType = courseTypeLabel(program.course_type);
  const facts: CatalogCardFact[] = [
    {
      label: "Duration",
      value: program.duration != null ? `${program.duration} ${program.duration === 1 ? "year" : "years"}` : "To be confirmed",
    },
    { label: "Location", value: program.branch?.state || "To be confirmed" },
    {
      label: "Intakes",
      wide: true,
      value: program.intake_months?.length ? (
        <IntakeMonthsChips months={program.intake_months} size="sm" maxVisible={4} />
      ) : (
        "Dates to be confirmed"
      ),
    },
    {
      label: "First-year tuition",
      value: (
        <span className="ub-tabular">
          {program.first_year_tuition != null
            ? money(program.first_year_tuition, program.yearly_fee_currency || "MYR")
            : "Fees on request"}
        </span>
      ),
    },
  ];
  if (program.commission_amount != null)
    facts.push({
      label: "Your commission",
      tone: "success",
      value: money(program.commission_amount, program.commission_currency || "MYR"),
    });

  const actions: CatalogCardAction[] = [
    { label: "View details", href, ariaLabel: `View details of ${program.name} (opens in a new tab)`, external: true },
  ];
  if (applyHref)
    actions.push({ label: "Apply now", href: hrefString(applyHref), ariaLabel: `Apply now for ${program.name}`, variant: "primary" });

  return (
    <CatalogCard
      name={program.name}
      avatar={<UniversityLogo name={program.university.name} fileKey={program.university.logo_file_key} />}
      status={programStatus(program)}
      subtitle={program.university.name}
      href={href}
      hrefExternal
      tags={
        <>
          <Tag hue="indigo" size="sm" className="capitalize">
            {program.qualification_level || "Level to be confirmed"}
          </Tag>
          {courseType && (
            <Tag tone="neutral" size="sm">
              {courseType}
            </Tag>
          )}
          {program.has_scholarship && (
            <Tag hue="amber" size="sm" icon={<Award className="h-3 w-3" />}>
              Scholarship
            </Tag>
          )}
        </>
      }
      facts={facts}
      actions={actions}
    />
  );
}

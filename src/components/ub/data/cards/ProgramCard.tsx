"use client";

import { useRef } from "react";
import Link from "next/link";
import type { LinkProps } from "next/link";
import { Award, CalendarDays, GraduationCap } from "lucide-react";
import Tag from "components/ub/data/badges/Tag";
import EntityCell from "components/ub/data/display/EntityCell";
import { buttonBase, buttonSizes, buttonVariants } from "components/ub/recipes";
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

const money = (amount: number, currency: string) =>
  `${currency.toUpperCase()} ${amount.toLocaleString("en-MY")}`;

/** Catalogue card shared by the Knowledge Hub and the UI template. */
export default function ProgramCard({
  program,
  href,
  applyHref,
}: ProgramCardProps) {
  const cardLink = useRef<HTMLAnchorElement>(null);
  return (
    <article
      aria-label={program.name}
      className="relative flex h-full min-w-0 flex-col break-words overflow-hidden rounded-ub-lg border border-ub-border bg-ub-surface shadow-ub-xs transition-[border-color,box-shadow] hover:border-ub-border-hover hover:shadow-ub-sm motion-reduce:transition-none"
    >
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        // Pointer shortcut only: keyboard and screen readers use "View details".
        aria-hidden="true"
        tabIndex={-1}
        ref={cardLink}
        className="absolute inset-0 z-10 rounded-ub-lg"
      />
      <div className="flex items-start justify-between gap-2 px-4 pt-4">
        <h3
          className="relative z-20 min-w-0 flex-1 cursor-pointer"
          onClick={() => cardLink.current?.click()}
        >
          <EntityCell
            tooltip
            name={program.name}
            avatar={
              <UniversityLogo
                name={program.university.name}
                fileKey={program.university.logo_file_key}
              />
            }
            status={programStatus(program)}
            subtitle={program.university.name}
          />
        </h3>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          <Tag hue="indigo" size="sm" className="capitalize">
            {program.qualification_level || "Level to be confirmed"}
          </Tag>
          {program.has_scholarship && (
            <Tag hue="amber" size="sm" icon={<Award className="h-3 w-3" />}>
              Scholarship available
            </Tag>
          )}
        </div>
        {program.course_type && (
          <p className="mt-1 text-ub-body-sm text-ub-text-secondary">
            {courseTypeLabel(program.course_type)}
          </p>
        )}

        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <p className="flex flex-wrap items-center gap-x-2 text-ub-body-sm text-ub-text-secondary">
            <span>{program.branch?.state || "Location to be confirmed"}</span>
            <span aria-hidden="true">·</span>
            <span>
              {program.duration != null
                ? `${program.duration} ${
                    program.duration === 1 ? "year" : "years"
                  }`
                : "Duration to be confirmed"}
            </span>
          </p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <p className="flex items-center gap-1.5 text-ub-label-sm text-ub-text-tertiary">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              Intakes
            </p>
            {program.intake_months?.length ? (
              <IntakeMonthsChips
                months={program.intake_months}
                size="sm"
                maxVisible={4}
              />
            ) : (
              <p className="text-ub-body-sm text-ub-text-secondary">
                Dates to be confirmed
              </p>
            )}
          </div>
        </div>
        <dl className="my-3 border-y border-ub-border py-2.5">
          <div>
            <dt className="flex items-center gap-1.5 text-ub-label-sm text-ub-text-tertiary">
              <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
              {/* Short on phones so it fits its column on one line. */}
              <span className="sm:hidden">1st-year fee</span>
              <span className="hidden sm:inline">First-year tuition</span>
            </dt>
            <dd className="ub-tabular mt-1 text-[18px] font-semibold leading-6 text-ub-text-primary">
              {program.first_year_tuition != null
                ? money(
                    program.first_year_tuition,
                    program.yearly_fee_currency || "MYR"
                  )
                : "Fees on request"}
            </dd>
          </div>
        </dl>

        <div className="mt-auto space-y-3">
          {program.commission_amount != null && (
            <div className="flex items-center justify-between gap-3 rounded-ub-md border border-ub-tone-success-border bg-ub-tone-success-bg px-3 py-2.5 sm:flex-col sm:items-start sm:gap-1">
              <span className="text-ub-label-sm text-ub-tone-success-text">
                Your commission
              </span>
              <span className="ub-tabular text-[20px] font-semibold leading-7 text-ub-tone-success-text">
                {money(
                  program.commission_amount,
                  program.commission_currency || "MYR"
                )}
              </span>
            </div>
          )}
          <div className="flex gap-2">
            <Link
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View details of ${program.name} (opens in a new tab)`}
              className={`relative z-20 flex-1 ${buttonBase} ${buttonSizes.sm} ${buttonVariants.secondary}`}
            >
              View details
            </Link>
            {applyHref && (
              <Link
                href={applyHref}
                aria-label={`Apply now for ${program.name}`}
                className={`relative z-20 flex-1 ${buttonBase} ${buttonSizes.sm} ${buttonVariants.primary}`}
              >
                Apply now
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

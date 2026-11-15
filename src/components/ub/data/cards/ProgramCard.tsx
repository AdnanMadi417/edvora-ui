"use client";

import { useId } from "react";
import Link from "next/link";
import type { LinkProps } from "next/link";
import {
  ArrowUpRight,
  Award,
  CalendarDays,
  GraduationCap,
  Send,
} from "lucide-react";
import PresignedImage from "components/ub/data/media/PresignedImage";
import Tag from "components/ub/data/badges/Tag";
import Tooltip from "components/ub/feedback/dialogs/Tooltip";
import {
  buttonBase,
  buttonSizes,
  buttonVariants,
  focusRing,
} from "components/ub/recipes";
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
  const titleId = useId();
  const initials = program.university.name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  const logoFallback = (
    <span className="text-base font-semibold text-ub-tone-brand-text">
      {initials || "U"}
    </span>
  );

  return (
    <article
      aria-labelledby={titleId}
      className="relative flex h-full min-w-0 flex-col break-words overflow-hidden rounded-ub-lg border border-ub-border bg-ub-surface shadow-ub-xs transition-[border-color,box-shadow] hover:border-ub-border-hover hover:shadow-ub-sm motion-reduce:transition-none"
    >
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`View ${program.name} (opens in a new tab)`}
        title={program.name}
        className={`absolute inset-0 z-10 rounded-ub-lg ${focusRing}`}
      />
      <div className="flex items-center gap-2.5 px-4 pt-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-ub-md border border-ub-border bg-ub-tone-brand-bg">
          {program.university.logo_file_key ? (
            <PresignedImage
              fileKey={program.university.logo_file_key}
              alt=""
              className="h-full w-full object-contain"
              fallback={logoFallback}
            />
          ) : (
            logoFallback
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="hidden text-[11px] leading-4 text-ub-text-tertiary sm:block">
            University
          </p>
          <p className="text-[13px] font-medium leading-5 text-ub-text-secondary">
            {program.university.name}
          </p>
        </div>
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
        <h3
          id={titleId}
          className="text-[16px] font-semibold leading-6 text-ub-text-primary sm:min-h-12"
        >
          <Tooltip
            content={program.name}
            position="bottom"
            className="w-full min-w-0 [&_[role=tooltip]]:max-w-full [&_[role=tooltip]]:break-words"
          >
            <Link
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`relative z-20 line-clamp-2 min-w-0 w-full break-words rounded-ub-xs hover:text-ub-text-link ${focusRing}`}
            >
              {program.name}
            </Link>
          </Tooltip>
        </h3>
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
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`relative z-20 ${buttonBase} ${buttonSizes.sm} ${buttonVariants.secondary} min-h-[44px] flex-1 sm:min-h-[32px]`}
              aria-label={`View ${program.name} (opens in a new tab)`}
            >
              View program
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            {applyHref && (
              <Link
                href={applyHref}
                className={`relative z-20 ${buttonBase} ${buttonSizes.sm} ${buttonVariants.primary} min-h-[44px] flex-1 sm:min-h-[32px]`}
                aria-label={`Apply for ${program.name}`}
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                Apply now
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

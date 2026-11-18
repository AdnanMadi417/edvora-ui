"use client";

import { useRef } from "react";
import Link from "next/link";
import { buttonBase, buttonSizes, buttonVariants } from "components/ub/recipes";
import { Languages } from "lucide-react";
import EntityCell from "components/ub/data/display/EntityCell";
import UniversityLogo, {
  universityStatus,
} from "features/universities/components/shared/UniversityLogo";
import IntakeMonthsChips from "features/programs/components/shared/IntakeMonthsChips";
import type { University } from "features/universities/types";

export interface UniversityCardProps {
  university: University;
  href: string;
  programsHref: string;
}

export default function UniversityCard({
  university,
  href,
  programsHref,
}: UniversityCardProps) {
  const cardLink = useRef<HTMLAnchorElement>(null);
  return (
    <article
      aria-label={university.name}
      className="relative flex h-full min-w-0 flex-col overflow-hidden rounded-ub-lg border border-ub-border bg-ub-surface shadow-ub-xs transition-[border-color,box-shadow] duration-200 hover:border-ub-border-hover hover:shadow-ub-sm motion-reduce:transition-none"
    >
      {/* Pointer shortcut only: keyboard and screen readers use "View details". */}
      <Link
        href={href}
        aria-hidden="true"
        tabIndex={-1}
        ref={cardLink}
        className="absolute inset-0 z-10 rounded-ub-lg"
      />
      <div className="flex items-start justify-between gap-2 p-5 pb-0">
        <h3
          className="relative z-20 min-w-0 flex-1 cursor-pointer"
          onClick={() => cardLink.current?.click()}
        >
          <EntityCell
            tooltip
            name={university.name}
            avatar={
              <UniversityLogo
                name={university.name}
                fileKey={university.logo_file_key}
              />
            }
            status={universityStatus(university)}
            subtitle={`${university.country || "Location to be confirmed"} · ${
              university.is_public ? "Public" : "Private"
            }`}
          />
        </h3>
      </div>
      <div className="flex flex-1 flex-col px-5 pb-5">
        <div className="my-4 border-y border-ub-border py-4">
          <p className="mb-2 text-ub-label-sm text-ub-text-tertiary">
            Upcoming intakes
          </p>
          {university.intake_months?.length ? (
            <IntakeMonthsChips
              months={university.intake_months}
              size="sm"
              maxVisible={4}
            />
          ) : (
            <p className="text-ub-body-sm text-ub-text-secondary">
              Dates to be confirmed
            </p>
          )}
        </div>
        <p className="flex items-center gap-2 text-ub-body-sm text-ub-text-secondary">
          <Languages
            className="h-4 w-4 shrink-0 text-ub-icon"
            aria-hidden="true"
          />
          {university.has_language_center
            ? "Language center available"
            : "No language center listed"}
        </p>
        <div className="mt-auto flex gap-2 pt-4">
          <Link
            href={href}
            aria-label={`View details of ${university.name}`}
            className={`relative z-20 flex-1 ${buttonBase} ${buttonSizes.sm} ${buttonVariants.secondary}`}
          >
            View details
          </Link>
          <Link
            href={programsHref}
            aria-label={`View programs at ${university.name}`}
            className={`relative z-20 flex-1 ${buttonBase} ${buttonSizes.sm} ${buttonVariants.primary}`}
          >
            View programs
          </Link>
        </div>
      </div>
    </article>
  );
}

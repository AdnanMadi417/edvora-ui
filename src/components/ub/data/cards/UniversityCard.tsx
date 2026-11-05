"use client";

import { useId } from "react";
import Link from "next/link";
import { focusRing } from "components/ub/recipes";
import {
  ArrowUpRight,
  BookOpen,
  GraduationCap,
  Languages,
  MapPin,
} from "lucide-react";
import PresignedImage from "components/ub/data/media/PresignedImage";
import Tag from "components/ub/data/badges/Tag";
import Tooltip from "components/ub/feedback/dialogs/Tooltip";
import LinkBtn from "components/ub/core/buttons/LinkBtn";
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
  const titleId = useId();
  return (
    <article
      aria-labelledby={titleId}
      className="relative flex h-full min-w-0 flex-col overflow-hidden rounded-ub-lg border border-ub-border bg-ub-surface shadow-ub-xs transition-[border-color,box-shadow] duration-200 hover:border-ub-border-hover hover:shadow-ub-sm motion-reduce:transition-none"
    >
      <Link href={href} aria-label={`View ${university.name}`} title={university.name} className={`absolute inset-0 z-10 rounded-ub-lg ${focusRing}`} />
      <div className="flex items-start justify-between gap-3 p-5 pb-0">
        <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-ub-md border border-ub-border bg-ub-tone-brand-bg">
          <PresignedImage
            fileKey={university.logo_file_key}
            alt=""
            className="h-full w-full object-contain"
            fallback={
              <GraduationCap className="h-6 w-6 text-ub-tone-brand-text" />
            }
          />
        </div>
        <Tag hue={university.is_public ? "indigo" : "sky"} size="sm">
          {university.is_public ? "Public university" : "Private university"}
        </Tag>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3
          id={titleId}
          className="min-h-[2.8em] text-ub-heading-md text-ub-text-primary"
        >
          <Tooltip
            content={university.name}
            position="bottom"
            className="w-full min-w-0 [&_[role=tooltip]]:max-w-full"
          >
            <span className="line-clamp-2 break-words">{university.name}</span>
          </Tooltip>
        </h3>
        <p className="mt-2 flex items-center gap-1.5 text-ub-body-sm text-ub-text-secondary">
          <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
          {university.country || "Location to be confirmed"}
        </p>
        <div className="my-5 border-y border-ub-border py-4">
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
        <p className="mb-5 flex items-center gap-2 text-ub-body-sm text-ub-text-secondary">
          <Languages
            className="h-4 w-4 shrink-0 text-ub-icon"
            aria-hidden="true"
          />
          {university.has_language_center
            ? "Language center available"
            : "No language center listed"}
        </p>
        <div className="mt-auto grid grid-cols-2 gap-2">
          <LinkBtn
            href={href}
            label="Details"
            title="View university details"
            icon={<ArrowUpRight className="h-4 w-4" />}
            variant="secondary"
            className="relative z-20 min-h-[44px] min-w-0 px-2 text-sm"
          />
          <LinkBtn
            href={programsHref}
            label="Programs"
            title="Explore university programs"
            icon={<BookOpen className="h-4 w-4" />}
            variant="primary"
            className="relative z-20 min-h-[44px] min-w-0 px-2 text-sm"
          />
        </div>
      </div>
    </article>
  );
}

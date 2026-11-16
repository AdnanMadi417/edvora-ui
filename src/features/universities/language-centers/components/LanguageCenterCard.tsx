"use client";
import { useId } from "react";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { focusRing } from "components/ub/recipes";
import type { University } from "features/universities/types";
import type { LanguageCenter } from "../types";
import UniversityIdentity from "../UniversityIdentity";

/** A single keyboard-accessible link makes the whole advisor card clickable. */
export default function LanguageCenterCard({
  center,
  university,
  href,
}: {
  center: LanguageCenter;
  university?: University;
  href: string;
}) {
  const titleId = useId();
  return (
    <article aria-labelledby={titleId} className="min-w-0">
      <Link
        href={href}
        className={`flex h-full min-w-0 flex-col gap-4 rounded-ub-lg border border-ub-border bg-ub-surface p-5 shadow-ub-xs transition-[border-color,box-shadow] hover:border-ub-border-hover hover:shadow-ub-sm motion-reduce:transition-none ${focusRing}`}
      >
        <UniversityIdentity university={university} />
        <h3
          id={titleId}
          className="break-words text-ub-heading-sm text-ub-text-primary"
        >
          {center.name}
        </h3>
        {center.description && (
          <p className="line-clamp-3 break-words text-ub-body-sm text-ub-text-secondary">
            {center.description}
          </p>
        )}
        <div className="mt-auto space-y-4">
          {center.location && (
            <p className="flex items-start gap-2 text-ub-body-sm text-ub-text-secondary">
              <MapPin
                aria-hidden="true"
                className="mt-0.5 h-4 w-4 shrink-0 text-ub-icon"
              />
              <span className="min-w-0 break-words">{center.location}</span>
            </p>
          )}
          <span className="flex items-center justify-between gap-2 border-t border-ub-border pt-4 text-ub-label-sm text-ub-text-link">
            View details
            <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0" />
          </span>
        </div>
      </Link>
    </article>
  );
}

"use client";
import Link from "next/link";
import { Eye, MapPin } from "lucide-react";
import TableActions, { TableAction } from "components/ub/data/tables/TableActions";
import type { University } from "features/universities/types";
import type { LanguageCenter } from "../types";
import LanguageCenterIdentity from "./LanguageCenterIdentity";

/** The whole Advisor card opens the centre; the name, status and location match the admin table row. */
export default function LanguageCenterCard({
  center,
  university,
  href,
}: {
  center: LanguageCenter;
  university?: University;
  href: string;
}) {
  return (
    <article
      aria-label={center.name}
      className="relative flex h-full min-w-0 flex-col gap-3 rounded-ub-lg border border-ub-border bg-ub-surface p-5 shadow-ub-xs transition-[border-color,box-shadow] hover:border-ub-border-hover hover:shadow-ub-sm motion-reduce:transition-none"
    >
      {/* Pointer shortcut only: keyboard and screen-reader users get the View action. */}
      <Link
        href={href}
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 z-10 rounded-ub-lg"
      />
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 flex-1">
          <LanguageCenterIdentity center={center} university={university} />
        </h3>
        <div className="relative z-20 -me-2 -mt-1 shrink-0">
          <TableActions label={center.name}>
            <TableAction
              primary
              label={`View ${center.name}`}
              icon={<Eye className="h-4 w-4" />}
              href={href}
            />
          </TableActions>
        </div>
      </div>
      {center.location && (
        <p className="flex items-start gap-2 text-ub-body-sm text-ub-text-secondary">
          <MapPin
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0 text-ub-icon"
          />
          <span className="min-w-0 break-words">{center.location}</span>
        </p>
      )}
    </article>
  );
}

import type { ReactNode } from "react";
import Link from "next/link";
import PresignedImage from "components/ub/data/media/PresignedImage";
import Tag from "components/ub/data/badges/Tag";
import type { University } from "features/universities/types";

export default function UniversityIdentity({
  university,
  href,
  children,
}: {
  university?: University;
  href: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 py-1">
      <div
        className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-ub-md border border-ub-border bg-ub-tone-brand-bg"
        aria-label={university ? `${university.name} logo` : "University logo"}
      >
        <PresignedImage
          fileKey={university?.logo_file_key || ""}
          alt=""
          className="h-full w-full object-contain"
          fallback={
            <span className="text-sm font-semibold text-ub-tone-brand-text">
              {university?.name?.trim().charAt(0).toUpperCase() || "U"}
            </span>
          }
        />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link
            href={href}
            className="break-words text-ub-label-md text-ub-text-primary hover:text-ub-text-link hover:underline"
          >
            {university?.name || "University unavailable"}
          </Link>
          {typeof university?.is_public === "boolean" && (
            <Tag size="sm" hue="indigo">
              {university.is_public ? "Public" : "Private"}
            </Tag>
          )}
        </div>
        {children && <div className="mt-1.5">{children}</div>}
      </div>
    </div>
  );
}

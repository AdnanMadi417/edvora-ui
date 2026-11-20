"use client";

import { MapPin } from "lucide-react";
import EntityCell from "components/ub/data/display/EntityCell";
import UniversityLogo from "features/universities/components/shared/UniversityLogo";
import type { University } from "features/universities/types";
import { cityState, type LanguageCenter } from "../types";

/**
 * The language centre's name cell, shared by the table and the Advisor card:
 * its own logo (else its university's logo, else initials), the name with its
 * status, and the university it belongs to.
 */
export default function LanguageCenterIdentity({
  center,
  university,
  showUniversity = true,
  showPlace = false,
}: {
  center: LanguageCenter;
  university?: University;
  showUniversity?: boolean;
  /** Phones only: the city and state under the name, where the table has no Location column. */
  showPlace?: boolean;
}) {
  const place = showPlace ? cityState(center.location) : "";
  const subtitle =
    center.centre_type === "independent"
      ? "Independent language center"
      : showUniversity
      ? university?.name || "University unavailable"
      : undefined;
  return (
    <EntityCell
      name={center.name}
      imageSrc={center.logo_url}
      avatar={
        center.logo_url ? undefined : (
          <UniversityLogo name={center.name} fileKey={university?.logo_file_key} />
        )
      }
      status={{ status: center.is_active }}
      subtitle={
        place ? (
          <>
            {subtitle && <span className="block truncate">{subtitle}</span>}
            <span className="mt-0.5 flex items-center gap-1 md:hidden">
              <MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-ub-icon" />
              <span className="truncate">{place}</span>
            </span>
          </>
        ) : (
          subtitle
        )
      }
    />
  );
}

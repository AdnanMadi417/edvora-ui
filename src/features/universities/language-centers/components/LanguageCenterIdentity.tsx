"use client";

import EntityCell from "components/ub/data/display/EntityCell";
import UniversityLogo from "features/universities/components/shared/UniversityLogo";
import type { University } from "features/universities/types";
import type { LanguageCenter } from "../types";

/**
 * The language centre's name cell, shared by the table and the Advisor card:
 * its own logo (else its university's logo, else initials), the name with its
 * status, and the university it belongs to.
 */
export default function LanguageCenterIdentity({
  center,
  university,
  showUniversity = true,
}: {
  center: LanguageCenter;
  university?: University;
  showUniversity?: boolean;
}) {
  const subtitle =
    center.centre_type === "independent"
      ? "Independent language centre"
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
      subtitle={subtitle}
    />
  );
}

"use client";

import CatalogCard from "components/ub/data/cards/CatalogCard";
import UniversityLogo, { universityStatus } from "features/universities/components/shared/UniversityLogo";
import IntakeMonthsChips from "features/programs/components/shared/IntakeMonthsChips";
import type { University } from "features/universities/types";

export interface UniversityCardProps {
  university: University;
  href: string;
  programsHref: string;
}

export default function UniversityCard({ university, href, programsHref }: UniversityCardProps) {
  return (
    <CatalogCard
      name={university.name}
      avatar={<UniversityLogo name={university.name} fileKey={university.logo_file_key} />}
      status={universityStatus(university)}
      subtitle={university.country || "Location to be confirmed"}
      href={href}
      facts={[
        { label: "Type", value: university.is_public ? "Public" : "Private" },
        { label: "Language center", value: university.has_language_center ? "Available" : "Not listed" },
        {
          label: "Upcoming intakes",
          wide: true,
          value: university.intake_months?.length ? (
            <IntakeMonthsChips months={university.intake_months} size="sm" maxVisible={4} />
          ) : (
            "Dates to be confirmed"
          ),
        },
      ]}
      actions={[
        { label: "View details", view: true, href, ariaLabel: `View details of ${university.name}` },
        { label: "View programs", href: programsHref, ariaLabel: `View programs at ${university.name}`, variant: "primary" },
      ]}
    />
  );
}

"use client";
import CatalogCard from "components/ub/data/cards/CatalogCard";
import { Avatar } from "components/ub/data/media/Avatar";
import UniversityLogo from "features/universities/components/shared/UniversityLogo";
import type { University } from "features/universities/types";
import type { LanguageCenter } from "../types";

/** The Advisor card: same anatomy as the program and university cards; the name, status and university match the admin table row. */
export default function LanguageCenterCard({
  center,
  university,
  href,
}: {
  center: LanguageCenter;
  university?: University;
  href: string;
}) {
  const independent = center.centre_type === "independent";
  const branches = center.branches?.length ?? 0;
  return (
    <CatalogCard
      name={center.name}
      avatar={
        center.logo_url ? (
          <Avatar name={center.name} src={center.logo_url} size={40} alt="" />
        ) : (
          <UniversityLogo name={center.name} fileKey={university?.logo_file_key} />
        )
      }
      status={{ status: center.is_active }}
      subtitle={independent ? "Independent language center" : university?.name || "University unavailable"}
      href={href}
      facts={[
        { label: "Type", value: independent ? "Independent" : "University-linked" },
        { label: "Branches", value: branches ? `${branches} ${branches === 1 ? "branch" : "branches"}` : "Main campus only" },
        { label: "Location", value: center.location || "To be confirmed", wide: true },
      ]}
      actions={[{ label: "View details", href, ariaLabel: `View details of ${center.name}`, variant: "primary" }]}
    />
  );
}

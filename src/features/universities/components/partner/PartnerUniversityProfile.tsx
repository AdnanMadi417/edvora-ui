"use client";

import UniversityProfile from "features/universities/components/shared/UniversityProfile";

export default function PartnerUniversityProfile({ id }: { id: string }) {
  return <UniversityProfile id={id} basePath="/partner/universities" />;
}

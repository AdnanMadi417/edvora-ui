"use client";

import { useParams } from "next/navigation";
import UniversityDetails from "features/universities/components/admin/details/UniversityDetails";

export default function PartnerUniversityPage() {
  const params = useParams();
  const universityId = params?.id as string;

  if (!universityId) return null;

  return <UniversityDetails id={universityId} basePath="/partner/universities" readOnly />;
}

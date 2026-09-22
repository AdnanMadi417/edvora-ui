"use client";

import { useParams } from "next/navigation";
import PartnerUniversityProfile from "features/universities/components/partner/PartnerUniversityProfile";

export default function PartnerUniversityPage() {
  const params = useParams();
  const universityId = params?.id as string;

  if (!universityId) return null;

  return <PartnerUniversityProfile id={universityId} />;
}

"use client";

import { useParams } from "next/navigation";
import EditUniversityDetails from "features/universities/components/admin/form/EditUniversityDetails";

export default function UniversityPage() {
  const params = useParams();
  const universityId = params?.id as string;

  if (!universityId) return null;

  return <EditUniversityDetails id={universityId} />;
}
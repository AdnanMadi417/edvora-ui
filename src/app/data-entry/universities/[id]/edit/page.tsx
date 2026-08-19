"use client";

import { useParams } from "next/navigation";
import EditUniversityDetails from "features/universities/components/admin/form/EditUniversityDetails";

export default function DataEntryEditUniversityPage() {
  const params = useParams();
  const universityId = params?.id as string;

  if (!universityId) return null;

  return <EditUniversityDetails id={universityId} redirectPath={`/data-entry/universities/${universityId}`} />;
}

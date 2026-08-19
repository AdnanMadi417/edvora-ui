"use client";

import { useParams } from "next/navigation";
import EditUniversityForm from "features/universities/components/admin/form/EditUniversityForm";

export default function DataEntryEditUniversityTypePage() {
  const params = useParams();
  const universityTypeId = params?.id as string;

  if (!universityTypeId) return null;

  return <EditUniversityForm id={universityTypeId} redirectPath={`/data-entry/university-configuration/${universityTypeId}/edit`} />;
}

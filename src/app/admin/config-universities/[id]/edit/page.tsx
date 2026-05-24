"use client";

import { useParams } from "next/navigation";
import EditUniversityForm from "features/universities/components/admin/form/EditUniversityForm";

export default function UniversityPage() {
  const params = useParams();
  const universityId = params?.id as string;

  if (!universityId) return null;

  return <EditUniversityForm id={universityId} />;
}
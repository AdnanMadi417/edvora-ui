"use client";

import { useParams } from "next/navigation";
import EditUniversityDetails from "components/admin/KnowledgeHub/university/details/edit/EditUniversityDetails";

export default function UniversityPage() {
  const params = useParams();
  const universityId = params?.id as string;

  if (!universityId) return null;

  return <EditUniversityDetails id={universityId} />;
}
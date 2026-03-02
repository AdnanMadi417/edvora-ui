"use client";

import { useParams } from "next/navigation";
import UniversityDetails from "components/admin/KnowledgeHub/university/details/UniversityDetails";

export default function UniversityPage() {
  const params = useParams();
  const universityId = params?.id as string;

  if (!universityId) return null;

  return <UniversityDetails id={universityId} />;
}
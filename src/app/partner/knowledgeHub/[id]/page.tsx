"use client";

import { useParams } from "next/navigation";
import UniversityDetails from "../../../../components/partner/knowledgeHub/details/UniversityDetails";

export default function UniversityDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  return <UniversityDetails id={id} />;
}

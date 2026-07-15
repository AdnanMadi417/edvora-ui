"use client";

import { useParams } from "next/navigation";
import UniversityDetails from "features/programs/components/shared/details/ProgramDetails";

export default function UniversityDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  return <UniversityDetails id={id} />;
}

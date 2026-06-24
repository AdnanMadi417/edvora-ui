"use client";

import { useParams } from "next/navigation";
import LogisticalPartnersDetails from "features/logistical-service/components/admin/details/LogisticalPartnersDetails";

export default function UniversityDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div>
      <LogisticalPartnersDetails id={id} />
    </div>
  );
}

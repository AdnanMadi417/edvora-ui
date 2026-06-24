"use client";

import { useParams } from "next/navigation";
import EditLogisticalPartnersDetails from "features/logistical-service/components/admin/details/EditLogisticalPartnersDetails";

export default function UniversityDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div>
      <EditLogisticalPartnersDetails id={id} />
    </div>
  );
}

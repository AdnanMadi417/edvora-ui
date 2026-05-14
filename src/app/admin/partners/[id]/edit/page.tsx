"use client";

import { useParams } from "next/navigation";
import { EditPartnerDetails } from "features/partners";

export default function PartnerPage() {
  const params = useParams();
  const partnerId = params?.id as string;

  if (!partnerId) return null;

  return <EditPartnerDetails id={partnerId} />;
}
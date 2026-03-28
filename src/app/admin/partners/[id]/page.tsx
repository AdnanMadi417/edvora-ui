"use client";

import { useParams } from "next/navigation";
import PartnerDetails from "components/admin/partners/details/PartnerDetails";

export default function PartnerPage() {
  const params = useParams();
  const partnerId = params?.id as string;

  if (!partnerId) return null;

  return <PartnerDetails id={partnerId} />;
}
"use client";

import { useParams } from "next/navigation";
import EditPaymentMethodDetails from "components/admin/configUniversities/paymentMethods/EditPaymentMethodDetails";

export default function UniversityPage() {
  const params = useParams();
  const paymentMethodId = params?.id as string;

  if (!paymentMethodId) return null;

  return <EditPaymentMethodDetails id={paymentMethodId} />;
}
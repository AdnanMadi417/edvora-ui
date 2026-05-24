"use client";

import { useParams } from "next/navigation";
import EditPaymentMethodDetails from "features/universities/components/admin/payment-methods/EditPaymentMethodDetails";

export default function UniversityPage() {
  const params = useParams();
  const paymentMethodId = params?.id as string;

  if (!paymentMethodId) return null;

  return <EditPaymentMethodDetails id={paymentMethodId} />;
}
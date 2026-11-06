"use client";

import { useParams } from "next/navigation";
import PaymentMethodDetails from "features/universities/payment-methods/components/admin/PaymentMethodDetails";

export default function UniversityPage() {
  const params = useParams();
  const paymentMethodId = params?.id as string;

  if (!paymentMethodId) return null;

  return <PaymentMethodDetails id={paymentMethodId} />;
}
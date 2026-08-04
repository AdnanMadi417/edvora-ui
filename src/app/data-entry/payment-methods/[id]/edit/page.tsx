"use client";

import { useParams } from "next/navigation";
import EditPaymentMethodDetails from "features/universities/components/admin/payment-methods/EditPaymentMethodDetails";

export default function DataEntryEditPaymentMethodPage() {
  const params = useParams();
  const paymentMethodId = params?.id as string;

  if (!paymentMethodId) return null;

  return (
    <EditPaymentMethodDetails
      id={paymentMethodId}
      redirectPath="/data-entry/payment-methods"
      listPath="/data-entry/payment-methods"
      hideDelete
    />
  );
}

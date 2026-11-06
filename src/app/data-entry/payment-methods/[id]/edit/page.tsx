"use client";

import { useParams } from "next/navigation";
import EditPaymentMethodDetails from "features/universities/payment-methods/components/admin/EditPaymentMethodDetails";

export default function DataEntryEditPaymentMethodPage() {
  const params = useParams();
  const paymentMethodId = params?.id as string;

  if (!paymentMethodId) return null;

  return (
    <EditPaymentMethodDetails
      id={paymentMethodId}
      redirectPath={`/data-entry/payment-methods/${paymentMethodId}`}
      listPath="/data-entry/payment-methods"
      hideDelete
    />
  );
}

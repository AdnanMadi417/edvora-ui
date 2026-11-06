"use client";
import { useParams } from "next/navigation";
import PaymentMethodDetails from "features/universities/payment-methods/components/admin/PaymentMethodDetails";
export default function DataEntryPaymentMethodPage() {
  const params = useParams();
  const id = params?.id as string;
  return id ? (
    <PaymentMethodDetails
      id={id}
      basePath="/data-entry/payment-methods"
      allowDelete={false}
    />
  ) : null;
}

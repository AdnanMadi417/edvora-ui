"use client";
import PaymentMethodsDirectory from "../shared/PaymentMethodsDirectory";
export default function DataEntryPaymentMethodsTable() {
  return (
    <PaymentMethodsDirectory
      basePath="/data-entry/payment-methods"
      allowDelete={false}
    />
  );
}

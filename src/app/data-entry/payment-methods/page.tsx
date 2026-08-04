"use client";

import PaymentMethodsTable from "features/universities/components/admin/payment-methods/PaymentMethodsTable";

export default function DataEntryPaymentMethodsPage() {
  return (
    <PaymentMethodsTable
      basePath="/data-entry/payment-methods"
      hideDelete
      getRowHref={(id) => `/data-entry/payment-methods/${id}/edit`}
    />
  );
}

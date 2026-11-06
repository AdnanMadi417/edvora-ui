"use client";

import { useParams } from "next/navigation";
import BankDetails from "features/partners/banks/components/BankDetails";

export default function DataEntryBankDetailsPage() {
  const params = useParams();
  const bankId = params?.id as string;

  if (!bankId) return null;

  return <BankDetails id={bankId} basePath="/data-entry/banks" />;
}

"use client";

import { useParams } from "next/navigation";
import EditBankDetails from "features/banks/components/EditBankDetails";

export default function DataEntryEditBankPage() {
  const params = useParams();
  const bankId = params?.id as string;

  if (!bankId) return null;

  return <EditBankDetails id={bankId} basePath="/data-entry/banks" />;
}

"use client";

import { useParams } from "next/navigation";
import EditBankDetails from "features/partners/banks/components/EditBankDetails";

export default function AdminEditBankPage() {
  const params = useParams();
  const bankId = params?.id as string;

  if (!bankId) return null;

  return <EditBankDetails id={bankId} />;
}

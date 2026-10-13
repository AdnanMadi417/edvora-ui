"use client";

import { useParams } from "next/navigation";
import BankDetails from "features/banks/components/BankDetails";

export default function AdminBankDetailsPage() {
  const params = useParams();
  const bankId = params?.id as string;

  if (!bankId) return null;

  return <BankDetails id={bankId} />;
}

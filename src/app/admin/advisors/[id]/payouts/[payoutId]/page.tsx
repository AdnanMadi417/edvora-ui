"use client";

import { useParams } from "next/navigation";
import { PayoutDetailPage } from "features/applications/payouts";

export default function AdminPayoutDetailPage() {
  const params = useParams();
  const partnerId = params?.id as string;
  const payoutId = params?.payoutId as string;

  if (!partnerId || !payoutId) return null;

  return <PayoutDetailPage partnerId={partnerId} payoutId={payoutId} />;
}

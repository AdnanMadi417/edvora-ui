"use client";

import { useParams } from "next/navigation";
import { useAccountManagerDetails, AccountManagerProfile } from "features/account-managers";
import ReviewerAccountManagerPartnersTable from "features/account-managers/components/reviewer/ReviewerAccountManagerPartnersTable";

export default function ReviewerAccountManagerProfilePage() {
  const params = useParams();
  const id = params.id as string;

  const { manager, loading, error } = useAccountManagerDetails(id);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-ub-tone-danger-text">{error}</div>;
  if (!manager) return <div className="p-6">Manager not found</div>;

  return (
    <div className="pt-6">
      <AccountManagerProfile manager={manager} />
      <ReviewerAccountManagerPartnersTable managerId={manager.id} />
    </div>
  );
}

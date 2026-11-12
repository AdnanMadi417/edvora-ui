"use client";

import { useParams } from "next/navigation";
import { useAccountManagerDetails, EditAccountManager } from "features/account-managers";

export default function EditAccountManagerPage() {
  const params = useParams();
  const id = params.id as string;

  const { manager, loading, error } = useAccountManagerDetails(id);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-ub-tone-danger-text">{error}</div>;
  if (!manager) return <div className="p-6">Manager not found</div>;

  return (
    <div className="pt-6">
      <EditAccountManager manager={manager} />
    </div>
  );
}

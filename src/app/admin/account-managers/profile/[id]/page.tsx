"use client";

import { useParams } from "next/navigation";
import { useAccountManagerDetails } from "hooks/account-managers/useAccountManagerDetails";
import ProfileDetails from "components/admin/accountManager/profile/ProfileDetails";

export default function AccountManagerProfile() {
  const params = useParams();
  const id = params.id as string;

  const { manager, loading, error } =
    useAccountManagerDetails(id);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!manager) return <div className="p-6">Manager not found</div>;

  return (
    <div className="pt-6">
      <ProfileDetails manager={manager} />
    </div>
  );
}
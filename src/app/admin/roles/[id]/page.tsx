"use client";

import { useParams } from "next/navigation";
import RoleDetails from "features/roles/components/admin/RoleDetails";

export default function AdminRoleDetailsPage() {
  const params = useParams();
  const id = Number(params.id);

  return <RoleDetails roleId={id} />;
}

"use client";

import { useParams } from "next/navigation";
import StaffUserDetails from "features/staff-users/components/admin/StaffUserDetails";

export default function AdminStaffUserDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  return <StaffUserDetails userId={id} />;
}

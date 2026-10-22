"use client";

import { useParams } from "next/navigation";
import AccountManagerPartnerProfile from "features/partners/components/account-manager/AccountManagerPartnerProfile";

export default function AccountManagerPartnerProfilePage() {
  const params = useParams();
  const id = params.id as string;

  return <AccountManagerPartnerProfile id={id} />;
}

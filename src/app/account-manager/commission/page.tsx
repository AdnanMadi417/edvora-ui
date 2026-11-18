import { redirect } from "next/navigation";

// Commission for an account manager's advisors: the Applications list on the
// Commission stage, where each application's status says where its commission
// stands and its Commission tab shows the amounts.
export default function AccountManagerCommissionPage() {
  redirect("/account-manager/applications?stage=commission");
}

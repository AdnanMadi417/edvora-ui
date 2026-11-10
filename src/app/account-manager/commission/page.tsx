import { redirect } from "next/navigation";

// The account manager Commission page isn't built yet (its menu item is
// hidden in accountManagerRoutes). Send old links Home instead of showing
// placeholder figures.
export default function AccountManagerCommissionPage() {
  redirect("/account-manager/home");
}

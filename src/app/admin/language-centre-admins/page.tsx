import { notFound } from "next/navigation";
import CentreAdminUsers from "features/language-centre-admin/components/CentreAdminUsers";
import { FEATURES } from "config/featureFlags";

export default function Page() {
  if (!FEATURES.languageCentreAdmins) notFound();
  return <CentreAdminUsers />;
}

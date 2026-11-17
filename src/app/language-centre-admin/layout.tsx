import { notFound } from "next/navigation";
import { FEATURES } from "config/featureFlags";
import LanguageCentreAdminShell from "./LanguageCentreAdminShell";

// The whole Language Centre Admin portal is hidden from every user while the
// feature is off (config/featureFlags.ts): every /language-centre-admin URL is a 404.
export default function LanguageCentreAdminLayout({ children }: { children: React.ReactNode }) {
  if (!FEATURES.languageCentreAdmins) notFound();
  return <LanguageCentreAdminShell>{children}</LanguageCentreAdminShell>;
}

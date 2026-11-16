import LanguageCenterDetails from "features/universities/language-centers/LanguageCenterDetails";
import { notFound } from "next/navigation";
import { FEATURES } from "config/featureFlags";
export default async function LanguageCenterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!FEATURES.partnerUniversities) notFound();
  const { id } = await params;
  return (
    <LanguageCenterDetails
      id={id}
      basePath="/partner"
      readOnly
      allowDelete={false}
    />
  );
}

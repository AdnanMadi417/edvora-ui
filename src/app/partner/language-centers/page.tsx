import { Suspense } from "react";
import { notFound } from "next/navigation";
import { FEATURES } from "config/featureFlags";
import LanguageCentersDirectory from "features/universities/language-centers/LanguageCentersDirectory";
export default function PartnerLanguageCentersPage() {
  if (!FEATURES.partnerUniversities) notFound();
  return (
    <Suspense fallback={<p>Loading language centers...</p>}>
      <LanguageCentersDirectory
        basePath="/partner"
        readOnly
        allowDelete={false}
      />
    </Suspense>
  );
}

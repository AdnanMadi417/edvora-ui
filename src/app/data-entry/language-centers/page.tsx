import { Suspense } from "react";
import LanguageCentersDirectory from "features/universities/language-centers/LanguageCentersDirectory";
export default function LanguageCentersPage() {
  return (
    <Suspense fallback={<p>Loading language centers...</p>}>
      <LanguageCentersDirectory basePath="/data-entry" allowDelete={false} />
    </Suspense>
  );
}

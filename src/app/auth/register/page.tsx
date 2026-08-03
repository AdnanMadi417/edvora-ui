import { Suspense } from "react";
import PartnerRegisterPage from "features/partners/components/register/PartnerRegisterPage";

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <PartnerRegisterPage />
    </Suspense>
  );
}

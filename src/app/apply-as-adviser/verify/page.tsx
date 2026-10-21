"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function RedirectToRegisterOtp() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const email = searchParams.get("email");
    router.replace(`/apply-as-adviser?step=otp${email ? `&email=${encodeURIComponent(email)}` : ""}`);
  }, [router, searchParams]);

  return null;
}

export default function RegisterVerifyPage() {
  return (
    <Suspense fallback={null}>
      <RedirectToRegisterOtp />
    </Suspense>
  );
}

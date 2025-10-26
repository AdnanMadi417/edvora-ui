"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/auth/sign-in");
    },3000);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);


    return () => {
      clearTimeout(timer);
      clearInterval(countdownInterval);
    };
  }, [router]);

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 bg-primary"
    >
      <div className="w-full max-w-md text-center">

        <div className="mb-2 flex justify-center">
          <div
            className="rounded-full p-6 bg-blue-300/50"
          >
            <ShieldX
              size={72}
              strokeWidth={1.5}
              style={{ color: '#0348D1' }}
            />
          </div>
        </div>

        <h1
          className="mb-2 text-h1 font-semibold tracking-tight text-accent"
        >
          Access Denied
        </h1>

        <p
          className="mb-2 text-base leading-relaxed text-text-muted"
        >
          You don't have permission to access this page.
        </p>

        <p
          className="text-sm text-text-muted"
        >
          Redirecting automatically in {countdown} seconds
        </p>
      </div>
    </div>
  );
}
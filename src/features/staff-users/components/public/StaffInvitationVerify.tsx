"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { useVerifyStaffInvitationOtp } from "features/staff-users/hooks";
import InputField from "components/form/fields/InputField";
import OtpInputField from "components/form/fields/OtpInputField";
import Button from "components/ui/buttons/Button";
import logoImg from "/public/img/brand/Primary-Logo-Blue.png";

function formatRoleLabel(role: string): string {
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function StaffInvitationVerify() {
  const searchParams = useSearchParams();

  const { verifyStaffInvitationOtp, loading, error } = useVerifyStaffInvitationOtp();

  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [otp, setOtp] = useState("");
  const [result, setResult] = useState<{ message: string; email: string; role: string } | null>(null);

  const handleVerify = async () => {
    if (!email.trim() || otp.length < 6) return;
    try {
      const data = await verifyStaffInvitationOtp(email.trim(), otp);
      setResult(data);
    } catch {
      /* error shown via hook */
    }
  };

  if (result) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white px-7 py-10 text-center shadow-sm">
          <div className="mb-6 flex justify-center">
            <Image src={logoImg} alt="Unibexs" width={110} height={36} className="object-contain" priority />
          </div>

          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>

          <h2 className="text-xl font-bold text-slate-900">Account created</h2>
          <p className="mt-2 text-sm text-slate-500">
            {result.message || "Your staff account has been created."}
          </p>

          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-left">
            <p className="text-xs text-slate-500">Email</p>
            <p className="text-sm font-medium text-slate-900">{result.email}</p>
            <p className="mt-2 text-xs text-slate-500">Role</p>
            <p className="text-sm font-medium text-slate-900">{formatRoleLabel(result.role)}</p>
          </div>

          <Button
            onClick={() => { window.location.href = "/auth/sign-in"; }}
            text="Go to Sign In"
            bgColor="bg-blue-600"
            textColor="text-white"
            borderColor="border-blue-600"
            hoverTextColor="hover:text-white"
            hoverBorderColor="hover:border-blue-700"
            className="mt-6 w-full py-3 hover:bg-blue-700"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white px-7 py-10 shadow-sm">
        <div className="mb-6 flex justify-center">
          <Image src={logoImg} alt="Unibexs" width={110} height={36} className="object-contain" priority />
        </div>

        <h2 className="text-center text-xl font-bold text-slate-900">Verify your invitation</h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Enter the email you were invited with and the 6-digit code sent to your inbox.
        </p>

        <div className="mt-6">
          <InputField
            label="Email"
            field="email"
            type="email"
            placeholder="you@example.com"
            formData={{ email }}
            errors={{}}
            updateFormData={(_field: string, value: string) => setEmail(value)}
          />

          <OtpInputField
            label="Verification Code"
            field="otp"
            formData={{ otp }}
            errors={{ otp: error || "" }}
            updateFormData={(_field: string, value: string) => setOtp(value)}
          />
        </div>

        <Button
          onClick={handleVerify}
          disabled={loading || !email.trim() || otp.length < 6}
          text={loading ? "Verifying..." : "Verify & Create Account"}
          bgColor="bg-blue-600"
          textColor="text-white"
          borderColor="border-blue-600"
          hoverTextColor="hover:text-white"
          hoverBorderColor="hover:border-blue-700"
          className="w-full py-3 hover:bg-blue-700"
        />
      </div>
    </div>
  );
}

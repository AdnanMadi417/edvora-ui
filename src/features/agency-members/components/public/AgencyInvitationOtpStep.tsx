"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { useVerifyAgencyInvitationOtp, useResendAgencyInvitationOtp } from "features/agency-members/hooks";
import OtpInputField from "components/form/fields/OtpInputField";
import InputField from "components/form/fields/InputField";
import Button from "components/ui/buttons/Button";
import logoImg from "/public/img/brand/Primary-Logo-Blue.png";

export default function AgencyInvitationOtpStep() {
  const searchParams = useSearchParams();

  const { verifyOtp, loading: verifyLoading, error: otpError } = useVerifyAgencyInvitationOtp();
  const { resendOtp, loading: resendLoading, error: resendError, maxResendsReached } = useResendAgencyInvitationOtp();

  const [email, setEmail] = useState(() => searchParams.get("email") ?? "");
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [emailError, setEmailError] = useState("");

  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const handleVerify = async () => {
    if (!validateEmail() || otp.length < 6) return;
    try {
      await verifyOtp(email.trim(), otp);
      setVerified(true);
    } catch { /* error shown via hook */ }
  };

  const handleResend = async () => {
    if (!validateEmail()) return;
    setResendSuccess(false);
    try {
      await resendOtp(email.trim());
      setResendSuccess(true);
      setResendCooldown(60);
    } catch { /* error shown via hook */ }
  };

  if (verified) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white px-7 py-10 text-center shadow-sm">
          <div className="mb-6 flex justify-center">
            <Image src={logoImg} alt="Unibexs" width={110} height={36} className="object-contain" priority />
          </div>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Check your email</h2>
          <p className="mt-2 text-sm text-slate-500">
            We&apos;ve sent a link to <span className="font-medium text-slate-700">{email}</span> to finish
            setting up your account.
          </p>
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
            errors={{ email: emailError }}
            updateFormData={(_field: string, value: string) => { setEmail(value); setEmailError(""); }}
            onBlur={validateEmail}
          />

          <OtpInputField
            label="Verification Code"
            field="otp"
            formData={{ otp }}
            errors={{ otp: otpError || "" }}
            updateFormData={(_field: string, value: string) => setOtp(value)}
          />
        </div>

        <Button
          onClick={handleVerify}
          disabled={verifyLoading || !email.trim() || otp.length < 6}
          text={verifyLoading ? "Verifying..." : "Verify Code"}
          bgColor="bg-blue-600"
          textColor="text-white"
          borderColor="border-blue-600"
          hoverTextColor="hover:text-white"
          hoverBorderColor="hover:border-blue-700"
          className="w-full py-3 hover:bg-blue-700"
        />

        <div className="mt-4 space-y-2 text-center">
          {resendSuccess && !maxResendsReached && (
            <p className="text-sm text-green-600">Code resent — check your inbox.</p>
          )}
          {resendError && (
            <p className="text-sm text-red-600">{resendError}</p>
          )}
          {resendCooldown > 0 ? (
            <p className="text-sm text-slate-400">
              Resend available in <span className="font-medium text-slate-600">{resendCooldown}s</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading || !email.trim()}
              className="text-sm text-slate-500 transition hover:text-blue-600 disabled:opacity-50"
            >
              {resendLoading ? "Sending..." : "Didn't receive it? Resend code"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

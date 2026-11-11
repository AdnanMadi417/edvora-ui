"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useVerifyRegistrationOtp, useResendRegistrationOtp } from "features/partners/hooks";
import OtpInputField from "components/ub/forms/text/OtpInputField";
import Button from "components/ub/core/buttons/Button";
import logoImg from "/public/img/brand/Primary-Logo-Blue.png";

interface Props {
  email: string;
  onSuccess: () => void;
  onRestart: () => void;
}

export default function OtpStep({ email, onSuccess, onRestart }: Props) {
  const { verifyOtp, loading: verifyLoading, error: otpError } = useVerifyRegistrationOtp();
  const { resendOtp, loading: resendLoading, error: resendError, maxResendsReached } = useResendRegistrationOtp();

  const [otp, setOtp] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const handleVerify = async () => {
    if (otp.length < 6) return;
    try {
      await verifyOtp(email, otp);
      onSuccess();
    } catch { /* error shown via hook */ }
  };

  const handleResend = async () => {
    setResendSuccess(false);
    try {
      await resendOtp(email);
      setResendSuccess(true);
      setResendCooldown(60);
    } catch { /* error shown via hook */ }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ub-surface-subtle px-4">
      <div className="w-full max-w-sm overflow-hidden rounded-ub-xl border border-ub-border bg-ub-surface px-7 py-10 shadow-sm">
        <div className="mb-6 flex justify-center">
          <Image src={logoImg} alt="Unibexs" width={110} height={36} className="object-contain" priority />
        </div>

        <h2 className="text-center text-xl font-bold text-ub-text-primary">Verify your email</h2>
        <p className="mt-2 text-center text-sm text-ub-text-secondary">
          We sent a 6-digit verification code to{" "}
          <span className="font-medium text-ub-text-secondary">{email}</span>
        </p>

        <div className="mt-6">
          <OtpInputField
            label="Verification Code"
            field="otp"
            formData={{ otp }}
            errors={{ otp: otpError || "" }}
            updateFormData={(_: string, val: string) => setOtp(val)}
          />
        </div>

        <Button
          onClick={handleVerify}
          disabled={verifyLoading || otp.length < 6}
          text={verifyLoading ? "Verifying..." : "Verify Code"}
          variant="primary"
          className="w-full py-3 hover:bg-ub-action-primary-hover"
        />

        <div className="mt-4 flex flex-col items-center gap-2 text-center">
          {resendSuccess && !maxResendsReached && (
            <p className="text-sm text-ub-tone-success-text">Code resent — check your inbox.</p>
          )}
          {resendError && (
            <p className="text-sm text-ub-tone-danger-text">{resendError}</p>
          )}
          {maxResendsReached ? (
            <button
              type="button"
              onClick={onRestart}
              className="text-sm font-medium text-ub-text-link transition hover:text-ub-text-link"
            >
              Restart registration
            </button>
          ) : resendCooldown > 0 ? (
            <p className="text-sm text-ub-text-tertiary">
              Resend available in <span className="font-medium text-ub-text-secondary">{resendCooldown}s</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className="text-sm text-ub-text-secondary transition hover:text-ub-text-link disabled:opacity-50"
            >
              {resendLoading ? "Sending..." : "Didn't receive it? Resend code"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

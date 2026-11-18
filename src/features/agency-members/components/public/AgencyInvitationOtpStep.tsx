"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Clock, Lock, MailCheck, SearchX, ShieldCheck, UserCheck } from "lucide-react";

import { useVerifyAgencyInvitationOtp, useResendAgencyInvitationOtp } from "features/agency-members/hooks";
import OtpInputField from "components/ub/forms/text/OtpInputField";
import InputField from "components/ub/forms/text/InputField";
import Button from "components/ub/core/buttons/Button";
import Alert from "components/ub/feedback/notifications/Alert";
import { getApiErrorCode, getApiErrorDetails, parseApiError } from "utils/parseApiError";
import { InviteShell, LinkButton, StatusView, inviteTextLink } from "./InviteLayout";

/** Matches the backend's OTP_COOLDOWN_SECONDS. */
export const RESEND_COOLDOWN_SECONDS = 60;
const OTP_LENGTH = 6;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type View =
  | "enter"
  | "verified"
  | "expired"
  | "locked"
  | "resends_used"
  | "no_invite"
  | "already_verified"
  | "has_account";

type Notice = { tone: "success" | "info" | "danger"; text: string } | null;

const ASK_FOR_NEW_INVITE = "Ask your agency admin to send you a new invite.";

export default function AgencyInvitationOtpStep() {
  const searchParams = useSearchParams();
  const urlEmail = (searchParams.get("email") ?? "").trim();
  const urlEmailValid = EMAIL_RE.test(urlEmail);

  const { verifyOtp, loading: verifying } = useVerifyAgencyInvitationOtp();
  const { resendOtp, loading: resending } = useResendAgencyInvitationOtp();

  const [view, setView] = useState<View>("enter");
  const [email, setEmail] = useState(urlEmailValid ? urlEmail : "");
  // Ask for the email when the link didn't carry a usable one.
  const [editingEmail, setEditingEmail] = useState(!urlEmailValid);
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState<{ email?: string; otp?: string }>({});
  const [notice, setNotice] = useState<Notice>(null);
  // The invite email has just delivered a code, so the first resend waits a minute.
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const cleanEmail = email.trim().toLowerCase();

  const emailError = (): string => {
    if (!email.trim()) return "Enter the email address your invite was sent to";
    if (!EMAIL_RE.test(email.trim())) return "Enter a full email address, like name@example.com";
    return "";
  };

  const handleVerify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const next = {
      email: emailError(),
      otp: otp.length < OTP_LENGTH ? `Enter all ${OTP_LENGTH} digits of the code` : "",
    };
    setErrors(next);
    if (next.email || next.otp) {
      if (next.email) setEditingEmail(true);
      return;
    }
    setNotice(null);
    try {
      await verifyOtp(cleanEmail, otp);
      setView("verified");
    } catch (err) {
      const code = getApiErrorCode(err);
      switch (code) {
        case "otp_invalid": {
          const left = Number(getApiErrorDetails(err)?.attempts_remaining);
          const tries = Number.isFinite(left) ? ` ${left} ${left === 1 ? "try" : "tries"} left.` : "";
          setOtp("");
          setErrors({ otp: `That code isn't right. Check the latest email from Unibexs and try again.${tries}` });
          return;
        }
        case "otp_expired":
          // The code is hours old, so the backend's resend cooldown has long passed.
          setCooldown(0);
          setView("expired");
          return;
        case "otp_max_attempts":
          setView("locked");
          return;
        case "otp_not_found":
          setView("no_invite");
          return;
        case "already_verified":
          setView("already_verified");
          return;
        case "email_already_registered":
          setView("has_account");
          return;
        default:
          setNotice({ tone: "danger", text: parseApiError(err, "We couldn't check your code. Please try again.") });
      }
    }
  };

  const handleResend = async () => {
    const problem = emailError();
    if (problem) {
      setErrors({ email: problem });
      setEditingEmail(true);
      setView("enter");
      return;
    }
    setNotice(null);
    try {
      await resendOtp(cleanEmail);
      setOtp("");
      setErrors({});
      setView("enter");
      setNotice({ tone: "success", text: `We sent a new code to ${cleanEmail}. It works for 2 hours.` });
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      switch (getApiErrorCode(err)) {
        case "otp_recently_sent":
          setView("enter");
          setNotice({ tone: "info", text: "We sent you a code less than a minute ago. Check your inbox, or ask again when the timer ends." });
          setCooldown(RESEND_COOLDOWN_SECONDS);
          return;
        case "otp_max_resends":
          setView("resends_used");
          return;
        case "no_pending_invitation":
          setView("no_invite");
          return;
        case "already_verified":
          setView("already_verified");
          return;
        case "email_already_registered":
          setView("has_account");
          return;
        default:
          setNotice({ tone: "danger", text: parseApiError(err, "We couldn't send a new code. Please try again.") });
      }
    }
  };

  const switchEmail = () => {
    setView("enter");
    setEditingEmail(true);
    setOtp("");
    setErrors({});
    setNotice(null);
  };

  const resendControl = (primary: boolean) =>
    cooldown > 0 ? (
      <p className="text-ub-body-sm text-ub-text-secondary">
        You can ask for a new code in <span className="ub-tabular font-medium text-ub-text-primary">{cooldown}s</span>
      </p>
    ) : (
      <Button
        onClick={handleResend}
        loading={resending}
        text="Send a new code"
        variant={primary ? "primary" : "tertiary"}
        size={primary ? "md" : "sm"}
        className={primary ? "w-full" : undefined}
      />
    );

  const emailLabel = <span className="font-medium text-ub-text-primary">{cleanEmail}</span>;

  let content: React.ReactNode;
  switch (view) {
    case "verified":
      content = (
        <StatusView icon={MailCheck} tint="green" title="Check your email">
          <p>We sent a link to {emailLabel} to complete your profile. The link works for 48 hours.</p>
          <p>Nothing there? Check your spam folder. If it still hasn&apos;t arrived, ask your agency admin to resend your profile link.</p>
        </StatusView>
      );
      break;
    case "expired":
      content = (
        <StatusView
          icon={Clock}
          tint="amber"
          title="Your code has expired"
          actions={
            <>
              {notice && <Alert tone={notice.tone}>{notice.text}</Alert>}
              {resendControl(true)}
            </>
          }
          support
        >
          <p>Codes work for 2 hours. Send a new code to {emailLabel} and enter it on the next screen.</p>
          <p>If you can&apos;t get a new code, {ASK_FOR_NEW_INVITE.toLowerCase()}</p>
        </StatusView>
      );
      break;
    case "locked":
      content = (
        <StatusView icon={Lock} tint="red" title="This invite is locked" support>
          <p>The code was entered wrong 3 times, so to keep your account safe this invite can&apos;t be used any more.</p>
          <p>{ASK_FOR_NEW_INVITE} You&apos;ll get a fresh code by email.</p>
        </StatusView>
      );
      break;
    case "resends_used":
      content = (
        <StatusView icon={Lock} tint="amber" title="No more new codes for this invite" support>
          <p>You&apos;ve asked for the most new codes one invite allows.</p>
          <p>{ASK_FOR_NEW_INVITE} You&apos;ll get a fresh code by email.</p>
        </StatusView>
      );
      break;
    case "no_invite":
      content = (
        <StatusView
          icon={SearchX}
          tint="slate"
          title="We can't find an open invite"
          actions={<Button onClick={switchEmail} text="Use a different email" variant="secondary" className="w-full" />}
          support
        >
          <p>There&apos;s no open invite for {emailLabel}. It may have been replaced by a newer invite, or already used.</p>
          <p>Check the email address, or {ASK_FOR_NEW_INVITE.toLowerCase()}</p>
        </StatusView>
      );
      break;
    case "already_verified":
      content = (
        <StatusView icon={ShieldCheck} tint="green" title="Your email is already verified" support>
          <p>When you verified {emailLabel}, we emailed you a link to complete your profile. Open that email to carry on.</p>
          <p>If the link is lost or has expired, ask your agency admin to resend your profile link. You won&apos;t need a new code.</p>
        </StatusView>
      );
      break;
    case "has_account":
      content = (
        <StatusView icon={UserCheck} tint="blue" title="You already have an account" actions={<LinkButton href="/">Go to sign in</LinkButton>} support>
          <p>{emailLabel} already has a Unibexs account. Sign in with it instead.</p>
        </StatusView>
      );
      break;
    default:
      content = (
        <form noValidate onSubmit={handleVerify}>
          <h1 className="text-center text-ub-heading-md text-ub-text-primary">Verify your email</h1>
          <p className="mt-2 text-center text-ub-body-sm text-ub-text-secondary">
            Your agency invited you to join them on Unibexs.{" "}
            {editingEmail ? (
              <>Enter your email and the {OTP_LENGTH}-digit code from your invite.</>
            ) : (
              <>
                Enter the {OTP_LENGTH}-digit code we sent to <span className="font-medium text-ub-text-primary [overflow-wrap:anywhere]">{cleanEmail}</span>.
              </>
            )}
          </p>

          {!urlEmailValid && (
            <Alert tone="warning" className="mt-5" title={urlEmail ? "We can't read the email in this link" : "This link is missing your email"}>
              Enter the email address your invite was sent to. If you can, open the link from your invite email again.
            </Alert>
          )}

          <div className="mt-6">
            {editingEmail ? (
              <InputField
                label="Email address"
                field="email"
                type="email"
                placeholder="name@example.com"
                formData={{ email }}
                errors={errors}
                updateFormData={(_field: string, value: string) => {
                  setEmail(value);
                  setErrors((p) => ({ ...p, email: "" }));
                }}
                onBlur={() => email && setErrors((p) => ({ ...p, email: emailError() }))}
              />
            ) : (
              <div className="-mt-2 mb-4 flex justify-center">
                <button type="button" onClick={switchEmail} className={inviteTextLink}>
                  Not your email? Use a different one
                </button>
              </div>
            )}

            <OtpInputField
              label="Verification code"
              field="otp"
              formData={{ otp }}
              errors={errors}
              updateFormData={(_field: string, value: string) => {
                setOtp(value);
                setErrors((p) => ({ ...p, otp: "" }));
              }}
            />
          </div>

          {notice && (
            <Alert tone={notice.tone} className="mb-4">
              {notice.text}
            </Alert>
          )}

          <Button type="submit" loading={verifying} text="Verify" variant="primary" className="w-full" />

          <div className="mt-4 flex flex-col items-center gap-1 text-center">
            <p className="text-ub-body-sm text-ub-text-secondary">Didn&apos;t get a code? Check your spam folder.</p>
            {resendControl(false)}
          </div>
        </form>
      );
  }

  return <InviteShell>{content}</InviteShell>;
}

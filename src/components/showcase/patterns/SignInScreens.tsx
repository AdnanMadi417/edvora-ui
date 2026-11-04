"use client";

import { ReactNode, useState } from "react";
import clsx from "clsx";
import { MailCheck } from "lucide-react";
import Button from "components/ub/core/buttons/Button";
import TextButton from "components/ub/core/buttons/TextButton";
import Input from "components/ub/forms/text/Input";
import Checkbox from "components/ub/forms/choices/Checkbox";
import OtpInputField from "components/ub/forms/text/OtpInputField";
import Alert from "components/ub/feedback/notifications/Alert";
import Logo from "components/ub/brand/Logo";
import { emptyBody, emptyIconCircle, emptyTitle } from "components/ub/recipes";
import { Demo, ShowcaseSection, Variant, useDemoForm } from "../Showcase";

/** A screen-sized frame so each sign-in screen reads as a page, not a widget. */
function ScreenFrame({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("overflow-hidden rounded-ub-xl border border-ub-border bg-ub-surface", className)}>{children}</div>;
}

/** The centred auth card used by every pre-product screen. */
function AuthCard({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[400px] px-6 py-10">
      <Logo size="md" className="mb-8" />
      <h3 className="text-ub-heading-xl-mobile text-ub-text-primary">{title}</h3>
      {description && <p className="mt-2 text-ub-body-md text-ub-text-secondary">{description}</p>}
      <div className="mt-8">{children}</div>
    </div>
  );
}

function SignInForm({ withError = false }: { withError?: boolean }) {
  const [email, setEmail] = useState(withError ? "nur.aisyah@globalpathways.com" : "");
  const [password, setPassword] = useState(withError ? "wrongpassword" : "");
  const [remember, setRemember] = useState(true);
  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      {withError && (
        <Alert tone="danger" title="We couldn't sign you in">
          That email and password don&apos;t match. Check them and try again, or reset your password.
        </Alert>
      )}
      <Input label="Work email" type="email" autoComplete="email" required value={email} onChange={setEmail} placeholder="name@company.com" />
      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={setPassword}
        error={withError ? "Check your password and try again." : undefined}
      />
      <div className="flex items-center justify-between gap-4">
        <Checkbox checked={remember} onChange={setRemember} label="Keep me signed in" />
        <TextButton size="sm" href="#auth">
          Forgot password?
        </TextButton>
      </div>
      <Button variant="primary" size="lg" type="submit" text="Sign in" className="w-full" />
      <p className="text-center text-ub-body-sm text-ub-text-secondary">
        New to the Unibexs System?{" "}
        <TextButton size="sm" href="#auth">
          Apply as an Advisor
        </TextButton>
      </p>
    </form>
  );
}

export default function SignInScreens() {
  const otp = useDemoForm({ code: "4821" });
  const [resetEmail, setResetEmail] = useState("");

  return (
    <ShowcaseSection
      id="auth"
      number="12"
      title="Sign-in screens"
      description="The screens people see before they reach the product: signing in, verifying, and recovering access. In this UI-only build there is no authentication, so these are visual references built from the real components."
    >
      <Demo name="Sign in" path="components/ub/forms/text/Input.tsx" description="Split layout from lg up: a Night Blue brand panel with the one hero effect, and the form on a solid surface.">
        <ScreenFrame className="grid lg:grid-cols-2">
          <div data-ub-theme="dark" className="relative hidden overflow-hidden bg-ub-canvas p-10 lg:flex lg:flex-col lg:justify-between">
            <div aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(70% 60% at 20% 10%, rgba(3,72,209,0.5), transparent 70%)" }} />
            <Logo background="navy" size="md" className="relative" />
            <div className="relative">
              <p className="text-ub-display-md text-ub-text-primary">Every application, one place.</p>
              <p className="mt-3 max-w-sm text-ub-body-lg text-ub-text-secondary">Track students from enquiry to placed, with commission tracked automatically.</p>
            </div>
            <p className="relative text-ub-caption text-ub-text-secondary">© 2026 Unibexs</p>
          </div>
          <AuthCard title="Welcome back" description="Sign in to manage your students and applications.">
            <SignInForm />
          </AuthCard>
        </ScreenFrame>
      </Demo>

      <Demo name="Verification and recovery" path="components/ub/forms/text/OtpInputField.tsx" className="grid gap-6 xl:grid-cols-3">
        <Variant label="Verify your identity">
          <ScreenFrame>
            <AuthCard title="Verify your identity" description="Enter the 6-digit code we sent to n•••@globalpathways.com. It expires in 10 minutes.">
              <OtpInputField label="Verification code" field="code" required formData={otp.formData} errors={otp.errors} updateFormData={otp.updateFormData} />
              <Button variant="primary" size="lg" text="Verify code" className="mt-2 w-full" />
              <p className="mt-4 text-center text-ub-body-sm text-ub-text-secondary">
                Didn&apos;t get it? <TextButton size="sm">Resend code</TextButton>
              </p>
            </AuthCard>
          </ScreenFrame>
        </Variant>
        <Variant label="Forgot password">
          <ScreenFrame>
            <AuthCard title="Forgot password?" description="Enter your work email and we'll send you a link to reset it.">
              <div className="space-y-4">
                <Input label="Work email" type="email" required value={resetEmail} onChange={setResetEmail} placeholder="name@company.com" />
                <Button variant="primary" size="lg" text="Send reset link" className="w-full" />
                <TextButton size="sm" leadingIcon="arrow-left" href="#auth">
                  Back to sign in
                </TextButton>
              </div>
            </AuthCard>
          </ScreenFrame>
        </Variant>
        <Variant label="Check your email">
          <ScreenFrame>
            <div className="mx-auto flex w-full max-w-[400px] flex-col items-center px-6 py-10 text-center">
              <Logo size="md" className="mb-8" />
              <span className={emptyIconCircle}>
                <MailCheck className="h-8 w-8" aria-hidden />
              </span>
              <h3 className={clsx(emptyTitle, "mt-5")}>Check your email</h3>
              <p className={clsx(emptyBody, "mt-2")}>We sent a reset link to nur.aisyah@globalpathways.com. Open it on this device to choose a new password.</p>
              <Button variant="primary" size="lg" text="Back to sign in" className="mt-8 w-full" />
              <p className="mt-4 text-ub-body-sm text-ub-text-secondary">
                No email after 5 minutes? <TextButton size="sm">Resend link</TextButton>
              </p>
            </div>
          </ScreenFrame>
        </Variant>
      </Demo>

      <Demo name="Sign-in error" path="components/ub/feedback/notifications/Alert.tsx" description="Errors say what happened and how to fix it. The field error and the alert use the same words.">
        <ScreenFrame>
          <AuthCard title="Welcome back">
            <SignInForm withError />
          </AuthCard>
        </ScreenFrame>
      </Demo>
    </ShowcaseSection>
  );
}

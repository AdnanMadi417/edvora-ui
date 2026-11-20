"use client";

import React, { type ComponentType, type ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";
import { MessageCircle } from "lucide-react";
import Logo from "components/ub/brand/Logo";
import { buttonBase, buttonSizes, buttonVariants, emptyBody, focusRing, iconTints } from "components/ub/recipes";
import { SUPPORT_WHATSAPP_URL } from "constants/support";

// Shared shell for the public team-invite pages (/team/verify-otp,
// /team/accept-invite): logo above a centred card, same look as the Advisor
// sign-up OTP step, following the theme through --ub-* tokens.

export function InviteShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <main className="flex min-h-screen flex-col items-center bg-ub-surface-subtle px-4 py-8 sm:justify-center sm:py-12">
      <div className="mb-6 flex justify-center">
        <Logo size={32} priority />
      </div>
      <div
        className={clsx(
          "w-full min-w-0 rounded-ub-xl border border-ub-border bg-ub-surface shadow-ub-sm",
          wide ? "max-w-3xl" : "max-w-md p-5 sm:p-8",
        )}
      >
        {children}
      </div>
    </main>
  );
}

/** Text link styled like the tertiary button, with a 44px touch target on phones. */
export const inviteTextLink = clsx(
  "inline-flex min-h-11 items-center gap-1.5 rounded-ub-sm px-1 text-ub-label-md text-ub-text-link underline-offset-2 hover:underline md:min-h-9",
  focusRing,
);

/** "Message Unibexs support on WhatsApp": the last stop when the agency can't help. */
export function SupportLink({ className }: { className?: string }) {
  return (
    <p className={clsx("text-ub-body-sm text-ub-text-secondary", className)}>
      Still stuck?{" "}
      <a href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={inviteTextLink}>
        Message Unibexs support
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only"> on WhatsApp (opens in a new tab)</span>
      </a>
    </p>
  );
}

/** Primary-looking link for a next step that leaves this page. */
export function LinkButton({ href, children, variant = "primary" }: { href: string; children: ReactNode; variant?: "primary" | "secondary" }) {
  return (
    <Link href={href} className={clsx(buttonBase, buttonSizes.md, buttonVariants[variant], "w-full")}>
      {children}
    </Link>
  );
}

type Tint = keyof typeof iconTints;

interface StatusViewProps {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  tint?: Tint;
  title: string;
  children: ReactNode;
  /** Buttons and links for the next step, stacked full width. */
  actions?: ReactNode;
  /** Show the Unibexs support contact under the actions. */
  support?: boolean;
}

/**
 * One outcome of the invite flow (checked your email, link expired, invite
 * locked…). Owns the page's single h1 while it is shown, and always ends in
 * a next step so nobody is left on a dead end.
 */
export function StatusView({ icon: Icon, tint = "blue", title, children, actions, support = false }: StatusViewProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className={clsx("mb-4 grid h-14 w-14 place-items-center rounded-ub-full", iconTints[tint])}>
        <Icon className="h-7 w-7" aria-hidden="true" />
      </div>
      <h1 className="text-ub-heading-md text-ub-text-primary">{title}</h1>
      <div className={clsx(emptyBody, "mt-2 space-y-2 text-ub-body-sm")}>{children}</div>
      {actions && <div className="mt-6 flex w-full flex-col gap-3">{actions}</div>}
      {support && <SupportLink className="mt-4" />}
    </div>
  );
}

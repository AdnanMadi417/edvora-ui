"use client";

import { useState } from "react";
import { Mail, ShieldCheck, KeyRound } from "lucide-react";
import { useMe } from "hooks/useMe";
import api from "lib/useApi";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import Loading from "components/ub/feedback/states/Loading";
import Button from "components/ub/core/buttons/Button";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  account_manager: "Account Manager",
  reviewer: "Reviewer",
  data_entry: "Data Entry",
};

// Read-only self-profile for the staff roles (admin, account_manager,
// reviewer, data_entry) -- there's no staff equivalent of the partner's
// editable profile form on the backend, so this only shows what /auth/me
// already returns and offers the same email-link password reset the
// navbar's "Reset Password" button already uses, generalized to every
// role here since reviewer/data_entry had no self-service password path
// at all before this.
export default function StaffProfile() {
  const { user, loading } = useMe();
  const { showToast } = useToast();
  const [sending, setSending] = useState(false);

  const handleSendResetLink = async () => {
    if (!user?.email || sending) return;
    setSending(true);
    try {
      await api.post("/auth/forgot-password", { email: user.email });
    } catch {
      // Always show success to prevent email enumeration, same as the
      // navbar's existing handleSendResetLink.
    } finally {
      setSending(false);
      showToast("Password reset link sent to your email.", "success");
    }
  };

  if (loading || !user) return <Loading text="Loading your profile..." />;

  const roleLabel = ROLE_LABELS[user.role] ?? user.role;

  return (
    <div className="mx-auto mt-5 overflow-hidden rounded-lg border border-ub-border bg-ub-surface">
      <div className="flex items-center gap-4 border-b border-ub-border p-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ub-tone-brand-bg text-xl font-semibold text-ub-tone-brand-text">
          {user.name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-ub-text-primary">{user.name}</h1>
          <p className="text-sm text-ub-text-secondary">{roleLabel}</p>
        </div>
      </div>

      <div className="divide-y divide-ub-border">
        <div className="flex items-center justify-between gap-4 p-6">
          <span className="flex items-center gap-2 text-sm text-ub-text-secondary">
            <Mail className="h-4 w-4" />
            Email
          </span>
          <span className="truncate text-sm font-medium text-ub-text-primary">{user.email}</span>
        </div>
        <div className="flex items-center justify-between gap-4 p-6">
          <span className="flex items-center gap-2 text-sm text-ub-text-secondary">
            <ShieldCheck className="h-4 w-4" />
            Role
          </span>
          <span className="text-sm font-medium text-ub-text-primary">{roleLabel}</span>
        </div>
      </div>

      <div className="flex justify-end border-t border-ub-border p-6">
        <Button
          onClick={handleSendResetLink}
          disabled={sending}
          icon={<KeyRound className="h-4 w-4" />}
          text={sending ? "Sending..." : "Send Password Reset Link"}
          variant="secondary"
        />
      </div>
    </div>
  );
}

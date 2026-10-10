"use client";

import { useState } from "react";
import { CloudOff, LogOut, RefreshCw } from "lucide-react";
import { LOGOUT_URL, SIGN_IN_URL, setLoggingOut } from "lib/authRedirect";

type Variant = "unavailable" | "loop";

interface AuthErrorStateProps {
  variant: Variant;
  onRetry: () => void;
}

const COPY: Record<Variant, { title: string; body: string }> = {
  unavailable: {
    title: "Can't reach the server",
    body: "We couldn't confirm your session. Check your connection and try again.",
  },
  loop: {
    title: "We couldn't confirm your session",
    body: "The app tried to redirect you too many times in a row. Try again, or sign out and sign in again.",
  },
};

/**
 * Shown by RoleGuard instead of navigating when the session check fails for
 * any reason other than a definite "not signed in" / "not allowed" answer.
 * Staying on the page is the point (UBX-423): a redirect here is what used
 * to start the sign-in ↔ home loop.
 */
export default function AuthErrorState({ variant, onRetry }: AuthErrorStateProps) {
  const [signingOut, setSigningOut] = useState(false);
  const copy = COPY[variant];

  const signOut = async () => {
    setSigningOut(true);
    setLoggingOut(true);
    try {
      await fetch(LOGOUT_URL, { method: "POST" });
    } catch {
      // The route clears cookies; if it is unreachable we still leave the page.
    }
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.replace(SIGN_IN_URL);
  };

  return (
    <div role="alert" data-testid={`auth-error-${variant}`} className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-md border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mb-4 flex justify-center">
          <div className="rounded-md bg-blue-50 p-4">
            <CloudOff className="h-8 w-8 text-blue-600" strokeWidth={1.5} aria-hidden="true" />
          </div>
        </div>
        <h1 className="mb-2 text-xl font-semibold text-slate-900">{copy.title}</h1>
        <p className="mb-6 text-sm leading-relaxed text-slate-600">{copy.body}</p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Retry
          </button>
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

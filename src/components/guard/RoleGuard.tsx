"use client";

import { ReactNode, useEffect, useState } from "react";
import Loading from "components/loading/Loading";
import { SessionProvider, useSession } from "components/context/SessionContext";
import { AUTH_LOOP_BREAKER_EVENT, redirectToSignIn, redirectToUnauthorized } from "lib/authRedirect";
import { reportClientEvent } from "lib/clientTelemetry";
import AuthErrorState from "./AuthErrorState";

interface RoleGuardProps {
  allowedRoles: string[];
  children: ReactNode;
}

/**
 * Gates a role layout on a confirmed session (UBX-423).
 *
 * Navigates only on a definite answer from our backend:
 * - 401            → sign-in, once (token cleared).
 * - 403, or a role the layout does not allow → /unauthorized, once.
 * Anything else (network error, timeout, 5xx, 429, an edge block or
 * challenge) keeps the user on the current URL and shows an inline error
 * with Retry, after three automatic backed-off retries. A redirect on those
 * is what used to bounce users between sign-in and their home page without
 * limit.
 */
export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  return (
    <SessionProvider>
      <RoleGate allowedRoles={allowedRoles}>{children}</RoleGate>
    </SessionProvider>
  );
}

function RoleGate({ allowedRoles, children }: RoleGuardProps) {
  const session = useSession();
  const status = session?.status ?? "loading";
  const user = session?.user ?? null;
  const failure = session?.failure ?? null;
  const [loopBroken, setLoopBroken] = useState(false);

  useEffect(() => {
    const onTrip = () => setLoopBroken(true);
    window.addEventListener(AUTH_LOOP_BREAKER_EVENT, onTrip);
    return () => window.removeEventListener(AUTH_LOOP_BREAKER_EVENT, onTrip);
  }, []);

  const role = typeof user?.role === "string" ? user.role.toLowerCase() : null;
  const roleAllowed = status === "ready" && role !== null && allowedRoles.includes(role);
  const roleRejected = status === "ready" && !roleAllowed;

  useEffect(() => {
    if (status === "unauthenticated") {
      const outcome = redirectToSignIn("role-guard:401");
      if (outcome !== "navigated" && outcome !== "logging-out") setLoopBroken(true);
    } else if (status === "forbidden" || roleRejected) {
      const outcome = redirectToUnauthorized(status === "forbidden" ? "role-guard:403" : "role-guard:role-not-allowed");
      if (outcome !== "navigated" && outcome !== "logging-out") setLoopBroken(true);
    }
  }, [status, roleRejected]);

  useEffect(() => {
    if (status !== "unavailable") return;
    reportClientEvent("auth_guard_error_state", {
      kind: failure?.kind ?? "unavailable",
      status: failure?.status ?? null,
      attempts: failure?.attempts ?? 0,
    });
  }, [status, failure]);

  const retry = () => {
    setLoopBroken(false);
    session?.retry();
  };

  if (loopBroken) return <AuthErrorState variant="loop" onRetry={retry} />;
  if (status === "unavailable") return <AuthErrorState variant="unavailable" onRetry={retry} />;
  if (!roleAllowed) return <Loading />;
  return <>{children}</>;
}

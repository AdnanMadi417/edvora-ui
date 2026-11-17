"use client";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { SessionProvider } from "components/context/SessionContext";
import Loading from "components/ub/feedback/states/Loading";
interface RoleGuardProps {
  allowedRoles: string[];
  children: ReactNode;
}
/** Demo sessions remain selected by area. Centre staff cannot change areas by
 * typing a different URL; the root preview picker is the explicit role switch. */
export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const primaryRole = allowedRoles[0];
  const rolesKey = allowedRoles.join("|");
  const [state, setState] = useState<
    "loading" | "allowed" | "denied" | "error"
  >("loading");
  useEffect(() => {
    try {
      const selected = sessionStorage.getItem("unibexs:preview-role");
      if (
        selected === "language_centre_admin" &&
        !rolesKey.split("|").includes(selected)
      ) {
        setState("denied");
        return;
      }
      if (primaryRole === "language_centre_admin")
        sessionStorage.setItem("unibexs:preview-role", primaryRole);
      setState("allowed");
    } catch {
      setState("error");
    }
  }, [primaryRole, rolesKey]);
  if (state === "loading") return <Loading text="Loading your workspace…" />;
  if (state !== "allowed")
    return (
      <div className="mx-auto max-w-xl space-y-4 p-6">
        <h1 className="text-ub-heading-lg">
          {state === "denied"
            ? "Access restricted"
            : "Unable to open the workspace"}
        </h1>
        <p role="alert" className="text-ub-body-md text-ub-text-secondary">
          {state === "denied"
            ? "Language Centre Admins can access their assigned centre workspace only."
            : "Browser session storage is unavailable. Enable browser storage and reload."}
        </p>
        <Link
          className="text-ub-text-link underline"
          href="/language-centre-admin/overview"
        >
          Return to your centre
        </Link>
      </div>
    );
  return <SessionProvider role={primaryRole}>{children}</SessionProvider>;
}

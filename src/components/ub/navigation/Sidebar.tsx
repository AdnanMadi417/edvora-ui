"use client";

import { X, MessageSquarePlus, FlaskConical, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import clsx from "clsx";
import Links, { type SidebarTip } from "components/ub/navigation/SidebarLinks";
import Logo from "components/ub/brand/Logo";
import { useSidebarCollapsed } from "./sidebarState";
import { IRoute } from "types/navigation";
import Link from "next/link";

import { useEffect, useState, useCallback, useId } from "react";
import { useMe } from "hooks/useMe";
import { usePartnerProfile } from "features/partners/hooks";
import { formatAgencyRole } from "features/partners/utils";
import PresignedImage from "components/ub/data/PresignedImage";
import { avatarInitials, focusRing, focusRingInset, iconButtonSizes, scrim, tagBase, tagTones, tooltip } from "components/ub/recipes";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  account_manager: "Account manager",
  partner: "Advisor",
  data_entry: "Data entry",
  reviewer: "Reviewer",
};

function getRoleLabel(role: string): string {
  return ROLE_LABELS[role] || role;
}

const PROFILE_PATHS: Record<string, string> = {
  partner: "/partner/profile",
  account_manager: "/account-manager/profile",
  admin: "/admin/profile",
  reviewer: "/reviewer/profile",
  data_entry: "/data-entry/profile",
};

const scrollArea =
  "[&::-webkit-scrollbar-thumb]:rounded-ub-full [&::-webkit-scrollbar-thumb]:bg-ub-border [&::-webkit-scrollbar]:w-1.5";

/** id of the sidebar element, for aria-controls on the toggles that open/collapse it. */
export const SIDEBAR_ID = "ub-sidebar";

/** True when focus is in a text field, where Ctrl/⌘+B must keep meaning "bold". */
const isTyping = (el: Element | null) => !!el && (el.matches("input, textarea, select") || (el as HTMLElement).isContentEditable);

function SidebarUnibexs(props: { routes: IRoute[]; [x: string]: any }) {
  const { routes, open, setOpen } = props;
  const { collapsed, toggle } = useSidebarCollapsed();
  const [tip, setTip] = useState<SidebarTip | null>(null);

  // Ctrl/⌘ + B collapses or expands the desktop sidebar.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "b" || !(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey) return;
      if (isTyping(document.activeElement) || !window.matchMedia("(min-width: 1200px)").matches) return;
      e.preventDefault();
      setTip(null);
      toggle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  // The (mock) session comes from the role layout's SessionProvider (via RoleGuard),
  // so the sidebar no longer makes its own /auth/me call on every mount.
  const { user, error: userFetchError } = useMe();
  const userError = !!userFetchError;
  const [showBetaTooltip, setShowBetaTooltip] = useState(false);
  const betaTooltipId = useId();
  const { partner } = usePartnerProfile({ enabled: user?.role === "partner" });
  const isAgencyPartner = partner?.type === "agency";
  const photoFileKey = isAgencyPartner
    ? partner?.company_details?.logo_file_key
    : partner?.individual_details?.profile_photo_file_key;
  const sidebarDisplayName = (isAgencyPartner && partner?.company_details?.company_name) || user?.name || "";

  const profilePath = user?.role ? PROFILE_PATHS[user.role] : undefined;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, setOpen]);

  const handleOverlayClick = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const userCard = (
    <>
      <span className={clsx(avatarInitials, "h-10 w-10 text-ub-label-lg")}>
        {user ? (
          <PresignedImage
            fileKey={photoFileKey ?? undefined}
            alt={sidebarDisplayName}
            className="h-full w-full object-cover"
            fallback={sidebarDisplayName ? sidebarDisplayName[0].toUpperCase() : "?"}
          />
        ) : (
          <span className="h-5 w-5 animate-pulse rounded-ub-full bg-ub-skeleton motion-reduce:animate-none" />
        )}
      </span>
      <span className="ub-sidebar-label min-w-0 flex-1">
        {user ? (
          <>
            <span className="block truncate text-ub-label-md text-ub-text-primary">{sidebarDisplayName}</span>
            <span className="block truncate text-ub-caption text-ub-text-tertiary">
              {user.role === "partner" && user.agency_role ? formatAgencyRole(user.agency_role) : getRoleLabel(user.role)}
            </span>
          </>
        ) : (
          <>
            <span className="mb-2 block h-4 w-32 animate-pulse rounded-ub-sm bg-ub-skeleton motion-reduce:animate-none" />
            <span className="block h-3 w-20 animate-pulse rounded-ub-sm bg-ub-skeleton motion-reduce:animate-none" />
          </>
        )}
      </span>
    </>
  );

  return (
    <>
      {open && (
        <div className={clsx("fixed inset-0 z-40 backdrop-blur-sm xl:hidden", scrim)} onClick={handleOverlayClick} aria-hidden="true" />
      )}

      <div
        className={clsx(
          // Strong light glass: stays legible when it overlays content as a drawer.
          "ub-glass-light-strong fixed start-0 top-0 z-50 flex h-screen w-64 flex-col xl:z-[60] xl:w-[var(--ub-sidebar-w)]",
          "transition-[transform,width] duration-ub-slow ease-ub-standard motion-reduce:transition-none xl:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full rtl:translate-x-full xl:rtl:translate-x-0",
        )}
        id={SIDEBAR_ID}
        role="navigation"
        aria-label="Main navigation"
      >
        <header className="ub-sidebar-header flex h-16 shrink-0 items-center gap-2 px-5">
          <Link href="/" className={clsx("ub-sidebar-expanded-only flex shrink-0 items-center rounded-ub-sm", focusRing)} aria-label="Unibexs home">
            {/* Logo swaps to the reversed artwork in dark (guide §3). */}
            <Logo size={24} priority />
          </Link>
          <Link href="/" className={clsx("ub-sidebar-collapsed-only flex shrink-0 items-center rounded-ub-sm", focusRing)} aria-label="Unibexs home">
            <Logo symbolOnly size="md" alt="" />
          </Link>
          {user?.role === "partner" && (
            <div className="ub-sidebar-expanded-only relative">
              <span
                tabIndex={0}
                aria-describedby={showBetaTooltip ? betaTooltipId : undefined}
                className={clsx(tagBase, tagTones.warning, "h-5 cursor-default px-1.5", focusRing)}
                onMouseEnter={() => setShowBetaTooltip(true)}
                onMouseLeave={() => setShowBetaTooltip(false)}
                onFocus={() => setShowBetaTooltip(true)}
                onBlur={() => setShowBetaTooltip(false)}
              >
                <FlaskConical className="h-3 w-3" aria-hidden />
                Beta
              </span>
              {showBetaTooltip && (
                <div id={betaTooltipId} role="tooltip" className={clsx(tooltip, "absolute start-0 top-full z-50 mt-2 w-52 text-ub-caption")}>
                  We&apos;re still polishing the Unibexs System, so you may spot a few bugs. Thanks for testing with us.
                </div>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              setTip(null);
              toggle();
            }}
            aria-controls={SIDEBAR_ID}
            aria-expanded={!collapsed}
            aria-label="Collapse sidebar"
            title="Collapse sidebar (Ctrl+B)"
            className={clsx(
              "ub-sidebar-expanded-only ms-auto hidden place-items-center rounded-ub-full text-ub-icon transition-colors duration-ub-fast hover:bg-ub-surface-subtle hover:text-ub-text-primary xl:inline-grid",
              iconButtonSizes.md,
              focusRing,
            )}
          >
            <PanelLeftClose className="h-5 w-5 rtl:-scale-x-100" aria-hidden />
          </button>
          <button
            className={clsx(
              "ms-auto inline-grid place-items-center rounded-ub-full text-ub-icon transition-colors duration-ub-fast hover:bg-ub-surface-subtle hover:text-ub-text-primary xl:hidden",
              iconButtonSizes.md,
              focusRing,
            )}
            onClick={handleOverlayClick}
            aria-label="Close navigation menu"
            type="button"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>

        <div className={clsx("flex-1 overflow-y-auto px-3 py-4", scrollArea)} onScroll={() => setTip(null)}>
          <button
            type="button"
            onClick={() => {
              setTip(null);
              toggle();
            }}
            onMouseEnter={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setTip({ label: "Expand sidebar (Ctrl+B)", top: r.top + r.height / 2 });
            }}
            onMouseLeave={() => setTip(null)}
            aria-controls={SIDEBAR_ID}
            aria-expanded={!collapsed}
            aria-label="Expand sidebar"
            className={clsx(
              "ub-sidebar-collapsed-only ub-sidebar-item mb-2 flex h-10 w-full items-center rounded-ub-md text-ub-icon transition-colors duration-ub-fast hover:bg-ub-nav-hover hover:text-ub-text-primary",
              focusRingInset,
            )}
          >
            <PanelLeftOpen className="h-5 w-5 rtl:-scale-x-100" aria-hidden />
          </button>
          <Links routes={routes} onLinkClick={() => setOpen(false)} onTip={setTip} />
        </div>

        {tip && (
          <div
            aria-hidden
            className={clsx(tooltip, "fixed z-[70] hidden -translate-y-1/2 whitespace-nowrap xl:block")}
            style={{ top: tip.top, insetInlineStart: "calc(var(--ub-sidebar-w) + 8px)" }}
          >
            {tip.label}
          </div>
        )}

        {user?.role === "partner" && (
          <div className="px-3 pb-2">
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLScbdcaLfK0utkj8DaMVEJdBUW82swRrWWZODNcFq1DNaRLLTQ/viewform"
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={(e) => {
                if (!collapsed) return;
                const r = e.currentTarget.getBoundingClientRect();
                setTip({ label: "Send feedback", top: r.top + r.height / 2 });
              }}
              onMouseLeave={() => setTip(null)}
              className={clsx(
                "ub-sidebar-item flex h-10 items-center gap-3 rounded-ub-md px-3 text-ub-label-md text-ub-text-secondary transition-colors duration-ub-fast hover:bg-ub-nav-hover hover:text-ub-text-primary",
                focusRingInset,
              )}
            >
              <MessageSquarePlus className="h-5 w-5" aria-hidden />
              <span className="ub-sidebar-label">Send feedback</span>
            </a>
          </div>
        )}

        <footer className="shrink-0 border-t border-ub-border p-3">
          {userError ? (
            <div className="px-3 py-2 text-center" role="alert">
              <p className="text-ub-body-sm text-ub-tone-danger-text">We couldn&apos;t load your account.</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className={clsx("mt-1 rounded-ub-sm text-ub-label-sm text-ub-text-link hover:underline", focusRing)}
              >
                Reload the page
              </button>
            </div>
          ) : profilePath ? (
            <Link
              href={profilePath}
              onClick={() => setOpen(false)}
              className={clsx("ub-sidebar-item flex items-center gap-3 rounded-ub-md p-2 transition-colors duration-ub-fast hover:bg-ub-surface", focusRingInset)}
            >
              {userCard}
            </Link>
          ) : (
            <div className="flex items-center gap-3 p-2">{userCard}</div>
          )}
        </footer>
      </div>
    </>
  );
}

export default SidebarUnibexs;

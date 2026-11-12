"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "components/ub/feedback/dialogs/Modal";
import Button from "components/ub/core/buttons/Button";

/**
 * Warns before someone leaves a form with unsaved work. While `active`:
 * closing or reloading the tab shows the browser's own warning, and clicking
 * an in-app link (sidebar, breadcrumbs…) opens a confirmation first.
 * Render the returned `dialog` once on the page.
 */
export function useLeaveGuard(
  active: boolean,
  copy: { title?: string; description?: string } = {}
) {
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    if (!active) return;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    // Capture phase, so this runs before Next's Link handles the click.
    const click = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      event.preventDefault();
      event.stopPropagation();
      setPendingHref(url.pathname + url.search + url.hash);
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", click, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", click, true);
    };
  }, [active]);

  const stay = () => setPendingHref(null);
  const leave = () => {
    const href = pendingHref;
    setPendingHref(null);
    if (href) router.push(href);
  };

  const dialog = (
    <Modal
      open={!!pendingHref}
      onClose={stay}
      role="alertdialog"
      size="sm"
      title={copy.title ?? "Leave this page?"}
      description={copy.description ?? "What you've entered will be lost."}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" text="Stay" onClick={stay} />
          <Button variant="destructive" text="Leave" onClick={leave} />
        </div>
      }
    />
  );

  return { dialog };
}

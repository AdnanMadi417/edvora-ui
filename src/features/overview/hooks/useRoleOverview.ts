"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "components/context/SessionContext";
import { createOverviewPlan } from "../services/overviewApi";
import type {
  OverviewContext,
  OverviewResource,
  OverviewRole,
} from "../model/types";

export function useRoleOverview(role: OverviewRole) {
  const session = useSession();
  const user = session?.user;
  const partner = session?.partner;
  const waiting =
    !session ||
    session.status === "loading" ||
    (role === "partner" && (!partner || session.isPartnerLoading));
  const denied =
    !!session &&
    session.status === "ready" &&
    (!user ||
      user.role !== role ||
      (role === "partner" &&
        !!partner &&
        (!partner.is_active ||
          (user.partner_id
            ? user.partner_id !== partner.id
            : partner.user_id !== user.id))));
  const member =
    partner?.agency_role === "member" ||
    user?.agency_role === "member" ||
    !!user?.agency_membership ||
    !!partner?.agency_membership;
  const context = useMemo<OverviewContext>(
    () => ({
      role,
      partnerId: partner?.id,
      agencyAdmin: role === "partner" && partner?.type === "agency" && !member,
      canViewCommission:
        role === "partner" && !!partner?.is_verified && !member,
      canCreateApplication:
        role === "partner" && !!partner?.is_verified && !!partner?.is_active,
    }),
    [
      role,
      partner?.id,
      partner?.type,
      partner?.is_verified,
      partner?.is_active,
      member,
    ]
  );
  const enabled = !waiting && !denied;
  const key = JSON.stringify([user?.id, context, enabled]);
  const plans = useMemo(
    () => (enabled ? createOverviewPlan(context) : []),
    [enabled, context]
  );
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<{
    key: string;
    resources: Record<string, OverviewResource>;
  }>({ key: "", resources: {} });
  const refresh = useCallback(() => setRound((value) => value + 1), []);
  // The first load for a user/context shows skeletons; later refreshes run in
  // the background and keep the numbers on screen until new ones arrive.
  const loadedKey = useRef("");
  useEffect(() => {
    let cancelled = false;
    const background = loadedKey.current === key;
    loadedKey.current = key;
    if (!background)
      setResult({
        key,
        resources: Object.fromEntries(
          plans.map((plan) => [plan.id, { state: "loading" }])
        ),
      });
    plans.forEach((plan) => {
      plan
        .load()
        .then((data) => {
          if (!cancelled)
            setResult((current) => ({
              key,
              resources: {
                ...current.resources,
                [plan.id]: { state: "ready", data },
              },
            }));
        })
        .catch((error) => {
          if (cancelled) return;
          setResult((current) =>
            // A failed background refresh keeps the last good numbers.
            background && current.resources[plan.id]?.state === "ready"
              ? current
              : {
                  key,
                  resources: {
                    ...current.resources,
                    [plan.id]: {
                      state: "error",
                      error:
                        error?.response?.status === 403
                          ? "You don't have access to this information."
                          : "Couldn't load this information. Please try again.",
                    },
                  },
                }
          );
        });
    });
    return () => {
      cancelled = true;
    };
  }, [key, plans, round]);

  // Refresh by itself: every minute while the tab is visible, and on return to
  // the tab, at most once every 30 seconds.
  useEffect(() => {
    if (!enabled) return;
    let last = Date.now();
    const tick = () => {
      if (document.visibilityState !== "visible" || Date.now() - last < 30_000)
        return;
      last = Date.now();
      refresh();
    };
    const timer = window.setInterval(tick, 60_000);
    window.addEventListener("focus", tick);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", tick);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [enabled, refresh]);
  const resources = result.key === key ? result.resources : {};
  return {
    session,
    context,
    plans,
    resources,
    refresh,
    waiting,
    denied,
    refreshing: plans.some(
      (plan) => !resources[plan.id] || resources[plan.id].state === "loading"
    ),
  };
}

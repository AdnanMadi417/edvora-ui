"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  useEffect(() => {
    let cancelled = false;
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
          if (!cancelled)
            setResult((current) => ({
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
            }));
        });
    });
    return () => {
      cancelled = true;
    };
  }, [key, plans, round]);
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

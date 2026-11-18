import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Cookies from "js-cookie";
import api from "lib/useApi";
import type {
  PartnerApplication,
  PartnerApplicationsResponse,
} from "features/applications/partner/hooks/usePartnerApplications";
import type { ApplicationDetail } from "features/applications/shared/applicationTypes";
import { parseApiError } from "utils/parseApiError";
import {
  isExpectedCandidate,
  pickExpectedCommission,
  runWithConcurrency,
  totalsByCurrency,
  type ExpectedAmount,
} from "../utils/expected";

/** Details loaded at once. The list has no commission field, so each application costs one request. */
export const DETAIL_CONCURRENCY = 4;
const LIST_PAGE_SIZE = 100;
/** Safety stop for very large books (1,000 active applications). */
const MAX_LIST_PAGES = 10;

export type ExpectedRowStatus = "loading" | "ready" | "failed";

export interface ExpectedRow {
  application: PartnerApplication;
  status: ExpectedRowStatus;
  /** Null while loading, on failure, or when the application has no open commission. */
  expected: ExpectedAmount | null;
}

// Cached per application and its last update, so a changed application is
// fetched again but moving between filters (or pages) is free.
const cache = new Map<string, ExpectedAmount | null>();
const inFlight = new Map<string, Promise<ExpectedAmount | null>>();
const cacheKey = (app: PartnerApplication) => `${app.id}:${app.updated_at}`;

/** Test-only: forget cached details. */
export function clearExpectedCommissionCache() {
  cache.clear();
  inFlight.clear();
}

const authHeaders = () => {
  const token = Cookies.get("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

function loadExpected(partnerId: string, app: PartnerApplication) {
  const key = cacheKey(app);
  if (cache.has(key)) return Promise.resolve(cache.get(key) ?? null);
  const running = inFlight.get(key);
  if (running) return running;
  const request = api
    .get<ApplicationDetail>(`/partners/${partnerId}/applications/${app.id}`, {
      headers: authHeaders(),
    })
    .then((res) => {
      const expected = pickExpectedCommission(res.data?.commissions);
      cache.set(key, expected);
      return expected;
    })
    .finally(() => inFlight.delete(key));
  inFlight.set(key, request);
  return request;
}

export interface UseExpectedCommissionsParams {
  partnerId?: string | null;
  /** Agency admins: include every team member's applications. */
  includeMembers?: boolean;
  /** Agency admins: only this team member's applications. */
  memberPartnerId?: string;
  enabled?: boolean;
}

/**
 * Commission still to come: the Advisor's active applications that haven't
 * reached the commission stage, each with the amount from its detail.
 * One list request per 100 applications, then one detail request per
 * application (4 at a time, cached).
 */
export function useExpectedCommissions({
  partnerId,
  includeMembers = false,
  memberPartnerId,
  enabled = true,
}: UseExpectedCommissionsParams) {
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [listVersion, setListVersion] = useState(0);
  const [detailVersion, setDetailVersion] = useState(0);
  const [details, setDetails] = useState<
    Record<string, { status: ExpectedRowStatus; expected: ExpectedAmount | null }>
  >({});
  const listRequest = useRef(0);

  useEffect(() => {
    if (!enabled || !partnerId) return;
    const request = ++listRequest.current;
    setListLoading(true);
    setListError(null);
    (async () => {
      const all: PartnerApplication[] = [];
      for (let page = 0; page < MAX_LIST_PAGES; page++) {
        const res = await api.get<PartnerApplicationsResponse>(
          `/partners/${partnerId}/applications`,
          {
            params: {
              limit: LIST_PAGE_SIZE,
              offset: page * LIST_PAGE_SIZE,
              status: "active",
              ...(includeMembers ? { include_members: true } : {}),
            },
            headers: authHeaders(),
          }
        );
        const items = res.data?.items ?? [];
        all.push(...items);
        if (!items.length || all.length >= (res.data?.total ?? 0)) break;
      }
      return all;
    })()
      .then((all) => {
        if (request === listRequest.current) setApplications(all);
      })
      .catch((err: unknown) => {
        if (request === listRequest.current)
          setListError(parseApiError(err, "Your applications couldn't load"));
      })
      .finally(() => {
        if (request === listRequest.current) setListLoading(false);
      });
  }, [enabled, partnerId, includeMembers, listVersion]);

  const candidates = useMemo(
    () =>
      applications.filter(
        (app) =>
          isExpectedCandidate(app) &&
          (!memberPartnerId || app.partner_id === memberPartnerId)
      ),
    [applications, memberPartnerId]
  );

  useEffect(() => {
    if (!enabled || !partnerId || !candidates.length) return;
    let cancelled = false;
    const update = (key: string, status: ExpectedRowStatus, expected: ExpectedAmount | null) => {
      if (!cancelled) setDetails((prev) => ({ ...prev, [key]: { status, expected } }));
    };
    const todo = candidates.filter((app) => {
      const key = cacheKey(app);
      if (cache.has(key)) {
        update(key, "ready", cache.get(key) ?? null);
        return false;
      }
      update(key, "loading", null);
      return true;
    });
    runWithConcurrency(todo, DETAIL_CONCURRENCY, async (app) => {
      if (cancelled) return;
      const key = cacheKey(app);
      try {
        update(key, "ready", await loadExpected(partnerId, app));
      } catch {
        update(key, "failed", null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, partnerId, candidates, detailVersion]);

  const rows: ExpectedRow[] = useMemo(
    () =>
      candidates.map((application) => {
        const state = details[cacheKey(application)];
        return {
          application,
          status: state?.status ?? "loading",
          expected: state?.expected ?? null,
        };
      }),
    [candidates, details]
  );

  const totals = useMemo(
    () => totalsByCurrency(rows.filter((r) => r.status === "ready").map((r) => r.expected)),
    [rows]
  );
  const pending = rows.filter((r) => r.status === "loading").length;
  const failed = rows.filter((r) => r.status === "failed").length;

  const retry = useCallback(() => {
    if (listError) setListVersion((v) => v + 1);
    else setDetailVersion((v) => v + 1);
  }, [listError]);

  return {
    rows,
    totals,
    /** The application list is loading (row count not known yet). */
    loading: enabled && (listLoading || (!partnerId && !listError)),
    error: listError,
    /** Rows whose amount is still loading. */
    pending,
    /** Rows whose detail failed to load. */
    failed,
    retry,
  };
}

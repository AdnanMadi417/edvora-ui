import { act, renderHook, waitFor } from "@testing-library/react";
import api from "lib/useApi";
import { clearExpectedCommissionCache, useExpectedCommissions } from "./useExpectedCommissions";

jest.mock("lib/useApi", () => ({ __esModule: true, default: { get: jest.fn() } }));
const get = api.get as jest.Mock;

const app = (id: string, stage: string, over: Record<string, unknown> = {}) => ({
  id,
  updated_at: "2026-01-01",
  stage,
  status: "",
  lifecycle_status: "active",
  partner_id: "agency",
  ...over,
});
const commissions = (amount: number, currency = "RM") => ({
  data: { commissions: [{ id: "c", status: "pending", amount, currency, created_at: "2026-01-01" }] },
});

beforeEach(() => {
  clearExpectedCommissionCache();
  get.mockReset();
  get.mockImplementation((url: string) => {
    if (url === "/partners/agency/applications")
      return Promise.resolve({
        data: {
          total: 4,
          items: [
            app("a1", "Visa Processing"),
            app("a2", "Partner Commission Invoicing"),
            app("a3", "Offer Letter", { partner_id: "member" }),
            app("a4", "Application Review"),
          ],
        },
      });
    if (url.endsWith("/a1")) return Promise.resolve(commissions(3000));
    if (url.endsWith("/a3")) return Promise.resolve(commissions(500, "USD"));
    return Promise.reject(new Error("down"));
  });
});

it("loads details only for applications before the commission stage and copes with failures", async () => {
  const { result } = renderHook(() =>
    useExpectedCommissions({ partnerId: "agency", includeMembers: true })
  );
  await waitFor(() => expect(result.current.rows).toHaveLength(3));
  await waitFor(() => expect(result.current.pending).toBe(0));
  expect(result.current.rows.map((r) => [r.application.id, r.status])).toEqual([
    ["a1", "ready"],
    ["a3", "ready"],
    ["a4", "failed"],
  ]);
  expect(result.current.failed).toBe(1);
  expect(result.current.totals).toEqual([
    { currency: "RM", amount: 3000, count: 1 },
    { currency: "USD", amount: 500, count: 1 },
  ]);
  const detailUrls = get.mock.calls.map(([url]) => url).filter((u: string) => /applications\/a\d$/.test(u));
  expect(detailUrls).not.toContain("/partners/agency/applications/a2");
  expect(get).toHaveBeenCalledWith(
    "/partners/agency/applications",
    expect.objectContaining({ params: expect.objectContaining({ status: "active", include_members: true }) })
  );

  // Retrying only refetches what failed; loaded amounts come from the cache.
  get.mockClear();
  act(() => result.current.retry());
  await waitFor(() => expect(result.current.failed).toBe(1));
  await waitFor(() => expect(get).toHaveBeenCalledTimes(1));
  expect(get.mock.calls.map(([url]) => url)).toEqual(["/partners/agency/applications/a4"]);
});

it("narrows an agency admin's rows to one team member", async () => {
  const { result } = renderHook(() =>
    useExpectedCommissions({ partnerId: "agency", includeMembers: true, memberPartnerId: "member" })
  );
  await waitFor(() => expect(result.current.rows).toHaveLength(1));
  await waitFor(() => expect(result.current.pending).toBe(0));
  expect(result.current.totals).toEqual([{ currency: "USD", amount: 500, count: 1 }]);
});

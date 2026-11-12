import React from "react";
import { renderHook, waitFor, act } from "@testing-library/react";
import {
  SessionContext,
  SessionContextValue,
} from "components/context/SessionContext";
import { MOCK_PARTNER, mockUser } from "config/mockSession";
import { collection, createOverviewPlan } from "../services/overviewApi";
import { overviewConfig } from "../model/overviewConfig";
import { useRoleOverview } from "../hooks/useRoleOverview";
import api from "lib/useApi";

jest.mock("lib/useApi", () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));
const get = api.get as jest.Mock;
const session = (role: string): SessionContextValue => ({
  status: "ready",
  user: mockUser(role),
  partner: role === "partner" ? MOCK_PARTNER : null,
  isPartnerLoading: false,
  partnerError: null,
  refetchPartner: jest.fn(),
});
beforeEach(() => {
  get.mockReset();
  get.mockResolvedValue({ data: { total: 0, items: [], count: 0 } });
});

test("uses API totals and rejects incomplete payloads instead of showing false zeroes", () => {
  expect(collection({ total: 100, items: [{ id: 1 }] }).total).toBe(100);
  expect(() => collection({ items: [] })).toThrow();
  expect(() => collection({ total: NaN, items: [] })).toThrow();
});
test.each([
  [
    "reviewer",
    [
      "reviews",
      "verified",
      "registrations",
      "advisors",
      "managers",
      "unread",
      "updates",
    ],
  ],
  [
    "data_entry",
    ["programs", "hiddenPrograms", "institutions", "unread", "updates"],
  ],
  [
    "account_manager",
    ["active", "hold", "pipeline", "advisors", "unread", "updates"],
  ],
  [
    "admin",
    [
      "active",
      "hold",
      "pipeline",
      "reviews",
      "commission",
      "unread",
      "updates",
    ],
  ],
] as const)("%s requests only its role resources", (role, ids) => {
  expect(createOverviewPlan({ role }).map((plan) => plan.id)).toEqual(ids);
});
test("agency members have no commission or team actions and use their scoped applications", async () => {
  const context = {
    role: "partner" as const,
    partnerId: "member/id",
    canViewCommission: false,
    agencyAdmin: false,
  };
  const plan = createOverviewPlan(context);
  expect(plan.some((item) => item.id === "commission")).toBe(false);
  expect(
    overviewConfig(context).actions.some((item) =>
      /team|commission/.test(item.href)
    )
  ).toBe(false);
  await plan[0].load();
  expect(get).toHaveBeenCalledWith(
    "/partners/member%2Fid/applications",
    expect.objectContaining({
      params: { status: "active", limit: 20, offset: 0 },
    })
  );
});
test("agency admin includes member applications, retaining server totals after filtering tasks", async () => {
  get.mockResolvedValue({
    data: {
      total: 50,
      items: [
        { id: "a", status: "new_application", student_name: "Student" },
        { id: "b", status: "completed" },
      ],
    },
  });
  const data = await createOverviewPlan({ role: "admin" })[0].load();
  expect(data.total).toBe(50);
  expect(data.items).toHaveLength(1);
  await createOverviewPlan({
    role: "partner",
    partnerId: "agency",
    agencyAdmin: true,
  })[0].load();
  expect(get.mock.calls[1][1].params.include_members).toBe(true);
});
test("does not request data for a mismatched session", async () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SessionContext.Provider value={session("reviewer")}>
      {children}
    </SessionContext.Provider>
  );
  const { result } = renderHook(() => useRoleOverview("admin"), { wrapper });
  expect(result.current.denied).toBe(true);
  expect(get).not.toHaveBeenCalled();
});
test("independent failures preserve other sections and refresh retries", async () => {
  get.mockImplementation((url: string) =>
    url.includes("unread-count")
      ? Promise.reject({ response: { status: 403 } })
      : Promise.resolve({ data: { total: 0, items: [] } })
  );
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SessionContext.Provider value={session("data_entry")}>
      {children}
    </SessionContext.Provider>
  );
  const { result } = renderHook(() => useRoleOverview("data_entry"), {
    wrapper,
  });
  await waitFor(() =>
    expect(result.current.resources.unread?.state).toBe("error")
  );
  expect(result.current.resources.programs.state).toBe("ready");
  get.mockResolvedValue({ data: { total: 0, items: [], count: 0 } });
  act(() => result.current.refresh());
  await waitFor(() =>
    expect(result.current.resources.unread?.state).toBe("ready")
  );
});
test("never requests a partner overview before its profile is loaded", () => {
  const value = {
    ...session("partner"),
    partner: null,
    isPartnerLoading: true,
  };
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
  renderHook(() => useRoleOverview("partner"), { wrapper });
  expect(get).not.toHaveBeenCalled();
});

test("late requests cannot repopulate a dashboard after the role changes", async () => {
  let resolve: (value: unknown) => void;
  const pending = new Promise((done) => {
    resolve = done;
  });
  get.mockReturnValue(pending);
  let value = session("admin");
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
  const { result, rerender } = renderHook(() => useRoleOverview("admin"), {
    wrapper,
  });
  value = session("reviewer");
  rerender();
  expect(result.current.denied).toBe(true);
  await act(async () => {
    resolve({ data: { total: 999, items: [], count: 999 } });
    await pending;
  });
  expect(result.current.resources.active).toBeUndefined();
});

test("member profile suppresses finance requests even with a legacy agency user", async () => {
  const value = {
    ...session("partner"),
    partner: { ...MOCK_PARTNER, agency_role: "member" },
  };
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
  const { result } = renderHook(() => useRoleOverview("partner"), { wrapper });
  await waitFor(() => expect(result.current.refreshing).toBe(false));
  expect(result.current.context.canViewCommission).toBe(false);
  expect(get.mock.calls.some(([url]) => /statement|finance/.test(url))).toBe(
    false
  );
});

test("pipeline uses scoped stage totals and backend order instead of counting a sampled page", async () => {
  get.mockImplementation((url: string, config: any) =>
    Promise.resolve({
      data:
        url === "/applications/stages"
          ? [
              {
                id: "b",
                name: "Offer Letter",
                code: "OFFER_LETTER",
                order_index: 2,
              },
              {
                id: "a",
                name: "Application Review",
                code: "APPLICATION_REVIEW",
                order_index: 1,
              },
            ]
          : { total: config.params.stage_id === "a" ? 150 : 40, items: [] },
    })
  );
  const result = await createOverviewPlan({
    role: "partner",
    partnerId: "p",
    agencyAdmin: true,
  })
    .find((plan) => plan.id === "pipeline")!
    .load();
  expect(result.total).toBe(190);
  expect(
    result.distribution?.map((stage) => [stage.key, stage.value, stage.stageId])
  ).toEqual([
    ["a", 150, "documents-pending"],
    ["b", 40, "offer-received"],
  ]);
  expect(
    get.mock.calls
      .slice(1)
      .every(
        ([url, config]) =>
          url === "/partners/p/applications" &&
          config.params.include_members === true &&
          config.params.status === "active"
      )
  ).toBe(true);
});
test("a failed stage count fails the pipeline rather than drawing a false zero", async () => {
  get
    .mockResolvedValueOnce({ data: [{ id: "a", name: "Stage" }] })
    .mockRejectedValueOnce(new Error("Unavailable"));
  await expect(
    createOverviewPlan({ role: "admin" })
      .find((plan) => plan.id === "pipeline")!
      .load()
  ).rejects.toThrow("Unavailable");
});

describe("refreshing in the background", () => {
  const wrapperFor = (role: string) => {
    const value = session(role);
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
    );
    return Wrapper;
  };

  test("keeps the numbers on screen while it reloads", async () => {
    get.mockResolvedValue({ data: { total: 7, items: [], count: 7 } });
    const { result } = renderHook(() => useRoleOverview("admin"), { wrapper: wrapperFor("admin") });
    await waitFor(() => expect(result.current.resources.active?.state).toBe("ready"));
    get.mockReturnValue(new Promise(() => {})); // the next load never settles
    act(() => result.current.refresh());
    expect(result.current.resources.active?.state).toBe("ready");
    expect(result.current.resources.active?.data?.total).toBe(7);
  });

  test("a failed background load keeps the last good numbers", async () => {
    get.mockResolvedValue({ data: { total: 7, items: [], count: 7 } });
    const { result } = renderHook(() => useRoleOverview("admin"), { wrapper: wrapperFor("admin") });
    await waitFor(() => expect(result.current.resources.active?.state).toBe("ready"));
    get.mockRejectedValue(new Error("network"));
    await act(async () => {
      result.current.refresh();
    });
    await waitFor(() => expect(get).toHaveBeenCalled());
    expect(result.current.resources.active?.state).toBe("ready");
    expect(result.current.resources.active?.data?.total).toBe(7);
  });
});

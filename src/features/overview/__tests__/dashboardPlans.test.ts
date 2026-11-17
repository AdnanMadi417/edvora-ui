import { createDashboardPlans } from "../services/dashboardPlans";
import api from "lib/useApi";
jest.mock("lib/useApi", () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));
const get = api.get as jest.Mock;
beforeEach(() => get.mockReset());
it("never requests finance resources for reviewer, data-entry, account manager or restricted advisors", () => {
  for (const role of [
    "reviewer",
    "data_entry",
    "account_manager",
    "partner",
  ] as const)
    expect(
      createDashboardPlans({
        role,
        partnerId: "p1",
        canViewCommission: false,
      }).some((plan) => plan.id === "universityCommission")
    ).toBe(false);
  expect(
    createDashboardPlans({
      role: "partner",
      partnerId: "p1",
      canViewCommission: true,
    }).some((plan) => plan.id === "universityCommission")
  ).toBe(true);
});
it("counts actionable applications across pages and preserves advisor scope", async () => {
  get
    .mockResolvedValueOnce({
      data: { total: 2, items: [{ id: "a1", status: "new_application" }] },
    })
    .mockResolvedValueOnce({
      data: { total: 2, items: [{ id: "a2", status: "new_application" }] },
    });
  const plan = createDashboardPlans({ role: "account_manager" }).find(
    (plan) => plan.id === "actionRequired"
  )!;
  const data = await plan.load();
  expect(data.total).toBe(2);
  expect(data.items).toHaveLength(2);
  expect(get).toHaveBeenCalledWith(
    "/account-managers/applications",
    expect.objectContaining({
      params: expect.objectContaining({ offset: 100 }),
    })
  );
});
it("does not treat optional fees or hidden state as incomplete programme information", async () => {
  const valid = {
    id: "p1",
    name: "Valid program",
    university: { id: "u1" },
    qualification_id: "q1",
    field_of_study_id: "f1",
    is_online: true,
    tuition_fee: null,
    is_hidden: true,
  };
  get.mockImplementation(async (_url, config) => ({
    data: {
      total: 1,
      items: [
        config.params.is_hidden
          ? {
              ...valid,
              id: "p2",
              name: "Missing field",
              field_of_study_id: null,
            }
          : valid,
      ],
    },
  }));
  const data = await createDashboardPlans({ role: "data_entry" })
    .find((plan) => plan.id === "catalogueQuality")!
    .load();
  expect(data.total).toBe(1);
  expect(data.items[0].description).toBe("Complete: field of study");
});

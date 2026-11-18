import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CommissionStatusChart from "../components/CommissionStatusChart";
import { groupUniversityCommission } from "../model/dashboardData";
import type { CommissionQueueItem } from "features/applications/payouts/types";
import { selectOption } from "testUtils/selectOption";
const record = {
  application_commission_id: "1",
  application_id: "a1",
  university_name: "Example University",
  commission_currency: "MYR",
  commission_amount: 100,
  waiting_on: "us",
} as CommissionQueueItem;
it("shows one currency at a time without aggregating unlike currencies", async () => {
  const user = userEvent.setup();
  render(
    <CommissionStatusChart
      onRetry={jest.fn()}
      resource={{
        state: "ready",
        data: {
          total: 2,
          items: [],
          universityCommission: groupUniversityCommission(
            [
              record,
              {
                ...record,
                application_commission_id: "2",
                commission_currency: "USD",
                commission_amount: 900,
              },
            ],
            true
          ),
        },
      }}
    />
  );
  expect(
    screen.getByRole("list", { name: "Commission amounts in MYR" })
  ).toHaveTextContent("MYR 100");
  expect(screen.queryByText(/900/)).not.toBeInTheDocument();
  await selectOption(
    user,
    screen.getByRole("combobox", { name: "Chart currency" }),
    "USD"
  );
  expect(
    screen.getByRole("list", { name: "Commission amounts in USD" })
  ).toHaveTextContent("USD 900");
});
it("shows missing amounts as unavailable rather than charting partial totals", () => {
  render(
    <CommissionStatusChart
      onRetry={jest.fn()}
      resource={{
        state: "ready",
        data: {
          total: 1,
          items: [],
          universityCommission: groupUniversityCommission(
            [{ ...record, commission_amount: null }],
            true
          ),
        },
      }}
    />
  );
  // The stage and the total both say so; nothing is summed or drawn from a partial figure.
  expect(screen.getAllByText("Not available").length).toBeGreaterThanOrEqual(2);
  expect(screen.getByRole("listitem", { name: /^Ready for payout: Not available/ })).toBeInTheDocument();
  expect(document.querySelector("[data-stage]")).toBeNull();
});
it("draws only stages that have an amount, and names each row's count", () => {
  render(
    <CommissionStatusChart
      onRetry={jest.fn()}
      resource={{
        state: "ready",
        data: {
          total: 1,
          items: [],
          universityCommission: groupUniversityCommission([record], true),
        },
      }}
    />
  );
  expect(screen.getByRole("listitem", { name: "Expected: MYR 0, 0 commissions" })).toBeInTheDocument();
  expect(screen.getByRole("listitem", { name: "Ready for payout: MYR 100, 1 commission" })).toBeInTheDocument();
  // Only the Ready segment has a width; empty stages draw nothing.
  expect([...document.querySelectorAll("[data-stage]")].map((el) => el.getAttribute("data-stage"))).toEqual(["ready"]);
});

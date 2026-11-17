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
  ).toHaveTextContent("100");
  expect(screen.queryByText("900")).not.toBeInTheDocument();
  await selectOption(
    user,
    screen.getByRole("combobox", { name: "Chart currency" }),
    "USD"
  );
  expect(
    screen.getByRole("list", { name: "Commission amounts in USD" })
  ).toHaveTextContent("900");
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
  expect(screen.getByText("Not available")).toBeInTheDocument();
  expect(
    screen.queryByRole("list", { name: /Commission amounts/ })
  ).not.toBeInTheDocument();
});
it("does not draw positive bars for zero-valued stages", () => {
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
  const expected = screen.getByRole("listitem", { name: "Expected: 0 MYR" });
  expect(expected.querySelector("span[style]")).toHaveStyle({ height: "0%" });
});

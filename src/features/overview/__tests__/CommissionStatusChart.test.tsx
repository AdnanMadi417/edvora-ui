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
  // USD is named in its own line, never added into the MYR figures.
  expect(screen.getByRole("list", { name: "Commission amounts in MYR" })).not.toHaveTextContent("900");
  expect(screen.queryByText(/MYR 1,000/)).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Also USD 900 across 1 commission" })).toBeInTheDocument();
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
  // The stage and the total both say so; no rings are drawn from a partial figure.
  expect(screen.getByText("Total not available")).toBeInTheDocument();
  expect(screen.getByRole("listitem", { name: /^Ready for payout: Not available/ })).toBeInTheDocument();
  expect(screen.queryByRole("img", { name: /Commission by payout stage/ })).toBeNull();
});
it("draws a ring per stage and names each row's count", () => {
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
  expect(screen.getByRole("listitem", { name: "With university: MYR 0, 0 commissions" })).toBeInTheDocument();
  expect(screen.getByRole("listitem", { name: "Ready for payout: MYR 100, 1 commission" })).toBeInTheDocument();
  // One ring per stage, each its share of the total.
  expect(screen.getByRole("img", { name: "Commission by payout stage in MYR: With university 0 of 100, Ready for payout 100 of 100, Paid 0 of 100" })).toBeInTheDocument();
});

it("says money in another currency exists and switches to it on press, without adding it in", async () => {
  const user = userEvent.setup();
  render(
    <CommissionStatusChart
      onRetry={jest.fn()}
      audience="advisor"
      href="/partner/commission-tracker"
      resource={{
        state: "ready",
        data: {
          total: 2,
          items: [],
          universityCommission: groupUniversityCommission(
            [record, { ...record, application_commission_id: "2", commission_currency: "USD", commission_amount: 900 }],
            true
          ),
        },
      }}
    />
  );
  // Advisors read "Due to you"; the card links to the Commission Tracker.
  expect(screen.getByRole("listitem", { name: "Due to you: MYR 100, 1 commission" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Open Commission Tracker" })).toHaveAttribute("href", "/partner/commission-tracker");
  await user.click(screen.getByRole("button", { name: "Also USD 900 across 1 commission" }));
  expect(screen.getByRole("list", { name: "Commission amounts in USD" })).toHaveTextContent("USD 900");
});

import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DonutStatsCard, { foldSlices } from "../cards/DonutStatsCard";
import GroupedBarChart from "./GroupedBarChart";
import AreaLineChart from "./AreaLineChart";
import { niceTicks } from "./chartScale";
import { groupPaidByMonth } from "features/overview/model/dashboardData";

it("folds past five slices into Other, largest first, in fixed colour order", () => {
  const items = [1, 9, 4, 6, 2, 8, 3].map((value, i) => ({ key: `k${i}`, label: `Item ${i}`, value }));
  const slices = foldSlices(items);
  expect(slices.map((s) => s.value)).toEqual([9, 8, 6, 4, 6]);
  expect(slices[4].label).toBe("Other (3)");
  expect(slices[0].color).toBe("var(--ub-chart-cat-1)");
  expect(slices[4].color).toBe("var(--ub-neutral-600)");
});

it("rounds axis ticks", () => {
  expect(niceTicks(8250)).toEqual([0, 2500, 5000, 7500, 10000]);
  expect(niceTicks(3)).toEqual([0, 1, 2, 3]);
  expect(niceTicks(0)).toEqual([0, 1]);
});

it("groups paid commission by month per currency, filling gaps with zero", () => {
  const paid = (month: string, amount: number, currency = "RM") =>
    ({ waiting_on: "nobody", commission_amount: amount, commission_currency: currency, since_date: `${month}-15` }) as never;
  const months = groupPaidByMonth([paid("2026-06", 3000), paid("2026-08", 5250), paid("2026-08", 100, "USD"), { waiting_on: "us", commission_amount: 9 } as never], false);
  expect(months.filter((m) => m.currency === "RM").map((m) => [m.month, m.amount])).toEqual([["2026-06", 3000], ["2026-07", 0], ["2026-08", 5250]]);
  expect(months.filter((m) => m.currency === "USD")).toHaveLength(1);
});

it("DonutStatsCard switches splits with tabs and links each part", async () => {
  const user = userEvent.setup();
  render(
    <DonutStatsCard
      title="Application pipeline"
      views={[
        { id: "stage", label: "By stage", centerLabel: "Active applications", items: [{ key: "visa", label: "Visa", value: 2, href: "/x?stage=visa" }, { key: "offer", label: "Offer", value: 6 }] },
        { id: "uni", label: "By university", centerLabel: "Active applications", items: [{ key: "apu", label: "APU", value: 8 }] },
      ]}
    />
  );
  expect(screen.getByRole("tab", { name: "By stage · 8" })).toHaveAttribute("aria-selected", "true");
  expect(screen.getByRole("link", { name: "Visa: 2, 25%" })).toHaveAttribute("href", "/x?stage=visa");
  expect(screen.getByRole("img", { name: /Visa 2 \(25%\)/ })).toBeInTheDocument();
  await user.click(screen.getByRole("tab", { name: "By university · 8" }));
  expect(within(screen.getByRole("list", { name: "By university, 8 in total" })).getByText("APU")).toBeInTheDocument();
});

it("GroupedBarChart names every bar and keeps a table of values", () => {
  render(
    <GroupedBarChart
      label="Commission per university"
      series={[{ key: "e", label: "Expected", color: "cat-1" }, { key: "p", label: "Paid", color: "cat-3" }]}
      groups={[{ key: "apu", label: "APU", values: [4200, 3000] }]}
    />
  );
  expect(screen.getByRole("button", { name: "APU, Paid: 3,000" })).toBeInTheDocument();
  fireEvent.focus(screen.getByRole("button", { name: "APU, Expected: 4,200" }));
  expect(screen.getByText("APU · Expected: 4,200")).toBeInTheDocument();
  expect(screen.getByRole("table")).toHaveTextContent("4,200");
});

it("AreaLineChart reads points with the arrow keys", () => {
  render(<AreaLineChart label="Paid per month" points={[{ key: "a", label: "Jun", value: 3000 }, { key: "b", label: "Jul", value: 0 }]} />);
  const chart = screen.getByRole("group", { name: /Paid per month/ });
  fireEvent.keyDown(chart, { key: "ArrowRight" });
  expect(screen.getByText("Jun: 3,000")).toBeInTheDocument();
  fireEvent.keyDown(chart, { key: "End" });
  expect(screen.getByText("Jul: 0")).toBeInTheDocument();
});


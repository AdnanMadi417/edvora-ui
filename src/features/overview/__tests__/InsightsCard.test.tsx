import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InsightsCard from "../components/InsightsCard";
import type { OverviewResource } from "../model/types";

const ready = (data: Partial<NonNullable<OverviewResource["data"]>>): OverviewResource => ({ state: "ready", data: { total: 10, items: [], ...data } });
const resources = {
  studyLevels: ready({
    studyLevels: { levels: [{ key: "Bachelor", label: "Bachelor", value: 6 }, { key: "Master", label: "Master", value: 4 }], notRecorded: 0 },
    byField: ["Business", "Engineering", "Computing", "Health", "Law", "Arts", "Education"].map((label, i) => ({ key: label, label, value: 7 - i })),
  }),
  pipeline: ready({ distribution: [{ key: "review", label: "Unibexs review", value: 3 }, { key: "visa", label: "Visa", value: 7 }] }),
  overTime: ready({
    overTime: {
      daily: [{ key: "2026-11-19", label: "19", value: 1 }, { key: "2026-11-20", label: "20", value: 2 }],
      weekly: [{ key: "2026-11-10", label: "10/11", value: 3 }, { key: "2026-11-17", label: "17/11", value: 5 }],
      monthly: [{ key: "2026-10-01", label: "Oct", value: 4 }, { key: "2026-11-01", label: "Nov", value: 6 }],
    },
  }),
  topCountries: ready({ byCountry: [{ key: "Nigeria", label: "Nigeria", value: 6 }, { key: "China", label: "China", value: 4 }] }),
};

it("switches views with tabs and keeps focus on the chosen tab", async () => {
  const user = userEvent.setup();
  render(<InsightsCard role="admin" base="/admin" resources={resources} onRetry={jest.fn()} />);
  expect(screen.getByRole("heading", { name: "Insights" })).toBeInTheDocument();
  // Stage is the first tab and opens first.
  expect(screen.getAllByRole("tab")[0]).toHaveTextContent("Stage");
  expect(screen.getByRole("tab", { name: "Stage" })).toHaveAttribute("aria-selected", "true");
  await user.click(screen.getByRole("tab", { name: "Study level" }));
  expect(screen.getByText("60.0%")).toBeInTheDocument();

  await user.click(screen.getByRole("tab", { name: "Stage" }));
  expect(screen.getByRole("tab", { name: "Stage" })).toHaveFocus();
  expect(screen.getByRole("link", { name: /^Visa: 7 applications/ })).toHaveAttribute("href", "/admin/applications?stage=visa");

  // Advisor rankings live on Advisor insights; the home card links there (admins only).
  expect(screen.queryByRole("tab", { name: "Top Advisors" })).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Open Advisor insights" })).toHaveAttribute("href", "/admin/advisor-insights");
});

it("draws the monthly and country views when the list sends the data", async () => {
  const user = userEvent.setup();
  render(<InsightsCard role="admin" base="/admin" resources={resources} onRetry={jest.fn()} />);
  await user.click(screen.getByRole("tab", { name: "Over time" }));
  // A line over the period, and the latest period against the one before (Nov 6 vs Oct 4).
  expect(screen.getByRole("group", { name: /last 12 months/ })).toBeInTheDocument();
  expect(screen.getByText("+50%")).toBeInTheDocument();
  await user.click(screen.getByRole("tab", { name: "Weekly" }));
  expect(screen.getByRole("table", { name: /last 12 weeks/ })).toHaveTextContent("17/11");
  await user.click(screen.getByRole("tab", { name: "Daily" }));
  expect(screen.getByRole("group", { name: /last 14 days/ })).toBeInTheDocument();
  await user.click(screen.getByRole("tab", { name: "Countries" }));
  // The Field of study donut: a slice per country.
  expect(screen.getByRole("img", { name: /^By country/ })).toBeInTheDocument();
  expect(screen.getByText("Nigeria")).toBeInTheDocument();
});

it("says plainly when a chart has no data yet, and Advisors get no Advisor insights link", async () => {
  const user = userEvent.setup();
  render(
    <InsightsCard
      role="partner"
      base="/partner"
      resources={{ ...resources, overTime: ready({ unavailable: true }) }}
      onRetry={jest.fn()}
    />
  );
  expect(screen.queryByRole("link", { name: "Open Advisor insights" })).not.toBeInTheDocument();
  await user.click(screen.getByRole("tab", { name: "Over time" }));
  expect(screen.getByText(/needs the date each application was submitted/)).toBeInTheDocument();
});

it("Field of study shows the top five fields and one Others row", async () => {
  const user = userEvent.setup();
  render(<InsightsCard role="admin" base="/admin" resources={resources} onRetry={jest.fn()} />);
  await user.click(screen.getByRole("tab", { name: "Field of study" }));
  // The Stage donut: five field slices and one Others slice.
  expect(screen.getByRole("img", { name: /^With a field/ })).toBeInTheDocument();
  expect(screen.getByRole("list", { name: /With a field/ }).querySelectorAll("li")).toHaveLength(6);
  expect(screen.getByText("Others (2 fields)")).toBeInTheDocument();
});

it("Field of study stays a donut even with many fields", async () => {
  const user = userEvent.setup();
  const many = Array.from({ length: 12 }, (_, i) => ({ key: `f${i}`, label: `Field ${i + 1}`, value: 20 - i }));
  render(
    <InsightsCard
      role="admin"
      base="/admin"
      resources={{ ...resources, studyLevels: ready({ studyLevels: { levels: [], notRecorded: 0 }, byField: many }) }}
      onRetry={jest.fn()}
    />
  );
  await user.click(screen.getByRole("tab", { name: "Field of study" }));
  expect(screen.getByRole("img", { name: /^With a field/ })).toBeInTheDocument();
  expect(screen.getByText("Others (7 fields)")).toBeInTheDocument();
});

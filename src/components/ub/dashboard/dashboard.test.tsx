import { render, screen, fireEvent } from "@testing-library/react";
import {
  ActivityHeatmap,
  BreakdownTable,
  CardFooterStats,
  CountdownCard,
  DashboardCard,
  DeltaPill,
  GaugeChart,
  PillBarChart,
  ProgressCard,
  ReminderCard,
  StatCard,
  StatusTag,
  TaskList,
  TaskListItem,
  compactNumber,
  countdownParts,
  defaultHighlight,
  deltaTone,
  formatDelta,
  gaugeDashes,
  heatLevel,
  resolveWidgetState,
  sparkPoints,
} from "components/ub/dashboard";

describe("dashboard helpers", () => {
  it("formats deltas with a real minus and picks the tone by direction", () => {
    expect(formatDelta(12)).toBe("+12%");
    expect(formatDelta(-4.5)).toBe("−4.5%");
    expect(formatDelta(3, "")).toBe("+3");
    expect(deltaTone(5)).toBe("success");
    expect(deltaTone(5, "down")).toBe("danger");
    expect(deltaTone(0)).toBe("neutral");
  });
  it("compacts numbers", () => {
    expect(compactNumber(1284)).toBe("1,284");
    expect(compactNumber(12900)).toBe("12.9K");
    expect(compactNumber(4_200_000)).toBe("4.2M");
  });
  it("highlights the last non-pending bar", () => {
    expect(defaultHighlight([{ label: "a", value: 1 }, { label: "b", value: 2 }, { label: "c", value: 3, status: "pending" }])).toBe(1);
  });
  it("splits a gauge with gaps and running offsets", () => {
    expect(gaugeDashes([{ value: 62 }, { value: 27 }, { value: 11 }])).toEqual([
      { dash: "61 39", offset: -0 },
      { dash: "26 74", offset: -62 },
      { dash: "11 89", offset: -89 },
    ]);
  });
  it("buckets heat into 5 levels", () => {
    expect([0, 1, 3, 6, 12].map((v) => heatLevel(v, 12))).toEqual([0, 1, 1, 2, 4]);
  });
  it("counts down and stops at zero", () => {
    expect(countdownParts(new Date("2026-11-05T12:30:00Z"), new Date("2026-11-03T09:00:00Z"))).toEqual({ days: 2, hours: 3, minutes: 30, done: false });
    expect(countdownParts(new Date("2026-11-01T00:00:00Z"), new Date("2026-11-03T00:00:00Z")).done).toBe(true);
  });
  it("resolves widget state and spark points", () => {
    expect(resolveWidgetState(undefined, false)).toBe("empty");
    expect(resolveWidgetState("loading", true)).toBe("loading");
    expect(sparkPoints([0, 10], 100, 32)).toBe("0,30 100,2");
  });
});

describe("dashboard widgets", () => {
  it("DeltaPill is not colour alone: sign, arrow and a spoken direction", () => {
    render(<DeltaPill value={-4} comparedTo="vs last week" />);
    expect(screen.getByText("−4%")).toBeInTheDocument();
    expect(screen.getByText("Down 4% vs last week")).toBeInTheDocument();
  });
  it("PillBarChart: each bar is focusable with its value; focus shows the bubble", () => {
    render(<PillBarChart label="Applications per day" unit="applications" data={[{ label: "Mon", value: 14 }, { label: "Sat", value: 9, status: "pending" }]} />);
    const sat = screen.getByRole("listitem", { name: "Sat: 9 applications (pending)" });
    fireEvent.focus(sat);
    expect(screen.getByText("9 applications")).toBeInTheDocument();
  });
  it("charts show empty and error states", () => {
    const onRetry = jest.fn();
    const { rerender } = render(<PillBarChart label="x" data={[]} emptyMessage="No applications this week yet." />);
    expect(screen.getByText("No applications this week yet.")).toBeInTheDocument();
    rerender(<PillBarChart label="x" data={[{ label: "a", value: 1 }]} state="error" errorMessage="Couldn't load." onRetry={onRetry} />);
    fireEvent.click(screen.getByRole("button", { name: /Try again/ }));
    expect(onRetry).toHaveBeenCalled();
  });
  it("GaugeChart has a spoken summary", () => {
    render(<GaugeChart label="Placement" segments={[{ label: "Placed", value: 62, color: "cat-1" }, { label: "Withdrawn", value: 11, color: "cat-3" }]} />);
    expect(screen.getByRole("img", { name: "Placement: Placed 62%, Withdrawn 11%" })).toBeInTheDocument();
  });
  it("ActivityHeatmap is one tab stop with arrow-key movement", () => {
    render(<ActivityHeatmap label="Uploads" rows={["Mon", "Tue"]} columns={["9am", "10"]} values={[[1, 2], [3, 0]]} unit="uploads" />);
    const cells = screen.getAllByRole("gridcell");
    expect(cells.filter((c) => c.tabIndex === 0)).toHaveLength(1);
    cells[0].focus();
    fireEvent.keyDown(cells[0], { key: "ArrowDown" });
    expect(screen.getByRole("gridcell", { name: "Tue 9am: 3 uploads" })).toHaveFocus();
  });
  it("StatCard, DashboardCard and footer stats render; loading is busy", () => {
    const { rerender } = render(<StatCard label="Commission paid" value="RM84,200" delta={{ value: 12 }} caption="RM75,100 last month" />);
    expect(screen.getByRole("heading", { name: "Commission paid" })).toBeInTheDocument();
    rerender(<StatCard label="Commission paid" value="RM84,200" state="loading" />);
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
    render(<DashboardCard title="Applications" footer={<CardFooterStats items={[{ label: "Submitted", value: "126" }, { label: "Offers", value: "38" }]} />}>Body</DashboardCard>);
    expect(screen.getByText("Submitted")).toBeInTheDocument();
  });
  it("lists, breakdown and status tags", () => {
    render(
      <>
        <TaskList label="Due" count={1}>
          <TaskListItem title="Pay visa fee" dueInDays={0} />
        </TaskList>
        <BreakdownTable caption="Commission by Institution" rows={[{ key: "s", label: "Sunway University", value: "RM28,400", growth: 14 }]} comparedTo="vs last intake" />
        <StatusTag status="offer-received" />
        <StatusTag status="Payment Rejected" />
      </>,
    );
    expect(screen.getByText("Due today")).toBeInTheDocument();
    expect(screen.getByRole("rowheader", { name: /Sunway University/ })).toBeInTheDocument();
    expect(screen.getByText("Offer received")).toBeInTheDocument();
    expect(screen.getByText("Payment Rejected")).toBeInTheDocument();
  });
  it("feature cards", () => {
    render(
      <>
        <ReminderCard title="Call with Sunway admissions" cta={{ label: "Join call", onClick: jest.fn() }} />
        <ReminderCard heading="Later" />
        <CountdownCard heading="Next intake" target="2026-11-05T12:30:00Z" now={new Date("2026-11-03T09:00:00Z")} />
        <ProgressCard title="Onboarding" done={3} total={5} stepLabel="steps done" />
      </>,
    );
    expect(screen.getByRole("button", { name: "Join call" })).toBeInTheDocument();
    expect(screen.getByText("Nothing scheduled. Enjoy the quiet.")).toBeInTheDocument();
    expect(screen.getByText("2 days, 3 hours, 30 minutes left")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuetext", "3 of 5 steps done");
  });
});

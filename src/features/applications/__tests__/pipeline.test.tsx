import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PipelineCard from "../partner/components/PipelineCard";

const stages = [
  {
    id: "submission",
    name: "Application submission",
    code: "APPLICATION_REVIEW",
  },
  {
    id: "commission",
    name: "Partner commission invoicing",
    code: "PARTNER_COMMISSION_INVOICING",
  },
];
const props = {
  stages,
  stageCounts: { submission: 12, commission: 6 },
  stageActionRequired: { submission: true },
  totalCount: 18,
  totalActionRequired: 999,
  onViewCommission: jest.fn(),
};

it("keeps stage counts and filters without duplicating the summary cards", () => {
  render(<PipelineCard {...props} selectedId={null} onSelect={jest.fn()} />);
  expect(screen.queryByLabelText("Application statistics")).not.toBeInTheDocument();
  const filters = screen.getByRole("group", { name: "Filter applications by stage" });
  expect(within(filters).getByText("12")).toBeInTheDocument();
  expect(within(filters).getByText("6")).toBeInTheDocument();
  expect(within(filters).getByRole("button", { name: /^Commission:/ })).toBeInTheDocument();
  expect(screen.queryByText(/999/)).not.toBeInTheDocument();
});

it("toggles a stage on and off without extra pipeline controls", async () => {
  function Harness() {
    const [selected, setSelected] = useState<string | null>(null);
    return (
      <PipelineCard {...props} selectedId={selected} onSelect={setSelected} />
    );
  }
  const user = userEvent.setup();
  render(<Harness />);
  const stage = screen.getByRole("button", { name: /Unibexs review/ });
  await user.click(stage);
  expect(stage).toHaveAttribute("aria-pressed", "true");
  expect(screen.queryByText("Your pipeline")).not.toBeInTheDocument();
  expect(screen.queryByText("Showing all stages")).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /View commission/ })).not.toBeInTheDocument();
  await user.click(stage);
  expect(stage).toHaveAttribute("aria-pressed", "false");
});

it("shows loading and error states without presenting missing stage counts as zero", () => {
  const { rerender } = render(
    <PipelineCard {...props} loading selectedId={null} onSelect={jest.fn()} />
  );
  expect(
    screen.getAllByRole("status", { name: "Loading" }).length
  ).toBeGreaterThan(0);
  expect(
    screen.queryByRole("button", { name: /Unibexs review/ })
  ).not.toBeInTheDocument();
  rerender(
    <PipelineCard
      {...props}
      error="Stage totals unavailable"
      selectedId={null}
      onSelect={jest.fn()}
    />
  );
  expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
  expect(screen.queryByRole("group", { name: "Filter applications by stage" })).not.toBeInTheDocument();
});

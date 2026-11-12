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

it("shows exact totals and labels commission as a stage rather than payout-ready applications", () => {
  render(<PipelineCard {...props} selectedId={null} onSelect={jest.fn()} />);
  const stats = screen.getByLabelText("Application statistics");
  expect(within(stats).getByText("18")).toBeInTheDocument();
  expect(within(stats).getByText("2")).toBeInTheDocument();
  expect(within(stats).getByText("6")).toBeInTheDocument();
  expect(within(stats).getByText("In commission stage")).toBeInTheDocument();
  expect(screen.queryByText(/999/)).not.toBeInTheDocument();
});

it("toggles stage selection and clears it from the All stages action", async () => {
  function Harness() {
    const [selected, setSelected] = useState<string | null>(null);
    return (
      <PipelineCard {...props} selectedId={selected} onSelect={setSelected} />
    );
  }
  const user = userEvent.setup();
  render(<Harness />);
  const stage = screen.getByRole("button", { name: /Application submission/ });
  await user.click(stage);
  expect(stage).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("status")).toHaveTextContent(
    "Showing Application submission"
  );
  await user.click(screen.getByRole("button", { name: "All stages" }));
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
    screen.queryByRole("button", { name: /Application submission/ })
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
  expect(
    screen.getByRole("button", { name: "View commission stage" })
  ).toBeDisabled();
});

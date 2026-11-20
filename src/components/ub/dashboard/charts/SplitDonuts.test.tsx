import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SplitDonuts from "./SplitDonuts";

const groups = [
  { label: "Account", parts: [{ id: "active", label: "Active", value: 15, color: "green" }, { id: "inactive", label: "Suspended", value: 5, color: "red" }] },
  { label: "Type", parts: [{ id: "individual", label: "Individual", value: 12, color: "blue" }, { id: "agency", label: "Company", value: 8, color: "teal" }] },
];

it("draws one donut per split and toggles a filter from the legend", async () => {
  const user = userEvent.setup();
  const onSelect = jest.fn();
  const { rerender } = render(<SplitDonuts unit="Advisors" groups={groups} onSelect={onSelect} />);
  expect(screen.getAllByRole("img")).toHaveLength(2);
  await user.click(screen.getByRole("button", { name: "Suspended: 5 Advisors, 25%" }));
  expect(onSelect).toHaveBeenCalledWith("inactive");
  rerender(<SplitDonuts unit="Advisors" groups={groups} onSelect={onSelect} selectedId="inactive" />);
  expect(screen.getByRole("button", { name: /^Suspended/ })).toHaveAttribute("aria-pressed", "true");
  await user.click(screen.getByRole("button", { name: /^Suspended/ }));
  expect(onSelect).toHaveBeenLastCalledWith(null);
});

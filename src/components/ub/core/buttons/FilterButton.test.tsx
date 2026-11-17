import { fireEvent, render, screen } from "@testing-library/react";
import FilterButton from "./FilterButton";

it("keeps the label in the accessible name and shows the count", () => {
  const onClick = jest.fn();
  render(<FilterButton onClick={onClick} count={2} />);
  const button = screen.getByRole("button", { name: "Filters (2)" });
  fireEvent.click(button);
  expect(onClick).toHaveBeenCalled();
  // Phone badge, hidden from screen readers (the name already has the count).
  expect(screen.getByText("2")).toHaveAttribute("aria-hidden", "true");
});

it("uses a custom label and no badge without filters", () => {
  render(<FilterButton onClick={() => {}} label="University filters" />);
  expect(screen.getByRole("button", { name: "University filters" })).toBeInTheDocument();
  expect(screen.queryByText("0")).not.toBeInTheDocument();
});

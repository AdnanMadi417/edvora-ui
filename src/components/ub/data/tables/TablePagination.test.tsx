import { fireEvent, render, screen } from "@testing-library/react";
import TablePagination from "./TablePagination";

const props = { currentPage: 1, onPageChange: jest.fn(), itemsPerPage: 20, itemCount: 20, totalCount: 201, itemLabel: "applications" };

it("shows the total, current page, and working page navigation", () => {
  const onPageChange = jest.fn();
  render(<TablePagination {...props} onPageChange={onPageChange} />);
  expect(screen.getByRole("status")).toHaveTextContent("201 applications");
  expect(screen.getByRole("button", { name: "Page 1" })).toHaveAttribute("aria-current", "page");
  expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Page 3" }));
  expect(onPageChange).toHaveBeenCalledWith(3);
  fireEvent.click(screen.getByRole("button", { name: "Next page" }));
  expect(onPageChange).toHaveBeenCalledWith(2);
});

it("disables navigation while results are updating", () => {
  render(<TablePagination {...props} currentPage={2} loading />);
  expect(screen.getByRole("status")).toHaveTextContent("Updating results");
  screen.getAllByRole("button").forEach((button) => expect(button).toBeDisabled());
});

it("handles an empty result and the last partial page", () => {
  const { rerender } = render(<TablePagination {...props} totalCount={0} itemCount={0} />);
  expect(screen.getByRole("status")).toHaveTextContent("0 applications");
  // One page (or none): only the count, no arrows and no lone "1".
  expect(screen.queryByRole("navigation", { name: "Pagination" })).toBeNull();
  rerender(<TablePagination {...props} totalCount={5} itemCount={5} />);
  expect(screen.getByRole("status")).toHaveTextContent("5 applications");
  expect(screen.queryByRole("button", { name: "Next page" })).toBeNull();
  rerender(<TablePagination {...props} currentPage={11} itemCount={1} />);
  expect(screen.getByRole("status")).toHaveTextContent("201 applications");
  expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
});

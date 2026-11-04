import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Pagination, { getPageRange } from "components/ub/navigation/controls/Pagination";

describe("getPageRange", () => {
  it("lists every page when they fit", () => {
    expect(getPageRange(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(getPageRange(1, 1)).toEqual([1]);
    expect(getPageRange(1, 0)).toEqual([]);
  });

  it("shows both ellipses around the current page", () => {
    expect(getPageRange(5, 12)).toEqual([1, "ellipsis-start", 4, 5, 6, "ellipsis-end", 12]);
  });

  it("shows only the end ellipsis near the start", () => {
    expect(getPageRange(1, 12)).toEqual([1, 2, 3, 4, 5, "ellipsis-end", 12]);
    expect(getPageRange(4, 12)).toEqual([1, 2, 3, 4, 5, "ellipsis-end", 12]);
  });

  it("shows only the start ellipsis near the end", () => {
    expect(getPageRange(12, 12)).toEqual([1, "ellipsis-start", 8, 9, 10, 11, 12]);
    expect(getPageRange(9, 12)).toEqual([1, "ellipsis-start", 8, 9, 10, 11, 12]);
  });

  it("respects siblingCount and clamps out-of-range pages", () => {
    expect(getPageRange(10, 20, 2)).toEqual([1, "ellipsis-start", 8, 9, 10, 11, 12, "ellipsis-end", 20]);
    expect(getPageRange(99, 12)).toEqual([1, "ellipsis-start", 8, 9, 10, 11, 12]);
  });
});

describe("Pagination", () => {
  it("marks the current page and changes page", async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();
    render(<Pagination page={5} pageCount={12} onPageChange={onPageChange} />);

    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 5" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Page 4" })).not.toHaveAttribute("aria-current");

    await user.click(screen.getByRole("button", { name: "Page 6" }));
    expect(onPageChange).toHaveBeenLastCalledWith(6);
    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(onPageChange).toHaveBeenLastCalledWith(4);
  });

  it("disables Previous on the first page and Next on the last", () => {
    const { rerender } = render(<Pagination page={1} pageCount={3} onPageChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    rerender(<Pagination page={3} pageCount={3} onPageChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("compact mode shows Page x of y without page buttons", () => {
    render(<Pagination page={2} pageCount={8} onPageChange={() => {}} compact />);
    expect(screen.queryByRole("button", { name: "Page 2" })).not.toBeInTheDocument();
    expect(screen.getByText(/Page/).textContent).toBe("Page 2 of 8");
  });
});

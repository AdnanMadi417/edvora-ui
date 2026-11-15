import { fireEvent, render, screen } from "@testing-library/react";
import Tooltip from "./Tooltip";

it("portals hints outside table cells and supports keyboard dismissal", () => {
  render(<table><tbody><tr><td><Tooltip content="A long hint"><button>Details</button></Tooltip></td></tr></tbody></table>);
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  fireEvent.focus(screen.getByRole("button", { name: "Details" }));
  const hint = screen.getByRole("tooltip");
  expect(hint).toHaveTextContent("A long hint");
  expect(hint.parentElement).toBe(document.body);
  expect(hint.style.maxWidth).toBe("min(280px, calc(100vw - 24px))");
  fireEvent.keyDown(screen.getByRole("button", { name: "Details" }), { key: "Escape" });
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
});
